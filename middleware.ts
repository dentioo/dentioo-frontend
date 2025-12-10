import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/registro', '/home', '/', '/planos', '/planos/pagamento', '/escolher-plano']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Rotas autenticadas (dashboard, admin, etc)
  const token = request.cookies.get('token')?.value || localStorage.getItem('token')
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
