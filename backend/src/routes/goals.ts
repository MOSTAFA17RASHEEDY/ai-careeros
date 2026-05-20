import { Router } from 'express'
import { connectDb } from '../db/connection'
import { CareerGoal } from '../db/models'
import { authMiddleware, type AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const r = await CareerGoal.deleteOne({ _id: req.params.id, userId: req.userId })
    if (r.deletedCount === 0) { res.status(404).json({ error: 'Not found' }); return }
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete goal' })
  }
})

export default router
