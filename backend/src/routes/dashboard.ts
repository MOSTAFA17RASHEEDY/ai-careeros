import { Router } from 'express'
import { connectDb } from '../db/connection'
import { ActivityLog } from '../db/models'

const router = Router()

router.get('/stats', async (_req, res) => {
  try {
    await connectDb()
    const activityDocs = await ActivityLog.find().sort({ time: -1 }).limit(5)
    const recentActivity = activityDocs.map((a) => ({
      id: a._id,
      action: a.action,
      detail: a.detail,
      time: a.time,
    }))

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
