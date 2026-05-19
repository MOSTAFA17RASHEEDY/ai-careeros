import { getDb, saveDb, initSchema } from './schema'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

async function seed() {
  const db = await getDb()
  initSchema()

  const existingUsers = db.exec("SELECT COUNT(*) as count FROM users")[0]
  if (!existingUsers || Number(existingUsers.values[0][0]) === 0) {
    const hash = await bcrypt.hash('password123', 10)
    db.run('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [randomUUID(), 'Alex Morgan', 'alex@example.com', hash])
    saveDb()
    console.log('Test user created: alex@example.com / password123')
  }

  const existing = db.exec("SELECT COUNT(*) as count FROM resumes")[0]
  if (existing && Number(existing.values[0][0]) > 0) {
    console.log('Database already seeded.')
    return
  }

  db.run(`INSERT INTO resumes (id, title, target, score, versions, updated) VALUES
    ('r1', 'Software Engineer v3', 'Acme Corp', 82, 3, datetime('now', '-2 hours')),
    ('r2', 'Software Engineer v2', 'TechCorp Inc', 74, 2, datetime('now', '-7 days')),
    ('r3', 'Full Stack Developer', 'StartupXYZ', 68, 1, datetime('now', '-14 days')),
    ('r4', 'Senior Backend Engineer', 'FinanceHub', 71, 2, datetime('now', '-21 days'))
  `)

  db.run(`INSERT INTO conversations (id, title, updated) VALUES
    ('c1', 'System Design Prep', datetime('now', '-1 hours')),
    ('c2', 'Resume Review', datetime('now', '-1 days')),
    ('c3', 'Salary Negotiation', datetime('now', '-2 days'))
  `)

  db.run(`INSERT INTO messages (id, conversation_id, role, text, time) VALUES
    ('m1', 'c1', 'assistant', 'Hi Alex! I''m your AI Career Coach. What would you like to work on today?', datetime('now', '-70 minutes')),
    ('m2', 'c1', 'user', 'I have a System Design interview at Google next week. Can you help me prep?', datetime('now', '-69 minutes')),
    ('m3', 'c1', 'assistant', 'Absolutely! Let''s start with a mock question: "Design a URL shortening service like TinyURL." Take 2 minutes to think about it, then tell me your approach.', datetime('now', '-69 minutes')),
    ('m4', 'c1', 'user', 'I''d start with the API design — POST to create, GET to redirect. Then think about storage and caching.', datetime('now', '-67 minutes')),
    ('m5', 'c1', 'assistant', 'Good start! Let''s dig into each layer. For the database, would you use SQL or NoSQL? And how would you handle the 1:1 mapping between short codes and long URLs?', datetime('now', '-66 minutes'))
  `)

  db.run(`INSERT INTO skills (id, name, level) VALUES
    ('s1', 'TypeScript', 85),
    ('s2', 'React', 80),
    ('s3', 'Node.js', 75),
    ('s4', 'Docker', 60),
    ('s5', 'AWS', 50),
    ('s6', 'PostgreSQL', 65),
    ('s7', 'GraphQL', 55),
    ('s8', 'Kubernetes', 35)
  `)

  db.run(`INSERT INTO activity_log (id, action, detail, time) VALUES
    ('a1', 'Resume updated', 'Software Engineer v3 — optimized for Acme Corp', datetime('now', '-2 hours')),
    ('a2', 'Skill gap analyzed', 'Senior DevOps Engineer — 4 gaps identified', datetime('now', '-1 days')),
    ('a3', 'Mock interview completed', 'System Design round — score: 7/10', datetime('now', '-2 days')),
    ('a4', 'Career goal set', 'Target: Staff Engineer at Big Tech', datetime('now', '-3 days')),
    ('a5', 'Resume created', 'Product Manager v1 — generated from profile', datetime('now', '-5 days'))
  `)

  saveDb()
  console.log('Database seeded successfully.')
}

seed().catch(console.error)
