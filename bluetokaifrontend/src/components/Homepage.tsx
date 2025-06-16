'use client'

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'

const LazyTestimonials = lazy(() => import('./LazyTestimonials'));
const LazyVideoSection = lazy(() => import('./LazyVideoSection'));

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

    const cacheKey = `products_${JSON.stringify(options)}`
    
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const params = new URLSearchParams()
      if (populate) params.append('populate', '*')
      if (limit) params.append('pagination[limit]', limit.toString())
      
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
        next: { revalidate: 300 }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rawData = await response.json()
      const transformedProducts = this.transformProductData(rawData)

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

  static clearCache() {
    this.cache.clear()
  }
}

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const carouselSlides = [
    {
      id: 1,
      image: "/Desktop_28.png"
    },
    {
      id: 2,
      image: "/Desktop-02_1_1370x.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const processSteps = [
    { title: "ROAST & GRINDING COFFEE", subtitle: "", image: "/process-1.jpg" },
    { title: "READY TO DRINK", subtitle: "", image: "/process-2.jpg" },
    { title: "NO EQUIPMENT BREWING", subtitle: "", image: "/process-3.jpg" },
    { title: "BREWING EQUIPMENT", subtitle: "", image: "/process-4.jpg" },
    { title: "ROASTED COFFEE RECOMMENDATION", subtitle: "", image: "/process-5.png" }
  ];

  const subscriptionFeatures = [
    { icon: "01 /", title: "Save up to 30%" },
    { icon: "02 /", title: "Enjoy convenience with doorstep delivery" },
    { icon: "03 /", title: "Experiment more with free and different beans" },
    { icon: "04 /", title: "Customize your plan according" },
    { icon: "05 /", title: "Stay stocked up and never run out of coffee" }
  ];

  const customizationOptions = [
    { title: "NUMBER", image: "/number_large.png" },
    { title: "PACK SIZE", image: "/pack_size_large.png" },
    { title: "COFFEES", image: "/coffees_large.png" },
    { title: "GRIND SIZE", image: "/grind_size_large.png" },
    { title: "FREQUENCY", image: "/frequency_large.png" }
  ];

  useEffect(() => {
    const fetchBestsellerProducts = async () => {
      try {
        setLoading(true);
        let fetchedProducts = await ProductService.fetchProducts({
          limit: 4,
          populate: true,
          filters: { featured: true }
        });

        if (fetchedProducts.length < 4) {
          const additionalProducts = await ProductService.fetchProducts({
            limit: 4 - fetchedProducts.length,
            populate: true,
            filters: { featured: false }
          });
          fetchedProducts = [...fetchedProducts, ...additionalProducts];
        }

        if (fetchedProducts.length < 4) {
          const allProducts = await ProductService.fetchProducts({
            limit: 4,
            populate: true
          });
          fetchedProducts = allProducts.slice(0, 4);
        }

        setBestsellerProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching bestseller products:', error);

        try {
          const fallbackProducts = await ProductService.fetchProducts({
            limit: 4,
            populate: true
          });
          setBestsellerProducts(fallbackProducts);
        } catch (fallbackError) {
          console.error('Error fetching fallback products:', fallbackError);
          setBestsellerProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellerProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header/>

      <section className="relative h-[300px] overflow-hidden">
        <div className="relative w-full h-full">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={`Coffee hero slide ${slide.id}`}
                fill
                className="object-cover"
                priority={index === 0}
                quality={85}
                sizes="100vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rq5lrXTl2RneGjBxfkKlgXe7y5JKWHjJsQxY2oZrGIK6WTxgT9gqJXE9xM8oEBUoQVIfg/8ANeBuztibxDIcZIlnhGPyLjZb/ajKbcBo3cFl8xnYFOa8RJcHYCRXPqPcYvIJl0u+e1lMvkHw7dUBa0ptfGKhTOxvJ1GGW9IHlnkZLhgq9gcHGdyF7C8jL7zVgRbfRZoK9HdYmJQK7ZuwmhYZikPBYRCWA9GiJhwwlVwb4SXRIyI0/cBHl0jJqEtWdmPqZAiLSIhb5SjKjLjHhPJWiTqaM8Y8JYJqAmfcvzDg4o6rdyBmmfKmgBaWWdqVWYgdmbA"
              />
            </div>
          ))}
          
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
            aria-label="Previous slide"
          >
            <Image
              src="/left-arrow-common.png"
              alt=""
              width={40}
              height={40}
              className="hover:opacity-80 transition-opacity"
              loading="lazy"
            />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            aria-label="Next slide"
          >
            <Image
              src="/right-arrow-common.png"
              alt=""
              width={40}
              height={40}
              className="hover:opacity-80 transition-opacity"
              loading="lazy"
            />
          </button>
        </div>
      </section>

      <section className="py-16 bg-yellow-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-50 h-50 rounded-full overflow-hidden mb-4 mx-auto">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={240}
                    height={240}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    quality={75}
                    sizes="240px"
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-800">{step.title}</h3>
                <p className="text-xs text-gray-600">{step.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-0">
        <div className="w-full h-[470px] relative">
          <Image
            src="/Desktop1.jpg"
            alt="Press Your Way - Coffee brewing methods"
            fill
            className="object-cover"
            loading="lazy"
            quality={80}
            sizes="100vw"
          />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-cormorant text-6xl font-regular text-start mb-12">Bestseller Coffees</h2>
          {loading ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4 h-64"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : bestsellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellerProducts.map((product) => (
                <div key={product.id} className="flex flex-col h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bestseller products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="w-1/2 pr-8">
              <h2 className="font-cormorant text-6xl font-regular mb-4">
                New to <span className="italic">Specialty</span> Coffee?
              </h2>
              <p className="font-brandon text-3xl text-gray-600 mb-6">
                Let's start brewing! Check beginner-<br />
                friendly products to get started.
              </p>
              <button className="bg-sky-100 text-black px-6 py-3 font-semibold hover:bg-gray-900 transition-colors">
                LEARN MORE
              </button>
            </div>
            <div className="w-1/2">
              <div className="relative h-[400px] w-[650px]">
                <Image
                  src="/NewToCoffee.jpg"
                  alt="Specialty Coffee brewing guide for beginners"
                  fill
                  className="object-cover"
                  loading="lazy"
                  quality={80}
                  sizes="650px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="absolute inset-0">
          <Image
            src="/subscriber-bg.png"
            alt=""
            fill
            className="object-cover"
            loading="lazy"
            quality={60}
            sizes="100vw"
          />
        </div>

        <div className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg pl-8 flex items-center justify-between">
              <div className="max-w-lg">
                <h2 className="font-cormorant text-6xl font-regular mb-6">
                  Brew
                
                <span className='italic'>
                    More. Save More!
                </span>
                </h2>
                <div className="mb-6">
                  <p className="font-semibold mb-4">WHEN YOU GET A SUBSCRIPTION FROM US, YOU:</p>
                  <ul className="space-y-2">
                    {subscriptionFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="mr-2">{feature.icon}</span>
                        {feature.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="bg-sky-200 text-black px-6 py-3 rounded font-bold hover:bg-sky-300 transition-colors">
                  SUBSCRIBE NOW
                </button>
              </div>
              <div className="flex-1 flex justify-end">
                <Image
                  src="/process-5.png"
                  alt="Coffee subscription service"
                  width={600}
                  height={500}
                  className="object-contain"
                  loading="lazy"
                  quality={75}
                  sizes="600px"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cormorant text-5xl mb-4 text-black">
              Completely customise your subscription,<br />
              in just a few clicks.
            </h2>
            <p className="font-cormorant text-5xl mb-12 text-black">You get to pick:</p>
            <div className="flex justify-center space-x-12 mb-16">
              {customizationOptions.map((option, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 mb-3 mx-8">
                    <Image
                      src={option.image}
                      alt={`Customize ${option.title.toLowerCase()}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      quality={75}
                      sizes="64px"
                    />
                  </div>
                  <p className="font-semibold text-lg text-black">{option.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse" />}>
        <LazyVideoSection />
      </Suspense>

      <section className="w-full h-[960px] relative">
        <Image
          src="/Group_6_1-change.png"
          alt="Coffee features and benefits"
          fill
          className="object-cover"
          loading="lazy"
          quality={80}
          sizes="100vw"
        />
      </section>

      <Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse" />}>
        <LazyTestimonials />
      </Suspense>
      <Footer/>
    </div>
  );
};

export default Homepage;