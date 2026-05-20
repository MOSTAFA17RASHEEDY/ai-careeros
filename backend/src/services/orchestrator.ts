import Groq from 'groq-sdk'
import { getToolDefinitions, executeTool } from './tools'

const MODEL = 'qwen/qwen3-32b'
const MAX_VISIBLE_MESSAGES = 8
const MAX_CONTEXT_CHARS = 12000
const MIN_INTERVAL_MS = 2200
const MAX_TOOL_TURNS = 8

const SYSTEM_PROMPT = 'You are a Career Action Orchestrator. You have two modes:\n\n' +
'**ACTION MODE** — When the user asks to create, update, add, or change something (goals, resumes, skills, etc.):\n' +
'- You MUST call one or more functions to make real database changes.\n' +
'- Never just reply with text describing what you would do.\n' +
'- After calling functions, summarize what was actually done.\n\n' +
'**INTERVIEW MODE** — When the user asks for interview prep or practice:\n' +
'- Act as a real interviewer. Ask questions ONE AT A TIME in a conversational format.\n' +
'- Wait for the user to answer before asking the next question or giving feedback.\n' +
'- After the user answers, give brief constructive feedback, then ask a follow-up or the next question.\n' +
'- Occasionally call practice_save to save the Q&A to their history.\n' +
'- At the end, summarize areas to improve.\n\n' +
'GENERAL RULES:\n' +
'1. When the user mentions a resume, first call resume_list to find their resume IDs.\n' +
'2. Use goal_list BEFORE creating a goal — if a goal with the same title already exists, update it instead.\n' +
'3. When creating a goal, include concrete actionable steps (e.g. "Complete System Design course").\n' +
'4. Link goals to resumes using resumeId.\n' +
'5. To add skills/education/etc. to a resume, use resume_update with id + section + data.\n' +
'6. For interview prep, start by checking their resume and skills to tailor questions.\n' +
'7. After every set of function calls, summarize the real changes made.\n\n' +
'Available tools:\n' +
'- resume_list, resume_get, resume_update — manage resumes\n' +
'- skill_list, skill_update — manage skill levels\n' +
'- goal_create, goal_list, goal_update, goal_delete — manage career goals\n' +
'- practice_save, practice_history — interview practice\n' +
'- activity_log — record activity\n\n' +
'EXAMPLE: User says "I want to become a Senior .NET Engineer" — call goal_list to check for existing goal, then goal_create with title="Become Senior .NET Engineer", description="...", steps=[{text:"...",done:false}], resumeId="..." if a resume for that role exists.\n' +
'EXAMPLE: User says "Help me prep for a frontend interview" — call resume_list and skill_list to see their background, then ask "Let\'s start with a frontend question: What\'s the difference between let, const, and var?" Wait for their answer, give feedback, then ask the next question.'

const modelState = {
  count: 0, resetAt: Date.now() + 60000, lastCallAt: 0,
}

const ERROR_CODES = {
  RATE_LIMITED: 'RATE_LIMITED',
  AUTH_FAILED: 'AUTH_FAILED',
  UNAVAILABLE: 'UNAVAILABLE',
}

function getClient(): Groq | null {
  const key = process.env.GROQ_API_KEY
  if (!key || key === 'your_groq_api_key_here') return null
  return new Groq({ apiKey: key })
}

function parseGroqError(err: any): { code: string; message: string } {
  const status = err?.status
  const errorCode = err?.error?.code || err?.code
  if (errorCode === 'rate_limit_exceeded' || status === 429) return { code: ERROR_CODES.RATE_LIMITED, message: 'Rate limit' }
  if (status === 401 || status === 403) return { code: ERROR_CODES.AUTH_FAILED, message: 'Auth failed' }
  if (err?.name === 'APIConnectionError' || err?.name === 'APIConnectionTimeoutError') return { code: ERROR_CODES.UNAVAILABLE, message: 'Connection error' }
  if (status && status >= 500) return { code: ERROR_CODES.UNAVAILABLE, message: 'Server error' }
  return { code: ERROR_CODES.UNAVAILABLE, message: err?.message || 'Unknown' }
}

