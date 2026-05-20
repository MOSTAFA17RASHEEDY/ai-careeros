import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Bot, Plus, CheckCircle, FileText, Brain, Target, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { api, type OrchestrateResponse, type AgentAction } from '../lib/api'
import { ServicePanel } from '../components/agents/ServicePanel'
import { useAuth } from '../contexts/AuthContext'

const actionIcons: Record<string, any> = {
  resume_update: FileText, resume_get: FileText, resume_list: FileText,
  goal_create: Target, goal_list: Target, goal_update: Target,
  skill_update: Brain, skill_list: Brain,
  practice_save: BookOpen, practice_history: BookOpen,
  activity_log: CheckCircle,
}
const actionColors: Record<string, string> = {
  goal_create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  goal_list: 'bg-blue-50 text-blue-700 border-blue-200',
  goal_update: 'bg-amber-50 text-amber-700 border-amber-200',
  skill_update: 'bg-purple-50 text-purple-700 border-purple-200',
  skill_list: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  resume_update: 'bg-orange-50 text-orange-700 border-orange-200',
  resume_get: 'bg-orange-50 text-orange-700 border-orange-200',
  resume_list: 'bg-orange-50 text-orange-700 border-orange-200',
  practice_save: 'bg-pink-50 text-pink-700 border-pink-200',
  practice_history: 'bg-pink-50 text-pink-700 border-pink-200',
  activity_log: 'bg-gray-50 text-gray-700 border-gray-200',
}

function ActionChip({ action }: { action: AgentAction }) {
  const Icon = actionIcons[action.tool] || CheckCircle
  const label = action.tool.replace(/_/g, ' ')
  const color = actionColors[action.tool] || 'bg-gray-50 text-gray-700 border-gray-200'
  const success = !action.result?.error
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${color}`}>
      <Icon size={11} />
      {label}
      {success && <CheckCircle size={10} className="text-green-500" />}
    </div>
  )
}

const suggestions = [
  'Set a career goal to become a Senior Engineer',
  'Help me prepare for a frontend interview',
  'I want to improve my resume',
  'What skills do I need for a Staff role?',
]

export function CareerCoach() {
  const { refreshUsage } = useAuth()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: string; text: string; actions?: AgentAction[] }>>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showPanel, setShowPanel] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeId) return
    api.chat.conversations().then(list => {
      if (list.length > 0) setActiveId(list[0].id)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!activeId) return
    api.chat.messages(activeId).then(msgs =>
      setMessages(msgs.map(m => ({ role: m.role, text: m.text, actions: (m as any).actions })))
    ).catch(console.error)
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNew = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({}),
      })
      const conv = await res.json()
      setActiveId(conv.id)
      setMessages([])
    } catch {}
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return
    setSending(true)
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: text.trim() }])

    try {
      const result: OrchestrateResponse = await api.ai.orchestrate(text.trim(), activeId || undefined)
      setMessages(prev => [...prev, { role: 'assistant', text: result.text, actions: result.actions }])
      setRefreshKey(k => k + 1)
      if (result.conversationId) setActiveId(result.conversationId)
      refreshUsage()
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: err instanceof Error ? err.message : 'Failed to process request' }])
      refreshUsage()
    } finally {
      setSending(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-4 md:-m-6 lg:-m-8">
      {/* Top Bar */}
      <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Career Assistant</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleNew} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus size={14} /> New Session
          </button>
          <button onClick={() => setShowPanel(!showPanel)} className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
            showPanel ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-600'
          }`}>
            {showPanel ? 'Hide Data' : 'My Data'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!hasMessages ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} className="text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">What do you want to do?</h2>
                <p className="text-sm text-gray-500 mb-6">Describe your career goal or what you need help with. The AI will take real actions to help you.</p>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-2 group"
                    >
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                        <Bot size={16} className="text-indigo-600" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200">
                          {msg.actions.map((a, j) => <ActionChip key={j} action={a} />)}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {sending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-indigo-600" />
                    </div>
                    <div className="bg-gray-100 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-gray-200 p-4 md:p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(input) }} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe what you want to achieve..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Service Panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-gray-200 bg-gray-50 overflow-y-auto shrink-0"
            >
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-900 mb-1">Your Career Data</div>
                <p className="text-[10px] text-gray-400 mb-4">Goals, skills, resumes & practice sessions</p>
                <ServicePanel conversationId={activeId} key={refreshKey} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
