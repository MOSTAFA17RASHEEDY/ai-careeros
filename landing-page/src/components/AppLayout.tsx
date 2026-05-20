import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Crown, Zap, BarChart3, Sparkles } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuth } from '../contexts/AuthContext'

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-amber-100 text-amber-700',
  enterprise: 'bg-purple-100 text-purple-700',
}
const tierIcons: Record<string, any> = {
  free: Zap,
  pro: Crown,
  enterprise: Sparkles,
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, usage, upgradeTo } = useAuth()
  const TierIcon = tierIcons[user?.tier || 'free']
  const pct = usage ? Math.min(100, Math.round((usage.aiCallsThisMonth / usage.limit) * 100)) : 0
  const isFree = user?.tier === 'free'

  const handleUpgrade = async () => {
    try {
      await upgradeTo('pro')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-100 flex items-center px-4 gap-3 md:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 -ml-2"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Tier Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tierColors[user?.tier || 'free']}`}>
            <TierIcon size={12} />
            {user?.tier ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1) : 'Free'}
          </div>

          {/* Usage Bar */}
          {usage && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <BarChart3 size={12} />
              <div className="w-24 h-1.5 rounded-full bg-gray-100">
                <div
                  className={`h-1.5 rounded-full transition-all ${pct >= 80 ? 'bg-red-400' : 'bg-blue-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span>{usage.aiCallsThisMonth}/{usage.limit} AI calls</span>
            </div>
          )}

          {/* Upgrade CTA */}
          {isFree && (
            <button
              onClick={handleUpgrade}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
            >
              <Crown size={12} />
              Upgrade to Pro
            </button>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
