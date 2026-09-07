import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel natively supports Next.js, so no static export config is needed here!
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://vitals.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; img-src 'self' blob: data: https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://firebasestorage.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://accounts.google.com https://www.googleapis.com https://vitals.vercel-insights.com wss://*.firebaseio.com; frame-src 'self' https://sakthiispeaks.firebaseapp.com https://accounts.google.com https://sakthiispeaks.firebaseapp.com;" }
        ],
      },
    ];
  },
};
export default nextConfig;
