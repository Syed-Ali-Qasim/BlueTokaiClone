import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import ProductPage from '@/components/ProductPage'

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
    // Add more fields as needed for ProductPage
    sweetness?: number
    body?: number
    acidity?: number
    bitterness?: number
    altitude?: string
    processing?: string
    variety?: string
    country?: string
    manufacturer?: string
    fssaiNumber?: string
    netQuantity?: string
    tastingNotes?: string[]
    size?: string[]
    grind?: string[]
  }
}

interface PageProps {
  params: {
    slug: string
  }
}

export default function ProductPageRoute({ params }: PageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
  setSlug(params.slug)
}, [params.slug])

  useEffect(() => {
    if (!slug) return

    const fetchProduct = async () => {
      try {
        setError(null)
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
        
        // Fetch the specific product by slug with deep population
        const productUrl = `${baseUrl}/api/products?populate[images][populate]=*&populate[hoverImage][populate]=*&filters[slug][$eq]=${slug}`
        
        console.log('🔍 Fetching product from URL:', productUrl)
        
        const response = await fetch(productUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const rawData = await response.json()
        console.log('📦 Raw product data:', JSON.stringify(rawData, null, 2))
        
        let productData: any = null
        
        if (rawData && rawData.data && rawData.data.length > 0) {
          const item = rawData.data[0]
          console.log('🔍 Processing item:', JSON.stringify(item, null, 2))
          
          // Handle both new Strapi structure (documentId) and old structure (attributes)
          if (item.documentId) {
            // New Strapi structure - item properties are at root level
            productData = {
              id: item.id || item.documentId,
              attributes: {
                name: item.name,
                description: item.description,
                price: item.price,
                originalPrice: item.originalPrice,
                roastLevel: item.roastLevel,
                drinkingPreference: item.drinkingPreference,
                flavourProfile: item.flavourProfile,
                images: item.images, // Keep original structure for processing
                hoverImage: item.hoverImage,
                slug: item.slug,
                featured: item.featured,
                inStock: item.inStock,
                sweetness: item.sweetness || 2,
                body: item.body || 2,
                acidity: item.acidity || 3,
                bitterness: item.bitterness || 1,
                altitude: item.altitude || '1075-1200 M',
                processing: item.processing || 'WASHED',
                variety: item.variety || 'ARABICA',
                country: item.country || 'India',
                manufacturer: item.manufacturer || 'Blue Tokai Coffee Roasters',
                fssaiNumber: item.fssaiNumber || 'N/A',
                netQuantity: item.netQuantity || '250g/500g/1000g',
                tastingNotes: item.tastingNotes || ['BALANCED', 'SMOOTH', 'AROMATIC'],
                size: item.size || ['250g', '500g', '1kg'],
                grind: item.grind || ['Whole Bean', 'Coarse', 'Medium', 'Fine', 'Extra Fine']
              }
            }
          } else if (item.attributes) {
            // Old Strapi structure - properties are nested under attributes
            productData = {
              ...item,
              attributes: {
                ...item.attributes,
                sweetness: item.attributes.sweetness || 2,
                body: item.attributes.body || 2,
                acidity: item.attributes.acidity || 3,
                bitterness: item.attributes.bitterness || 1,
                altitude: item.attributes.altitude || '1075-1200 M',
                processing: item.attributes.processing || 'WASHED',
                variety: item.attributes.variety || 'ARABICA',
                country: item.attributes.country || 'India',
                manufacturer: item.attributes.manufacturer || 'Blue Tokai Coffee Roasters',
                fssaiNumber: item.attributes.fssaiNumber || 'N/A',
                netQuantity: item.attributes.netQuantity || '250g/500g/1000g',
                tastingNotes: item.attributes.tastingNotes || ['BALANCED', 'SMOOTH', 'AROMATIC'],
                size: item.attributes.size || ['250g', '500g', '1kg'],
                grind: item.attributes.grind || ['Whole Bean', 'Coarse', 'Medium', 'Fine', 'Extra Fine']
              }
            }
          } else {
            // Fallback structure
            productData = {
              id: item.id,
              attributes: {
                ...item,
                sweetness: item.sweetness || 2,
                body: item.body || 2,
                acidity: item.acidity || 3,
                bitterness: item.bitterness || 1,
                altitude: item.altitude || '1075-1200 M',
                processing: item.processing || 'WASHED',
                variety: item.variety || 'ARABICA',
                country: item.country || 'India',
                manufacturer: item.manufacturer || 'Blue Tokai Coffee Roasters',
                fssaiNumber: item.fssaiNumber || 'N/A',
                netQuantity: item.netQuantity || '250g/500g/1000g',
                tastingNotes: item.tastingNotes || ['BALANCED', 'SMOOTH', 'AROMATIC'],
                size: item.size || ['250g', '500g', '1kg'],
                grind: item.grind || ['Whole Bean', 'Coarse', 'Medium', 'Fine', 'Extra Fine']
              }
            }
          }
        }
        
        console.log('🎯 Final product data:', JSON.stringify(productData, null, 2))
        
        if (!productData) {
          return notFound()
        }
        
        setProduct(productData)
        
        // Fetch related products
        const relatedUrl = `${baseUrl}/api/products?populate[images][populate]=*&populate[hoverImage][populate]=*&pagination[limit]=4&filters[id][$ne]=${productData.id}`
        const relatedResponse = await fetch(relatedUrl)
        
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          console.log('🔗 Related products raw data:', JSON.stringify(relatedData, null, 2))
          
          if (relatedData && relatedData.data) {
            let relatedProductsArray: any[] = []
            
            if (Array.isArray(relatedData.data)) {
              relatedProductsArray = relatedData.data
            } else {
              relatedProductsArray = [relatedData.data]
            }
            
            const transformedRelated = relatedProductsArray.map((item: any) => {
              let product: any
              
              if (item.documentId) {
                product = {
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
                product = item
              } else {
                product = {
                  id: item.id,
                  attributes: item
                }
              }
              
              return product
            })
            
            console.log('🔗 Transformed related products:', JSON.stringify(transformedRelated, null, 2))
            setRelatedProducts(transformedRelated)
          }
        }
        
      } catch (error) {
        console.error('💥 Error fetching product:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return notFound()
  }

  // Enhanced helper function to extract image URLs with better debugging
  const extractImageUrls = (images: any): string[] => {
    console.log('🖼️ Extracting images from:', JSON.stringify(images, null, 2))
    
    if (!images) {
      console.log('❌ No images object found')
      return ['/placeholder-coffee-1.jpg']
    }
    
    // Handle different possible structures
    let imageArray: any[] = []
    
    if (images.data && Array.isArray(images.data)) {
      // Standard Strapi structure: { data: [...] }
      imageArray = images.data
      console.log('📋 Found images.data array:', imageArray.length, 'items')
    } else if (Array.isArray(images)) {
      // Direct array
      imageArray = images
      console.log('📋 Found direct images array:', imageArray.length, 'items')
    } else {
      console.log('❌ Images structure not recognized:', typeof images)
      return ['/placeholder-coffee-1.jpg']
    }
    
    if (imageArray.length === 0) {
      console.log('❌ Empty images array')
      return ['/placeholder-coffee-1.jpg']
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || baseUrl
    
    const urls = imageArray.map((img: any, index: number) => {
      console.log(`🖼️ Processing image ${index}:`, JSON.stringify(img, null, 2))
      
      let imageUrl: string | null = null
      
      // Try different possible structures
      if (img?.attributes?.url) {
        imageUrl = img.attributes.url
        console.log(`✅ Found URL in attributes: ${imageUrl}`)
      } else if (img?.url) {
        imageUrl = img.url
        console.log(`✅ Found URL directly: ${imageUrl}`)
      } else if (typeof img === 'string') {
        imageUrl = img
        console.log(`✅ Found URL as string: ${imageUrl}`)
      }
      
      if (!imageUrl) {
        console.log(`❌ No URL found for image ${index}`)
        return '/placeholder-coffee-1.jpg'
      }
      
      // Construct full URL
      if (imageUrl.startsWith('http')) {
        console.log(`🌐 Using full URL: ${imageUrl}`)
        return imageUrl
      } else {
        const fullUrl = `${strapiUrl}${imageUrl}`
        console.log(`🔗 Constructed URL: ${fullUrl}`)
        return fullUrl
      }
    })
    
    console.log('🎯 Final extracted URLs:', urls)
    return urls.filter(Boolean) // Remove any null/undefined values
  }

  // Transform product data to match ProductPage component expectations
  const transformedProduct = {
    id: product.id.toString(),
    name: product.attributes.name,
    price: product.attributes.price,
    originalPrice: product.attributes.originalPrice,
    images: extractImageUrls(product.attributes.images),
    description: product.attributes.description || 'Premium coffee blend',
    size: product.attributes.size || ['250g', '500g', '1kg'],
    grind: product.attributes.grind || ['Whole Bean', 'Coarse', 'Medium', 'Fine', 'Extra Fine'],
    sweetness: product.attributes.sweetness || 2,
    body: product.attributes.body || 2,
    acidity: product.attributes.acidity || 3,
    bitterness: product.attributes.bitterness || 1,
    roast: product.attributes.roastLevel || 'MEDIUM',
    flavour: 'BLACK',
    altitude: product.attributes.altitude || '1075-1200 M',
    processing: product.attributes.processing || 'WASHED',
    variety: product.attributes.variety || 'ARABICA',
    sun: 'SUN DRIED',
    country: product.attributes.country || 'India',
    manufacturer: product.attributes.manufacturer || 'Blue Tokai Coffee Roasters',
    fssaiNumber: product.attributes.fssaiNumber || 'N/A',
    netQuantity: product.attributes.netQuantity || '250g/500g/1000g',
    tastingNotes: product.attributes.tastingNotes || ['BALANCED', 'SMOOTH', 'AROMATIC'],
    brewGuide: {
      time: '2:30 MINS',
      coffee: '18G',
      water: '230ML',
      temperature: '92°C',
      grindSize: 'MEDIUM GRIND'
    },
    estate: {
      name: `${product.attributes.name} Estate`,
      location: product.attributes.country || 'India',
      description: `Premium coffee estate producing exceptional ${product.attributes.roastLevel?.toLowerCase()} roast coffee beans.`,
      area: '275 acres',
      altitude: product.attributes.altitude || '1200 metres'
    }
  }

  // Transform related products for display
  const transformedRelatedProducts = relatedProducts.map(item => ({
    id: item.id,
    name: item.attributes.name,
    price: item.attributes.price,
    originalPrice: item.attributes.originalPrice,
    images: extractImageUrls(item.attributes.images),
    soldOut: !item.attributes.inStock
  }))

  console.log('🚀 Final transformed product for ProductPage:', JSON.stringify(transformedProduct, null, 2))
  console.log('🚀 Final transformed related products:', JSON.stringify(transformedRelatedProducts, null, 2))

  return (
    <ProductPage 
      product={transformedProduct} 
      relatedProducts={transformedRelatedProducts}
    />
  )
}