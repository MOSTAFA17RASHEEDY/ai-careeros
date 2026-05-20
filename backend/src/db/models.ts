import mongoose, { Schema, Document } from 'mongoose'

export type Tier = 'free' | 'pro' | 'enterprise'

export const TIER_LIMITS: Record<Tier, { aiMessagesPerMonth: number; resumeAnalysesPerMonth: number; label: string }> = {
  free: { aiMessagesPerMonth: 10, resumeAnalysesPerMonth: 2, label: 'Free' },
  pro: { aiMessagesPerMonth: 500, resumeAnalysesPerMonth: 50, label: 'Pro' },
  enterprise: { aiMessagesPerMonth: 99999, resumeAnalysesPerMonth: 99999, label: 'Enterprise' },
}

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  tier: Tier
  aiCallsThisMonth: number
  aiCallMonth: string
  createdAt: Date
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  aiCallsThisMonth: { type: Number, default: 0 },
  aiCallMonth: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.model<IUser>('User', userSchema)

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  target: string
  score: number
  versions: number
  content: string
  updatedAt: Date
  createdAt: Date
}

const resumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  target: { type: String, required: true },
  score: { type: Number, default: 0 },
  versions: { type: Number, default: 1 },
  content: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

export const Resume = mongoose.model<IResume>('Resume', resumeSchema)

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  updatedAt: Date
  createdAt: Date
}

const conversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: 'user' | 'assistant'
  text: string
  time: Date
  agent?: string
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
  agent: { type: String },
})

export const Message = mongoose.model<IMessage>('Message', messageSchema)

export interface ISkill extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  level: number
}

const skillSchema = new Schema<ISkill>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  level: { type: Number, default: 0 },
})

skillSchema.index({ userId: 1, name: 1 }, { unique: true })

export const Skill = mongoose.model<ISkill>('Skill', skillSchema)

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId
  action: string
  detail: string
  time: Date
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true },
  detail: { type: String, required: true },
  time: { type: Date, default: Date.now },
})

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)

export interface CareerGoalStep {
  text: string
  done: boolean
}

export interface ICareerGoal extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description: string
  progress: number
  deadline?: Date
  steps: CareerGoalStep[]
  resumeId?: string
  createdAt: Date
}

const careerGoalSchema = new Schema<ICareerGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  progress: { type: Number, default: 0 },
  deadline: { type: Date },
  steps: [{ text: String, done: { type: Boolean, default: false } }],
  resumeId: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export const CareerGoal = mongoose.model<ICareerGoal>('CareerGoal', careerGoalSchema)

export interface IPracticeSession extends Document {
  userId: mongoose.Types.ObjectId
  conversationId?: string
  question: string
  answer: string
  feedback: string
  category: string
  createdAt: Date
}

const practiceSessionSchema = new Schema<IPracticeSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  conversationId: { type: String },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  feedback: { type: String, required: true },
  category: { type: String, required: true, enum: ['behavioral', 'system-design', 'coding', 'frontend'] },
  createdAt: { type: Date, default: Date.now },
})

export const PracticeSession = mongoose.model<IPracticeSession>('PracticeSession', practiceSessionSchema)
