import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  Home,
  Dumbbell,
  BarChart3,
  User,
  Crown,
  Trophy,
  BookOpen,
  Settings,
} from 'lucide-react'

const menuItems = [
  { icon: Home, label: '首页', path: '/' },
  { icon: Dumbbell, label: '训练中心', path: '/training' },
  { icon: BarChart3, label: '复盘分析', path: '/review' },
  { icon: Trophy, label: '排行榜', path: '/leaderboard' },
  { icon: BookOpen, label: '学习资料', path: '/learn' },
  { icon: User, label: '个人中心', path: '/profile' },
  { icon: Settings, label: '设置', path: '/settings' },
]

export function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
      <div className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-poker-green text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Pro upgrade banner */}
      <div className="p-4">
        <div className="rounded-lg bg-gradient-to-br from-poker-green to-poker-green/80 p-4 text-white">
          <Crown className="h-8 w-8 text-poker-gold mb-2" />
          <h3 className="font-semibold">升级到 Pro</h3>
          <p className="text-xs text-white/80 mt-1">
            解锁无限训练和高级AI分析
          </p>
          <button className="mt-3 w-full rounded-md bg-poker-gold px-3 py-1.5 text-xs font-semibold text-black hover:bg-poker-gold/90 transition-colors">
            立即升级
          </button>
        </div>
      </div>
    </aside>
  )
}
