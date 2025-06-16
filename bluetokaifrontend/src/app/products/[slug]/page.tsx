import { notFound } from 'next/navigation'
import ProductPageClient from './ProductPageClient'

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
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPageRoute({ params }: PageProps) {
  const { slug } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
  
  try {
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
    
    // Fetch related products
    let relatedProducts: Product[] = []
    
    try {
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
          
          relatedProducts = relatedProductsArray.map((item: any) => {
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
          
          console.log('🔗 Transformed related products:', JSON.stringify(relatedProducts, null, 2))
        }
      }
    } catch (relatedError) {
      console.warn('⚠️ Failed to fetch related products:', relatedError)
      // Continue without related products
    }
    
    return <ProductPageClient product={productData} relatedProducts={relatedProducts} />
    
  } catch (error) {
    console.error('💥 Error fetching product:', error)
    return notFound()
  }
}