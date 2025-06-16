'use client'

import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'
import FilterSidebar from '@/components/FilterSidebar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Lazy load heavy components
const YouMayAlsoLike = lazy(() => import('@/components/YouMayAlsoLike'))

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

interface StrapiResponse {
  data: Product[]
  meta?: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

// Optimized API fetching with caching and error handling
class ProductService {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static async fetchProducts(options: {
    limit?: number
    populate?: boolean
    filters?: Record<string, any>
  } = {}): Promise<Product[]> {
    const { limit, populate = true, filters } = options
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    
    // Create cache key
    const cacheKey = `products_${JSON.stringify(options)}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

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
        // Add cache control for browser caching
        next: { revalidate: 300 } // 5 minutes
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rawData = await response.json()
      const transformedProducts = this.transformProductData(rawData)
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: transformedProducts,
        timestamp: Date.now()
      })

      return transformedProducts
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
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

  // Clear cache manually if needed
  static clearCache() {
    this.cache.clear()
  }
}

// Optimized Hero Banner Component with lazy loading
function HeroBanner() {
  return (
    <div className="relative">
      {/* Desktop banner */}
      <div className="hidden md:block">
        <Image 
          src="/Desktop_28.png" 
          alt="Carefully sourced from India's finest farms" 
          width={1920}
          height={600}
          className="w-full h-auto object-cover"
          priority
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss6RtOdw=="
        />
      </div>
      
      {/* Mobile banner */}
      <div className="block md:hidden">
        <Image 
          src="/Mobile_29.png" 
          alt="Carefully sourced from India's finest farms" 
          width={768}
          height={400}
          className="w-full h-auto object-cover"
          priority
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss6RtOdw=="
        />
      </div>
    </div>
  )
}

// Loading skeleton component
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}

export default function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('featured')
  const [selectedFilters, setSelectedFilters] = useState({
    roastLevel: [] as string[],
    drinkingPreference: [] as string[],
    flavourProfile: [] as string[]
  })

  const filters = {
    roastLevel: ['Dark', 'Light', 'Medium', 'Medium Dark'],
    drinkingPreference: ['With Milk', 'Without Milk', 'Medium', 'Medium Dark'],
    flavourProfile: ['Balanced', 'Bold and Bitter', 'Chocolatey and Nutty', 'Delicate and Complex']
  }

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      try {
        setError(null)
        const fetchedProducts = await ProductService.fetchProducts({
          populate: true
        })
        
        if (isMounted) {
          setProducts(fetchedProducts)
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error occurred')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]
    if (selectedFilters.roastLevel.length > 0) {
      filtered = filtered.filter(product => 
        product.attributes?.roastLevel && 
        selectedFilters.roastLevel.includes(product.attributes.roastLevel)
      )
    }

    if (selectedFilters.drinkingPreference.length > 0) {
      filtered = filtered.filter(product => {
        const productPreferences = Array.isArray(product.attributes?.drinkingPreference) 
          ? product.attributes.drinkingPreference 
          : []
        return selectedFilters.drinkingPreference.some(filter => 
          productPreferences.includes(filter)
        )
      })
    }

    if (selectedFilters.flavourProfile.length > 0) {
      filtered = filtered.filter(product => {
        const productFlavours = Array.isArray(product.attributes?.flavourProfile) 
          ? product.attributes.flavourProfile 
          : []
        return selectedFilters.flavourProfile.some(filter => 
          productFlavours.includes(filter)
        )
      })
    }

    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => (a.attributes?.price || 0) - (b.attributes?.price || 0))
      case 'price-high':
        return filtered.sort((a, b) => (b.attributes?.price || 0) - (a.attributes?.price || 0))
      case 'name':
        return filtered.sort((a, b) => (a.attributes?.name || '').localeCompare(b.attributes?.name || ''))
      default:
        return filtered.sort((a, b) => {
          const aFeatured = a.attributes?.featured || false
          const bFeatured = b.attributes?.featured || false
          if (aFeatured && !bFeatured) return -1
          if (!aFeatured && bFeatured) return 1
          return 0
        })
    }
  }, [products, selectedFilters, sortBy])

  const handleFilterChange = (type: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: checked 
        ? [...prev[type as keyof typeof prev], value]
        : prev[type as keyof typeof prev].filter(item => item !== value)
    }))
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center max-w-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <HeroBanner />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <FilterSidebar 
            filters={filters}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Products ({filteredProducts.length})
              </h2>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {loading ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                {products.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">
                    No products were loaded from the API. Check the console for details.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {!loading && (
          <div className="mt-16 bg-white rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Buy Freshly Roasted Coffee Beans Online with Blue Tokai
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              There's nothing quite like the aroma and taste of freshly roasted coffee beans at home! Whether you're a coffee aficionado or a casual drinker, getting coffee that's been freshly roasted makes a world of difference. Our commitment to quality and authenticity has made us a favourite among coffee lovers across the country.
            </p>
          </div>
        )}
      </div>

      {!loading && (
        <Suspense fallback={
          <div className="bg-white py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                <div className="w-16 h-0.5 bg-gray-200 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }>
          <YouMayAlsoLike />
        </Suspense>
      )}

      <div className="relative h-24 w-full overflow-hidden">
        <Image
          src="/recommened-bottom-img_1366x.png"
          alt="Wave pattern"
          fill
          className="object-cover object-center"
          loading="lazy"
          quality={75}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss6RtOdw=="
        />
      </div>

      <Footer />
    </div>
  )
}