import { Router } from 'express'
import { connectDb } from '../db/connection'
import { Resume } from '../db/models'
import { authMiddleware, type AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const docs = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 })
    const resumes = docs.map((r) => ({
      id: r._id, title: r.title, target: r.target, score: r.score, versions: r.versions, updated: r.updatedAt,
    }))
    res.json(resumes)
  } catch {
    res.status(500).json({ error: 'Failed to fetch resumes' })
  }
})

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const r = await Resume.findOne({ _id: req.params.id, userId: req.userId })
    if (!r) { res.status(404).json({ error: 'Resume not found' }); return }
    let sections = {}
    try { sections = JSON.parse(r.content || '{}') } catch {}
    res.json({
      id: r._id, title: r.title, target: r.target, score: r.score, versions: r.versions,
      content: r.content, sections, updated: r.updatedAt, created: r.createdAt,
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch resume' })
  }
})

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, target } = req.body
    if (!title || !target) { res.status(400).json({ error: 'title and target are required' }); return }
    await connectDb()
    const r = await Resume.create({ userId: req.userId, title, target, score: 0, versions: 1, content: '' })
    res.status(201).json({ id: r._id, title: r.title, target: r.target, score: 0, versions: 1, content: '' })
  } catch {
    res.status(500).json({ error: 'Failed to create resume' })
  }
})

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const r = await Resume.findOne({ _id: req.params.id, userId: req.userId })
    if (!r) { res.status(404).json({ error: 'Resume not found' }); return }
    const { title, target, score, content, sections } = req.body
    if (title !== undefined) r.title = title
    if (target !== undefined) r.target = target
    if (score !== undefined) r.score = Number(score)
    if (content !== undefined) r.content = String(content)
    if (sections !== undefined) {
      let existing = {}
      try { existing = JSON.parse(r.content || '{}') } catch {}
      Object.assign(existing, sections)
      r.content = JSON.stringify(existing)
    }
    r.updatedAt = new Date()
    await r.save()
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to update resume' })
  }
})

router.patch('/:id/section', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const r = await Resume.findOne({ _id: req.params.id, userId: req.userId })
    if (!r) { res.status(404).json({ error: 'Resume not found' }); return }
    const { section, data } = req.body
    if (!section || data === undefined) { res.status(400).json({ error: 'section and data are required' }); return }

    let content: any = {}
    try { content = JSON.parse(r.content || '{}') } catch { content = {} }
    content[section] = data
    r.content = JSON.stringify(content)
    r.updatedAt = new Date()
    await r.save()
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to update section' })
  }
})

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await connectDb()
    const r = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!r) { res.status(404).json({ error: 'Resume not found' }); return }
    res.status(204).send()
  } catch {
    res.status(500).json({ error: 'Failed to delete resume' })
  }
})

export default router
