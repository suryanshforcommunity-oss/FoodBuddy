import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for our custom auth cookie set by the client
  const token = request.cookies.get('sb-access-token')?.value
  
  const isProtectedPath = ['/student', '/manager', '/warden'].some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    // Redirect unauthorized users back to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

// Only run middleware on protected routes to minimize edge function invocations
export const config = {
  matcher: ['/student/:path*', '/manager/:path*', '/warden/:path*'],
}
