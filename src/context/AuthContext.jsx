import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null)
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error loading profile:', error.message)
      return null
    }

    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id)
      }
      if (mounted) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signUp = async ({ email, password, fullName }) => {
    if (!supabase) throw new Error('Supabase is not configured. Check your .env file.')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw error
    return data
  }

  const signIn = async ({ email, password }) => {
    if (!supabase) throw new Error('Supabase is not configured. Check your .env file.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      await fetchProfile(data.user.id)
    }
    return data
  }

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Supabase is not configured. Check your .env file.')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  const resetPasswordForEmail = async (email) => {
    if (!supabase) throw new Error('Supabase is not configured. Check your .env file.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    if (!supabase) throw new Error('Supabase is not configured. Check your .env file.')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  const refreshProfile = async () => {
    if (user?.id) {
      return fetchProfile(user.id)
    }
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
