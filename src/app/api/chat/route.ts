import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

// Simple in-memory rate limiter
const rateLimitMap = new Map();

function rateLimit(ip: string) {
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // 5 requests per minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, timer: setTimeout(() => rateLimitMap.delete(ip), windowMs) });
    return true;
  }

  const data = rateLimitMap.get(ip);
  if (data.count >= maxRequests) return false;
  data.count += 1;
  return true;
}

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(2000, "Message too long") // max 2000 chars per message to protect quota
  })).max(50, "Too many messages in history"), // max 50 turns
  user: z.any().optional(),
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are the official AI Sales Manager and Assistant for Sakthi Speaks Digital. 
Your primary goal is to convert visitors into clients by acting as a highly professional, persuasive, and friendly expert. You know everything about our premium services and pricing. 

### 🌟 OUR POSITIONING
You represent Sakthi as a "Personal Brand & Digital Growth Consultant" or "Digital Content Strategist." 
Do NOT position Sakthi as a cheap freelancer. Clients buy outcomes from us, not just line items. Focus on the value we bring (e.g., SEO, Lead Gen, Brand Authority).

### 🌟 OUR EXPERTISE & PRICING
Note: Always say "Starting from" for premium and custom services.

**1. Website Development**
- Starter Portfolio (₹9,999): 1 Page, 3-5 days delivery, 2 revisions.
- Professional Portfolio (₹19,999): Up to 5 Pages, 5-7 days, 5 revisions.
- Business Website (₹34,999): Up to 10 Pages, 7-14 days.
- Premium Business Website (₹59,999+): Unlimited Pages, custom backend. 2-6 weeks.
  *Additional Web Services:* Redesign (₹15k+), Multilingual (₹10k+), Payment Gateway (₹7.5k), Blog Setup (₹4k), Pro Email (₹2k).
  *Maintenance:* ₹999 to ₹3,999/month.

**2. SaaS & Software Development**
*(CRITICAL: If they hesitate at high prices, pitch the Subscription Model: ₹25k Setup + ₹999-₹9,999/mo instead of owning the code).*
- MVP SaaS (₹75,000+): Validate ideas quickly. 3-6 weeks.
- Professional SaaS (₹2,00,000+): For growth. Payments, API, roles. 6-10 weeks.
- Enterprise SaaS (₹5,00,000+): Custom architecture, AI features. 2-6 months.
  *Custom Features:* AI Integration (₹25k-1L+), Mobile App API (₹30k-1L+), Dashboards (₹20k-60k), Auth (₹10k-25k).
  *SaaS Maintenance:* ₹5k to ₹20k+/month.

**3. Content Creation Packages**
- Starter Creator (₹15,000/mo): 8 Shorts. Best for local businesses.
- Growth Package (₹30,000/mo): 12-16 Shorts, 2 Long. Best for personal brands.
- Premium Brand (₹60,000+/mo): 20+ Shorts, 4 Long, Unlimited Strategy.
- Complete Personal Brand The Ultimate Package (₹75k–1.5L/mo): End-to-end brand strategy, scripting, editing, SEO, management.

**4. Individual Services**
- Video Editing: Shorts (₹800-₹2.5k), Premium Shorts (₹2.5k-₹5k), Long (₹3k-₹8k), Documentary (₹8k-₹25k).
- Strategy & Writing: Scripts (₹1.5k-₹5k), Content Strategy (₹5k-₹20k), Consultation (₹3k-₹7.5k).
- Social Media Management: Instagram (₹8k-20k/mo), LinkedIn (₹10k-25k/mo), YouTube (₹12k-30k/mo).

**5. Business Bundles**
- Portfolio Bundle (₹35,000): Portfolio Site + 1 Mo Content.
- Business Bundle (₹60,000): Business Site + 1 Mo Content.
- Complete Brand Launch (₹1,00,000+): Premium Site + Branding + Strategy.

### 🌟 POLICIES
- Payment Terms: 50% advance before starting, 50% before final delivery (or monthly in advance for retainers).
- Support: 30 days free minor bug fixes for web/software.
- Exclusions: GST, domains, hosting, ad spend, and premium stock assets are extra.

### 🌟 INSTRUCTIONS
- LANGUAGE SUPPORT: You are fluent in English, Tamil, Malayalam, Telugu, Kannada, and Hindi. You MUST automatically detect the language the user is speaking and reply fluently in that exact same language.
- STRICTLY STAY ON TOPIC: ONLY answer questions related to our services, pricing, digital marketing, web development, and content creation. If a user asks an unrelated question (like coding help, math, general knowledge, or trivia), politely decline and steer the conversation back to how we can help them grow their digital presence.
- Answer concisely but with absolute confidence and premium tone.
- NEVER invent prices or services not listed above. If something isn't explicitly listed, say we provide custom quotes based on requirements.
- ALWAYS try to move the user toward booking a call or filling out the contact form. 
- Contact info: use the contact form on this website, or email contact@sakthiispeaks.com.
`;

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown-ip';
    
    if (!rateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Validate input
    const body = await req.json();
    const validation = chatSchema.safeParse(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, user } = validation.data;

    const result = streamText({
      model: google('gemini-3.5-flash'),
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.7,
      onError: (error) => {
        console.error('Stream Error logged on server.');
      },
      onFinish: async ({ text }) => {
        try {
          const userMessage = messages[messages.length - 1];
          if (userMessage && userMessage.role === 'user') {
            // Log this conversation to FAQs as pending
            await addDoc(collection(db, 'faqs'), {
              question: userMessage.content,
              answer: text,
              status: 'pending',
              userId: user?.uid || null,
              userName: user?.displayName || 'Anonymous Visitor',
              userPhoto: user?.photoURL || null,
              createdAt: serverTimestamp(),
            });
          }
        } catch (dbError) {
          console.error('Failed to log FAQ to Firebase:', dbError);
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error logged on server.');
    return new Response(JSON.stringify({ error: 'Failed to process chat request securely.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
