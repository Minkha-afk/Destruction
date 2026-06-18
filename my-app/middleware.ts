import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/courses', '/explore', '/chat', '/profile', '/settings'];
// Routes only accessible when NOT logged in
const AUTH_ONLY_ROUTES = ['/auth'];

function getTokenFromRequest(req: NextRequest): string | null {
  // Check cookie
  const cookieToken = req.cookies.get('authToken')?.value;
  if (cookieToken) return cookieToken;
  // Also accept Bearer header (for API calls)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthOnly = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  const token = getTokenFromRequest(req);
  const isLoggedIn = token && !isTokenExpired(token);

  if (isProtected && !isLoggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && isLoggedIn) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all pages but skip static files, _next, and API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|public|placeholder.svg).*)'],
};
