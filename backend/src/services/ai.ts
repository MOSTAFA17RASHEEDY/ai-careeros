import Groq from 'groq-sdk'
import { getToolDefinitions, executeTool } from './tools'

const MODEL_FAST = 'qwen/qwen3-32b'
const MODEL_DEEP = 'qwen/qwen3-32b'
const MAX_CONTEXT_CHARS = 12000
const MAX_VISIBLE_MESSAGES = 8
const MIN_INTERVAL_MS = 500
const MAX_TOOL_TURNS = 6
const GHOST_RETRY_MAX = 1

const SYSTEM_PROMPTS: Record<string, string> = {
  'career-coach': `You are CareerCoach, an expert career advisor for software engineers. You help with career growth, salary negotiation, and professional development.

You have tools to create and track career goals, and log activity. Use them proactively:
- When a user wants to set a goal → call goal_create
- When asked about progress → call goal_list
- When discussing achievements → call activity_log to record wins

Keep responses concise (2-4 paragraphs). Be encouraging but honest.`,
  'resume-coach': `You are ResumeCoach, an expert resume reviewer. You analyze resumes and make real improvements.

You have tools to read, update resumes and log activity. Use them:
- Get the user's resume first with resume_get or resume_list
- After analysis, call resume_update with improved content and a score
- Log the improvement with activity_log
- Never update without showing the user what changed first

Format responses with: ## Analysis, ## Changes Made, ## Next Steps.`,
  'interview-prep': `You are InterviewPrep, a technical interview coach. You run mock interviews and track progress.

You have tools to save practice sessions and review history. Use them:
- After asking a question and getting an answer, save it with practice_save
- Review past practice with practice_history to track improvement
- Cover behavioral (STAR), system design, and coding questions

Ask what role/company they're targeting first. Give feedback after each answer.`,
  'skill-gap': `You are SkillGapAnalyst. You assess skills and build learning roadmaps.

You have tools to view and update skills, and log activity. Use them:
- Start by calling skill_list to see current skills
- Ask about target role, then update skills with skill_update
- Log the completed analysis with activity_log

Provide: (1) gap assessment, (2) prioritized roadmap, (3) free resources. Be realistic.`,
}

const AGENT_MODEL: Record<string, string> = {
  'career-coach': MODEL_FAST,
  'resume-coach': MODEL_FAST,
  'interview-prep': MODEL_FAST,
  'skill-gap': MODEL_FAST,
}

const AGENT_TEMP: Record<string, number> = {
  'career-coach': 0.7,
  'resume-coach': 0.4,
  'interview-prep': 0.6,
  'skill-gap': 0.4,
}

const modelState: Record<string, { count: number; resetAt: number; lastCallAt: number }> = {
  'default': { count: 0, resetAt: Date.now() + 60000, lastCallAt: 0 },
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

  if (errorCode === 'rate_limit_exceeded' || status === 429) {
    return { code: ERROR_CODES.RATE_LIMITED, message: 'Rate limit' }
  }
  if (status === 401 || status === 403) {
    return { code: ERROR_CODES.AUTH_FAILED, message: 'Auth failed' }
  }
  if (err?.name === 'APIConnectionError' || err?.name === 'APIConnectionTimeoutError') {
    return { code: ERROR_CODES.UNAVAILABLE, message: 'Connection error' }
  }
  if (status && status >= 500) {
    return { code: ERROR_CODES.UNAVAILABLE, message: 'Server error' }
  }
  return { code: ERROR_CODES.UNAVAILABLE, message: err?.message || 'Unknown' }
}

async function waitForSlot(model: string): Promise<boolean> {
  const state = modelState[model]
  if (!state) return true
  const now = Date.now()

  if (now > state.resetAt) {
    state.count = 0; state.resetAt = now + 60000; state.lastCallAt = 0
  }
  if (state.count >= 27) {
    const wait = state.resetAt - now
    if (wait > 0) return false
    state.count = 0; state.resetAt = now + 60000
  }
  const elapsed = now - state.lastCallAt
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - elapsed))
  }
  state.count++
  state.lastCallAt = Date.now()
  return true
}

function prepareMessages(
  systemPrompt: string,
  userMessages: { role: string; text: string }[],
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const result: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ]
  if (userMessages.length === 0) return result

  let msgs = [...userMessages]
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

export interface AgentAction {
  tool: string
  args: any
  result: any
}

export interface AgentResponse {
  text: string
  actions: AgentAction[]
}

const ACTION_VERBS = ['updated', 'improved', 'added', 'created', 'changed', 'deleted', 'saved', 'set', 'removed', 'fixed', 'wrote', 'modified']

