
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const protectedRoutes = ['/admin'];
const adminOnlyRoutes = ['/admin/categories', '/admin/users'];

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
    
    // Check for admin-only routes
    const isAdminOnlyRoute = adminOnlyRoutes.some((route) => path.startsWith(route));
    if (isAdminOnlyRoute && session.role !== 'admin') {
        // Redirect non-admins away from admin-only pages
        return NextResponse.redirect(new URL('/admin/modules', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
