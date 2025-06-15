import React from 'react';

const LazyVideoSection = () => {
  return (
    <section className="w-full">
      <div className="w-full h-full pl-20 pr-20 relative">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          loading="lazy"
        >
          <source src="/e2b557a3730f49969da2ad109ec44e63c.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default LazyVideoSection;