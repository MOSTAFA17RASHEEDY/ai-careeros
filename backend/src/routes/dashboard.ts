import { Router } from 'express'
import { getDb } from '../db/schema'

const router = Router()

router.get('/stats', async (_req, res) => {
  try {
    const db = await getDb()
    const activity = db.exec(`
      SELECT id, action, detail, time FROM activity_log ORDER BY time DESC LIMIT 5
    `)[0]

    const recentActivity = activity
      ? activity.values.map((row) => ({
          id: row[0],
          action: row[1],
          detail: row[2],
          time: row[3],
        }))
      : []

    const stats = [
      { label: 'Resume Score', value: '78', unit: '/100', trend: '+12', color: 'bg-blue-500' },
      { label: 'Skill Match', value: '64', unit: '%', trend: '+8', color: 'bg-green-500' },
      { label: 'Interviews Prepped', value: '3', unit: '', trend: '+1', color: 'bg-purple-500' },
      { label: 'Career Progress', value: '45', unit: '%', trend: '+5', color: 'bg-amber-500' },
    ]

    res.json({ stats, recentActivity })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

export default router
