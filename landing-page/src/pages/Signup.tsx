import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Crown, Sparkles } from 'lucide-react'

const planLabels: Record<string, { label: string; icon: any }> = {
  pro: { label: 'Pro — Start Free Trial', icon: Crown },
  enterprise: { label: 'Enterprise — Contact Sales', icon: Sparkles },
}

export function Signup() {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  const planInfo = planLabels[plan]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { signup, upgradeTo } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup(name, email, password)
      if (plan === 'pro') {
        await upgradeTo('pro')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AI CareerOS</h1>
          <p className="mt-2 text-sm text-gray-500">Create your account</p>
          {planInfo && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
              <planInfo.icon size={12} />
              {planInfo.label}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            {busy ? (plan === 'pro' ? 'Creating & upgrading...' : 'Creating account...') : plan === 'pro' ? 'Start Free Trial' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to={`/login${plan !== 'free' ? `?plan=${plan}` : ''}`} className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
