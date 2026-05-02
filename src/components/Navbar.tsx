import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Spade,
} from 'lucide-react'

export function Navbar() {
  const { user, userProfile, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-poker-green flex items-center justify-center">
              <Spade className="h-5 w-5 text-poker-gold" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-poker-green">Poker</span>
              <span className="text-poker-gold">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              首页
            </Link>
            {user && (
              <>
                <Link
                  to="/training"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  训练
                </Link>
                <Link
                  to="/game"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  对弈
                </Link>
                <Link
                  to="/range"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  范围
                </Link>
                <Link
                  to="/hand-history"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  复盘
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* User menu or Login/Register */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile?.photoURL || undefined} />
                      <AvatarFallback className="bg-poker-green text-white">
                        {getInitials(userProfile?.displayName ?? null)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userProfile?.displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {userProfile?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    个人中心
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button variant="poker" onClick={() => navigate('/register')}>
                  免费注册
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              首页
            </Link>
            {user && (
              <>
                <Link
                  to="/training"
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  训练
                </Link>
                <Link
                  to="/game"
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  对弈
                </Link>
                <Link
                  to="/range"
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  范围
                </Link>
                <Link
                  to="/hand-history"
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  复盘
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  个人中心
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-md text-destructive"
                >
                  退出登录
                </button>
              </>
            )}
            {!user && (
              <div className="flex flex-col space-y-2 px-4 pt-2">
                <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}>
                  登录
                </Button>
                <Button variant="poker" onClick={() => { navigate('/register'); setMobileMenuOpen(false) }}>
                  免费注册
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
