'use client';

import { useRef } from 'react';
import Image from 'next/image';

const photos = [
  '/background1.png',
  '/background2.png',
  '/background3.png',
];

export default function Gallery() {
  const scrollRef = useRef(null);

  const handleKeyDown = (e) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;

    if (e.key === 'ArrowRight') {
      container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-[800px] aspect-video overflow-hidden bg-black/70 rounded-2xl shadow-lg flex items-center justify-center"
    >
      <div
        ref={scrollRef}
        className="flex overflow-x-scroll snap-x snap-mandatory w-full h-full no-scrollbar"
      >
        {photos.map((src, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 w-full h-full snap-center flex items-center justify-center"
          >
            <Image
              src={src}
              alt={`Photo ${i + 1}`}
              fill
              className="object-cover rounded-2xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
