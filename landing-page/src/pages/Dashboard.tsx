import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, Target, ArrowRight } from 'lucide-react'
import { api, type DashboardStat, type ActivityItem } from '../lib/api'

const statLinks: Record<string, string> = {
  'Resume Score': '/app/resumes',
  'Skill Match': '/app/skills',
  'Interviews Prepped': '/app/coach',
  'Career Progress': '/app/skills',
}

const quickActions = [
  { label: 'Create Resume', icon: FileText, href: '/app/resumes', color: 'bg-blue-50 text-blue-600' },
  { label: 'Start Coaching', icon: MessageSquare, href: '/app/coach', color: 'bg-purple-50 text-purple-600' },
  { label: 'Analyze Skills', icon: Target, href: '/app/skills', color: 'bg-green-50 text-green-600' },
]

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.stats()
      .then((data) => {
        setStats(data.stats)
        setActivity(data.recentActivity)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your career overview at a glance.</p>
      </motion.div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const href = statLinks[stat.label]
          const card = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                {stat.unit && <span className="text-sm text-gray-500">{stat.unit}</span>}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                <span>{stat.trend}</span>
                <span>vs last month</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-gray-100">
                <div
                  className={`h-1.5 rounded-full ${stat.color}`}
                  style={{ width: stat.value }}
                />
              </div>
            </motion.div>
          )
          return href ? <Link key={stat.label} to={href}>{card}</Link> : card
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mt-8 grid md:grid-cols-3 gap-4"
      >
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-4 group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
              <action.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">{action.label}</div>
              <div className="text-xs text-gray-500">Go to {action.label.replace('Create ', '').replace('Start ', '').replace('Analyze ', '')}</div>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div className="mt-4 rounded-xl border border-gray-200 divide-y divide-gray-100">
          {activity.length === 0 && (
            <div className="p-6 text-sm text-gray-400 text-center">No activity yet. Start by creating a resume or analyzing your skills.</div>
          )}
          {activity.map((item) => (
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
