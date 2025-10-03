import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, userData: { name: string; pt_name: string; pt_email: string }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (err: any) {
        console.error('Error checking user:', err.message)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, 'session exists:', !!session);
      if (session?.user) {
        // User signed in - use session user directly
        console.log('Setting user from session:', !!session.user);
        setUser(session.user)
      } else {
        // User signed out
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: { name: string; pt_name: string; pt_email: string }) => {
    try {
      console.log('AuthContext signUp called with:', email);
      setError(null)
      setLoading(true)
      await auth.signUp(email, password, userData)
      console.log('AuthContext signUp completed successfully');
      // User state will be updated by the auth state change listener
    } catch (err: any) {
      console.log('AuthContext signUp error:', err);
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await auth.signIn(email, password)
      // User state will be updated by the auth state change listener
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await auth.signOut()
      // User state will be updated by the auth state change listener
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

