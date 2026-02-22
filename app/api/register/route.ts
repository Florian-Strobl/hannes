import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, address, role, pin } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Address is required for customers, optional for farmers
    if (role === 'customer' && !address) {
      return NextResponse.json({ error: 'Address is required for customers' }, { status: 400 });
    }

    if (role !== 'farmer' && role !== 'customer') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (role === 'farmer' && !pin) {
      return NextResponse.json({ error: 'PIN is required for farmers' }, { status: 400 });
    }

    if (role === 'farmer' && (pin.length !== 4 || !/^\d+$/.test(pin))) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        address: role === 'farmer' ? '' : (address || ''),
        role,
        pin: role === 'farmer' ? pin : (null as unknown as string | null),
      } as any,
    });

    return NextResponse.json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}