import { Router } from 'express'
import { getDb, saveDb } from '../db/schema'
import { randomUUID } from 'crypto'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const db = await getDb()
    const result = db.exec(`
      SELECT id, title, target, score, versions, updated FROM resumes ORDER BY updated DESC
    `)[0]
    const resumes = result
      ? result.values.map((row) => ({
          id: String(row[0]),
          title: String(row[1]),
          target: String(row[2]),
          score: Number(row[3]),
          versions: Number(row[4]),
          updated: String(row[5]),
        }))
      : []
    res.json(resumes)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const result = db.exec(
      `SELECT id, title, target, score, versions, content, updated, created FROM resumes WHERE id = ?`,
      [req.params.id]
    )[0]
    if (!result || !result.values.length) {
      res.status(404).json({ error: 'Resume not found' })
      return
    }
    const row = result.values[0] as any[]
    res.json({
      id: row[0],
      title: row[1],
      target: row[2],
      score: Number(row[3]),
      versions: Number(row[4]),
      content: row[5],
      updated: row[6],
      created: row[7],
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
    const db = await getDb()
    const id = randomUUID()
    db.run(
      `INSERT INTO resumes (id, title, target, score, versions, content) VALUES (?, ?, ?, 0, 1, '')`,
      [id, title, target]
    )
    saveDb()
    res.status(201).json({ id, title, target, score: 0, versions: 1, content: '' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resume' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const existing = db.exec('SELECT id FROM resumes WHERE id = ?', [req.params.id])[0]
    if (!existing || !existing.values.length) {
      res.status(404).json({ error: 'Resume not found' })
      return
    }
    const { title, target, score, content } = req.body
    const updates: string[] = []
    const params: (string | number)[] = []
    if (title) { updates.push('title = ?'); params.push(title) }
    if (target) { updates.push('target = ?'); params.push(target) }
    if (score !== undefined) { updates.push('score = ?'); params.push(Number(score)) }
    if (content !== undefined) { updates.push('content = ?'); params.push(String(content)) }
    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' })
      return
    }
    updates.push("updated = datetime('now')")
    params.push(req.params.id)
    db.run(`UPDATE resumes SET ${updates.join(', ')} WHERE id = ?`, params)
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resume' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const existing = db.exec('SELECT id FROM resumes WHERE id = ?', [req.params.id])[0]
    if (!existing || !existing.values.length) {
      res.status(404).json({ error: 'Resume not found' })
      return
    }
    db.run('DELETE FROM resumes WHERE id = ?', [req.params.id])
    saveDb()
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume' })
  }
})

export default router