async function callGroqWithTools(
  client: Groq,
  agentType: string,
  model: string,
  systemPrompt: string,
  userMessages: { role: string; text: string }[],
  temperature: number,
  userId: string,
): Promise<AgentResponse> {
  const tools = getToolDefinitions(agentType)
  const actions: AgentAction[] = []

  const messages = prepareMessages(systemPrompt, userMessages)

  let emptyTurns = 0
  let ghostRetries = 0

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const ok = await waitForSlot(model)
    if (!ok) throw Object.assign(new Error('Rate limit'), { code: ERROR_CODES.RATE_LIMITED })

    const body: any = { model, messages, temperature, max_tokens: 1024 }
    if (tools.length > 0) {
      body.tools = tools.map(t => ({
        type: 'function',
        function: { name: t.name, description: t.description, parameters: t.parameters },
      }))
    }

    const completion = await client.chat.completions.create(body)
    const choice = completion.choices[0]
    if (!choice) throw new Error('No response')

    const msg = choice.message
    const actionsBefore = actions.length

    if (msg.content) messages.push({ role: 'assistant', content: msg.content })

    if (choice.finish_reason === 'tool_calls' && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments)
        const result = await executeTool(tc.function.name, args, userId)
        actions.push({ tool: tc.function.name, args, result: result.data || result })
        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) } as any)
      }
      emptyTurns = 0
      continue
    }

    const newTools = actions.length - actionsBefore
    const lowerContent = (msg.content || '').toLowerCase()
    const claimsAction = ACTION_VERBS.some(v => lowerContent.includes(v))

    if (newTools === 0 && claimsAction && ghostRetries < GHOST_RETRY_MAX) {
      ghostRetries++
      messages.push({
        role: 'system',
        content: 'You claimed to have made changes but did not call any tool. You MUST call the appropriate tool to actually perform the change before responding.',
      })
      emptyTurns = 0
      continue
    }

    if (newTools === 0) {
      emptyTurns++
      if (emptyTurns >= 2) break
    } else {
      emptyTurns = 0
    }

    return { text: msg.content || 'Done.', actions }
  }
  return { text: 'Completed.', actions }
}

export async function chat(agentType: string, messages: { role: string; text: string }[], userId: string): Promise<AgentResponse> {
  const client = getClient()
  if (!client) return { text: 'AI not configured — set GROQ_API_KEY in backend/.env and restart.', actions: [] }

  const agentKey = agentType || 'career-coach'
  const model = AGENT_MODEL[agentKey] || MODEL_FAST
  const system = SYSTEM_PROMPTS[agentKey] || SYSTEM_PROMPTS['career-coach']
  const temp = AGENT_TEMP[agentKey] || 0.7

  try {
    return await callGroqWithTools(client, agentKey, model, system, messages, temp, userId)
  } catch (err: any) {
    const parsed = parseGroqError(err)
    console.error(`[AI Error] agent=${agentKey} model=${model} code=${parsed.code}`, err?.message)

    const fb = (): AgentResponse => ({
      text: parsed.code === ERROR_CODES.RATE_LIMITED ? 'AI at full capacity (30 req/min). Wait ~30s.'
        : parsed.code === ERROR_CODES.AUTH_FAILED ? 'AI authentication failed — check GROQ_API_KEY.'
        : 'AI service unavailable. Try again shortly.',
      actions: [],
    })

    if (model === MODEL_DEEP) {
      try {
        return await callGroqWithTools(client, agentKey, MODEL_FAST, system, messages, 0.6, userId)
      } catch { return fb() }
    }
    return fb()
  }
}

export async function analyzeWithAgent(agentType: string, content: string, userId: string): Promise<AgentResponse> {
  const client = getClient()
  if (!client) return { text: 'AI not configured — set GROQ_API_KEY.', actions: [] }

  const agentKey = agentType || 'career-coach'
  const model = AGENT_MODEL[agentKey] || MODEL_FAST
  const system = SYSTEM_PROMPTS[agentKey] || SYSTEM_PROMPTS['career-coach']
  const temp = AGENT_TEMP[agentKey] || 0.7

  try {
    return await callGroqWithTools(client, agentKey, model, system, [{ role: 'user', text: content }], temp, userId)
  } catch (err: any) {
    const parsed = parseGroqError(err)
    console.error(`[AI Error] agent=${agentKey} model=${model} code=${parsed.code}`, err?.message)

    const fb = (): AgentResponse => ({
      text: parsed.code === ERROR_CODES.RATE_LIMITED ? 'AI at full capacity. Wait ~30s.'
        : parsed.code === ERROR_CODES.AUTH_FAILED ? 'AI authentication failed.'
        : 'AI service unavailable.',
      actions: [],
    })

    if (model === MODEL_DEEP) {
      try { return await callGroqWithTools(client, agentKey, MODEL_FAST, system, [{ role: 'user', text: content }], 0.6, userId) }
      catch { return fb() }
    }
    return fb()
  }
}
