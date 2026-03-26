import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith('/dashboard/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    if (path.startsWith('/dashboard/penjual') && token?.role !== 'SELLER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  },
  { pages: { signIn: '/auth/masuk' } }
)

export const config = {
  matcher: ['/dashboard/:path*', '/checkout', '/pesanan/:path*', '/wishlist', '/cart'],
}
