import React, { useState, useEffect, memo, lazy, Suspense } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { Metadata } from 'next';
import ProductCard from '@/components/ProductCard';

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

// Lazy load heavy components
const Header = lazy(() => import('./Header'));
const Footer = lazy(() => import('./Footer'));

// Memoized components for performance
const RatingBars = memo(({ value, max = 4 }: { value: number; max?: number }) => (
  <div className="flex gap-1 justify-center">
    {Array.from({ length: max }, (_, i) => (
      <div
        key={i}
        className={`h-1 w-6 rounded-full ${i < value ? 'bg-orange-400' : 'bg-gray-200'}`}
      />
    ))}
  </div>
));

const OptimizedImage = memo(({ src, alt, ...props }: any) => (
  <Image
    src={src}
    alt={alt}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9btCs+Cj8cJG9+OxUUlzqH7YqUxgJGGJhQKKOr4bDSjpEsKlDsGnxU3RZBZWgGVZ1n5Vc4lsKKRzBhbAhMmgYuNTBN3VLjhUMlYMjJQKLQODcUGBTGCTgVlO2+Bj9Zy9YQjh1BZmKBJAq6VDmqTFQwVnzYhGQCUYWJbAqEEqQKDiHBhNlWlLKgWRjhIWXGAJy5D8SQdJRRBMNhqS4FBUAjX+R6D4BQHQDbGQkx5VWUTXBgEjFCVBJ5+gJtBQUOmRhvQnQxLACqKxLiX0BrNQFJwGJ2qkiOqLYMiRRqQiCIEj1BgCXBQgG4Aky4GBwEDgFEkEQNXUWJQFUgGBkZGBQUEBQwBVFIKQMKKQmAGFhxhKiGqKQQJQEHZFhBhbAqQKDiEo6TBUuFaQrECmNtBKhBQQVjYGBQUHcFmCKBgGREHYCKBhbAhyBBBEBhBBMGBQUKNEGF5BNMmFBQUgLgWQmAGjEFBqGgAYGBgGBQUHMlhQmAGjEFBkGgAYGBgGBQUHMlhQmAGjEFBkGgAY"
    {...props}
  />
));

const ProductAttribute = memo(({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="text-center">
    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
      <OptimizedImage src={icon} alt={label} width={24} height={24} />
    </div>
    <p className="text-xs text-blue-500 font-bold mb-1 uppercase">{label}</p>
    <p className="text-xs font-bold text-black">{value}</p>
  </div>
));

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

interface ProductPageProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    description: string;
    size: string[];
    grind: string[];
    sweetness: number;
    body: number;
    acidity: number;
    bitterness: number;
    roast: string;
    flavour: string;
    altitude: string;
    processing: string;
    variety: string;
    sun: string;
    country: string;
    manufacturer: string;
    fssaiNumber: string;
    netQuantity: string;
    tastingNotes: string[];
    brewGuide: {
      time: string;
      coffee: string;
      water: string;
      temperature: string;
      grindSize: string;
    };
    estate: {
      name: string;
      location: string;
      description: string;
      area: string;
      altitude: string;
    };
  };
  relatedProducts?: Product[];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  
  return {
    title: `${product.name} - Premium Coffee | Blue Tokai`,
    description: `${product.description} ${product.tastingNotes.join(', ')} - Order now with free shipping on orders above ₹799`,
    keywords: `coffee, ${product.name}, ${product.roast} roast, ${product.tastingNotes.join(', ')}, premium coffee`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
      type: 'product',
    },
    robots: 'index, follow',
    alternates: {
      canonical: `https://yoursite.com/products/${params.slug}`,
    },
  };
}

// Optimized data fetching
async function fetchProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return res.json();
}

