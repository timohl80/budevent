import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    // Add some additional debugging info
    googleClientIdPreview: process.env.GOOGLE_CLIENT_ID ? 
      process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET',
    googleClientSecretPreview: process.env.GOOGLE_CLIENT_SECRET ? 
      process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET',
  })
}
