# 📧 Disable Email Confirmation for Development

For testing purposes, you can disable email confirmation in Supabase:

## Steps:
1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **"Email Confirmation"** section
4. **Uncheck** "Enable email confirmations"
5. Click **Save**

## ⚠️ Important Notes:
- This is good for **development/testing only**
- For production, you should keep email confirmation enabled
- Users can now sign up and immediately sign in without confirming email

## Alternative: Use Email Confirmation with Better UX
If you want to keep email confirmation enabled (recommended), see the next option for handling the confirmation flow properly.

