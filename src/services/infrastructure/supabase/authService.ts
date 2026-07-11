import { getSupabaseClient } from '@/lib/supabase'
import type { IAuthService } from '@/services/abstractions'
import type { Session } from '@/types/domain'
import { mapSession } from './mappers'

export class SupabaseAuthService implements IAuthService {
  private client = getSupabaseClient()

  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('Unable to sign in')
    return mapSession(data.user)
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) throw new Error(error.message)
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession()
    if (error) throw new Error(error.message)
    if (!data.session?.user) return null
    return mapSession(data.session.user)
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? mapSession(session.user) : null)
    })
    return () => data.subscription.unsubscribe()
  }

  async getUserId(): Promise<string> {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')
    return session.userId
  }
}
