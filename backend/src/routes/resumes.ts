import { Router } from 'express'
import { connectDb } from '../db/connection'
import { Resume } from '../db/models'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    await connectDb()
    const docs = await Resume.find().sort({ updatedAt: -1 })
    const resumes = docs.map((r) => ({
      id: r._id,
      title: r.title,
      target: r.target,
      score: r.score,
      versions: r.versions,
      updated: r.updatedAt,
    }))
    res.json(resumes)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    await connectDb()
    const r = await Resume.findById(req.params.id)
    if (!r) {
      res.status(404).json({ error: 'Resume not found' })
      return
    }
    res.json({
      id: r._id,
      title: r.title,
      target: r.target,
      score: r.score,
      versions: r.versions,
      content: r.content,
      updated: r.updatedAt,
      created: r.createdAt,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, target } = req.body
    if (!title || !target) {
      res.status(400).json({ error: 'title and target are required' })
      return
    }
    await connectDb()
    const r = await Resume.create({ title, target, score: 0, versions: 1, content: '' })
    res.status(201).json({ id: r._id, title: r.title, target: r.target, score: 0, versions: 1, content: '' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resume' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    await connectDb()
    const r = await Resume.findById(req.params.id)
    if (!r) {
      res.status(404).json({ error: 'Resume not found' })
      return
    }
    const { title, target, score, content } = req.body
    if (title !== undefined) r.title = title
    if (target !== undefined) r.target = target
    if (score !== undefined) r.score = Number(score)
    if (content !== undefined) r.content = String(content)
    r.updatedAt = new Date()
    await r.save()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resume' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await connectDb()
    const r = await Resume.findByIdAndDelete(req.params.id)
    if (!r) {
      res.status(404).json({ error: 'Resume not found' })
      return
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume' })
  }
})

export default router
