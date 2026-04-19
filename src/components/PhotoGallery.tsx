'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, MapPin, Star } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption: string;
  isPrimary: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  name: string;
}

export default function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const prev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setActiveIdx((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const lightboxPrev = () => setLightboxIdx((i) => (i - 1 + photos.length) % photos.length);
  const lightboxNext = () => setLightboxIdx((i) => (i + 1) % photos.length);

  return (
    <>
      {/* Main gallery */}
      <div className="relative bg-gray-900 overflow-hidden" style={{ height: '500px' }}>
        {/* Main image */}
        {photos.map((photo, idx) => (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.caption || name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              idx === activeIdx ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 pointer-events-none" />

        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
              aria-label="Předchozí fotka"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
              aria-label="Další fotka"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Zoom button */}
        <button
          onClick={() => openLightbox(activeIdx)}
          className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-lg px-3 py-2 flex items-center gap-1.5 text-sm transition-colors z-10"
        >
          <ZoomIn className="w-4 h-4" />
          Zvětšit
        </button>

        {/* Photo counter */}
        <div className="absolute top-4 left-4 bg-black/40 text-white text-sm px-3 py-1.5 rounded-lg z-10">
          {activeIdx + 1} / {photos.length}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setActiveIdx(idx)}
                className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                  idx === activeIdx
                    ? 'border-white scale-110'
                    : 'border-white/40 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `${name} — miniatura ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full p-2 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIdx + 1} / {photos.length}
          </div>

          {/* Image */}
          <div className="relative max-w-5xl max-h-screen w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIdx].url}
              alt={photos[lightboxIdx].caption || name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {photos[lightboxIdx].caption && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm">
                {photos[lightboxIdx].caption}
              </div>
            )}
          </div>

          {/* Lightbox nav */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 rounded-full p-3 transition-colors"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 rounded-full p-3 transition-colors"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