async function fetchRelatedProducts(productId: string): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/related`, {
    next: { revalidate: 7200 } // Revalidate every 2 hours
  });
  
  if (!res.ok) {
    return [];
  }
  
  return res.json();
}

const ProductPage: React.FC<ProductPageProps> = ({ 
  product,
  relatedProducts = []
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.size?.[0] || '250g');
  const [selectedGrind, setSelectedGrind] = useState(product?.grind?.[0] || 'Whole Bean');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [selectedBrewMethod, setSelectedBrewMethod] = useState('French Press');

  const [fetchedRelatedProducts, setFetchedRelatedProducts] = useState<Product[]>([])
const [loadingRelated, setLoadingRelated] = useState(false)

// Fetch related products
useEffect(() => {
  let isMounted = true

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true)
      const products = await ProductService.fetchProducts({
        limit: 4,
        populate: true
      })
      
      if (isMounted) {
        setFetchedRelatedProducts(products)
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    } finally {
      if (isMounted) {
        setLoadingRelated(false)
      }
    }
  }

  fetchRelatedProducts()

  return () => {
    isMounted = false
  }
}, [])

  if (!product) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">Product not found</h1>
            <p className="text-gray-600">The requested product could not be loaded.</p>
          </div>
        </div>
        <Footer />
      </Suspense>
    );
  }

  const brewGuides = {
    'French Press': {
      time: '4:00 MINS',
      coffee: '16G',
      water: '255ML',
      temperature: '96°C',
      grindSize: 'VERY COARSE',
      image: '/frenchpress_800x.png'
    },
    'Moka Pot': {
      time: '5:00 MINS',
      coffee: '20G',
      water: '300ML',
      temperature: '100°C',
      grindSize: 'FINE',
      image: '/mokapot_1_800x.png'
    },
    'Espresso': {
      time: '0:30 MINS',
      coffee: '18G',
      water: '36ML',
      temperature: '93°C',
      grindSize: 'EXTRA FINE',
      image: '/espresso_1_800x.png'
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);

  const getStrapiImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder-coffee-1.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return `${strapiBaseUrl}${imageUrl}`;
  };

  const coffeeAttributes = [
    { icon: "/Group_large.png", label: "ROAST", value: product.roast },
    { icon: "/Layer_1_c90a183e-9f3c-4c83-92ea-0453b0b6312c_large.png", label: "HAVE IT", value: product.flavour },
    { icon: "/Vector_17_large.png", label: "ALTITUDE", value: product.altitude },
    { icon: "/Vector_18_large.png", label: "PROCESSING", value: product.processing },
    { icon: "/Vector_19_large.png", label: "LOCATION", value: product.estate.location.split(',')[0] },
    { icon: "/Vector_20_large.png", label: "VARIETY", value: product.variety }
  ];

  const coffeeProfiles = [
    { name: "SWEETNESS", value: product.sweetness, icon: "/Frame_9_large.png" },
    { name: "BODY", value: product.body, icon: "/Frame-_11_-3_large.png" },
    { name: "ACIDITY", value: product.acidity, icon: "/Frame-_13_-4_large.png" },
    { name: "BITTERNESS", value: product.bitterness, icon: "/Frame-_11_-3_large.png" }
  ];

  const getProfileLabel = (name: string, value: number) => {
    const labels = {
      SWEETNESS: ['LOW', 'MEDIUM', 'MEDIUM-HIGH', 'HIGH'],
      BODY: ['LIGHT', 'MEDIUM', 'MEDIUM-FULL', 'FULL'],
      ACIDITY: ['LOW', 'MEDIUM', 'MEDIUM-HIGH', 'HIGH'],
      BITTERNESS: ['LOW', 'MEDIUM', 'MEDIUM-HIGH', 'HIGH']
    };
    return labels[name][Math.min(value - 1, 3)];
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={getStrapiImageUrl(product.images[currentImageIndex])}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-16 h-16 relative rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentImageIndex === index ? 'border-orange-400' : 'border-gray-200'}`}>
                      <OptimizedImage src={getStrapiImageUrl(image)} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 uppercase">{product.roast} Roast</span>
                <div className="w-3 h-3 bg-orange-200 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-normal text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-medium">₹ {product.price}</span>
                  {product.originalPrice && <span className="text-lg text-gray-500 line-through">₹ {product.originalPrice}</span>}
                  <span className="text-xs text-gray-500">MRP (inclusive of all taxes)</span>
                </div>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
              {product.size && product.size.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">Size</label>
                  <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md bg-white text-sm">
                    {product.size.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                </div>
              )}
              {product.grind && product.grind.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">Grind</label>
                  <select value={selectedGrind} onChange={(e) => setSelectedGrind(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md bg-white text-sm">
                    {product.grind.map((grind) => <option key={grind} value={grind}>{grind}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-medium w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="flex-1 bg-black text-white py-2.5 px-6 rounded text-sm font-medium hover:bg-gray-800 transition-colors uppercase">Add to Cart</button>
              </div>
              <button className="w-full bg-black text-white py-2.5 px-6 rounded text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <span>⚡</span><span>Buy Now COD</span>
              </button>
              <div className="text-sm">
                <p className="text-gray-600 mb-2 flex items-center gap-1"><span>📦</span><span>Premium orders available</span></p>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter PIN to check shipping options & delivery time" value={pincode} onChange={(e) => setPincode(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm" />
                  <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600">CHECK</button>
                </div>
                <p className="mt-2 text-xs text-gray-500">FREE STANDARD SHIPPING on all prepaid orders above ₹799</p>
              </div>
            </div>
          </div>

          {/* Coffee Profile Section */}
          <div className="bg-yellow-50 py-12 px-8 mb-8">
            <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
              {coffeeProfiles.map((profile) => (
                <div key={profile.name} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <OptimizedImage src={profile.icon} alt={profile.name} width={32} height={32} />
                  </div>
                  <h3 className="font-bold text-xs uppercase mb-1 text-black">{profile.name}</h3>
                  <p className="text-xs text-black mb-2">{getProfileLabel(profile.name, profile.value)}</p>
                  <RatingBars value={profile.value} />
                </div>
              ))}
            </div>
          </div>

          {/* Coffee Attributes & Tasting Notes */}
          <div className="bg-white py-12 px-8 mb-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="grid grid-cols-3 gap-6">
                  {coffeeAttributes.map((attr) => (
                    <ProductAttribute key={attr.label} {...attr} />
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="text-3xl font-light text-blue-400 mb-6 uppercase">{product.tastingNotes.join(', ')}</h2>
                  <div className="mb-4">
                    <p className="text-sm font-bold text-black uppercase mb-2">TASTING NOTES</p>
                    <p className="text-sm text-gray-600">How to brew</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-orange-50 rounded-lg p-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-orange-500 text-white px-4 py-2 text-sm font-medium mb-6 inline-block">DELICATE & COMPLEX</div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{product.description}</p>
                <p className="text-sm text-gray-700 leading-relaxed mb-6">Notes of {product.tastingNotes.join(', ').toLowerCase()} carry through each sip, creating a unique and memorable coffee experience.</p>
                <div>
                  <h3 className="font-medium text-sm mb-4 uppercase">Additional Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">COUNTRY OF ORIGIN</span><span>{product.country}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">MANUFACTURED BY</span><span>{product.manufacturer}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">FSSAI NO</span><span>{product.fssaiNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">NET QUANTITY</span><span>{product.netQuantity}</span></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative aspect-square bg-orange-100 rounded-lg overflow-hidden">
                  <OptimizedImage src={getStrapiImageUrl(product.images[0])} alt={`${product.name} package`} fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Estate Section */}
          <div className="mb-16">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-light mb-2">
              <span>ESTATE</span><span>N° 76 4820 E</span>
            </div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">{product.estate.name}</h2>
            <p className="text-base text-gray-600 mb-4">{product.estate.location}</p>
            <p className="text-gray-700 leading-relaxed max-w-2xl mb-6">{product.estate.description}</p>
            <button className="border border-gray-400 px-6 py-2 text-sm hover:bg-gray-50 transition-colors uppercase">Visit the Farm</button>
          </div>

          {/* Brew Guide Section */}
          <div className="mb-16">
            <div className="bg-orange-50 px-16 py-12">
              <div className="grid grid-cols-2 gap-16 max-w-6xl mx-auto">
                <div>
                  <h3 className="text-blue-300 text-sm font-normal tracking-widest mb-2 uppercase">{selectedBrewMethod.toUpperCase()}</h3>
                  <h2 className="text-4xl font-light mb-8 text-black">How to <em>Brew</em></h2>
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: "/Ellipse_11_ccd069a0-edee-4c98-8d69-087db3d62faa_large.png", text: `${brewGuides[selectedBrewMethod].time} / BREW TIME` },
                      { icon: "/Ellipse_12_large.png", text: `${brewGuides[selectedBrewMethod].coffee} / COFFEE AMOUNT` },
                      { icon: "/Ellipse_13_large.png", text: `${brewGuides[selectedBrewMethod].water} / WATER VOLUME` },
                      { icon: "/Ellipse_14_large.png", text: `${brewGuides[selectedBrewMethod].temperature} / WATER TEMPERATURE` },
                      { icon: "/Ellipse_15_large.png", text: `${brewGuides[selectedBrewMethod].grindSize} / GRIND SIZE` }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <OptimizedImage src={item.icon} alt="" width={20} height={20} />
                        <span className="text-sm font-medium text-black">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xs font-bold mb-4 text-black tracking-wider uppercase">Other Recommended Methods</h3>
                    <div className="flex gap-6">
                      {['French Press', 'Moka Pot', 'Espresso'].map((method) => (
                        <button key={method} onClick={() => setSelectedBrewMethod(method)} className={`text-sm font-medium transition-colors ${selectedBrewMethod === method ? 'text-blue-500 border-b border-blue-500' : 'text-black hover:text-blue-500'}`}>
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="bg-blue-500 text-white text-xs font-bold px-6 py-3 tracking-wider uppercase hover:bg-blue-600 transition-colors">View Other Recipes</button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-md">
                    <OptimizedImage src={brewGuides[selectedBrewMethod].image} alt={`${selectedBrewMethod} brewing`} width={400} height={400} className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

{/* Related Products - Using ProductCard component like ProductListingPage */}
{(fetchedRelatedProducts.length > 0 || relatedProducts?.length > 0) && (
  <div>
    <h2 className="text-xl font-light mb-8">You May Also Like</h2>
    {loadingRelated ? (
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-4 gap-6">
        {(fetchedRelatedProducts.length > 0 ? fetchedRelatedProducts : relatedProducts)?.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )}
  </div>
)}
        </div>
      </div>
      <Footer />
    </Suspense>
  );
};

export default ProductPage;