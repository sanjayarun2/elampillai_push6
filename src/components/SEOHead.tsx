import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
  keywords?: string;
  schema?: Record<string, any>;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function SEOHead({ 
  title, 
  description, 
  image = '/og-image.jpg',
  url,
  type = 'website',
  keywords,
  schema,
  author,
  publishedTime,
  modifiedTime
}: SEOHeadProps) {
  const siteName = 'Elampillai Community';
  const fullTitle = `${title} - ${siteName}`;
  const canonicalUrl = new URL(url).origin + new URL(url).pathname + (new URL(url).search || '');
  // Ensure image has the full domain prefix
  const fullImageurl = image?.startsWith('http') ? image : `${new URL(url).origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* FIX: Schema.org markup for Google+ / WhatsApp explicitly */}
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={fullImageurl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageurl} />
      <meta property="og:image:secure_url" content={fullImageurl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ta_IN" />
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageurl} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#1E40AF" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            ...schema
          })}
        </script>
      )}
    </Helmet>
  );
}