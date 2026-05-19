export const mockUser = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  avatar: 'AM',
  memberSince: 'Jan 2026',
}

export const mockDashboardStats = [
  { label: 'Resume Score', value: '78', unit: '/100', trend: '+12', color: 'bg-blue-500' },
  { label: 'Skill Match', value: '64', unit: '%', trend: '+8', color: 'bg-green-500' },
  { label: 'Interviews Prepped', value: '3', unit: '', trend: '+1', color: 'bg-purple-500' },
  { label: 'Career Progress', value: '45', unit: '%', trend: '+5', color: 'bg-amber-500' },
]

export const mockRecentActivity = [
  { action: 'Resume updated', detail: 'Software Engineer v3 — optimized for Acme Corp', time: '2h ago' },
  { action: 'Skill gap analyzed', detail: 'Senior DevOps Engineer — 4 gaps identified', time: '1d ago' },
  { action: 'Mock interview completed', detail: 'System Design round — score: 7/10', time: '2d ago' },
  { action: 'Career goal set', detail: 'Target: Staff Engineer at Big Tech', time: '3d ago' },
  { action: 'Resume created', detail: 'Product Manager v1 — generated from profile', time: '5d ago' },
]

export const mockResumes = [
  {
    id: '1',
    title: 'Software Engineer v3',
    target: 'Acme Corp',
    score: 82,
    updated: '2h ago',
    versions: 3,
  },
  {
    id: '2',
    title: 'Software Engineer v2',
    target: 'TechCorp Inc',
    score: 74,
    updated: '1w ago',
    versions: 2,
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    target: 'StartupXYZ',
    score: 68,
    updated: '2w ago',
    versions: 1,
  },
  {
    id: '4',
    title: 'Senior Backend Engineer',
    target: 'FinanceHub',
    score: 71,
    updated: '3w ago',
    versions: 2,
  },
]

export const mockMessages = [
  { id: '1', role: 'assistant', text: 'Hi Alex! I\'m your AI Career Coach. What would you like to work on today?', time: '10:30 AM' },
  { id: '2', role: 'user', text: 'I have a System Design interview at Google next week. Can you help me prep?', time: '10:31 AM' },
  {
    id: '3',
    role: 'assistant',
    text: 'Absolutely! Let\'s start with a mock question: "Design a URL shortening service like TinyURL." Take 2 minutes to think about it, then tell me your approach.',
    time: '10:31 AM',
  },
  { id: '4', role: 'user', text: 'I\'d start with the API design — POST to create, GET to redirect. Then think about storage and caching.', time: '10:33 AM' },
  {
    id: '5',
    role: 'assistant',
    text: 'Good start! Let\'s dig into each layer. For the database, would you use SQL or NoSQL? And how would you handle the 1:1 mapping between short codes and long URLs?',
    time: '10:34 AM',
  },
]

export const mockConversations = [
  { id: 'c1', title: 'System Design Prep', lastMessage: 'Let\'s dig into each layer...', time: '10:34 AM', active: true },
  { id: 'c2', title: 'Resume Review', lastMessage: 'Your bullet points could be more...', time: 'Yesterday', active: false },
  { id: 'c3', title: 'Salary Negotiation', lastMessage: 'Here\'s a script for the initial...', time: '2d ago', active: false },
]

export const mockCurrentSkills = [
  { name: 'TypeScript', level: 85 },
  { name: 'React', level: 80 },
  { name: 'Node.js', level: 75 },
  { name: 'Docker', level: 60 },
  { name: 'AWS', level: 50 },
  { name: 'PostgreSQL', level: 65 },
  { name: 'GraphQL', level: 55 },
  { name: 'Kubernetes', level: 35 },
]

export const mockRequiredSkills = [
  { name: 'TypeScript', required: 90, match: true },
  { name: 'React', required: 85, match: true },
  { name: 'Node.js', required: 85, match: false },
  { name: 'Docker', required: 70, match: false },
  { name: 'AWS', required: 80, match: false },
  { name: 'PostgreSQL', required: 75, match: false },
  { name: 'GraphQL', required: 70, match: false },
  { name: 'Kubernetes', required: 65, match: false },
  { name: 'System Design', required: 80, match: false },
  { name: 'CI/CD', required: 75, match: false },
]

export const mockTargetRoles = [
  'Senior Software Engineer',
  'Staff Engineer',
  'Engineering Manager',
  'Principal Architect',
  'Tech Lead',
]

export const sidebarLinks = [
  { label: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard' },
  { label: 'Resumes', href: '/app/resumes', icon: 'FileText' },
  { label: 'Career Coach', href: '/app/coach', icon: 'MessageSquare' },
  { label: 'Skill Gap', href: '/app/skills', icon: 'Target' },
]
