export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/spravce/:path*', '/profil/:path*'],
};
