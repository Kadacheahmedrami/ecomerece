import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for admin routes
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminAPI = pathname.startsWith('/api/admin')

  if (!isAdminPage && !isAdminAPI) {
    return NextResponse.next()
  }

  try {
    // Get the token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If no token, redirect to sign in
    if (!token) {
      if (isAdminAPI) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      const signInUrl = new URL('/api/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user has email
    if (!token.email) {
      if (isAdminAPI) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 401 }
        )
      }
      
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL
    const isAdmin = token.email === adminEmail

    if (!isAdmin) {
      if (isAdminAPI) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // User is admin, allow access
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    
    if (isAdminAPI) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}