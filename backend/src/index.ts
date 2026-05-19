import 'dotenv/config'
import express from 'express'
import path from 'path'
import { existsSync } from 'fs'
import cors from 'cors'
import { getDb, initSchema } from './db/schema'
import { authMiddleware } from './middleware/auth'
import dashboardRoutes from './routes/dashboard'
import resumesRoutes from './routes/resumes'
import chatRoutes from './routes/chat'
import skillsRoutes from './routes/skills'
import authRoutes from './routes/auth'

const PORT = process.env.PORT || 3001
const isDev = process.env.NODE_ENV !== 'production'

// On Render, CORS_ORIGIN should be set to the Vercel frontend URL
// In dev, it defaults to localhost:5173
const corsOrigin = process.env.CORS_ORIGIN || (isDev ? 'http://localhost:5173' : '*')

async function main() {
  await getDb()
  initSchema()

  const app = express()

  if (corsOrigin) {
    app.use(cors({ origin: corsOrigin }))
  }

  app.use(express.json())

  app.use('/api/auth', authRoutes)
  app.use('/api/dashboard', authMiddleware, dashboardRoutes)
  app.use('/api/resumes', authMiddleware, resumesRoutes)
  app.use('/api/chat', authMiddleware, chatRoutes)
  app.use('/api/skills', authMiddleware, skillsRoutes)

  // In production, try to serve the built frontend if it exists
  // (for single-server deployments). On Render, the frontend is on Vercel,
  // so this will gracefully fall through to API-only mode.
  if (!isDev) {
    const distPath = path.resolve(__dirname, '../../landing-page/dist')
    if (existsSync(distPath)) {
      app.use(express.static(distPath))
      app.use((req, res) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
          const index = path.join(distPath, 'index.html')
          if (existsSync(index)) {
            res.sendFile(index)
            return
          }
        }
        res.status(404).json({ error: 'Not found' })
      })
      return
    }
  }

  // API-only mode (used on Render or when frontend is served separately)
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.listen(PORT, () => {
    console.log(`AI CareerOS ${isDev ? 'dev' : 'production'} API on http://localhost:${PORT}`)
    if (!isDev && corsOrigin) {
      console.log(`  CORS origin: ${corsOrigin}`)
    }
  })
}

main().catch(console.error)
