import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X as XIcon } from 'lucide-react'
import { api, type SkillAnalysis } from '../lib/api'

const targetRoles = [
  'Senior Software Engineer',
  'Staff Engineer',
  'Engineering Manager',
  'Principal Architect',
  'Tech Lead',
]

export function SkillGapAnalysis() {
  const [role, setRole] = useState('')
  const [analysis, setAnalysis] = useState<SkillAnalysis[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async (targetRole: string) => {
    setRole(targetRole)
    setLoading(true)
    try {
      const result = await api.skills.analyze(targetRole)
      setAnalysis(result.analysis)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">See what skills you need for your target role.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8"
      >
        <label className="text-sm font-medium text-gray-700">Choose a target role to analyze</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {targetRoles.map((r) => (
            <button
              key={r}
              onClick={() => handleAnalyze(r)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                role === r && !loading
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {loading && (
        <div className="mt-8 text-sm text-gray-500">Analyzing your skills...</div>
      )}

      {analysis && !loading && (
        <div className="mt-8 space-y-3">
          {analysis.map((skill, i) => {
            const gap = skill.required - skill.current
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {skill.match ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <XIcon size={16} className="text-red-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{skill.current}%</span>
                    {' → '}
                    <span className="font-medium text-gray-700">{skill.required}%</span>
                    {gap > 0 && (
                      <span className="ml-1 text-red-500">({gap}% gap)</span>
                    )}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${skill.current}%` }}
                  />
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${skill.match ? 'bg-green-400' : 'bg-red-300'}`}
                    style={{ width: `${skill.required}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>Current</span>
                  <span>Required</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {!analysis && !loading && (
        <div className="mt-16 text-center">
          <TargetIcon className="mx-auto text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">Select a target role above to see your skill gaps.</p>
        </div>
      )}
    </div>
  )
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
