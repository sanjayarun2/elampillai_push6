import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/blog/:path*',
};

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /WhatsApp|facebookexternalhit|Facebot|Meta-ExternalAgent|Twitterbot|LinkedInBot|TelegramBot|Discordbot|Slackbot|Instagram|Pinterest|Redditbot|SkypeUriPreview/i.test(userAgent);
  
  const url = request.nextUrl;
  const postId = url.searchParams.get('id');

  if (isBot && postId) {
    try {
      // Fetch blog data from your API
      const apiUrl = `${url.origin}/api/blog/${postId}`;
      const response = await fetch(apiUrl);
      const post = await response.json();

      if (post && post.title) {
        const title = post.title;
        const description = post.content.substring(0, 150).replace(/[#*]/g, '');
        const image = post.image;
        const fullImageUrl = image?.startsWith('http') ? image : `${url.origin}${image}`;

        const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${fullImageUrl}">
    <meta property="og:image:secure_url" content="${fullImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${url.href}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Elampillai Community">
    <meta property="og:locale" content="ta_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${fullImageUrl}">
    <meta http-equiv="refresh" content="0;url=${url.href}">
  </head>
  <body></body>
</html>`;

        return new NextResponse(html, {
          headers: {
            'content-type': 'text/html; charset=UTF-8',
          },
        });
      }
    } catch (e) {
      console.error("Bot metadata error:", e);
    }
  }

  return NextResponse.next();
}