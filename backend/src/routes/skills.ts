import { Router } from 'express'
import { getDb } from '../db/schema'

const router = Router()

const targetRoleSkills: Record<string, { name: string; required: number }[]> = {
  'Senior Software Engineer': [
    { name: 'TypeScript', required: 90 },
    { name: 'React', required: 85 },
    { name: 'Node.js', required: 85 },
    { name: 'Docker', required: 70 },
    { name: 'AWS', required: 80 },
    { name: 'PostgreSQL', required: 75 },
    { name: 'GraphQL', required: 70 },
    { name: 'Kubernetes', required: 65 },
    { name: 'System Design', required: 80 },
    { name: 'CI/CD', required: 75 },
  ],
  'Staff Engineer': [
    { name: 'TypeScript', required: 95 },
    { name: 'React', required: 90 },
    { name: 'Node.js', required: 90 },
    { name: 'Docker', required: 80 },
    { name: 'AWS', required: 90 },
    { name: 'PostgreSQL', required: 85 },
    { name: 'GraphQL', required: 80 },
    { name: 'Kubernetes', required: 80 },
    { name: 'System Design', required: 95 },
    { name: 'CI/CD', required: 85 },
    { name: 'Leadership', required: 80 },
  ],
}

router.get('/', async (_req, res) => {
  try {
    const db = await getDb()
    const result = db.exec('SELECT name, level FROM skills ORDER BY name')[0]
    const skills = result
      ? result.values.map((row) => ({
          name: String(row[0]),
          level: Number(row[1]),
        }))
      : []
    res.json(skills)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skills' })
  }
})

router.post('/analyze', async (req, res) => {
  try {
    const { targetRole } = req.body
    if (!targetRole) {
      res.status(400).json({ error: 'targetRole is required' })
      return
    }

    const db = await getDb()
    const currentResult = db.exec('SELECT name, level FROM skills')[0]
    const currentSkills = currentResult
      ? Object.fromEntries(currentResult.values.map((row) => [String(row[0]), Number(row[1])]))
      : {}

    const required = targetRoleSkills[targetRole]
    if (!required) {
      res.status(400).json({ error: `Unknown target role: ${targetRole}` })
      return
    }

    const analysis = required.map((skill) => ({
      name: skill.name,
      required: skill.required,
      current: currentSkills[skill.name] ?? 0,
      match: (currentSkills[skill.name] ?? 0) >= skill.required,
    }))

    res.json({ targetRole, analysis })
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze skills' })
  }
})

export default router
