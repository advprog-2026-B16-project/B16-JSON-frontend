import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control (RBAC) at middleware level
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/home', request.url));
    }

    // Redirect admins directly to admin panel if they visit home
    if (pathname === '/dashboard' || pathname === '/dashboard/home') {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    }
  }

  // Redirect to dashboard if already logged in and visiting login/register
  if (token && (pathname === '/login' || pathname === '/register')) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
