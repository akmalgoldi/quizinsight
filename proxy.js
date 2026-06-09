import { NextResponse } from 'next/server';

// Helper to decode JWT payload without jsonwebtoken library (since Next.js Middleware runs in Edge runtime)
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(payloadBase64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Static files, icons, and API routes bypass middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // User is logged in
  if (token) {
    const decoded = decodeJwt(token);
    if (!decoded) {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Redirect logged in user trying to access login/register
    if (pathname === '/login' || pathname === '/register') {
      if (decoded.role === 'LECTURER') {
        return NextResponse.redirect(new URL('/dashboard/lecturer', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard/student', request.url));
      }
    }

    // Role-based route protection
    if (pathname.startsWith('/dashboard/lecturer') && decoded.role !== 'LECTURER') {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }

    if (pathname.startsWith('/dashboard/student') && decoded.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard/lecturer', request.url));
    }
  } else {
    // User is NOT logged in
    // Redirect if trying to access dashboard pages
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
