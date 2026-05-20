import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Target, Brain, ArrowRight, Crown, Zap, TrendingUp, BookOpen, Sparkles, CheckCheck, CalendarDays, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api, type ActivityItem, type Goal } from '../lib/api'

export function Dashboard() {
  const { user, usage, upgradeTo } = useAuth()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const deleteGoal = async (id: string) => {
    try {
      await api.goals.delete(id)
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    api.dashboard.stats()
      .then((data) => {
        setStats(data.stats)
        setActivity(data.recentActivity)
        setGoals(data.goals)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pct = usage ? Math.round((usage.aiCallsThisMonth / usage.limit) * 100) : 0
  const isFree = user?.tier === 'free'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome + Tier */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'there'} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isFree
                ? 'You\'re on the Free plan — 10 AI responses/month. Upgrade to Pro for unlimited access.'
                : `You're on the ${user?.tier?.charAt(0).toUpperCase()}${user?.tier?.slice(1)} plan — enjoy full AI access.`
              }
            </p>
          </div>
          {isFree && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={async () => { await upgradeTo('pro'); window.location.reload() }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
            >
              <Crown size={16} />
              Simulate Upgrade to Pro
            </motion.button>
          )}
        </div>

        {/* Usage Bar */}
        {usage && (
          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap size={16} className="text-amber-500" />
                <span className="font-medium">AI Responses Used This Month</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usage.aiCallsThisMonth} / {usage.limit}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-2 rounded-full ${pct >= 80 ? 'bg-red-400' : pct >= 50 ? 'bg-amber-400' : 'bg-blue-500'}`}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      {!loading && stats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map((s: any, i: number) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{s.value}</span>
                {s.unit && <span className="text-xs text-gray-400">{s.unit}</span>}
              </div>
              <div className="mt-1 text-xs text-gray-400">{s.trend}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main CTA - Single Chat Entry */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Link
          to="/app/coach"
          className="group block rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 hover:border-indigo-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Career Assistant</h2>
              <p className="text-sm text-gray-600 mt-0.5">One conversation. Real results. The AI understands what you need, takes action across goals, skills, resumes, and interview prep — all at once.</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-emerald-700 border border-emerald-200 shadow-sm">
              <Target size={11} /> Set goals
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-purple-700 border border-purple-200 shadow-sm">
              <Brain size={11} /> Track skills
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-orange-700 border border-orange-200 shadow-sm">
              <FileText size={11} /> Improve resumes
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-pink-700 border border-pink-200 shadow-sm">
              <BookOpen size={11} /> Practice interviews
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Manage Your Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/app/resumes" className="rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all text-center">
            <FileText size={20} className="mx-auto text-orange-500 mb-1.5" />
            <div className="text-sm font-medium text-gray-900">Resumes</div>
            <div className="text-[10px] text-gray-400 mt-0.5">View & edit</div>
          </Link>
          <Link to="/app/coach" className="rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all text-center">
            <Sparkles size={20} className="mx-auto text-indigo-500 mb-1.5" />
            <div className="text-sm font-medium text-gray-900">Assistant</div>
            <div className="text-[10px] text-gray-400 mt-0.5">AI chat</div>
          </Link>
          <Link to="/app/skills" className="rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all text-center">
            <Target size={20} className="mx-auto text-emerald-500 mb-1.5" />
            <div className="text-sm font-medium text-gray-900">Skills</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Track & analyze</div>
          </Link>
          <Link to="/app/coach" className="rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all text-center">
            <BookOpen size={20} className="mx-auto text-pink-500 mb-1.5" />
            <div className="text-sm font-medium text-gray-900">Practice</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Interview prep</div>
          </Link>
        </div>
      </motion.div>

      {/* Career Goals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Career Goals</h2>
          <span className="text-xs text-gray-400">{goals.length} total</span>
        </div>
        {goals.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <Target size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No career goals yet. Talk to the Career Assistant to set one!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{goal.title}</h3>
                      {goal.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{goal.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                      <button onClick={() => deleteGoal(goal.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors" title="Delete goal">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                <div className="h-1.5 rounded-full bg-gray-100 mb-3">
                  <div className="h-1.5 rounded-full bg-gray-900 transition-all" style={{ width: `${goal.progress}%` }} />
                </div>
                {goal.steps && goal.steps.length > 0 && (
                  <div className="space-y-1">
                    {goal.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          step.done ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                        }`}>
                          {step.done && <CheckCheck size={9} className="text-white" />}
                        </div>
                        <span className={step.done ? 'text-gray-400 line-through' : 'text-gray-700'}>{step.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                  {goal.resumeId && <span className="inline-flex items-center gap-1"><FileText size={10} />Linked to resume</span>}
                  {goal.deadline && <span className="inline-flex items-center gap-1"><CalendarDays size={10} />{new Date(goal.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
          {activity.length === 0 ? (
            <div className="p-6 text-center">
              <TrendingUp size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No activity yet. Talk to an AI agent above to get started!</p>
            </div>
          ) : activity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-4">
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{item.action}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.detail}</div>
              </div>
              <div className="text-xs text-gray-400 shrink-0">{item.time}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
