import React from 'react';
import Image from 'next/image';

const LazyTestimonials = () => {
  const testimonials = [
    {
      text: "I've been drinking coffee for a year now but never tried Blue Team Coffee before. After trying their French roast, I am not a bit of darker roast but it was one of the smoothest coffees I've tried. Highly recommend!",
      name: "KEERTHI HARDASANI",
      rating: 5
    },
    {
      text: "Love the packaging that coffee perfection. It's gorgeous. The coffee tastes amazing and I love how it blend even with the world is wanting to 'say' 'Happy Morning' ☕",
      name: "SAHIL MADAN",
      rating: 5
    },
    {
      text: "Blue Team is hands down the best coffee brand out there! I've enjoyed every single cup and the quality has been so good. I can't get enough of their amazing blend!",
      name: "KRISHNA SARBADHIKARY",
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Left Pattern - absolutely positioned at screen edge */}
      <div className="absolute left-0 top-0 z-0">
        <Image
          src="/Asset44-left_310x.png"
          alt=""
          width={300}
          height={400}
          className="opacity-100"
          loading="lazy"
          quality={70}
          sizes="300px"
        />
      </div>

      {/* Right Pattern - absolutely positioned at screen edge */}
      <div className="absolute right-0 top-0 z-0">
        <Image
          src="/Asset43-right_310x.png"
          alt=""
          width={300}
          height={400}
          className="opacity-100"
          loading="lazy"
          quality={70}
          sizes="300px"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Header Row with Bird and Heading */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-2">
            <Image
              src="/Asset_1_1_140x.png"
              alt="Decorative bird illustration"
              width={128}
              height={128}
              loading="lazy"
              quality={75}
              sizes="128px"
            />
            <h2 className="font-cormorant text-6xl font-light">
              Happy <span className="italic">Customers</span>
            </h2>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="font-brandon flex flex-col justify-between text-center bg-orange-50 p-6 rounded-lg h-full">
              <p className="font-brandon text-gray-700 text-lg leading-relaxed mb-4">
                {testimonial.text}
              </p>
              <div className="mt-auto">
                <div className="flex justify-center mb-2" aria-label={`${testimonial.rating} star rating`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span
                      key={i}
                      className="font-segoeSymbols text-yellow-300 text-4xl font-semibold"
                      aria-hidden="true">
                      ★
                    </span>
                  ))}
                </div>
                <p className="font-brandon text-2xl font-semibold text-gray-800">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LazyTestimonials;