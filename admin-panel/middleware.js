import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export function middleware(request) {
  // Check for token in cookies (middleware runs on server side)
  const adminToken = request.cookies.get('adminToken')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // If there's no token and not on login page, redirect to login
  if (!adminToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a token and on login page, redirect to dashboard
  if (adminToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add a response header to indicate token presence
  const response = NextResponse.next();
  if (adminToken) {
    response.headers.set('x-admin-token', 'present');
  }
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 