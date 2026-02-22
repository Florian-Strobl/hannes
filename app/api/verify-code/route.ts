import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 404 });
    }

    // Check if verification code exists and is not expired
    if (!user.verificationCode || !user.verificationCodeExpires) {
      return NextResponse.json({ error: 'No verification code found' }, { status: 400 });
    }

    if (new Date() > user.verificationCodeExpires) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Code is valid, return reset link
    const baseUrl = request.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${user.resetToken}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      message: 'Verification successful',
      resetLink,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
