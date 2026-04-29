import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Profile } from '@/pages/Profile'
import { Training } from '@/pages/Training'
import { Review } from '@/pages/Review'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="poker-ai-theme">
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/training"
                    element={
                      <ProtectedRoute>
                        <Training />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/review"
                    element={
                      <ProtectedRoute>
                        <Review />
                      </ProtectedRoute>
                    }
                  />
                  {/* Placeholder routes for future pages */}
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRoute>
                        <div className="container mx-auto px-4 py-8">
                          <h1 className="text-3xl font-bold">排行榜</h1>
                          <p className="text-muted-foreground mt-2">即将推出...</p>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/learn"
                    element={
                      <ProtectedRoute>
                        <div className="container mx-auto px-4 py-8">
                          <h1 className="text-3xl font-bold">学习资料</h1>
                          <p className="text-muted-foreground mt-2">即将推出...</p>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <div className="container mx-auto px-4 py-8">
                          <h1 className="text-3xl font-bold">设置</h1>
                          <p className="text-muted-foreground mt-2">即将推出...</p>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <div className="container mx-auto px-4 py-8 text-center">
                        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
                        <p className="text-xl text-muted-foreground mb-8">页面未找到</p>
                        <a href="/" className="text-poker-green hover:underline">
                          返回首页
                        </a>
                      </div>
                    }
                  />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
