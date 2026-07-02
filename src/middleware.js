import { NextResponse } from 'next/server'

export function middleware(request) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/login'

  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  // Als de gebruiker niet is ingelogd en een admin route probeert te openen: redirect naar /login
  if (!hasSession && isAdminRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Als de gebruiker wél is ingelogd en naar /login probeert te gaan: direct naar dashboard
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
