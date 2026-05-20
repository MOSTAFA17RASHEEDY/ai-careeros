import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { connectDb } from '../db/connection'
import { User, TIER_LIMITS } from '../db/models'
import { generateToken, authMiddleware, type AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ error: 'name, email, and password are required' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    await connectDb()
    const existing = await User.findOne({ email })
    if (existing) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const user = await User.create({ name, email, passwordHash, tier: 'free', aiCallsThisMonth: 0, aiCallMonth: month })

    const token = generateToken(String(user._id), user.name)
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, tier: user.tier },
      usage: { aiCallsThisMonth: 0, limit: TIER_LIMITS.free.aiMessagesPerMonth },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    await connectDb()
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    if (user.aiCallMonth !== month) {
      user.aiCallsThisMonth = 0
      user.aiCallMonth = month
      await user.save()
    }

    const token = generateToken(String(user._id), user.name)
    const limit = TIER_LIMITS[user.tier].aiMessagesPerMonth
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, tier: user.tier },
      usage: { aiCallsThisMonth: user.aiCallsThisMonth, limit },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to log in' })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    if (user.aiCallMonth !== month) {
      user.aiCallsThisMonth = 0
      user.aiCallMonth = month
      await user.save()
    }
    const limit = TIER_LIMITS[user.tier].aiMessagesPerMonth
    res.json({
      user: { id: user._id, name: user.name, email: user.email, tier: user.tier },
      usage: { aiCallsThisMonth: user.aiCallsThisMonth, limit },
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router
