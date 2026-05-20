import { connectDb } from '../db/connection'
import { Resume, Skill, CareerGoal, PracticeSession, ActivityLog } from '../db/models'

export interface ToolDefinition {
  name: string
  description: string
  parameters: { type: 'object'; properties: Record<string, any>; required: string[] }
}

export interface ToolResult { success: boolean; data?: any; error?: string }

type ToolHandler = (args: any, userId: string) => Promise<ToolResult>

const tools: Record<string, { definition: ToolDefinition; handler: ToolHandler }> = {}

function register(name: string, def: ToolDefinition, handler: ToolHandler) {
  tools[name] = { definition: def, handler }
}

register('resume_list', {
  name: 'resume_list', description: 'List all resumes',
  parameters: { type: 'object', properties: {}, required: [] },
}, async (_a, uid) => {
  await connectDb()
  const docs = await Resume.find({ userId: uid }).sort({ updatedAt: -1 }).lean()
  return { success: true, data: docs.map(r => ({ id: r._id, title: r.title, target: r.target, score: r.score })) }
})

register('resume_get', {
  name: 'resume_get', description: 'Get full resume by ID',
  parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
}, async (args, uid) => {
  await connectDb()
  const r = await Resume.findOne({ _id: args.id, userId: uid }).lean()
  if (!r) return { success: false, error: 'Not found' }
  return { success: true, data: { id: r._id, title: r.title, target: r.target, score: r.score, versions: r.versions, content: r.content } }
})

register('resume_update', {
  name: 'resume_update', description: 'Update resume content. Send FULL content JSON as string, OR use section/data to update a single section.',
  parameters: { type: 'object', properties: {
    id: { type: 'string' }, content: { type: 'string' }, score: { type: 'number' },
    section: { type: 'string', description: 'Section name: summary, experience, education, skills, projects' },
    data: { type: 'string', description: 'JSON string of the section data to replace' },
  }, required: ['id'] },
}, async (args, uid) => {
  await connectDb()
  const r = await Resume.findOne({ _id: args.id, userId: uid })
  if (!r) return { success: false, error: 'Not found' }

  if (args.section && args.data !== undefined) {
    let content: any = {}
    try { content = JSON.parse(r.content || '{}') } catch { content = {} }
    try { content[args.section] = JSON.parse(args.data) } catch { content[args.section] = args.data }
    r.content = JSON.stringify(content)
  } else if (args.content !== undefined) {
    r.content = args.content
  }

  if (args.score !== undefined) r.score = Number(args.score)
  r.versions += 1; r.updatedAt = new Date()
  await r.save()
  return { success: true, data: { id: r._id, title: r.title, target: r.target, score: r.score, versions: r.versions } }
})

register('skill_list', {
  name: 'skill_list', description: 'List all current skills',
  parameters: { type: 'object', properties: {}, required: [] },
}, async (_a, uid) => {
  await connectDb()
  const skills = await Skill.find({ userId: uid }).sort({ name: 1 }).lean()
  return { success: true, data: skills.map(s => ({ name: s.name, level: s.level })) }
})

register('skill_update', {
  name: 'skill_update', description: 'Add or update a skill (0-100)',
  parameters: { type: 'object', properties: {
    name: { type: 'string' }, level: { type: 'number' },
  }, required: ['name', 'level'] },
}, async (args, uid) => {
  await connectDb()
  const s = await Skill.findOneAndUpdate(
    { userId: uid, name: args.name },
    { userId: uid, name: args.name, level: Number(args.level) },
    { upsert: true, new: true },
  ).lean()
  return { success: true, data: { name: s.name, level: s.level } }
})

register('goal_create', {
  name: 'goal_create', description: 'Create a career goal with optional steps. If a goal with the same title already exists, return it instead of creating a duplicate.',
  parameters: { type: 'object', properties: {
    title: { type: 'string' }, description: { type: 'string' }, deadline: { type: 'string' },
    steps: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, done: { type: 'boolean' } } }, description: 'Array of step objects with text and done' },
    resumeId: { type: 'string', description: 'ID of the linked resume' },
  }, required: ['title', 'description'] },
}, async (args, uid) => {
  await connectDb()
  const existing = await CareerGoal.findOne({ userId: uid, title: args.title }).lean()
  if (existing) return { success: true, data: { id: existing._id, title: existing.title, created: false, message: 'Goal already exists' } }
  const goal = await CareerGoal.create({
    userId: uid, title: args.title, description: args.description,
    deadline: args.deadline ? new Date(args.deadline) : undefined,
    steps: args.steps || [],
    resumeId: args.resumeId || undefined,
  })
  return { success: true, data: { id: goal._id, title: goal.title, created: true } }
})

