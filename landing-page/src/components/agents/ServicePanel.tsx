import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, BookOpen, FileText, Clock, CheckCircle, Zap, Award, Brain } from 'lucide-react'
import { API_BASE } from '../../lib/api'

interface Goal { id: string; title: string; description?: string; progress: number; deadline?: string; steps?: { text: string; done: boolean }[]; resumeId?: string; createdAt: string }
interface Skill { name: string; level: number }
interface PracticeSession { id: string; question: string; category: string; createdAt: string }
interface ResumeItem { id: string; title: string; target: string; score: number; versions: number; updated: string }

interface AllData {
  goals: Goal[]
  skills: Skill[]
  practiceSessions: PracticeSession[]
  resumes: ResumeItem[]
}

export function ServicePanel({ conversationId }: { conversationId?: string | null }) {
  const [data, setData] = useState<AllData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const token = localStorage.getItem('token')
    fetch(`${API_BASE}/ai/state`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [conversationId])

  if (loading) {
    return (
      <div className="text-sm text-gray-400 flex items-center gap-2 py-4">
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
        Loading...
      </div>
    )
  }

  if (!data) return null

  const isEmpty = data.goals.length === 0 && data.skills.length === 0 &&
    data.practiceSessions.length === 0 && data.resumes.length === 0

  if (isEmpty) {
    return (
      <div className="text-center py-8">
        <Brain size={28} className="mx-auto mb-2 text-gray-300" />
        <p className="text-xs text-gray-400">No data yet. Send a message above to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <GoalsPanel goals={data.goals} />
      <SkillsPanel skills={data.skills} />
      <ResumePanel resumes={data.resumes} />
      <PracticePanel sessions={data.practiceSessions} />
    </div>
  )
}

function GoalsPanel({ goals }: { goals: Goal[] }) {
  const total = goals.length
  const avgProgress = total ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / total) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">Career Goals</h3>
        <span className="text-xs text-gray-400">{goals.length}</span>
      </div>
      {goals.length === 0 ? (
        <EmptySection icon={Target} text="No goals yet." />
      ) : (
        <div className="space-y-1.5">
          {goals.slice(0, 4).map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-2.5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-900 truncate">{goal.title}</span>
                <span className="text-xs font-medium text-gray-500">{goal.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-gray-900 transition-all" style={{ width: `${goal.progress}%` }} />
              </div>
              {goal.steps && goal.steps.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {goal.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px]">
                      <div className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center shrink-0 ${step.done ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                        {step.done && <span className="text-white leading-none" style={{fontSize: 7}}>✓</span>}
                      </div>
                      <span className={step.done ? 'text-gray-400 line-through' : 'text-gray-600'}>{step.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {goal.resumeId && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                  <FileText size={9} /> Linked to resume
                </div>
              )}
              {goal.deadline && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                  <Clock size={9} />
                  {new Date(goal.deadline).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      {total > 0 && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
          <TrendingUp size={10} /> Avg progress: {avgProgress}%
        </div>
      )}
    </div>
  )
}

function SkillsPanel({ skills }: { skills: Skill[] }) {
  const high = skills.filter(s => s.level >= 70).length
  const medium = skills.filter(s => s.level >= 40 && s.level < 70).length
  const low = skills.filter(s => s.level < 40).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">Skills</h3>
        <span className="text-xs text-gray-400">{skills.length}</span>
      </div>
      {skills.length === 0 ? (
        <EmptySection icon={Zap} text="No skills tracked yet." />
      ) : (
        <div className="flex flex-wrap gap-1">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                skill.level >= 70 ? 'bg-green-50 text-green-700 border-green-200' :
                skill.level >= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {skill.name}
              <span className="opacity-60">{skill.level}%</span>
            </div>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><Award size={10} />{high} strong</span>
          <span className="flex items-center gap-1"><TrendingUp size={10} />{medium} building</span>
          <span className="flex items-center gap-1"><Target size={10} />{low} gaps</span>
        </div>
      )}
    </div>
  )
}

function ResumePanel({ resumes }: { resumes: ResumeItem[] }) {
  const avgScore = resumes.length ? Math.round(resumes.reduce((s, r) => s + r.score, 0) / resumes.length) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">Resumes</h3>
        <span className="text-xs text-gray-400">{resumes.length}</span>
      </div>
      {resumes.length === 0 ? (
        <EmptySection icon={FileText} text="No resumes yet." />
      ) : (
        <div className="space-y-1.5">
          {resumes.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-gray-900">{r.title}</div>
                  <div className="text-[10px] text-gray-400">{r.target}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <CheckCircle size={9} />
                  {r.score}%
                </div>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">v{r.versions} · {r.updated}</div>
            </div>
          ))}
        </div>
      )}
      {resumes.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
          <TrendingUp size={10} /> Avg score: {avgScore}%
        </div>
      )}
    </div>
  )
}

function PracticePanel({ sessions }: { sessions: PracticeSession[] }) {
  const categories = [...new Set(sessions.map(s => s.category))]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">Practice</h3>
        <span className="text-xs text-gray-400">{sessions.length}</span>
      </div>
      {sessions.length === 0 ? (
        <EmptySection icon={BookOpen} text="No practice saved yet." />
      ) : (
        <div className="space-y-1.5">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-2.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-gray-900 truncate">{s.question.slice(0, 45)}</span>
                <span className="text-[10px] text-gray-400 capitalize">{s.category}</span>
              </div>
              <div className="text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {categories.map(c => (
            <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{c}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptySection({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="text-center py-4 text-gray-400">
      <Icon size={20} className="mx-auto mb-1 opacity-40" />
      <p className="text-[10px]">{text}</p>
    </div>
  )
}
