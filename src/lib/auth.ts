import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
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
            
            // Check if approved
            if (!existingUser.is_approved) {
              console.log('User not approved, throwing error')
              throw new Error('Account pending approval. Please wait for admin approval before logging in.')
            }
            
            // Important: Update the user object to use our database ID
            user.id = existingUser.id
            console.log('User approved, allowing sign-in with database ID:', user.id)
            return true
          } else {
            // New Google user - require approval instead of auto-approving
            console.log('New Google user, creating account with pending approval...')
            console.log('Attempting to insert user with data:', {
              email: user.email,
              name: user.name,
              is_approved: false, // Changed from true to false
              role: 'USER',
              created_at: new Date().toISOString(),
              password_hash: null,
            })
            
            // Try to create user with minimal required fields first
            let userData: any = {
              email: user.email,
              name: user.name,
              is_approved: false, // Changed from true to false
              role: 'USER',
            }
            
            // Only add optional fields if they exist
            if (user.email) userData.email = user.email
            if (user.name) userData.name = user.name
            
            console.log('Attempting to insert user with pending approval:', userData)
            
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
            console.log('Google user created with pending approval:', newUser)
            // Don't allow sign-in until approved
            throw new Error('Account created successfully! Please wait for admin approval before logging in.')
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
        // For Google users, we need to ensure we're using the database user ID, not the Google ID
        if (account?.provider === 'google') {
          console.log('JWT callback for Google user:', { user, account });
          // The user object from Google sign-in should have the database ID
          // since we're creating/updating the user in our database
          token.id = user.id
          console.log('JWT token set with database user ID:', token.id);
        } else {
          // For email users, use the user ID as normal
          token.id = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
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
