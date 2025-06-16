import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

const Header = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFloatingHeader, setShowFloatingHeader] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const threshold = 100 // When to start showing floating header
      
      if (scrollY > threshold) {
        if (!showFloatingHeader) {
          setShowFloatingHeader(true)
        }
        setIsScrolled(true)
      } else {
        setShowFloatingHeader(false)
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showFloatingHeader])

  const navigationItems = [
    { 
      name: 'ROASTED COFFEE', 
      hasDropdown: true,
      dropdownItems: [
        'SINGLE ORIGINS AND BLENDS',
        'CAPSULES',
        'VALUE PACKS',
        'SUBSCRIPTIONS',
        'ALL COLLECTIONS'
      ]
    },
    { 
      name: 'OFFERS', 
      hasDropdown: true, 
      highlight: true,
      dropdownItems: [
        'FRENCH PRESS OFFER',
        'STARTER PACKS'
      ]
    },
    { 
      name: 'READY TO BREW', 
      hasDropdown: true,
      dropdownItems: [
        'EASY POUR',
        'COLD BREW BAGS',
        'COFFEE IN A CAN'
      ]
    },
    { 
      name: 'EQUIPMENT', 
      hasDropdown: false 
    },
    { 
      name: 'OTHERS', 
      hasDropdown: true,
      dropdownItems: [
        'MERCHANDISE',
        'PANTRY',
        'WHOLESALE'
      ]
    },
    { 
      name: 'LEARN', 
      hasDropdown: true,
      dropdownItems: [
        'EVENTS',
        'BLOG',
        'RECIPE',
        'BREWING GUIDES',
        'INDIAN FLAVOR WHEEL',
        'ALL FARMS'
      ]
    },
    { 
      name: 'ABOUT US', 
      hasDropdown: true,
      dropdownItems: [
        'WHO WE ARE',
        'OUR PACKAGING',
        'PARTNERSHIPS',
        'PRESS',
        'CAREERS',
        'CONTACT US',
        'INVESTOR RELATIONS',
        'OUR PRESENCE'
      ]
    },
  ]

  const HeaderContent = () => (
    <>
      {/* Top promotional banner */}
      <div className="bg-black text-white text-center py-3 cursor-pointer hover:bg-gray-900 transition-colors">
        <span className="text-sm">
          GET 10% OFF ON YOUR FIRST COFFEE PURCHASE, USE CODE - 
          <span className="text-blue-400 ml-1 font-medium">TRY10</span>
        </span>
      </div>

      {/* Main navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <Link href="/">
                <Image 
                  src="/logo-footer.png" 
                  alt="Blue Tokai Coffee Roasters" 
                  width={120}
                  height={48}
                  className="h-12 w-auto"
                  priority
                />
                </Link>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <a
                    href={item.name === 'ROASTED COFFEE' ? '/products' : '/'}
                    className={`flex items-center space-x-1 py-2 text-sm font-medium transition-colors duration-200 ${
                      item.highlight 
                        ? 'text-red-600' 
                        : hoveredItem === item.name 
                          ? 'text-blue-600' 
                          : 'text-gray-800'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </a>
                  
                  {/* Hover underline */}
                  {hoveredItem === item.name && !item.highlight && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-200" />
                  )}
                  
                  {/* Dropdown menu */}
                  {item.hasDropdown && hoveredItem === item.name && item.dropdownItems && (
                    <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-md py-2 z-50 min-w-48">
                      {item.dropdownItems.map((dropdownItem, index) => (
                        <a
                          key={index}
                          href={item.name === 'ROASTED COFFEE' ? '/products' : '/'}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          {dropdownItem}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Get the App button */}
              <button className="hidden md:block bg-black text-sky-300 px-4 py-2 rounded-xl text-sm font-medium hover:text-white hover:bg-gray-800 transition-colors duration-200">
                GET THE APP
              </button>

              {/* Icons */}
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Image 
                    src="/header-search_small.png" 
                    alt="Search" 
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Image 
                    src="/header-user_small.png" 
                    alt="Account" 
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Image 
                    src="/header-cart_small.png" 
                    alt="Cart" 
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Static header */}
      <header>
        <HeaderContent />
      </header>

      {/* Floating header */}
      {showFloatingHeader && (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isScrolled ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <HeaderContent />
        </div>
      )}
    </>
  )
}

export default Header