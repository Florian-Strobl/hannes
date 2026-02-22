import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email doesn't exist!" },
        { status: 404 }
      );
    }

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 600000); // 10 minutes

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save verification code and reset token to database
    const updateData = {
      verificationCode,
      verificationCodeExpires,
      resetToken,
      resetTokenExpires,
    } as Prisma.UserUpdateInput;
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Send email with verification code
    const baseUrl = request.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    try {
      await resend.emails.send({
        from: 'Hannes Meat Shop <onboarding@resend.dev>', // Change this to your verified domain
        to: email,
        subject: 'Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Please use the verification code below:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #10b981; font-size: 36px; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Hannes Meat Shop - Fresh Quality Meats</p>
          </div>
        `,
      });
      
      console.log(`Verification code sent to ${email}: ${verificationCode}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - user can see code in console for testing
    }

    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Reset link for ${email}: ${resetLink}`);

    return NextResponse.json({
      message: 'Verification code sent to email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
