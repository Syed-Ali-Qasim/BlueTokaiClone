import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'

interface Product {
  id: number
  attributes: {
    name: string
    description: string
    price: number
    originalPrice?: number
    roastLevel: string
    drinkingPreference: any
    flavourProfile: any
    images: {
      data: Array<{
        id: number
        attributes: {
          url: string
          alternativeText?: string
        }
      }>
    }
    hoverImage?: {
      data: {
        id: number
        attributes: {
          url: string
          alternativeText?: string
        }
      }
    }
    slug: string
    featured: boolean
    inStock: boolean
  }
}

// Server-side product fetching with caching
export const getProducts = unstable_cache(
  async (options: {
    limit?: number
    populate?: boolean
    filters?: Record<string, any>
  } = {}): Promise<Product[]> => {
    const { limit, populate = true, filters } = options
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    
    try {
      const params = new URLSearchParams()
      if (populate) params.append('populate', '*')
      if (limit) params.append('pagination[limit]', limit.toString())
      
      // Add filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`filters[${key}][$in]`, v))
          } else {
            params.append(`filters[${key}]`, value)
          }
        })
      }

      const url = `${baseUrl}/api/products?${params.toString()}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { 
          revalidate: 300, // 5 minutes
          tags: ['products'] // For on-demand revalidation
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rawData = await response.json()
      return transformProductData(rawData)
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },
  ['products'], // Cache key
  {
    revalidate: 300, // 5 minutes
    tags: ['products']
  }
)

// Get single product by slug
export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    
    try {
      const url = `${baseUrl}/api/products?filters[slug][$eq]=${slug}&populate=*`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { 
          revalidate: 600, // 10 minutes for individual products
          tags: [`product-${slug}`]
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rawData = await response.json()
      const products = transformProductData(rawData)
      
      return products.length > 0 ? products[0] : null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  },
  ['product-by-slug'],
  {
    revalidate: 600,
    tags: ['products']
  }
)

// Get featured products
export const getFeaturedProducts = unstable_cache(
  async (limit: number = 4): Promise<Product[]> => {
    return getProducts({
      limit,
      populate: true,
      filters: { featured: true }
    })
  },
  ['featured-products'],
  {
    revalidate: 600,
    tags: ['products', 'featured']
  }
)

// Transform product data helper
function transformProductData(rawData: any): Product[] {
  let productsArray: any[] = []
  
  if (rawData && rawData.data) {
    productsArray = Array.isArray(rawData.data) ? rawData.data : [rawData.data]
  } else if (Array.isArray(rawData)) {
    productsArray = rawData
  } else if (rawData && rawData.results) {
    productsArray = Array.isArray(rawData.results) ? rawData.results : [rawData.results]
  }

  return productsArray.map((item: any) => {
    if (item.documentId) {
      return {
        id: item.id || item.documentId,
        attributes: {
          name: item.name,
          description: item.description,
          price: item.price,
          originalPrice: item.originalPrice,
          roastLevel: item.roastLevel,
          drinkingPreference: item.drinkingPreference,
          flavourProfile: item.flavourProfile,
          images: item.images,
          hoverImage: item.hoverImage,
          slug: item.slug,
          featured: item.featured,
          inStock: item.inStock
        }
      }
    } else if (item.attributes) {
      return item
    } else {
      return {
        id: item.id,
        attributes: item
      }
    }
  })
}

// Cache revalidation functions
export async function revalidateProducts() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('products')
}

export async function revalidateProduct(slug: string) {
  const { revalidateTag } = await import('next/cache')
  revalidateTag(`product-${slug}`)
}

// Error handling wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error('Server function error:', error)
      return null
    }
  }
}

// Static generation helpers for build time
export async function generateStaticParams() {
  try {
    const products = await getProducts({ limit: 100 })
    return products.map((product) => ({
      slug: product.attributes.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Sitemap generation helper
export async function generateSitemap() {
  try {
    const products = await getProducts()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
    
    const productUrls = products.map((product) => ({
      url: `${baseUrl}/products/${product.attributes.slug}`,
      lastModified: new Date(),
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
      },
      ...productUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return []
  }
}

// RSS feed generation helper
export async function generateRSSFeed() {
  try {
    const products = await getFeaturedProducts(20)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
    
    const rssItems = products.map((product) => ({
      title: product.attributes.name,
      description: product.attributes.description,
      link: `${baseUrl}/products/${product.attributes.slug}`,
      pubDate: new Date().toISOString(),
    }))

    return {
      title: 'Blue Tokai Coffee - Latest Products',
      description: 'Latest premium coffee products from Blue Tokai',
      link: baseUrl,
      items: rssItems,
    }
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return null
  }
}