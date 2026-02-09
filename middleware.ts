export const config = {
  matcher: ['/blog/:path*', '/api/og-meta'],
};

export async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /WhatsApp|facebookexternalhit|Facebot|Meta-ExternalAgent|Twitterbot|LinkedInBot|TelegramBot|Discordbot|Slackbot|Instagram|Pinterest|Redditbot|SkypeUriPreview/i.test(userAgent);
  
  const url = new URL(request.url);
  // FIX: Look for ID in query param OR in the URL path (e.g., /blog/123)
  const postId = url.searchParams.get('id') || url.pathname.split('/').pop();

  if (isBot && postId && postId !== 'blog') { // Ensure we don't treat '/blog' as an ID
    try {
      const apiUrl = `${url.origin}/api/blog/${postId}`;
      const response = await fetch(apiUrl);
      const post = await response.json();

      if (post && post.title) {
        const title = String(post.title).replace(/"/g, '&quot;');
        const description = String(post.content).substring(0, 150).replace(/[#*]/g, '').replace(/"/g, '&quot;');
        const image = String(post.image || '');
        const fullImageUrl = image.startsWith('http') ? image : `${url.origin}${image}`;

        const html = `<!DOCTYPE html>
<html lang="ta">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
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
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
  </body>
</html>`;

        return new Response(html, {
          headers: {
            'content-type': 'text/html; charset=UTF-8',
            'cache-control': 'public, max-age=3600',
          },
        });
      }
    } catch (e) {
      console.error("Bot metadata error:", e);
    }
  }

  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}