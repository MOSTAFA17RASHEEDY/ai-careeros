import { connectDb } from './connection'
import { User, Resume, Conversation, Message, Skill, ActivityLog } from './models'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

async function seed() {
  await connectDb()

  const userCount = await User.countDocuments()
  if (userCount === 0) {
    const hash = await bcrypt.hash('password123', 10)
    await User.create({ name: 'Alex Morgan', email: 'alex@example.com', passwordHash: hash })
    console.log('Test user created: alex@example.com / password123')
  }

  const resumeCount = await Resume.countDocuments()
  if (resumeCount > 0) {
    console.log('Database already seeded.')
    return
  }

  await Resume.insertMany([
    { title: 'Software Engineer v3', target: 'Acme Corp', score: 82, versions: 3, updatedAt: new Date(Date.now() - 2 * 3600000), createdAt: new Date() },
    { title: 'Software Engineer v2', target: 'TechCorp Inc', score: 74, versions: 2, updatedAt: new Date(Date.now() - 7 * 86400000), createdAt: new Date() },
    { title: 'Full Stack Developer', target: 'StartupXYZ', score: 68, versions: 1, updatedAt: new Date(Date.now() - 14 * 86400000), createdAt: new Date() },
    { title: 'Senior Backend Engineer', target: 'FinanceHub', score: 71, versions: 2, updatedAt: new Date(Date.now() - 21 * 86400000), createdAt: new Date() },
  ])

  const convIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
  await Conversation.insertMany([
    { _id: convIds[0], title: 'System Design Prep', updatedAt: new Date(Date.now() - 3600000), createdAt: new Date() },
    { _id: convIds[1], title: 'Resume Review', updatedAt: new Date(Date.now() - 86400000), createdAt: new Date() },
    { _id: convIds[2], title: 'Salary Negotiation', updatedAt: new Date(Date.now() - 2 * 86400000), createdAt: new Date() },
  ])

  await Message.insertMany([
    { conversationId: convIds[0], role: 'assistant', text: 'Hi Alex! I\'m your AI Career Coach. What would you like to work on today?', time: new Date(Date.now() - 70 * 60000) },
    { conversationId: convIds[0], role: 'user', text: 'I have a System Design interview at Google next week. Can you help me prep?', time: new Date(Date.now() - 69 * 60000) },
    { conversationId: convIds[0], role: 'assistant', text: 'Absolutely! Let\'s start with a mock question: "Design a URL shortening service like TinyURL." Take 2 minutes to think about it, then tell me your approach.', time: new Date(Date.now() - 69 * 60000) },
    { conversationId: convIds[0], role: 'user', text: 'I\'d start with the API design — POST to create, GET to redirect. Then think about storage and caching.', time: new Date(Date.now() - 67 * 60000) },
    { conversationId: convIds[0], role: 'assistant', text: 'Good start! Let\'s dig into each layer. For the database, would you use SQL or NoSQL? And how would you handle the 1:1 mapping between short codes and long URLs?', time: new Date(Date.now() - 66 * 60000) },
  ])

  await Skill.insertMany([
    { name: 'TypeScript', level: 85 },
    { name: 'React', level: 80 },
    { name: 'Node.js', level: 75 },
    { name: 'Docker', level: 60 },
    { name: 'AWS', level: 50 },
    { name: 'PostgreSQL', level: 65 },
    { name: 'GraphQL', level: 55 },
    { name: 'Kubernetes', level: 35 },
  ])

  await ActivityLog.insertMany([
    { action: 'Resume updated', detail: 'Software Engineer v3 — optimized for Acme Corp', time: new Date(Date.now() - 2 * 3600000) },
    { action: 'Skill gap analyzed', detail: 'Senior DevOps Engineer — 4 gaps identified', time: new Date(Date.now() - 86400000) },
    { action: 'Mock interview completed', detail: 'System Design round — score: 7/10', time: new Date(Date.now() - 2 * 86400000) },
    { action: 'Career goal set', detail: 'Target: Staff Engineer at Big Tech', time: new Date(Date.now() - 3 * 86400000) },
    { action: 'Resume created', detail: 'Product Manager v1 — generated from profile', time: new Date(Date.now() - 5 * 86400000) },
  ])

  console.log('Database seeded successfully.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
