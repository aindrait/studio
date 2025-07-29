import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const protectedRoutes = ['/admin'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const session = await getSession();
    if (!session) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
