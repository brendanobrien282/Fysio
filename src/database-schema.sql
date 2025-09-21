-- ============================================
-- Supabase Database Schema for PT Exercise Tracker
-- ============================================
-- Run these SQL commands in your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query)

-- 1. Create user_profiles table to store additional user information
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  pt_name TEXT NOT NULL,
  pt_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for user_profiles table
-- Users can only view and edit their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create exercise_sessions table to track daily exercise completion
CREATE TABLE exercise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_exercises TEXT[] DEFAULT '{}',
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 5. Enable RLS for exercise_sessions
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for exercise_sessions
CREATE POLICY "Users can view their own sessions" ON exercise_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON exercise_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON exercise_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create exercise_notes table to store notes for each exercise
CREATE TABLE exercise_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  exercise_id TEXT NOT NULL,
  note_text TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Enable RLS for exercise_notes
ALTER TABLE exercise_notes ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for exercise_notes
CREATE POLICY "Users can view their own notes" ON exercise_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON exercise_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_sessions_updated_at
  BEFORE UPDATE ON exercise_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, pt_name, pt_email)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'pt_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'pt_email', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Instructions for Setup:
-- ============================================
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute all commands
-- 6. Authentication is now ready to use!
--
-- Optional: You can also set up email templates and additional 
-- authentication settings in Authentication > Settings
-- ============================================

