import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot/i.test(userAgent);
  const { pathname, searchParams } = request.nextUrl;

  // Only run this for blog links when a bot is visiting
  if (isBot && pathname.startsWith('/blog')) {
    const postId = searchParams.get('id');
    
    // This sends a tiny HTML page with ONLY the meta tags to the bot
    // Replace the placeholders with your actual API fetch if needed
    return new NextResponse(
      `<html>
        <head>
          <meta property="og:title" content="இளம்பிள்ளை ஜவுளித் துறை: அதிரடி அறிவிப்பு!">
          <meta property="og:description" content="Click to read the full update.">
          <meta property="og:image" content="https://elampillai.in/og-image.jpg">
          <meta property="og:type" content="article">
          <meta name="twitter:card" content="summary_large_image">
        </head>
        <body>Redirecting...</body>
      </html>`,
      { headers: { 'content-type': 'text/html' } }
    );
  }

  return NextResponse.next();
}