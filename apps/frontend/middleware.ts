import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();

  // Add CSP header for security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  // Add cache control for static assets
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|ico|css|js)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Add locale detection if needed
  const locale = request.cookies.get('locale')?.value || 'en';

  // You can add authentication checks here
  const isAuthRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                      request.nextUrl.pathname.startsWith('/profile');

  if (isAuthRoute) {
    const token = request.cookies.get('token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};