import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const meats = await prisma.meat.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(meats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, price, stock } = await request.json();

    if (!name || !price || stock == null) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (price <= 0 || stock < 0) {
      return NextResponse.json({ error: 'Invalid price or stock' }, { status: 400 });
    }

    const meat = await prisma.meat.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseFloat(stock),
      },
    });

    return NextResponse.json(meat);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}