import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Sparkles, Target, X, LogOut, BookOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

const iconMap: Record<string, ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  FileText: <FileText size={20} />,
  Sparkles: <Sparkles size={20} />,
  Target: <Target size={20} />,
  BookOpen: <BookOpen size={20} />,
}

const links = [
  { label: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard' },
  { label: 'Resumes', href: '/app/resumes', icon: 'FileText' },
  { label: 'Career Assistant', href: '/app/coach', icon: 'Sparkles' },
  { label: 'Skills', href: '/app/skills', icon: 'Target' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <span className="text-lg font-bold text-gray-900">AI CareerOS</span>
          <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              {iconMap[link.icon]}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'}
            </div>
            <div className="text-sm min-w-0">
              <div className="font-medium text-gray-900 truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
