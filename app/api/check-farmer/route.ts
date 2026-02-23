import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const farmerExists = await prisma.user.findFirst({
      where: { role: 'farmer' },
    });

    return NextResponse.json({ exists: !!farmerExists });
  } catch (error) {
    console.error('Error checking farmer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
