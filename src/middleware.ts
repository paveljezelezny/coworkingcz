import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminPath = req.nextUrl.pathname.startsWith('/admin');

    // /admin vyžaduje roli super_admin
    if (isAdminPath && token?.role !== 'super_admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/prihlaseni';
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      url.searchParams.set('error', 'AccessDenied');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // authorized se volá dřív — pokud vrátí false, user je přesměrován na /prihlaseni
      authorized: ({ token, req }) => {
        const isAdminPath = req.nextUrl.pathname.startsWith('/admin');
        // Pro /admin musí být přihlášen (token existuje) — role řešíme v middleware výše
        if (isAdminPath) return !!token;
        // Pro ostatní chráněné cesty stačí být přihlášen
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/spravce/:path*', '/profil/:path*', '/admin/:path*', '/admin'],
};
