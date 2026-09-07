import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminAuth } from '@/lib/firebaseAdmin';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; timer: ReturnType<typeof setTimeout> }>();

function rateLimit(ip: string): boolean {
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 3;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, timer: setTimeout(() => rateLimitMap.delete(ip), windowMs) });
    return true;
  }

  const data = rateLimitMap.get(ip)!;
  if (data.count >= maxRequests) return false;
  data.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown-ip';
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Generate the verification link using Firebase Admin SDK
    const actionCodeSettings = {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sakthiispeaks.vercel.app',
      handleCodeInApp: false,
    };

    const verificationLink = await getAdminAuth().generateEmailVerificationLink(email, actionCodeSettings);

    // Send the email using the same Gmail SMTP you already use for the contact form
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('EMAIL_USER or EMAIL_PASS not set');
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sakthi Speaks" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email — Sakthi Speaks',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0f0f23; border-radius: 16px; border: 1px solid #1e1e3a;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Sakthi Speaks</h1>
            <p style="color: #a0a0c0; font-size: 14px; margin-top: 4px;">Digital Agency & Portfolio</p>
          </div>
          <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; border: 1px solid #2a2a4a;">
            <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 12px 0;">Confirm your email</h2>
            <p style="color: #b0b0d0; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Thanks for signing up! Click the button below to verify your email address and activate your account.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${verificationLink}" style="
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                color: #ffffff;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
              ">Verify My Email</a>
            </div>
            <p style="color: #808098; font-size: 13px; line-height: 1.5; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationLink}" style="color: #a855f7; word-break: break-all;">${verificationLink}</a>
            </p>
          </div>
          <p style="color: #606078; font-size: 12px; text-align: center; margin-top: 20px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send verification email.' }, { status: 500 });
  }
}
