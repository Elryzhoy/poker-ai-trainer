import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  subscription: 'free' | 'pro' | 'elite'
  gamesPlayed: number
  winRate: number
  joinDate: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          subscription: 'free',
          gamesPlayed: 0,
          winRate: 0,
          joinDate: new Date().toISOString(),
        }
        setUserProfile(profile)
        localStorage.setItem('userProfile', JSON.stringify(profile))
      } else {
        setUserProfile(null)
        localStorage.removeItem('userProfile')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      let message = '登录失败，请重试'
      if (err.code === 'auth/user-not-found') message = '用户不存在'
      if (err.code === 'auth/wrong-password') message = '密码错误'
      if (err.code === 'auth/invalid-email') message = '邮箱格式不正确'
      if (err.code === 'auth/too-many-requests') message = '登录尝试过多，请稍后再试'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      setLoading(true)
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
    } catch (err: any) {
      let message = '注册失败，请重试'
      if (err.code === 'auth/email-already-in-use') message = '该邮箱已被注册'
      if (err.code === 'auth/weak-password') message = '密码强度不够，至少需要6个字符'
      if (err.code === 'auth/invalid-email') message = '邮箱格式不正确'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google登录失败，请重试')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('userProfile')
    } catch (err) {
      setError('退出失败，请重试')
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
