// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/', '/properties', '/about', '/contact'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths and API routes
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get token and admin data from cookies/localStorage
  const token = request.cookies.get('estate_token')?.value;
  const adminData = request.cookies.get('estate_admin_data')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If token exists but no admin data, try to get it
  if (!adminData) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const admin = JSON.parse(adminData);
    const status = admin.status || 'PENDING';
    const role = admin.role || 'USER';

    // Check if agent is trying to access agent routes
    if (role === 'AGENT' && pathname.startsWith('/agent')) {
      // If status is PENDING, redirect to waiting page
      if (status === 'PENDING' && pathname !== '/agent/waiting') {
        return NextResponse.redirect(new URL('/agent/waiting', request.url));
      }
      // If status is not PENDING, allow access
      if (status !== 'PENDING' && pathname === '/agent/waiting') {
        return NextResponse.redirect(new URL('/agent/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If admin data is invalid, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};