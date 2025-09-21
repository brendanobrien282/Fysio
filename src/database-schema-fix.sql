-- ============================================
-- FIX for Row Level Security Policy Issue
-- ============================================
-- Run this in your Supabase SQL Editor to fix the signup issue

-- 1. Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- 2. Create a more permissive INSERT policy for new user registration
-- This allows authenticated users to insert a profile with their own user ID
CREATE POLICY "Enable insert for authenticated users during signup" ON user_profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- 3. Alternative: If the above doesn't work, temporarily disable RLS for INSERT
-- (You can re-enable it later after testing)
-- Uncomment the lines below if needed:

-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- 
-- -- Then after testing, re-enable with this command:
-- -- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Make sure the auth.users table allows the profile creation
-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;

