import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mask = (v?: string) => v ? v.replace(/:[^@]+@/, ':***@').slice(0, 250) : 'MISSING';
  const env = {
    DATABASE_URL: mask(process.env.DATABASE_URL),
    DIRECT_URL: mask(process.env.DIRECT_URL),
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
  };
  let dbResult: unknown;
  try {
    const r = await prisma.$queryRawUnsafe<Array<{ count: number }>>(`SELECT 1 as count`);
    dbResult = { ok: true, r: JSON.parse(JSON.stringify(r, (_, v) => typeof v === 'bigint' ? Number(v) : v)) };
  } catch (e: unknown) {
    dbResult = { ok: false, error: (e as Error).message, name: (e as Error).name };
  }
  return NextResponse.json({ env, dbResult });
}
