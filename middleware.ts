import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot/i.test(userAgent);
  const { pathname, searchParams } = request.nextUrl;

  if (isBot && pathname.startsWith('/blog')) {
    const postId = searchParams.get('id');
    
    if (postId) {
      try {
        // Replace this URL with your actual API endpoint to fetch a single post
        const res = await fetch(`https://your-api.com/posts/${postId}`);
        const post = await res.json();

        return new NextResponse(
          `<html>
            <head>
              <meta property="og:title" content="${post.title}">
              <meta property="og:description" content="${post.content.substring(0, 150)}...">
              <meta property="og:image" content="${post.image}">
              <meta property="og:type" content="article">
              <meta name="twitter:card" content="summary_large_image">
            </head>
            <body>Redirecting to Elampillai News...</body>
          </html>`,
          { headers: { 'content-type': 'text/html' } }
        );
      } catch (e) {
        console.error("Bot metadata fetch failed", e);
      }
    }
  }

  return NextResponse.next();
}