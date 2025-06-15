import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'

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

// Optimized product service for recommendations
class RecommendationService {
  private static cache: { data: Product[]; timestamp: number } | null = null
  private static readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  static async fetchRecommendedProducts(): Promise<Product[]> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.data
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
      const url = `${baseUrl}/api/products?populate=*&pagination[limit]=4&sort=createdAt:desc`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 600 } // 10 minutes cache
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const rawData = await response.json()
      const transformedProducts = this.transformProductData(rawData)
      
      // Cache the result
      this.cache = {
        data: transformedProducts.slice(0, 4),
        timestamp: Date.now()
      }

      return this.cache.data
    } catch (error) {
      console.error('Error fetching recommended products:', error)
      return []
    }
  }

  private static transformProductData(rawData: any): Product[] {
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
}

export default function YouMayAlsoLike() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchRecommendations = async () => {
      try {
        const products = await RecommendationService.fetchRecommendedProducts()
        
        if (isMounted) {
          setRecommendedProducts(products)
        }
      } catch (error) {
        console.error('Error in YouMayAlsoLike:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRecommendations()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">YOU MAY ALSO LIKE</h2>
            <div className="w-16 h-0.5 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (recommendedProducts.length === 0) {
    return null // Don't render if no products
  }

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">YOU MAY ALSO LIKE</h2>
          <div className="w-16 h-0.5 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}