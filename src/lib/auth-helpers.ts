import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }

  // For now, return a simple user object since we're not using Prisma
  // In production, you'd fetch from Supabase
  return {
    id: session.user.email, // Use email as ID since session doesn't have id
    email: session.user.email,
    name: session.user.name,
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}
