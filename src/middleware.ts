import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the request is for the dashboard which requires authentication
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // For dashboard routes, check if the user is authenticated
  if (isDashboardRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // If no token exists, redirect to the sign-in page
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // If already authenticated and trying to access auth pages, redirect to dashboard
  if (pathname.startsWith('/auth/')) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (token) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}; 