-- ============================================
-- BETTER SOLUTION: Use Database Triggers for Auto Profile Creation
-- ============================================
-- This is the recommended approach for handling user profile creation
-- Run this in your Supabase SQL Editor

-- 1. First, let's clean up the existing RLS policies and recreate them properly
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON user_profiles;

-- 2. Create a function that automatically creates a user profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, pt_name, pt_email)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'pt_name', 'PT Name Required'),
    COALESCE(new.raw_user_meta_data->>'pt_email', 'pt@example.com')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Now create the proper RLS policies (no INSERT policy needed since trigger handles it)
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Now you need to update your signup code to pass metadata
-- ============================================

