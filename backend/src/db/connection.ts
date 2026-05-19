import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

const globalAny = globalThis as any
let cached = globalAny.mongooseCache || { conn: null, promise: null }
globalAny.mongooseCache = cached

export async function connectDb() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}
