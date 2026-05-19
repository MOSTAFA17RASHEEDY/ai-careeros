const API_BASE = import.meta.env.VITE_API_URL || '/api'

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
    stats: () => request<{ stats: DashboardStat[]; recentActivity: ActivityItem[] }>('/dashboard/stats'),
  },
  resumes: {
    list: () => request<Resume[]>('/resumes'),
    get: (id: string) => request<Resume>(`/resumes/${id}`),
    create: (data: { title: string; target: string }) =>
      request<Resume>('/resumes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Resume>) =>
      request<{ success: boolean }>(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/resumes/${id}`, { method: 'DELETE' }),
  },
  chat: {
    conversations: () => request<Conversation[]>('/chat/conversations'),
    messages: (id: string) => request<Message[]>(`/chat/conversations/${id}`),
    send: (conversationId: string, text: string) =>
      request<{ userMessage: Message; aiMessage: Message }>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, text }),
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

export interface Conversation {
  id: string
  title: string
  lastMessage: string
  time: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  time: string
}

export interface Skill {
  name: string
  level: number
}

export interface SkillAnalysis {
  name: string
  required: number
  current: number
  match: boolean
}
