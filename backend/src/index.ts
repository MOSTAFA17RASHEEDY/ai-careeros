import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDb } from './db/connection'
import { authMiddleware } from './middleware/auth'
import dashboardRoutes from './routes/dashboard'
import resumesRoutes from './routes/resumes'
import chatRoutes from './routes/chat'
import aiRoutes from './routes/ai'
import skillsRoutes from './routes/skills'
import goalsRoutes from './routes/goals'
import authRoutes from './routes/auth'
import seedRoutes from './routes/seed'

const PORT = process.env.PORT || 3001
const isDev = process.env.NODE_ENV !== 'production'
const corsOrigin = process.env.CORS_ORIGIN || (isDev ? 'http://localhost:5173' : '*')

const app = express()

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && (corsOrigin === '*' || corsOrigin.split(',').map(s => s.trim()).includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin === '*' ? origin : corsOrigin)
  } else if (corsOrigin === '*') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/seed', seedRoutes)
app.use('/api/dashboard', authMiddleware, dashboardRoutes)
app.use('/api/resumes', authMiddleware, resumesRoutes)
app.use('/api/chat', authMiddleware, chatRoutes)
app.use('/api/ai', authMiddleware, aiRoutes)
app.use('/api/skills', authMiddleware, skillsRoutes)
app.use('/api/goals', authMiddleware, goalsRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

if (process.env.VERCEL !== '1') {
  connectDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`AI CareerOS ${isDev ? 'dev' : 'production'} API on http://localhost:${PORT}`)
      })
    })
    .catch(console.error)
}

export default app
