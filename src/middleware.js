import { NextResponse } from 'next/server'

export function middleware(request) {
  // Controleer of de request naar een klantportaal gaat (deze moeten altijd toegankelijk blijven zonder login)
  const isCustomerPortal = request.nextUrl.pathname.startsWith('/k/');
  
  if (isCustomerPortal) {
    return NextResponse.next()
  }

  // Controleer op Supabase sessie cookies (doorgaans in de vorm van sb-[id]-auth-token)
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
  
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Als de gebruiker niet is ingelogd en niet op de loginpagina is: redirect naar /login
  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Als de gebruiker wél is ingelogd en naar /login probeert te gaan: direct naar dashboard
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

// Zorg dat de middleware op álle routes draait, behalve static bestanden en API's
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|logo.png).*)'],
}