async function waitForSlot(): Promise<boolean> {
  const now = Date.now()
  if (now > modelState.resetAt) {
    modelState.count = 0; modelState.resetAt = now + 60000; modelState.lastCallAt = 0
  }
  if (modelState.count >= 27) {
    const wait = modelState.resetAt - now
    if (wait > 0) return false
    modelState.count = 0; modelState.resetAt = now + 60000
  }
  const elapsed = now - modelState.lastCallAt
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - elapsed))
  }
  modelState.count++
  modelState.lastCallAt = Date.now()
  return true
}

function prepareMessages(history: { role: string; text: string }[]): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const result: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ]
  if (history.length === 0) return result

  let msgs = [...history]
  if (msgs.length > MAX_VISIBLE_MESSAGES) {
    const visible = msgs.slice(-MAX_VISIBLE_MESSAGES)
    const older = msgs.slice(0, msgs.length - MAX_VISIBLE_MESSAGES)
    result.push({
      role: 'system',
      content: `Previous context:\n${older.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text.slice(0, 200)}`).join('\n')}`,
    })
    msgs = visible
  }
  for (const m of msgs) {
    result.push({ role: m.role as 'user' | 'assistant', content: m.text })
  }
  if (JSON.stringify(result).length > MAX_CONTEXT_CHARS) {
    const keep = Math.floor(MAX_VISIBLE_MESSAGES / 2)
    result.length = 1
    for (const m of msgs.slice(-keep)) {
      result.push({ role: m.role as 'user' | 'assistant', content: m.text.slice(0, 400) })
    }
  }
  return result
}

export interface OrchestratorAction {
  tool: string
  args: any
  result: any
}

export interface OrchestratorResponse {
  text: string
  actions: OrchestratorAction[]
}

export async function orchestrate(
  messages: { role: string; text: string }[],
  userId: string,
): Promise<OrchestratorResponse> {
  const client = getClient()
  if (!client) return { text: 'AI not configured — set GROQ_API_KEY in backend/.env.', actions: [] }

  const tools = getToolDefinitions('*')
  const allActions: OrchestratorAction[] = []
  const msgs = prepareMessages(messages)

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const ok = await waitForSlot()
    if (!ok) throw Object.assign(new Error('Rate limit'), { code: ERROR_CODES.RATE_LIMITED })

    const body: any = { model: MODEL, messages: msgs, temperature: 0.5, max_tokens: 1024 }
    if (tools.length > 0) {
      body.tools = tools.map(t => ({
        type: 'function',
        function: { name: t.name, description: t.description, parameters: t.parameters },
      }))
    }

    let completion
    try {
      completion = await client.chat.completions.create(body)
    } catch (err: any) {
      const status = err?.status
      const errorCode = err?.error?.code || err?.code
      if (errorCode === 'rate_limit_exceeded' || status === 429) {
        throw Object.assign(new Error('Rate limit'), { code: ERROR_CODES.RATE_LIMITED })
      }
      throw err
    }
    const choice = completion.choices[0]
    if (!choice) throw new Error('No response')

    const msg = choice.message

    if (choice.finish_reason === 'tool_calls' && msg.tool_calls) {
      if (msg.content) msgs.push({ role: 'assistant', content: msg.content })
      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments)
        const result = await executeTool(tc.function.name, args, userId)
        allActions.push({ tool: tc.function.name, args, result: result.data || result })
        msgs.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) } as any)
      }
      continue
    }

    if (msg.content) msgs.push({ role: 'assistant', content: msg.content })
    return { text: msg.content || 'Done.', actions: allActions }
  }
  return { text: 'Completed.', actions: allActions }
}
