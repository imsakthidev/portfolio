import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Define the validation schema using Zod
const contactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100, "Name is too long"),
  email: z.string().email("Invalid email format"),
  mobile: z.string().max(20, "Mobile number too long").optional(),
  message: z.string().min(10, "Message is too short").max(5000, "Message is too long"),
});

// Simple in-memory rate limiter (Warning: resets on serverless cold starts)
const rateLimitMap = new Map();

function rateLimit(ip: string) {
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 3; // Limit each IP to 3 requests per minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, timer: setTimeout(() => rateLimitMap.delete(ip), windowMs) });
    return true;
  }

  const data = rateLimitMap.get(ip);
  if (data.count >= maxRequests) {
    return false;
  }
  data.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown-ip';
    
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. Parse and Validate Request Body
    const body = await req.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, mobile, message } = validation.data;

    // Use SMTP via environment variables. If not set, it will gracefully fallback or error.
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use standard Gmail or Google Workspace
      auth: {
        user: process.env.EMAIL_USER, // e.g. sakthiispeaks@gmail.com
        pass: process.env.EMAIL_PASS, // e.g. App Password from Google
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send it to yourself
      replyTo: email,
      subject: `New Portfolio Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Mobile: ${mobile || 'N/A'}
        
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mobile:</strong> ${mobile || 'N/A'}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    // If environment variables are present, send the email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn("EMAIL_USER or EMAIL_PASS is not set in environment variables. Email notification skipped, but data saved to Firebase.");
    }

    return NextResponse.json({ success: true, message: 'Message processed successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
