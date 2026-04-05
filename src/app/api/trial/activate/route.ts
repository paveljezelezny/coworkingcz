import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json().catch(() => ({}));
  const plan: 'monthly' | 'yearly' = body.plan === 'yearly' ? 'yearly' : 'monthly';

  // 30-day trial end
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);

  // Upsert CoworkerProfile with trial membership
  await prisma.coworkerProfile.upsert({
    where: { userId },
    update: {
      membershipTier: `trial_${plan}`,
      membershipStart: new Date(),
      membershipEnd: trialEnd,
    },
    create: {
      userId,
      membershipTier: `trial_${plan}`,
      membershipStart: new Date(),
      membershipEnd: trialEnd,
      isPublic: true,
    },
  });

  return NextResponse.json({ success: true, trialEnd: trialEnd.toISOString(), plan });
}
