'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Users, DollarSign, Star, Calendar } from 'lucide-react';
import { CoworkingSpace, AMENITY_LABELS } from '@/lib/types';

interface CoworkingCardProps {
  coworking: CoworkingSpace;
}

export default function CoworkingCard({ coworking }: CoworkingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const photos = coworking.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  useEffect(() => {
    if (isHovered && hasMultiplePhotos) {
      // Cycle every 1 second while hovered
      intervalRef.current = setInterval(() => {
        setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Reset to first photo when mouse leaves
      if (!isHovered) setCurrentPhotoIdx(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, hasMultiplePhotos, photos.length]);

  const amenityLabels = coworking.amenities.slice(0, 3).map((a) => AMENITY_LABELS[a] || a);

  const getGradientColor = (name: string) => {
    const letters = name.charCodeAt(0);
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-orange-400 to-orange-600',
      'from-teal-400 to-teal-600',
    ];
    return colors[letters % colors.length];
  };

  return (
    <Link href={`/coworking/${coworking.slug}`}>
      <div
        className="card-hover group overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image with crossfade slideshow */}
        <div
          className={`relative w-full h-48 bg-gradient-to-br ${getGradientColor(coworking.name)} overflow-hidden flex-shrink-0`}
        >
          {photos.length > 0 ? (
            photos.map((photo, idx) => (
              <img
                key={photo.id || idx}
                src={photo.url}
                alt={photo.caption || coworking.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  idx === currentPhotoIdx ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))
          ) : null}

          {/* Photo dot indicators */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentPhotoIdx
                      ? 'bg-white w-3 h-1.5'
                      : 'bg-white/60 w-1.5 h-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {coworking.isVerified && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
              <Star className="w-3 h-3" />
              Ověřeno
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {coworking.name}
          </h3>

          {/* City + address */}
          <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
            <div className="min-w-0">
              <span className="font-medium">{coworking.city}</span>
              {coworking.address && (
                <span className="block text-xs text-gray-400 line-clamp-1">
                  {[coworking.address, coworking.zipCode].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
            {coworking.shortDescription}
          </p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenityLabels.map((label, idx) => (
              <span
                key={idx}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium"
              >
                {label}
              </span>
            ))}
            {coworking.amenities.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                +{coworking.amenities.length - 3}
              </span>
            )}
          </div>

          {/* Info row: capacity + prices */}
          <div className="border-t border-gray-100 pt-3 mb-4 space-y-1.5">
            {coworking.capacity && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>{coworking.capacity} míst</span>
              </div>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {coworking.prices?.hourly?.enabled && coworking.prices.hourly.from ? (
                <span className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs">od </span>
                  <span className="font-semibold text-gray-900">{coworking.prices.hourly.from.toLocaleString('cs-CZ')} Kč</span>
                  <span className="text-gray-500 font-normal">/hod</span>
                </span>
              ) : null}
              {coworking.prices?.dayPass?.enabled && coworking.prices.dayPass.from ? (
                <span className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs">od </span>
                  <span className="font-semibold text-gray-900">{coworking.prices.dayPass.from.toLocaleString('cs-CZ')} Kč</span>
                  <span className="text-gray-500 font-normal">/den</span>
                </span>
              ) : null}
              {coworking.prices?.openSpace?.enabled && coworking.prices.openSpace.from ? (
                <span className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs">od </span>
                  <span className="font-semibold text-gray-900">{coworking.prices.openSpace.from.toLocaleString('cs-CZ')} Kč</span>
                  <span className="text-gray-500 font-normal">/měs</span>
                </span>
              ) : null}
              {!coworking.prices?.hourly?.enabled && !coworking.prices?.dayPass?.enabled && !coworking.prices?.openSpace?.enabled && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  Cena na vyžádání
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Zobrazit detail
          </button>
        </div>
      </div>
    </Link>
  );
}
