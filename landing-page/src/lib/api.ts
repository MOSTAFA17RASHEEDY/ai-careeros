const rawBase = import.meta.env.VITE_API_URL || ''
const API_BASE = rawBase ? (rawBase.startsWith('/') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`) : '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  dashboard: {
    stats: () => request<{ stats: DashboardStat[]; recentActivity: ActivityItem[]; goals: Goal[] }>('/dashboard/stats'),
  },
  resumes: {
    list: () => request<Resume[]>('/resumes'),
    get: (id: string) => request<ResumeDetail>(`/resumes/${id}`),
    create: (data: { title: string; target: string }) =>
      request<Resume>('/resumes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Resume>) =>
      request<{ success: boolean }>(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateSection: (id: string, section: string, data: any) =>
      request<{ success: boolean }>(`/resumes/${id}/section`, { method: 'PATCH', body: JSON.stringify({ section, data }) }),
    delete: (id: string) =>
      request<void>(`/resumes/${id}`, { method: 'DELETE' }),
  },
  chat: {
    conversations: () => request<Conversation[]>('/chat/conversations'),
    messages: (id: string) => request<Message[]>(`/chat/conversations/${id}`),
    send: (conversationId: string, text: string, agent?: string) =>
      request<{ userMessage: Message; aiMessage: Message }>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, text, agent }),
      }),
  },
  ai: {
    agent: (agent: string, content: string) =>
      request<{ agent: string; response: string; actions: AgentAction[] }>('/ai/agent', {
        method: 'POST',
        body: JSON.stringify({ agent, content }),
      }),
    state: (agent: string, conversationId?: string) =>
      request<{ agent: string; data: any }>(`/ai/state/${agent}${conversationId ? `?conversationId=${conversationId}` : ''}`),
    orchestrate: (text: string, conversationId?: string) =>
      request<OrchestrateResponse>('/ai/orchestrate', {
        method: 'POST',
        body: JSON.stringify({ text, conversationId }),
      }),
  },
  skills: {
    list: () => request<Skill[]>('/skills'),
    analyze: (targetRole: string) =>
      request<{ targetRole: string; analysis: SkillAnalysis[] }>('/skills/analyze', {
        method: 'POST',
        body: JSON.stringify({ targetRole }),
      }),
  },
  goals: {
    delete: (id: string) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
  },
}

export interface DashboardStat {
  label: string
  value: string
  unit: string
  trend: string
  color: string
}

export interface ActivityItem {
  id: string
  action: string
  detail: string
  time: string
}

export interface Resume {
  id: string
  title: string
  target: string
  score: number
  versions: number
  content?: string
  updated: string
  created?: string
}

export interface ResumeSections {
  summary?: string
  experience?: Experience[]
  education?: Education[]
  skills?: string[]
  projects?: Project[]
}

export interface Experience {
  id: string
  company: string
  role: string
  duration: string
  description: string
}

export interface Education {
  id: string
  school: string
  degree: string
  year: string
}

export interface Project {
  id: string
  name: string
  description: string
  link?: string
}

export interface ResumeDetail extends Resume {
  sections?: ResumeSections
}

export interface Conversation {
  id: string
  title: string
  lastMessage: string
  time: string
}

export interface AgentAction {
  tool: string
  args: any
  result: any
}

export interface OrchestrateResponse {
  text: string
  actions: AgentAction[]
  conversationId?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  time: string
  agent?: string
  actions?: AgentAction[]
}

export interface Skill {
  name: string
  level: number
}

export interface GoalStep {
  text: string
  done: boolean
}

export interface Goal {
  id: string
  title: string
  description?: string
  progress: number
  deadline?: string
  steps?: GoalStep[]
  resumeId?: string
  createdAt?: string
}

export interface SkillAnalysis {
  name: string
  required: number
  current: number
  match: boolean
}
