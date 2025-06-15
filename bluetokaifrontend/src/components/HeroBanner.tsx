import Image from 'next/image'

export default function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 py-12 px-8 mb-8 rounded-lg overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carefully sourced from
          </h1>
          <h2 className="text-3xl font-bold text-teal-600 mb-8">
            India's finest farms
          </h2>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p className="text-xs text-gray-600 leading-tight">
                Direct<br/>Sourcing
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <p className="text-xs text-gray-600 leading-tight">
                13 Great farm<br/>Families
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <p className="text-xs text-gray-600 leading-tight">
                Roasted in<br/>Small Batches
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <Image
              src="/api/placeholder/400/300"
              alt="Coffee packages"
              width={400}
              height={300}
              className="object-contain"
            />
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-1/4 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-8 left-1/3 w-3 h-3 bg-teal-400 rounded-full"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-orange-400 rounded-full"></div>
      </div>
    </div>
  )
}