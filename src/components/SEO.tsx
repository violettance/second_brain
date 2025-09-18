import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  noindex = false,
  nofollow = false,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
}) => {
  const robotsContent = noindex || nofollow 
    ? `${noindex ? 'noindex' : ''}${noindex && nofollow ? ', ' : ''}${nofollow ? 'nofollow' : ''}`
    : 'index, follow';

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content={robotsContent} />
      
      {/* Open Graph */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
    </Helmet>
  );
};

