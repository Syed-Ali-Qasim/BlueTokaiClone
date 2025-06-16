'use client'

import { useEffect, useState } from 'react'
import ProductPage from './ProductPage'
import { notFound } from 'next/navigation'

interface ProductPageClientProps {
  slug: string
}

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
        const productUrl = `${baseUrl}/api/products?populate[images][populate]=*&populate[hoverImage][populate]=*&filters[slug][$eq]=${slug}`
        const res = await fetch(productUrl)

        if (!res.ok) throw new Error('Failed to fetch product')

        const json = await res.json()
        const item = json.data?.[0]
        if (!item) {
          return notFound()
        }

        const attr = item.attributes

        const extractImageUrls = (images: any): string[] =>
          images?.data?.map((img: any) => `${baseUrl}${img.attributes.url}`) || ['/placeholder-coffee-1.jpg']

        const productData = {
          id: item.id.toString(),
          name: attr.name,
          price: attr.price,
          originalPrice: attr.originalPrice,
          images: extractImageUrls(attr.images),
          description: attr.description,
          size: attr.size || ['250g', '500g', '1kg'],
          grind: attr.grind || ['Whole Bean', 'Coarse', 'Medium', 'Fine', 'Extra Fine'],
          sweetness: attr.sweetness || 2,
          body: attr.body || 2,
          acidity: attr.acidity || 3,
          bitterness: attr.bitterness || 1,
          roast: attr.roastLevel || 'MEDIUM',
          flavour: 'BLACK',
          altitude: attr.altitude || '1075-1200 M',
          processing: attr.processing || 'WASHED',
          variety: attr.variety || 'ARABICA',
          sun: 'SUN DRIED',
          country: attr.country || 'India',
          manufacturer: attr.manufacturer || 'Blue Tokai Coffee Roasters',
          fssaiNumber: attr.fssaiNumber || 'N/A',
          netQuantity: attr.netQuantity || '250g/500g/1000g',
          tastingNotes: attr.tastingNotes || ['BALANCED', 'SMOOTH', 'AROMATIC'],
          brewGuide: {
            time: '2:30 MINS',
            coffee: '18G',
            water: '230ML',
            temperature: '92°C',
            grindSize: 'MEDIUM GRIND'
          },
          estate: {
            name: `${attr.name} Estate`,
            location: attr.country || 'India',
            description: `Premium coffee estate producing exceptional ${attr.roastLevel?.toLowerCase()} roast coffee beans.`,
            area: '275 acres',
            altitude: attr.altitude || '1200 metres'
          }
        }

        setProduct(productData)
        setRelatedProducts([]) // You can add related products fetch here if needed
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (loading) return <div className="p-8">Loading...</div>
  if (!product) return notFound()

  return <ProductPage product={product} relatedProducts={relatedProducts} />
}
