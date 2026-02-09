import { createClient } from '@libsql/client/web';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).send('Missing blog ID');
  }

  const userAgent = req.headers['user-agent'] || '';
  const isBot = /WhatsApp|facebookexternalhit|Facebot|Meta-ExternalAgent|Twitterbot|LinkedInBot|TelegramBot|Discordbot|Slackbot|Instagram|Pinterest|Redditbot|SkypeUriPreview/i.test(userAgent);

  if (!isBot) {
    return res.redirect(307, `/blog?id=${id}`);
  }

  try {
    const db = createClient({
      url: process.env.VITE_TURSO_URL || '',
      authToken: process.env.VITE_TURSO_TOKEN || '',
    });

    const result = await db.execute({
      sql: "SELECT * FROM blogs WHERE id = ?",
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).send('Blog not found');
    }

    const post = result.rows[0] as any;
    const title = String(post.title);
    const description = String(post.content).substring(0, 150).replace(/[#*]/g, '');
    const image = String(post.image);
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const fullImageUrl = image?.startsWith('http') ? image : `${protocol}://${host}${image}`;
    const pageUrl = `${protocol}://${host}/blog?id=${id}`;

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
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Elampillai Community">
    <meta property="og:locale" content="ta_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${fullImageUrl}">
    <meta http-equiv="refresh" content="0;url=${pageUrl}">
  </head>
  <body>
    <h1>${title}</h1>
    <p>Redirecting...</p>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(html);
  } catch (error) {
    console.error('OG Meta Error:', error);
    res.status(500).send('Server error');
  }
}