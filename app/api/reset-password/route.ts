import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, email, password, pin } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    if (!password && !pin) {
      return NextResponse.json(
        { error: 'Password or PIN is required' },
        { status: 400 }
      );
    }

    // Find user by email and reset token
    const where = {
      email,
      resetToken: token,
    } as Prisma.UserWhereInput;
    const user = await prisma.user.findFirst({ where });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    const baseData: Record<string, unknown> = {
      resetToken: null,
      resetTokenExpires: null,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      baseData.password = hashedPassword;
    }

    if (pin) {
      if (user.role !== 'farmer') {
        return NextResponse.json(
          { error: 'Only farmers can reset PIN' },
          { status: 400 }
        );
      }
      baseData.pin = pin;
    }

    const updateData = baseData as Prisma.UserUpdateInput;

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Password/PIN reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
