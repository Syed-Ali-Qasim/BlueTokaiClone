'use client'

import dynamic from 'next/dynamic'

const ProductPageClient = dynamic(() => import('./ProductPageClient'), {
  ssr: false
})

export default function ProductPageWrapper({ slug }: { slug: string }) {
  return <ProductPageClient slug={slug} />
}