register('goal_list', {
  name: 'goal_list', description: 'List career goals with their steps',
  parameters: { type: 'object', properties: {}, required: [] },
}, async (_a, uid) => {
  await connectDb()
  const goals = await CareerGoal.find({ userId: uid }).sort({ createdAt: -1 }).lean()
  return { success: true, data: goals.map(g => ({
    id: g._id, title: g.title, description: g.description, progress: g.progress,
    deadline: g.deadline, steps: g.steps || [], resumeId: g.resumeId,
  })) }
})

register('goal_update', {
  name: 'goal_update', description: 'Update goal progress, toggle steps, or link a resume',
  parameters: { type: 'object', properties: {
    id: { type: 'string' }, progress: { type: 'number' },
    stepIndex: { type: 'number', description: 'Index of the step to toggle done/undone' },
    stepDone: { type: 'boolean', description: 'Whether to mark the step done (true) or undone (false)' },
    resumeId: { type: 'string', description: 'Link a resume to this goal' },
  }, required: ['id'] },
}, async (args, uid) => {
  await connectDb()
  const g = await CareerGoal.findOne({ _id: args.id, userId: uid })
  if (!g) return { success: false, error: 'Not found' }

  if (args.progress !== undefined) g.progress = Number(args.progress)

  if (args.stepIndex !== undefined && args.stepDone !== undefined) {
    if (g.steps && g.steps[args.stepIndex]) {
      g.steps[args.stepIndex].done = args.stepDone
      const done = g.steps.filter(s => s.done).length
      g.progress = g.steps.length ? Math.round((done / g.steps.length) * 100) : 0
    }
  }

  if (args.resumeId !== undefined) g.resumeId = args.resumeId

  await g.save()
  return { success: true, data: { id: g._id, title: g.title, progress: g.progress, steps: g.steps, resumeId: g.resumeId } }
})

register('goal_delete', {
  name: 'goal_delete', description: 'Delete a career goal by ID',
  parameters: { type: 'object', properties: {
    id: { type: 'string' },
  }, required: ['id'] },
}, async (args, uid) => {
  await connectDb()
  const r = await CareerGoal.deleteOne({ _id: args.id, userId: uid })
  if (r.deletedCount === 0) return { success: false, error: 'Not found' }
  return { success: true }
})

register('practice_save', {
  name: 'practice_save', description: 'Save interview practice',
  parameters: { type: 'object', properties: {
    conversationId: { type: 'string' }, question: { type: 'string' }, answer: { type: 'string' },
    feedback: { type: 'string' }, category: { type: 'string' },
  }, required: ['question', 'answer', 'feedback', 'category'] },
}, async (args, uid) => {
  await connectDb()
  const s = await PracticeSession.create({
    userId: uid, conversationId: args.conversationId, question: args.question,
    answer: args.answer, feedback: args.feedback, category: args.category,
  })
  return { success: true, data: { id: s._id, category: s.category } }
})

register('practice_history', {
  name: 'practice_history', description: 'Get practice history',
  parameters: { type: 'object', properties: {
    conversationId: { type: 'string' }, limit: { type: 'number' },
  }, required: [] },
}, async (args, uid) => {
  await connectDb()
  const filter: any = { userId: uid }
  if (args.conversationId) filter.conversationId = args.conversationId
  const sessions = await PracticeSession.find(filter).sort({ createdAt: -1 }).limit(args.limit || 10).lean()
  return { success: true, data: sessions.map(s => ({ id: s._id, question: s.question, category: s.category, createdAt: s.createdAt })) }
})

register('activity_log', {
  name: 'activity_log', description: 'Log dashboard activity',
  parameters: { type: 'object', properties: {
    action: { type: 'string' }, detail: { type: 'string' },
  }, required: ['action', 'detail'] },
}, async (args, uid) => {
  await connectDb()
  await ActivityLog.create({ userId: uid, action: args.action, detail: args.detail, time: new Date() })
  return { success: true }
})

export function getToolDefinitions(agentType: string): ToolDefinition[] {
  if (agentType === '*') return Object.values(tools).map(t => t.definition).filter(Boolean)
  const names: Record<string, string[]> = {
    'career-coach': ['goal_create', 'goal_list', 'goal_update', 'activity_log'],
    'resume-coach': ['resume_list', 'resume_get', 'resume_update', 'activity_log'],
    'interview-prep': ['practice_save', 'practice_history', 'activity_log'],
    'skill-gap': ['skill_list', 'skill_update', 'activity_log'],
  }
  return (names[agentType] || []).map(n => tools[n]?.definition).filter(Boolean)
}

export async function executeTool(name: string, args: any, userId: string): Promise<ToolResult> {
  const t = tools[name]
  if (!t) return { success: false, error: `Unknown tool: ${name}` }
  try {
    return await t.handler(args, userId)
  } catch (err: any) {
    return { success: false, error: err.message || 'Execution failed' }
  }
}
