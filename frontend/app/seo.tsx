import { Metadata } from 'next'

// Define base metadata for SEO
export const baseMetadata: Metadata = {
  title: 'Apto Works - Global Task Marketplace Platform',
  description: 'Connect with global opportunities on Apto Works. Find tasks, hire talent, or invest in the future of work. Join our micro-service task marketplace today.',
  keywords: 'task marketplace, freelance platform, gig economy, remote work, digital tasks, online jobs, micro services',
  authors: [{ name: 'Apto Works Team' }],
  creator: 'Apto Works',
  publisher: 'Apto Works',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://aptoworks.com',
  },
  openGraph: {
    type: 'website',
    url: 'https://aptoworks.com',
    title: 'Apto Works - Global Task Marketplace Platform',
    description: 'Connect with global opportunities on Apto Works. Find tasks, hire talent, or invest in the future of work.',
    siteName: 'Apto Works',
    images: [
      {
        url: 'https://aptoworks.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Apto Works Platform Overview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aptoworks',
    creator: '@aptoworks',
    title: 'Apto Works - Global Task Marketplace Platform',
    description: 'Connect with global opportunities on Apto Works. Find tasks, hire talent, or invest in the future of work.',
    images: ['https://aptoworks.com/twitter-image.jpg'],
  },
}

// JSON-LD Structured Data
export const getStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Apto Works',
    url: 'https://aptoworks.com',
    logo: 'https://aptoworks.com/logo.png',
    sameAs: [
      'https://twitter.com/aptoworks',
      'https://linkedin.com/company/aptoworks',
      'https://facebook.com/aptoworks',
    ],
    description: 'Global task marketplace platform connecting talent with opportunities.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1000',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://aptoworks.com',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '15',
      highPrice: '60',
      offerCount: '1000',
    },
  }
}

// SEO Component
export default function SEO() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
      />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    </>
  )
} 