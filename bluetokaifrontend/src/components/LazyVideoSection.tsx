import React, { useRef, useEffect, useState } from 'react';

const LazyVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full">
      <div className="w-full h-full pl-20 pr-20 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload={shouldLoad ? "auto" : "none"}
        >
          {shouldLoad && (
            <source src="/e2b557a3730f49969da2ad109ec44e63c.mp4" type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default LazyVideoSection;