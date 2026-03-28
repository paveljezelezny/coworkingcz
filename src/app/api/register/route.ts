import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['coworker', 'coworking_admin']).default('coworker'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Tento email je již registrován' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Neplatná data', details: err.errors }, { status: 400 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}
