'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Subscribe email:', email)
    setEmail('')
  }

  return (
    <div>
      {/* Footer Section with Blue Background */}
      <div className="font-brandon relative bg-cyan-50 overflow-hidden min-h-[100px]">
        <div className="relative z-1   py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-6 gap-8 items-start">
              {/* Left side - Logo and brand info */}
              <div className="col-span-1">
                <div className="mb-0">
                  <div className="w-full h-full mb-6">
                    <Image
                      src="/logo-footer.png"
                      alt="Blue Tokai Coffee Roasters"
                      width={188}
                      height={128}
                      className="object-contain"
                    />
                  </div>
                  
                  <h3 className="font-brandon text-sm font-bold text-black mb-4 tracking-wider leading-tight">
                    BLUE TOKAI COFFEE ROASTERS
                  </h3>
                  
                  <div className="text-xs text-black mb-6 space-y-1">
                    <p className="font-brandon font-bold">PRIVACY POLICY</p>
                    <p className="font-brandon font-bold">COPYRIGHT © 2022</p>
                  </div>
                  
                  <div>
                    <p className="font-brandon text-xs text-black mb-3 font-bold">FOLLOW US</p>
                    <div className="flex space-x-3 text-black">
                      <a href="#" className="hover:opacity-70 text-lg">𝕏</a>
                      <a href="#" className="hover:opacity-70 text-lg">f</a>
                      <a href="#" className="hover:opacity-70 text-lg">📷</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center - Newsletter signup */}
              <div className="col-span-2 px-12">
                <form onSubmit={handleSubscribe} className="mb-6">
                  <div className="mb-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Sign up for our newsletter!"
                      className="font-brandon bg-white w-full px-4 py-3 border-0 text-sm text-gray-900 focus:outline-none placeholder-gray-500"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="font-brandon w-full bg-black hover:bg-gray-800 text-white py-3 text-sm font-bold tracking-wider">
                    SUBSCRIBE NOW
                  </Button>
                </form>
                
                <div className="text-xs text-black leading-relaxed space-y-1">
                  <p className="font-brandon font-bold">SPECIAL OFFERS, BREWING TIPS & RECIPES!</p>
                  <p className="font-brandon font-bold">GET AN INSIDER ACCESS TO NEW LAUNCHES, EVENTS</p>
                  <p className="font-brandon font-bold"> & MORE - STRAIGHT TO YOUR INBOX!</p>
                  <p className="font-brandon font-bold text-gray-700">(WE PROMISE NOT TO SPAM)</p>
                </div>
              </div>

              {/* Right side - Footer Links in 3 columns */}
              <div className="col-span-3 grid grid-cols-3 gap-3">
                {/* Shop Online */}
                <div>
                  <h4 className="font-brandon font-bold text-black mb-4 text-lg tracking-wider">SHOP ONLINE</h4>
                  <ul className="space-y-2 text-lg text-black">
                    <li><a href="#" className="hover:opacity-70">Coffee</a></li>
                    <li><a href="#" className="hover:opacity-70">Equipment</a></li>
                    <li><a href="#" className="hover:opacity-70">Merchandise</a></li>
                    <li><a href="#" className="hover:opacity-70">Track Order</a></li>
                    <li><a href="#" className="hover:opacity-70">Wholesale</a></li>
                    <li><a href="#" className="hover:opacity-70">Terms and Conditions</a></li>
                    <li><a href="#" className="hover:opacity-70">Offers T&C</a></li>
                    <li><a href="#" className="hover:opacity-70">Sitemap</a></li>
                  </ul>
                </div>

                {/* About Us */}
                <div>
                  <h4 className="font-brandon font-bold text-black mb-4 text-lg tracking-wider">ABOUT US</h4>
                  <ul className="space-y-2 text-lg text-black">
                    <li><a href="#" className="hover:opacity-70">Our Roasteries</a></li>
                    <li><a href="#" className="hover:opacity-70">Our Beliefs</a></li>
                    <li><a href="#" className="hover:opacity-70">Our Farms</a></li>
                    <li><a href="#" className="hover:opacity-70">Play Bar Project</a></li>
                    <li><a href="#" className="hover:opacity-70">Press</a></li>
                    <li><a href="#" className="hover:opacity-70">Careers</a></li>
                    <li><a href="#" className="hover:opacity-70">Packaging</a></li>
                    <li><a href="#" className="hover:opacity-70">Contact Us</a></li>
                  </ul>
                </div>

                {/* Visit Us */}
                <div>
                  <h4 className="font-brandon font-bold text-black mb-4 text-lg tracking-wider">VISIT US</h4>
                  <div className="space-y-2 text-lg text-black">
                    <p className="font-bold text-black mb-4 text-lg tracking-wider"><a href="#" className="hover:opacity-70">OUR FARMS</a></p>
                    <p className="font-bold text-black mb-4 text-lg tracking-wider"><a href="#" className="hover:opacity-70">LEARN</a></p>
                    <p className="font-bold text-black mb-4 text-lg tracking-wider"><a href="#" className="hover:opacity-70">BLOG</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Creature - positioned at bottom right corner */}
            <Image
              src="/footer-svg.png"
              alt="Decorative creature"
              width={256}
              height={256}
              className="absolute bottom-0 right-0 z-20 object-contain"
              priority
            />
      </div>
    </div>
  )
}