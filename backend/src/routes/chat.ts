import { Router } from 'express'
import { connectDb } from '../db/connection'
import { Conversation, Message, User, TIER_LIMITS } from '../db/models'
import mongoose from 'mongoose'
import { chat } from '../services/ai'
import { authMiddleware, type AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/conversations', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const conversations = await Conversation.find({ userId: req.userId }).sort({ updatedAt: -1 }).lean()
    const result = await Promise.all(
      conversations.map(async (c) => {
        const lastMsg = await Message.findOne({ conversationId: c._id }).sort({ time: -1 }).lean()
        return { id: c._id, title: c.title, lastMessage: lastMsg?.text || '', time: c.updatedAt }
      })
    )
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

router.post('/conversations', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const { title } = req.body
    const conv = await Conversation.create({ userId: req.userId, title: title || 'New Chat' })
    res.status(201).json({ id: conv._id, title: conv.title, lastMessage: '', time: conv.updatedAt })
  } catch {
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

router.get('/conversations/:id', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const conv = await Conversation.findOne({ _id: req.params.id, userId: req.userId })
    if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return }
    const messages = await Message.find({ conversationId: conv._id }).sort({ time: 1 }).lean()
    res.json(messages.map(m => ({ id: m._id, role: m.role, text: m.text, time: m.time, agent: m.agent })))
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

router.post('/messages', async (req: AuthRequest, res) => {
  try {
    const { conversationId, text, agent: agentType } = req.body
    if (!conversationId || !text) { res.status(400).json({ error: 'conversationId and text are required' }); return }

    await connectDb()

    const conv = await Conversation.findOne({ _id: conversationId, userId: req.userId })
    if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return }

    const user = await User.findById(req.userId)
    if (!user) { res.status(401).json({ error: 'User not found' }); return }

    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    if (user.aiCallMonth !== month) {
      user.aiCallsThisMonth = 0
      user.aiCallMonth = month
    }
    const limit = TIER_LIMITS[user.tier].aiMessagesPerMonth

    const convObjectId = new mongoose.Types.ObjectId(String(conversationId))
    const userMsg = await Message.create({
      conversationId: convObjectId, userId: req.userId, role: 'user', text, time: now, agent: agentType || 'career-coach',
    })

    if (user.aiCallsThisMonth >= limit && limit < 99999) {
      await user.save()
      const aiMsg = await Message.create({
        conversationId: convObjectId, userId: req.userId, role: 'assistant',
        text: `You've used all ${limit} AI responses this month on your ${TIER_LIMITS[user.tier].label} plan. [Upgrade to Pro](/#upgrade) for 500 AI responses/month.`,
        time: new Date(now.getTime() + 1000), agent: agentType || 'career-coach',
      })
      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() })
      res.status(201).json({
        userMessage: { id: userMsg._id, role: 'user', text, time: now, agent: userMsg.agent },
        aiMessage: { id: aiMsg._id, role: 'assistant', text: aiMsg.text, time: aiMsg.time, agent: aiMsg.agent },
      })
      return
    }

    const messages = await Message.find({ conversationId: convObjectId }).sort({ time: 1 }).lean()
    const history = messages.map(m => ({ role: m.role, text: m.text }))
    const response = await chat(agentType || 'career-coach', history, req.userId!)

    user.aiCallsThisMonth += 1
    await user.save()

    const aiMsg = await Message.create({
      conversationId: convObjectId, userId: req.userId, role: 'assistant',
      text: response.text, time: new Date(now.getTime() + 1000), agent: agentType || 'career-coach',
    })

    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() })

    res.status(201).json({
      userMessage: { id: userMsg._id, role: 'user', text, time: now, agent: userMsg.agent },
      aiMessage: { id: aiMsg._id, role: 'assistant', text: response.text, time: aiMsg.time, agent: aiMsg.agent, actions: response.actions },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

export default router
