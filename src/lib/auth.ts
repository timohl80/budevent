import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
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
