import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// E-maily, které dostanou roli super_admin automaticky při přihlášení
const SUPER_ADMIN_EMAILS = ['pavel@pracovna.cz'];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Heslo', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Block unverified users — but only if a pending verification token exists.
        // Legacy accounts (registered before email verification was introduced) have
        // no VerificationToken and pass through automatically.
        if (!user.emailVerified) {
          const pendingToken = await prisma.verificationToken.findFirst({
            where: { identifier: user.email ?? '', expires: { gt: new Date() } },
          });
          if (pendingToken) {
            throw new Error('EMAIL_NOT_VERIFIED');
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dní
  },
  events: {
    // Automaticky nastaví super_admin roli a řeší auto-membership při každém přihlášení
    async signIn({ user }) {
      if (!user.id) return;

      // 1. Super admin role pro definované e-maily
      if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: 'super_admin' },
        });
      }

      // 2. Auto-membership pro vlastníky coworkingů
      // Pokud má uživatel schválený claim a nemá placené členství → dostane roční zdarma
      try {
        const claim = await prisma.coworkingClaim.findFirst({
          where: { userId: user.id, status: 'approved' },
        });

        if (claim) {
          const profile = await prisma.coworkerProfile.findUnique({
            where: { userId: user.id },
            select: { membershipTier: true, membershipEnd: true },
          });

          const hasPaidMembership =
            profile?.membershipTier &&
            profile.membershipTier !== 'free' &&
            profile.membershipEnd &&
            new Date(profile.membershipEnd) > new Date();

          if (!hasPaidMembership) {
            // Vlastník bez aktivního placenéh membership → dej mu roční tier
            const now = new Date();
            const end = new Date(now);
            end.setFullYear(end.getFullYear() + 1);

            await prisma.coworkerProfile.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                membershipTier: 'yearly',
                membershipStart: now,
                membershipEnd: end,
              },
              update: {
                membershipTier: 'yearly',
                membershipStart: now,
                membershipEnd: end,
              },
            });
          }
        }
      } catch {
        // Neblokovat přihlášení kvůli chybě v auto-membership
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'coworker';
      }
      // Refresh role z DB při každém JWT refresh
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/prihlaseni',
    error: '/prihlaseni',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
