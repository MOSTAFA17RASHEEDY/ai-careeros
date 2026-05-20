import { Router } from 'express'
import { connectDb } from '../db/connection'
import { Resume, Conversation, CareerGoal, Skill, ActivityLog, User, TIER_LIMITS } from '../db/models'
import { AuthRequest } from '../middleware/auth'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const uid = req.userId
    await connectDb()

    const [resumes, goals, skills, conversations, activities, user] = await Promise.all([
      Resume.find({ userId: uid }).sort({ updatedAt: -1 }).lean(),
      CareerGoal.find({ userId: uid }).sort({ createdAt: -1 }).lean(),
      Skill.find({ userId: uid }).sort({ name: 1 }).lean(),
      Conversation.find({ userId: uid }).sort({ updatedAt: -1 }).lean(),
      ActivityLog.find({ userId: uid }).sort({ time: -1 }).limit(5).lean(),
      User.findById(uid).lean(),
    ])

    const avgScore = resumes.length ? Math.round(resumes.reduce((s, r) => s + r.score, 0) / resumes.length) : 0
    const skillsHigh = skills.filter(s => s.level >= 70).length
    const goalsInProgress = goals.filter(g => g.progress < 100).length

    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const needsReset = user && user.aiCallMonth !== month
    const aiCalls = needsReset ? 0 : (user?.aiCallsThisMonth || 0)
    const tier = (user?.tier || 'free') as 'free' | 'pro' | 'enterprise'
    const limit = TIER_LIMITS[tier].aiMessagesPerMonth

    const stats = [
      { label: 'Resumes', value: String(resumes.length), unit: '', trend: avgScore > 0 ? `${avgScore}% avg` : '—', color: 'bg-blue-500' },
      { label: 'Skill Coverage', value: String(skillsHigh), unit: `/${skills.length}`, trend: skills.length > 0 ? 'strong' : 'add skills', color: 'bg-green-500' },
      { label: 'Conversations', value: String(conversations.length), unit: '', trend: `${limit - aiCalls} AI calls left`, color: 'bg-purple-500' },
      { label: 'Goals Active', value: String(goalsInProgress), unit: `/${goals.length}`, trend: 'in progress', color: 'bg-amber-500' },
    ]

    const recentActivity = activities.map(a => ({
      id: a._id, action: a.action, detail: a.detail, time: a.time,
    }))

    const goalsData = goals.map(g => ({
      id: g._id, title: g.title, description: g.description, progress: g.progress,
      deadline: g.deadline, steps: g.steps || [], resumeId: g.resumeId, createdAt: g.createdAt,
    }))

    res.json({ stats, recentActivity, usage: { aiCallsThisMonth: aiCalls, limit, tier: TIER_LIMITS[tier].label }, goals: goalsData })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard' })
  }
})

export default router
