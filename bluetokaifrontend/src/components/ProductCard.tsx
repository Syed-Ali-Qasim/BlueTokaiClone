import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

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

interface ProductCardProps {
  product: Product
  priority?: boolean
}

const getImageUrl = (imageData: any): string | null => {
  if (!imageData) return null

  if (Array.isArray(imageData) && imageData.length > 0) {
    return imageData[0]?.url || null
  }

  if (imageData?.data && Array.isArray(imageData.data) && imageData.data.length > 0) {
    return imageData.data[0]?.attributes?.url || null
  }

  if (imageData?.url) {
    return imageData.url
  }
  
  return null
}

const getHoverImageUrl = (hoverImageData: any): string | null => {
  if (!hoverImageData) return null

  if (hoverImageData?.url) {
    return hoverImageData.url
  }

  if (hoverImageData?.data?.attributes?.url) {
    return hoverImageData.data.attributes.url
  }
  
  return null
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!product || !product.attributes) {
    console.error('Invalid product data:', product)
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="text-red-500 text-sm">Invalid product data</div>
        </div>
      </div>
    )
  }
  
  const { attributes } = product
  
  const mainImageUrl = getImageUrl(attributes.images)
  const hoverImageUrl = getHoverImageUrl(attributes.hoverImage) || mainImageUrl

const getFullImageUrl = (url: string | null): string => {
  if (!url) return '/placeholder-image.jpg'

  if (url.startsWith('http')) return url

  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
  
  if (baseUrl.includes('strapiapp.com') && !url.startsWith('/uploads')) {
    const mediaUrl = baseUrl.replace('.strapiapp.com', '.media.strapiapp.com')
    return `${mediaUrl}${url.startsWith('/') ? url : `/${url}`}`
  }
  
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`
}
  
  const finalMainImage = getFullImageUrl(mainImageUrl)
  const finalHoverImage = getFullImageUrl(hoverImageUrl)

  const productSlug = attributes.slug || attributes.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const productUrl = `/products/${productSlug}`
  
  return (
    <div className="bg-[#f4f1e8] overflow-hidden group max-w-sm mx-auto">
      <Link href={productUrl} className="block">
        <div 
          className="relative overflow-hidden cursor-pointer bg-[#f4f1e8] p-6"
          style={{ height: '320px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!imageError ? (
            <Image
              src={isHovered && finalHoverImage !== finalMainImage ? finalHoverImage : finalMainImage}
              alt={attributes.name || 'Product image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              quality={85} 
              placeholder="blur" 
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyiwjA"
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}

          {isHovered && finalHoverImage !== finalMainImage && (
            <link rel="preload" as="image" href={finalHoverImage} />
          )}
          
          <div className="absolute bottom-0 left-0 bg-sky-100 px-4 py-3 z-10">
            <div className="text-xl font-bold text-black whitespace-nowrap">
              ₹ {Number(attributes.price || 0)}
            </div>
          </div>
          
          {attributes.originalPrice && attributes.originalPrice > attributes.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1">
              Sale
            </div>
          )}
          
          {attributes.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1">
              Featured
            </div>
          )}
        </div>
      </Link>
      
      <div className="bg-white px-2 py-6">
        <Link href={productUrl}>
          <h3 className="font-bold text-black text-lg mb-2 uppercase leading-tight line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
            {attributes.name || 'Unknown Product'}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-1">
          {attributes.description || `${attributes.roastLevel || 'Premium'} roast coffee`}
        </p>

        <div className="relative">
          <Link href={productUrl}>
            <Button 
              className="w-full h-12 bg-[#b3d4e6] hover:bg-[#9ac5dd] text-white font-semibold text-lg pr-16 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={!attributes.inStock}
              style={{ borderRadius: 0 }}
            >
              {attributes.inStock ? 'BUY NOW' : 'OUT OF STOCK'}
            </Button>
          </Link>
          <div className="absolute right-1 top-1 bottom-1 w-12 bg-white border-l border-gray-300 flex items-center justify-center pointer-events-none">
            <Plus className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>
    </div>
  )
}