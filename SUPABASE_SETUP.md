# Supabase Setup Guide for BudEvent

## Prerequisites
- A Supabase account and project
- Node.js and pnpm installed

## Step 1: Install Dependencies
```bash
pnpm add @supabase/supabase-js
```

## Step 2: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** → **API** in your project dashboard
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Set Environment Variables

1. Create a `.env.local` file in your project root:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up Database Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the SQL

This will create:
- `events` table with proper structure
- Row Level Security (RLS) policies
- Sample data for testing

## Step 5: Test the Connection

1. Start your development server:
```bash
pnpm dev
```

2. Navigate to `/events` to see if events are loaded from Supabase
3. Try creating a new event at `/events/new`

## Database Schema

The `events` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `title` | TEXT | Event title (required) |
| `description` | TEXT | Event description (optional) |
| `starts_at` | TIMESTAMPTZ | Event start date/time (required) |
| `location` | TEXT | Event location (optional) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Record update timestamp |

## Security Features

- **Row Level Security (RLS)** is enabled
- **Public read access** for all events
- **Authenticated users only** can create/update/delete events
- **Indexed queries** for better performance

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check that `.env.local` exists and has correct values
   - Restart your dev server after adding environment variables

2. **"Failed to fetch events"**
   - Verify your Supabase URL and key are correct
   - Check that the `events` table exists in your database
   - Ensure RLS policies are properly configured

3. **"Permission denied"**
   - Check your RLS policies in Supabase
   - Verify user authentication status

### Need Help?

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the console for error messages
- Verify your database table structure matches the schema
