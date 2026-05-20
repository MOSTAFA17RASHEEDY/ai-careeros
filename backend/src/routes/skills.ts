import { Router } from 'express'
import { connectDb } from '../db/connection'
import { Skill } from '../db/models'
import { authMiddleware, type AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

const targetRoleSkills: Record<string, { name: string; required: number }[]> = {
  'Senior Software Engineer': [
    { name: 'TypeScript', required: 90 }, { name: 'React', required: 85 }, { name: 'Node.js', required: 85 },
    { name: 'Docker', required: 70 }, { name: 'AWS', required: 80 }, { name: 'PostgreSQL', required: 75 },
    { name: 'GraphQL', required: 70 }, { name: 'Kubernetes', required: 65 }, { name: 'System Design', required: 80 },
    { name: 'CI/CD', required: 75 },
  ],
  'Staff Engineer': [
    { name: 'TypeScript', required: 95 }, { name: 'React', required: 90 }, { name: 'Node.js', required: 90 },
    { name: 'Docker', required: 80 }, { name: 'AWS', required: 90 }, { name: 'PostgreSQL', required: 85 },
    { name: 'GraphQL', required: 80 }, { name: 'Kubernetes', required: 80 }, { name: 'System Design', required: 95 },
    { name: 'CI/CD', required: 85 }, { name: 'Leadership', required: 80 },
  ],
  'Engineering Manager': [
    { name: 'Leadership', required: 90 }, { name: 'Agile', required: 85 }, { name: 'System Design', required: 75 },
    { name: 'Budgeting', required: 70 }, { name: 'Technical Strategy', required: 85 },
  ],
  'Tech Lead': [
    { name: 'System Design', required: 85 }, { name: 'Code Review', required: 80 }, { name: 'Architecture', required: 85 },
    { name: 'Leadership', required: 75 }, { name: 'TypeScript', required: 80 },
  ],
  'Principal Architect': [
    { name: 'System Design', required: 95 }, { name: 'Architecture', required: 95 }, { name: 'Leadership', required: 85 },
    { name: 'Technical Strategy', required: 90 }, { name: 'Cloud Infrastructure', required: 85 },
  ],
}

router.get('/', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const skills = await Skill.find({ userId: req.userId }).sort({ name: 1 })
    res.json(skills)
  } catch {
    res.status(500).json({ error: 'Failed to fetch skills' })
  }
})

router.post('/analyze', async (req: AuthRequest, res) => {
  try {
    const { targetRole } = req.body
    if (!targetRole) { res.status(400).json({ error: 'targetRole is required' }); return }
    await connectDb()
    const skills = await Skill.find({ userId: req.userId })
    const currentSkills: Record<string, number> = {}
    for (const s of skills) currentSkills[s.name] = s.level
    const required = targetRoleSkills[targetRole]
    if (!required) { res.status(400).json({ error: `Unknown target role: ${targetRole}` }); return }
    const analysis = required.map(skill => ({
      name: skill.name, required: skill.required,
      current: currentSkills[skill.name] ?? 0,
      match: (currentSkills[skill.name] ?? 0) >= skill.required,
    }))
    res.json({ targetRole, analysis })
  } catch {
    res.status(500).json({ error: 'Failed to analyze skills' })
  }
})

router.post('/update', async (req: AuthRequest, res) => {
  try {
    const { name, level } = req.body
    if (!name || level === undefined) { res.status(400).json({ error: 'name and level are required' }); return }
    await connectDb()
    const s = await Skill.findOneAndUpdate(
      { userId: req.userId, name },
      { userId: req.userId, name, level: Number(level) },
      { upsert: true, new: true },
    )
    res.json({ name: s.name, level: s.level })
  } catch {
    res.status(500).json({ error: 'Failed to update skill' })
  }
})

export default router
