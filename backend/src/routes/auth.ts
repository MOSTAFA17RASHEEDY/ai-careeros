import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb, saveDb } from '../db/schema'
import { generateToken, authMiddleware, type AuthRequest } from '../middleware/auth'
import { randomUUID } from 'crypto'

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

    const db = await getDb()
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email])[0]
    if (existing && existing.values.length) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }

    const id = randomUUID()
    const passwordHash = await bcrypt.hash(password, 10)
    db.run('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, name, email, passwordHash])
    saveDb()

    const token = generateToken(id, name)
    res.status(201).json({ token, user: { id, name, email } })
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

    const db = await getDb()
    const result = db.exec('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email])[0]
    if (!result || !result.values.length) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const row = result.values[0] as any[]
    const valid = await bcrypt.compare(password, String(row[3]))
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const token = generateToken(String(row[0]), String(row[1]))
    res.json({ token, user: { id: row[0], name: row[1], email: row[2] } })
  } catch (err) {
    res.status(500).json({ error: 'Failed to log in' })
  }
})

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: { id: req.userId, name: req.userName } })
})

export default router
