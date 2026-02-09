import { createClient } from '@libsql/client/web';

export const config = {
  matcher: ['/blog/:path*', '/blog'],
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /WhatsApp|facebookexternalhit|Facebot|Meta-ExternalAgent|Twitterbot|LinkedInBot|TelegramBot|Discordbot|Slackbot|Instagram|Pinterest|Redditbot|SkypeUriPreview/i.test(userAgent);
  const postId = url.searchParams.get('id');

  if (isBot && postId) {
    try {
      const db = createClient({
        url: process.env.VITE_TURSO_DATABASE_URL || '',
        authToken: process.env.VITE_TURSO_AUTH_TOKEN || '',
      });

      const result = await db.execute({
        sql: "SELECT title, content, image FROM blogs WHERE id = ?",
        args: [postId]
      });

      if (result.rows.length > 0) {
        const post = result.rows[0];
        const title = String(post.title);
        const description = String(post.content).substring(0, 150).replace(/[#*]/g, '');
        const image = String(post.image);
        const fullImageUrl = image.startsWith('http') ? image : `${url.origin}${image}`;

        return new Response(
          `<!DOCTYPE html>
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
              <meta name="twitter:image" content="${fullImageUrl}">
            </head>
          </html>`,
          { headers: { 'content-type': 'text/html; charset=UTF-8' } }
        );
      }
    } catch (e) {
      console.error("Bot metadata error:", e);
    }
  }
  return fetch(request);
}