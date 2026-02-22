import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'farmer') {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { name: true, address: true, email: true } },
          meat: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(orders);
    } else {
      const orders = await prisma.order.findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { userId: (session as any).user.id },
        include: {
          meat: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.role || (session as any).user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meatId, quantity } = await request.json();

    if (!meatId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const qty = parseFloat(quantity);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const meat = await tx.meat.findUnique({
        where: { id: meatId },
      });

      if (!meat) {
        throw new Error('Meat not found');
      }

      if (meat.stock < qty) {
        throw new Error('Insufficient stock');
      }

      const total = meat.price * qty;

      const order = await tx.order.create({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId: (session as any).user.id,
          meatId,
          quantity: qty,
          total,
        },
      });

      await tx.meat.update({
        where: { id: meatId },
        data: { stock: meat.stock - qty },
      });

      return order;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}