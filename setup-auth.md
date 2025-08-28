# Authentication Setup Guide

## 1. Environment Variables

Add these to your `.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3001

# Database Configuration (use your Supabase connection string)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 2. Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 3. Database Setup

1. **Update your Supabase connection string** in `.env.local`
2. **Run Prisma migration**:
   ```bash
   npx prisma db push
   ```
3. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

## 4. Update Supabase RLS Policies

Run this SQL in your Supabase SQL Editor to allow authenticated users to create events:

```sql
-- Update the events table to include user_id
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for authenticated users
DROP POLICY IF EXISTS "Allow public insert" ON public.events;
CREATE POLICY "Allow authenticated insert" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Keep other policies as they are
```

## 5. Test the System

1. **Start your dev server**: `pnpm dev`
2. **Visit `/register`** to create an account
3. **Visit `/auth`** to sign in
4. **Try accessing `/events`** - should redirect to login if not authenticated
5. **After login, access `/events`** - should work

## 6. Features Available

- ✅ User registration with password hashing
- ✅ User login with credential verification
- ✅ Protected routes (events require authentication)
- ✅ Session management with NextAuth
- ✅ Sign out functionality
- ✅ Responsive navigation with auth status

## Troubleshooting

- **"Invalid credentials"**: Check if user exists in database
- **"Missing environment variables"**: Verify `.env.local` has all required vars
- **Database connection errors**: Check DATABASE_URL format
- **RLS policy issues**: Verify policies allow authenticated operations
