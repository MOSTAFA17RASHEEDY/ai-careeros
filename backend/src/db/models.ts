import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  createdAt: Date
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.model<IUser>('User', userSchema)

export interface IResume extends Document {
  title: string
  target: string
  score: number
  versions: number
  content: string
  updatedAt: Date
  createdAt: Date
}

const resumeSchema = new Schema<IResume>({
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
  title: string
  updatedAt: Date
  createdAt: Date
}

const conversationSchema = new Schema<IConversation>({
  title: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  role: 'user' | 'assistant'
  text: string
  time: Date
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
})

export const Message = mongoose.model<IMessage>('Message', messageSchema)

export interface ISkill extends Document {
  name: string
  level: number
}

const skillSchema = new Schema<ISkill>({
  name: { type: String, required: true, unique: true },
  level: { type: Number, default: 0 },
})

export const Skill = mongoose.model<ISkill>('Skill', skillSchema)

export interface IActivityLog extends Document {
  action: string
  detail: string
  time: Date
}

const activityLogSchema = new Schema<IActivityLog>({
  action: { type: String, required: true },
  detail: { type: String, required: true },
  time: { type: Date, default: Date.now },
})

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)
