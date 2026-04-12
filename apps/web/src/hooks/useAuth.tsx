import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/auth'
import api from '@/lib/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, companyName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        localStorage.setItem('access_token', session.access_token)
        fetchUser()
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          localStorage.setItem('access_token', session.access_token)
          fetchUser()
        } else {
          localStorage.removeItem('access_token')
          setUser(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUser() {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function register(email: string, password: string, fullName: string, companyName: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) throw authError
    if (!authData.user) throw new Error('Registration failed')

    await api.post('/auth/register', {
      company_name: companyName,
      full_name: fullName,
      email,
      supabase_user_id: authData.user.id,
    })
  }

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
