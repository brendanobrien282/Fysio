import { createClient } from '@supabase/supabase-js'

// These will be your Supabase project credentials
// You'll get these from your Supabase dashboard -> Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-public-anon-key'

// Check if we have valid Supabase credentials
if (supabaseUrl === 'https://your-project-url.supabase.co' || supabaseAnonKey === 'your-public-anon-key') {
  console.error('🔥 SUPABASE SETUP REQUIRED! 🔥')
  console.error('Please set up your Supabase credentials in .env.local file')
  console.error('1. Go to https://supabase.com and create a new project')
  console.error('2. Go to Settings → API in your Supabase dashboard') 
  console.error('3. Copy your Project URL and anon public key')
  console.error('4. Update the .env.local file with real values')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define the User type based on what we need for the PT tracker
export interface UserProfile {
  id: string
  email: string
  name: string
  pt_name: string
  pt_email: string
  created_at?: string
  updated_at?: string
}

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData: { name: string; pt_name: string; pt_email: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          pt_name: userData.pt_name,
          pt_email: userData.pt_email,
        }
      }
    })

    if (error) throw error

    // The user profile will be automatically created by the database trigger
    // No need to manually insert into user_profiles table

    return data
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user with profile data
  getCurrentUser: async (): Promise<UserProfile | null> => {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null

    // Fetch user profile from our custom table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null

    return profile
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}
