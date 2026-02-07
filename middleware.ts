import { createClient } from '@libsql/client/web';

export const config = {
  matcher: '/blog/:path*',
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // 1. Detect social media bots that scrape for preview cards
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot/i.test(userAgent);
  const postId = url.searchParams.get('id');

  // 2. If a bot is visiting a blog link with an ID, fetch dynamic data from Turso
  if (isBot && postId) {
    try {
      const db = createClient({
        url: process.env.VITE_TURSO_DATABASE_URL || '',
        authToken: process.env.VITE_TURSO_AUTH_TOKEN || '',
      });

      // Query the specific blog post from your 'blogs' table
      const result = await db.execute({
        sql: "SELECT title, content, image FROM blogs WHERE id = ?",
        args: [postId]
      });

      if (result.rows.length > 0) {
        const post = result.rows[0];
        const title = String(post.title || "Elampillai News");
        const description = String(post.content || "").substring(0, 150).replace(/[#*]/g, '') + "...";
        const image = String(post.image || "https://elampillai.in/og-image.jpg");

        // 3. Return a minimal HTML page with only the SEO tags the bot needs
        return new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>${title}</title>
              <meta property="og:title" content="${title}">
              <meta property="og:description" content="${description}">
              <meta property="og:image" content="${image}">
              <meta property="og:url" content="${url.href}">
              <meta property="og:type" content="article">
              <meta name="twitter:card" content="summary_large_image">
              <meta name="twitter:title" content="${title}">
              <meta name="twitter:image" content="${image}">
            </head>
            <body>Redirecting to Elampillai News...</body>
          </html>`,
          {
            headers: { 'content-type': 'text/html; charset=UTF-8' },
          }
        );
      }
    } catch (e) {
      console.error("Middleware Turso fetch failed:", e);
    }
  }

  // 4. For real users (not bots), continue to the React app normally
  return fetch(request);
}