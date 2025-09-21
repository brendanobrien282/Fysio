# 🛡️ Supabase Authentication Setup Guide

Your PT Exercise Tracker now uses **Supabase** for real authentication! Follow these steps to get everything working.

## 🚀 Quick Setup (5 minutes)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Create a new project (choose any name, like "pt-exercise-tracker")
4. Wait for the project to initialize (takes ~2 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Project API Key** (the `anon public` key)

### 3. Configure Environment Variables

1. In your project folder (`src/`), copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` with your actual credentials:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

### 4. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `database-trigger-solution.sql` 
4. Paste it into the query editor
5. Click **"Run"** to execute

**Note:** If you already ran `database-schema.sql` and got a Row Level Security error, use `database-trigger-solution.sql` instead - it fixes the signup issue!

✅ **That's it!** Your authentication is now ready to use.

## 🔧 What You Get

- **Real user accounts** with secure email/password authentication
- **User profiles** that store name and PT information
- **Row Level Security** - users can only see their own data
- **Session management** - stay logged in across browser sessions
- **Database storage** ready for exercise tracking (future feature)

## 🧪 Testing

1. Start your development server: `npm run dev`
2. Try creating a new account with the registration form
3. Sign out and sign back in
4. Your user data should persist!

## 🛠️ Customization Options

In your Supabase dashboard, you can:

- **Authentication → Settings**: Configure password policies, email confirmations
- **Authentication → Templates**: Customize email templates
- **Authentication → Providers**: Add Google, GitHub, etc. social login
- **Database**: Add more tables for exercise tracking, progress history

## 🔒 Security Notes

- Your `.env.local` file is automatically ignored by git (secure)
- The anon key is safe to use in frontend code
- Row Level Security ensures data privacy
- Supabase handles password hashing and security automatically

## 🚨 Troubleshooting

**"Invalid API key" errors?**
- Double-check your credentials in `.env.local`
- Make sure you copied the `anon public` key, not the `service_role` key
- Restart your dev server after changing `.env.local`

**"Row Level Security policy" errors?**
- Use `database-trigger-solution.sql` instead of `database-schema.sql`
- This uses database triggers to automatically create user profiles
- Much more reliable than manual profile creation

**Database errors?**
- Make sure you ran the correct SQL file in your Supabase dashboard
- Check the SQL Editor for any error messages

**Still having issues?**
- Check the browser console for detailed error messages
- Verify your Supabase project is active and running

---

**Lok'tar, warrior! Your authentication fortress is now ready for battle!** 🏰⚔️
