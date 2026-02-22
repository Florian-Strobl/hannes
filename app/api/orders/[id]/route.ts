import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params?: { id?: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idFromPath = request.nextUrl.pathname.split('/').pop();
    const orderId = params?.id || idFromPath;
    if (!orderId) {
      return NextResponse.json({ error: 'Order id is required' }, { status: 400 });
    }

    if (!session.user.role || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { meat: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Farmers can clear delivered orders. Customers can cancel their own orders.
    if (session.user.role === 'farmer') {
      await prisma.order.delete({ where: { id: orderId } });
      return NextResponse.json({ message: 'Order cleared' });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.order.delete({ where: { id: orderId } }),
      prisma.meat.update({
        where: { id: order.meatId },
        data: { stock: order.meat.stock + order.quantity },
      }),
    ]);

    return NextResponse.json({ message: 'Order cancelled' });
  } catch (error) {
    console.error('Order delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
