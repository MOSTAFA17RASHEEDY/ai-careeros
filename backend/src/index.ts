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

if (corsOrigin) {
  const allowedOrigins = corsOrigin === '*' ? '*' : corsOrigin.replace(/\/+$/, '').split(',').map((s) => s.trim())
  app.use(cors({ origin: allowedOrigins }))
}

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
