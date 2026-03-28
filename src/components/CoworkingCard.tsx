import Link from 'next/link';
import { MapPin, Users, DollarSign, Star } from 'lucide-react';
import { CoworkingSpace, AMENITY_LABELS } from '@/lib/types';

interface CoworkingCardProps {
  coworking: CoworkingSpace;
}

export default function CoworkingCard({ coworking }: CoworkingCardProps) {
  const amenityLabels = coworking.amenities.slice(0, 3).map(a => AMENITY_LABELS[a] || a);

  // Generate gradient placeholder color based on first letter
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

  const priceDisplay = coworking.priceDayPass ? `${coworking.priceDayPass} Kč/den` : 'Cena na vyžádání';

  return (
    <Link href={`/coworking/${coworking.slug}`}>
      <div className="card-hover group overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
        {/* Image */}
        <div className={`relative w-full h-48 bg-gradient-to-br ${getGradientColor(coworking.name)} overflow-hidden`}>
          {coworking.photos && coworking.photos[0] && (
            <img
              src={coworking.photos[0].url}
              alt={coworking.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )}
          {coworking.isVerified && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              Ověřeno
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name and Location */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {coworking.name}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0 text-blue-600" />
            <span className="line-clamp-1">{coworking.city}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
            {coworking.shortDescription}
          </p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-3">
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

          {/* Info Row */}
          <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-t border-gray-100 pt-4">
            {coworking.capacity && (
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{coworking.capacity} míst</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-gray-900">{priceDisplay}</span>
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
