import { Router } from 'express'
import { connectDb } from '../db/connection'
import { Conversation, Message } from '../db/models'
import mongoose from 'mongoose'

const router = Router()

const aiReplies = [
  "Great question! Let's break this down step by step. First, think about the requirements — what are the functional and non-functional requirements?",
  "That's a solid approach. One thing to consider is how you'd handle scale. What happens when you get 1M requests per second?",
  "Good thinking! Now let's talk about tradeoffs. Every design decision comes with tradeoffs — what are the pros and cons of your approach?",
  "Excellent! Let's drill deeper into that specific area. How would you implement caching to reduce database load?",
  "You're on the right track. For your resume, try framing achievements with concrete metrics. Instead of 'improved performance', say 'reduced latency by 40%'.",
  "Here's a salary negotiation tip: always get the offer in writing before discussing numbers. Then use market data to anchor high.",
]

router.get('/conversations', async (_req, res) => {
  try {
    await connectDb()
    const conversations = await Conversation.find().sort({ updatedAt: -1 }).lean()
    const result = await Promise.all(
      conversations.map(async (c) => {
        const lastMsg = await Message.findOne({ conversationId: c._id }).sort({ time: -1 }).lean()
        return {
          id: c._id,
          title: c.title,
          lastMessage: lastMsg?.text || '',
          time: c.updatedAt,
        }
      })
    )
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

router.get('/conversations/:id', async (req, res) => {
  try {
    await connectDb()
    const messages = await Message.find({
      conversationId: new mongoose.Types.ObjectId(String(req.params.id)),
    })
      .sort({ time: 1 })
      .lean()
    res.json(
      messages.map((m) => ({
        id: m._id,
        role: m.role,
        text: m.text,
        time: m.time,
      }))
    )
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

router.post('/messages', async (req, res) => {
  try {
    const { conversationId, text } = req.body
    if (!conversationId || !text) {
      res.status(400).json({ error: 'conversationId and text are required' })
      return
    }

    await connectDb()

    const convObjectId = new mongoose.Types.ObjectId(String(conversationId))
    const userMsg = await Message.create({
      conversationId: convObjectId,
      role: 'user',
      text,
      time: new Date(),
    })

    const reply = aiReplies[Math.floor(Math.random() * aiReplies.length)]
    const aiMsg = await Message.create({
      conversationId: convObjectId,
      role: 'assistant',
      text: reply,
      time: new Date(Date.now() + 1000),
    })

    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() })

    res.status(201).json({
      userMessage: { id: userMsg._id, role: 'user', text, time: userMsg.time },
      aiMessage: { id: aiMsg._id, role: 'assistant', text: reply, time: aiMsg.time },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

export default router
