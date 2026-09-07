import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateVerificationLink } from '@/lib/firebaseAdmin';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; timer: ReturnType<typeof setTimeout> }>();

function rateLimit(ip: string): boolean {
  const windowMs = 60 * 1000;
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

    // Check SMTP credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 });
    }

    // Generate the verification link via REST API (no firebase-admin needed)
    const continueUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sakthiispeaks.vercel.app';
    const verificationLink = await generateVerificationLink(email, continueUrl);

    // Send via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sakthi Speaks" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to: email,
      subject: 'Please verify your email address',
      text: `Hi there!\n\nThanks for creating an account on Sakthi Speaks.\n\nPlease verify your email address by clicking the link below:\n${verificationLink}\n\nIf you didn't create this account, you can safely ignore this email.\n\nThanks,\nSakthi Speaks`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi there!</p>
          <p>Thanks for creating an account on <strong>Sakthi Speaks</strong>.</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p style="margin: 24px 0;">
            <a href="${verificationLink}" style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #7c3aed;
              color: #ffffff;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
            ">Verify Email Address</a>
          </p>
          <p style="font-size: 13px; color: #666;">
            Or copy and paste this link in your browser:<br/>
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #999;">
            If you didn't create this account, you can safely ignore this email.
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
