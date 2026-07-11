import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { services } from '@/services/container'
import type { Session } from '@/types/domain'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    services.auth.getSession().then(setSession).finally(() => setLoading(false))
    return services.auth.onAuthStateChange(setSession)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      signIn: async (email, password) => {
        const nextSession = await services.auth.signIn(email, password)
        setSession(nextSession)
      },
      signOut: async () => {
        await services.auth.signOut()
        setSession(null)
      },
      resetPassword: (email) => services.auth.resetPassword(email),
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
