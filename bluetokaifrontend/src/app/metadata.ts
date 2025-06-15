import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Premium Coffee Beans Online | Blue Tokai Coffee',
    template: '%s | Blue Tokai Coffee'
  },
  description: 'Buy freshly roasted coffee beans online from Blue Tokai. Premium single-origin and blended coffees, carefully sourced from India\'s finest farms. Free shipping available.',
  keywords: [
    'coffee beans',
    'freshly roasted coffee',
    'Blue Tokai',
    'single origin coffee',
    'premium coffee',
    'buy coffee online',
    'Indian coffee',
    'coffee roasters',
    'specialty coffee',
    'arabica coffee'
  ],
  authors: [{ name: 'Blue Tokai Coffee' }],
  creator: 'Blue Tokai Coffee',
  publisher: 'Blue Tokai Coffee',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://localhost'), // Replace with your actual domain
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Premium Coffee Beans Online | Blue Tokai Coffee',
    description: 'Buy freshly roasted coffee beans online from Blue Tokai. Premium single-origin and blended coffees, carefully sourced from India\'s finest farms.',
    url: 'https://localhost/products', // Replace with your actual domain
    siteName: 'Blue Tokai Coffee',
    images: [
      {
        url: '/og-image.jpg', // Create this image
        width: 1200,
        height: 630,
        alt: 'Blue Tokai Coffee - Premium Coffee Beans',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Coffee Beans Online | Blue Tokai Coffee',
    description: 'Buy freshly roasted coffee beans online from Blue Tokai. Premium single-origin and blended coffees.',
    images: ['/twitter-image.jpg'], // Create this image
    creator: '@BlueTokai', // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: 'food & drink',
}

// Dynamic metadata generator for individual product pages
export function generateProductMetadata(product: any): Metadata {
  const productName = product?.attributes?.name || 'Coffee Product'
  const productDescription = product?.attributes?.description || 'Premium coffee from Blue Tokai'
  const productPrice = product?.attributes?.price || 0
  const productImage = product?.attributes?.images?.data?.[0]?.attributes?.url || '/default-product.jpg'

  return {
    title: `${productName} - Premium Coffee | Blue Tokai`,
    description: `${productDescription.substring(0, 160)}...`,
    openGraph: {
      title: `${productName} - Premium Coffee | Blue Tokai`,
      description: productDescription,
      images: [
        {
          url: productImage,
          width: 800,
          height: 600,
          alt: productName,
        }
      ],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} - Premium Coffee | Blue Tokai`,
      description: productDescription,
      images: [productImage],
    },
    other: {
      'product:price:amount': productPrice.toString(),
      'product:price:currency': 'INR',
      'product:availability': product?.attributes?.inStock ? 'in stock' : 'out of stock',
    },
  }
}

// JSON-LD structured data for better SEO
export function generateProductStructuredData(products: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Blue Tokai Coffee Products',
    description: 'Premium coffee beans and products from Blue Tokai',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.attributes?.name,
        description: product.attributes?.description,
        image: product.attributes?.images?.data?.[0]?.attributes?.url,
        offers: {
          '@type': 'Offer',
          price: product.attributes?.price,
          priceCurrency: 'INR',
          availability: product.attributes?.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Blue Tokai Coffee'
          }
        },
        brand: {
          '@type': 'Brand',
          name: 'Blue Tokai'
        }
      }
    }))
  }
}