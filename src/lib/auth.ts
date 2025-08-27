import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

// Add this temporarily to your auth config to debug
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

export const authOptions: NextAuthOptions = {
  providers: [
    (() => {
      console.log('=== GOOGLE PROVIDER SETUP ===');
      console.log('GOOGLE_CLIENT_ID available:', !!process.env.GOOGLE_CLIENT_ID);
      console.log('GOOGLE_CLIENT_SECRET available:', !!process.env.GOOGLE_CLIENT_SECRET);
      
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('❌ GOOGLE PROVIDER: Missing credentials!');
        console.error('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
        console.error('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
        throw new Error('Google OAuth credentials are missing!');
      }
      
      console.log('✅ GOOGLE PROVIDER: Creating provider with credentials');
      return GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      });
    })(),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Query Supabase for user
          const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, password_hash, is_approved, role')
            .eq('email', credentials.email)
            .single()

          if (error || !users) {
            console.log('User not found:', credentials.email)
            return null
          }

          // Check if user is approved
          if (!users.is_approved) {
            console.log('User not approved:', credentials.email)
            throw new Error('Account pending approval. Please wait for admin approval before logging in.');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            users.password_hash
          )

          if (isPasswordValid) {
            return {
              id: users.id,
              email: users.email,
              name: users.name,
              role: users.role,
              isApproved: users.is_approved,
            }
          }

          console.log('Invalid password for user:', credentials.email)
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day (more secure)
    updateAge: 60 * 60, // Update session every hour
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // If signing in with Google, check if user exists in our database
      if (account?.provider === 'google') {
        console.log('=== GOOGLE SIGN-IN DEBUG ===')
        console.log('User object:', user)
        console.log('Account object:', account)
        console.log('Profile object:', profile)
        console.log('Google sign-in attempt for:', user.email)
        console.log('==============================')
        try {
          console.log('Searching for user with email:', user.email)
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('id, email, is_approved')
            .eq('email', user.email)
            .single()

          if (existingUser) {
            console.log('Existing user found:', existingUser)
            // User exists, check if approved
            if (!existingUser.is_approved) {
              console.log('User not approved, throwing error')
              throw new Error('Account pending approval. Please wait for admin approval before logging in.')
            }
            console.log('User approved, allowing sign-in')
            return true
          } else {
            // Let's see what users exist in the database
            console.log('No user found with email:', user.email)
            const { data: allUsers, error: allUsersError } = await supabase
              .from('users')
              .select('email, name, is_approved, role')
              .limit(10)
            
            if (allUsersError) {
              console.error('Error fetching all users:', allUsersError)
            } else {
              console.log('All users in database:', allUsers)
            }
            console.log('New Google user, creating account...')
            // New Google user, create account
            console.log('Attempting to insert user with data:', {
              email: user.email,
              name: user.name,
              is_approved: true,
              role: 'USER',
              created_at: new Date().toISOString(),
              password_hash: null,
            })
            
            // Try to create user with minimal required fields first
            let userData: any = {
              email: user.email,
              name: user.name,
              is_approved: true,
              role: 'USER',
            }
            
            // Only add optional fields if they exist
            if (user.email) userData.email = user.email
            if (user.name) userData.name = user.name
            
            console.log('Attempting to insert user with minimal data:', userData)
            
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert(userData)
              .select()
              .single()

            if (insertError) {
              console.error('Error creating Google user:', insertError)
              console.error('Error details:', insertError.message, insertError.details, insertError.hint)
              return false
            }
            console.log('Google user created successfully:', newUser)
            return true
          }
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).provider = token.provider as string
      }
      return session
    }
  },
  pages: {
    signIn: '/welcome',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}
