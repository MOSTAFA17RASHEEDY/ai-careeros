import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'careeros-dev-secret-change-in-production'

export { JWT_SECRET }

export interface AuthRequest extends Request {
  userId?: string
  userName?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; name: string }
    req.userId = decoded.userId
    req.userName = decoded.name
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function generateToken(userId: string, name: string): string {
  return jwt.sign({ userId, name }, JWT_SECRET, { expiresIn: '7d' })
}
