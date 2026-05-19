import { Router } from 'express'
import { getDb, saveDb } from '../db/schema'
import { randomUUID } from 'crypto'

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
    const db = await getDb()
    const result = db.exec(`
      SELECT c.id, c.title, c.updated,
        (SELECT text FROM messages WHERE conversation_id = c.id ORDER BY time DESC LIMIT 1) as last_message
      FROM conversations c ORDER BY c.updated DESC
    `)[0]
    const conversations = result
      ? result.values.map((row) => ({
          id: String(row[0]),
          title: String(row[1]),
          lastMessage: String(row[3] || ''),
          time: String(row[2]),
        }))
      : []
    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

router.get('/conversations/:id', async (req, res) => {
  try {
    const db = await getDb()
    const result = db.exec(
      'SELECT id, role, text, time FROM messages WHERE conversation_id = ? ORDER BY time ASC',
      [req.params.id]
    )[0]
    const messages = result
      ? result.values.map((row) => ({
          id: String(row[0]),
          role: String(row[1]),
          text: String(row[2]),
          time: String(row[3]),
        }))
      : []
    res.json(messages)
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
    const db = await getDb()
    const userMsgId = randomUUID()
    const now = new Date().toISOString()
    db.run(
      'INSERT INTO messages (id, conversation_id, role, text, time) VALUES (?, ?, ?, ?, ?)',
      [userMsgId, conversationId, 'user', text, now]
    )

    const reply = aiReplies[Math.floor(Math.random() * aiReplies.length)]
    const aiMsgId = randomUUID()
    db.run(
      'INSERT INTO messages (id, conversation_id, role, text, time) VALUES (?, ?, ?, ?, ?)',
      [aiMsgId, conversationId, 'assistant', reply, new Date(Date.now() + 1000).toISOString()]
    )

    db.run("UPDATE conversations SET updated = datetime('now') WHERE id = ?", [conversationId])
    saveDb()

    res.status(201).json({
      userMessage: { id: userMsgId, role: 'user', text, time: now },
      aiMessage: { id: aiMsgId, role: 'assistant', text: reply, time: new Date(Date.now() + 1000).toISOString() },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

export default router
