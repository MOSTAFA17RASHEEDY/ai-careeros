import { Router } from 'express'
import { connectDb } from '../db/connection'
import mongoose from 'mongoose'
import { analyzeWithAgent } from '../services/ai'
import { orchestrate } from '../services/orchestrator'
import { CareerGoal, PracticeSession, Resume, Skill, User, Conversation, Message, TIER_LIMITS } from '../db/models'
import { authMiddleware, type AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.post('/orchestrate', async (req: AuthRequest, res) => {
  try {
    const { text, conversationId } = req.body
    if (!text) { res.status(400).json({ error: 'text is required' }); return }

    await connectDb()
    const user = await User.findById(req.userId)
    if (!user) { res.status(401).json({ error: 'User not found' }); return }

    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    if (user.aiCallMonth !== month) {
      user.aiCallsThisMonth = 0
      user.aiCallMonth = month
    }
    const limit = TIER_LIMITS[user.tier].aiMessagesPerMonth
    if (user.aiCallsThisMonth >= limit && limit < 99999) {
      await user.save()
      res.json({
        text: `You've used all ${limit} AI responses this month on your ${TIER_LIMITS[user.tier].label} plan. Upgrade to Pro for 500 AI responses/month.`,
        actions: [],
      })
      return
    }

    let convId = conversationId
    if (!convId) {
      const conv = await Conversation.create({ userId: req.userId, title: text.slice(0, 60) })
      convId = String(conv._id)
    }

    const convObjectId = new mongoose.Types.ObjectId(convId)

    await Message.create({
      conversationId: convObjectId, userId: req.userId, role: 'user', text, time: now,
    })

    const history = (await Message.find({ conversationId: convObjectId }).sort({ time: 1 }).lean()).map(
      m => ({ role: m.role, text: m.text })
    )

    const result = await orchestrate(history, req.userId!)

    user.aiCallsThisMonth += 1
    await user.save()

    await Message.create({
      conversationId: convObjectId, userId: req.userId, role: 'assistant',
      text: result.text, time: new Date(now.getTime() + 1000),
    })
    await Conversation.findByIdAndUpdate(convId, { updatedAt: new Date() })

    res.json({ text: result.text, actions: result.actions, conversationId: convId })
  } catch (err: any) {
    const msg = err?.code === 'RATE_LIMITED' ? 'AI at full capacity (30 req/min). Wait ~30s.' : 'Failed to process request'
    res.status(err?.code === 'RATE_LIMITED' ? 429 : 500).json({ error: msg })
  }
})

router.post('/agent', async (req: AuthRequest, res) => {
  try {
    const { agent, content } = req.body
    if (!agent || !content) { res.status(400).json({ error: 'agent and content are required' }); return }

    const valid = ['career-coach', 'resume-coach', 'interview-prep', 'skill-gap']
    if (!valid.includes(agent)) { res.status(400).json({ error: `Unknown agent: ${agent}` }); return }

    const result = await analyzeWithAgent(agent, content, req.userId!)
    res.json({ agent, response: result.text, actions: result.actions })
  } catch {
    res.status(500).json({ error: 'Failed to process AI request' })
  }
})

router.get('/state', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const uid = req.userId
    const [goals, resumes, skills, sessions] = await Promise.all([
      CareerGoal.find({ userId: uid }).sort({ createdAt: -1 }).lean(),
      Resume.find({ userId: uid }).sort({ updatedAt: -1 }).lean(),
      Skill.find({ userId: uid }).sort({ name: 1 }).lean(),
      PracticeSession.find({ userId: uid }).sort({ createdAt: -1 }).limit(10).lean(),
    ])
    res.json({
      goals: goals.map(g => ({ id: g._id, title: g.title, description: g.description, progress: g.progress, deadline: g.deadline, steps: g.steps || [], resumeId: g.resumeId, createdAt: g.createdAt })),
      resumes: resumes.map(r => ({ id: r._id, title: r.title, target: r.target, score: r.score, versions: r.versions, updated: r.updatedAt })),
      skills: skills.map(s => ({ name: s.name, level: s.level })),
      practiceSessions: sessions.map(s => ({ id: s._id, question: s.question, category: s.category, createdAt: s.createdAt })),
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch state' })
  }
})

router.get('/state/:agent', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const { agent } = req.params
    const uid = req.userId
    let data: Record<string, any> = {}

    switch (agent) {
      case 'career-coach': {
        const goals = await CareerGoal.find({ userId: uid }).sort({ createdAt: -1 }).lean()
        data.goals = goals.map(g => ({ id: g._id, title: g.title, description: g.description, progress: g.progress, deadline: g.deadline, steps: g.steps || [], resumeId: g.resumeId, createdAt: g.createdAt }))
        break
      }
      case 'resume-coach': {
        const resumes = await Resume.find({ userId: uid }).sort({ updatedAt: -1 }).lean()
        data.resumes = resumes.map(r => ({ id: r._id, title: r.title, target: r.target, score: r.score, versions: r.versions, updated: r.updatedAt }))
        break
      }
      case 'interview-prep': {
        const { conversationId } = req.query as any
        const filter: any = { userId: uid }
        if (conversationId) filter.conversationId = conversationId
        const sessions = await PracticeSession.find(filter).sort({ createdAt: -1 }).limit(10).lean()
        data.practiceSessions = sessions.map(s => ({ id: s._id, question: s.question, category: s.category, createdAt: s.createdAt }))
        break
      }
      case 'skill-gap': {
        const skills = await Skill.find({ userId: uid }).sort({ name: 1 }).lean()
        data.skills = skills.map(s => ({ name: s.name, level: s.level }))
        break
      }
      default: res.status(400).json({ error: 'Unknown agent' }); return
    }
    res.json({ agent, data })
  } catch {
    res.status(500).json({ error: 'Failed to fetch agent state' })
  }
})

router.post('/upgrade', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const { tier } = req.body
    if (!tier || !['pro', 'enterprise'].includes(tier)) {
      res.status(400).json({ error: 'Specify tier: pro or enterprise' }); return
    }
    const user = await User.findByIdAndUpdate(req.userId, { tier }, { new: true }).lean()
    if (!user) { res.status(404).json({ error: 'User not found' }); return }
    const limit = TIER_LIMITS[user.tier]
    res.json({
      success: true,
      tier: user.tier,
      message: `Upgraded to ${limit.label}! You now get ${limit.aiMessagesPerMonth} AI responses/month.`,
    })
  } catch {
    res.status(500).json({ error: 'Failed to upgrade' })
  }
})

export default router
