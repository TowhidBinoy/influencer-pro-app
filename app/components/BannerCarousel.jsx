'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Single-slide banner carousel — autoplay every 5s, swipe/drag to navigate,
 * dot indicators when there's more than one banner. Renders nothing when
 * `banners` is empty. Matches the pattern in mrs-g6-frontend's
 * SpecialOffersCarousel, adapted to this app's dark/purple styling.
 */
export default function BannerCarousel({ banners = [], height = 'h-28' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => { setIndex(0); }, [banners.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[index];

  const handleClick = () => {
    if (!banner.link) return;
    const url = banner.link.startsWith('http') ? banner.link : `https://${banner.link}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDragEnd = (_, info) => {
    if (banners.length <= 1) return;
    if (info.offset.x < -40) next();
    else if (info.offset.x > 40) prev();
  };

  return (
    <div className="space-y-2">
      <div className={`relative overflow-hidden rounded-[20px] border border-[#231A3D] shadow-md ${height}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={banner.uuid || index}
            className={`absolute inset-0 ${banner.link ? 'cursor-pointer' : ''}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            drag={banners.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
          >
            <img
              src={banner.image}
              alt={banner.name || 'Banner'}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.uuid || i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === index ? 'bg-[#B13CFF] w-5' : 'bg-[#3A2C63] w-1.5'
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
