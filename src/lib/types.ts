export interface CoworkingPrice {
  enabled: boolean;
  from: number | null;
}

export interface CoworkingPrices {
  hourly: CoworkingPrice;    // hodina
  dayPass: CoworkingPrice;   // den
  openSpace: CoworkingPrice; // open space (měsíc v listech)
  fixDesk: CoworkingPrice;   // fix desk
  office: CoworkingPrice;    // kancelář
}

export interface CoworkingSpace {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  city: string;
  region: string;
  address: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  areaM2: number | null;
  phone: string;
  email: string;
  website: string;
  openingHours: OpeningHours;
  prices: CoworkingPrices;
  platformTier: 'small' | 'medium' | 'large' | null;
  platformActive: boolean;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  amenities: string[];
  photos: Photo[];
  locations: Location[];
  youtubeUrl?: string;
  matterportUrl?: string;
  // Workspace details
  officeCount?: number | null;
  fixedDesks?: number | null;
  hotDesks?: number | null;
  // Event / venue
  hasEventSpace?: boolean;
  venueTypes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  isPrimary: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  isPrimary: boolean;
}

export interface OpeningHours {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'coworker' | 'coworking_admin' | 'super_admin';
  createdAt: string;
}

export interface CoworkerProfile {
  id: string;
  userId: string;
  bio: string;
  profession: string;
  skills: string[];
  linkedinUrl: string;
  websiteUrl: string;
  avatarUrl: string;
  isPublic: boolean;
  services: string;
  membershipTier: 'free' | 'premium' | null;
  membershipStart: string | null;
  membershipEnd: string | null;
  homeCoworkingId: string | null;
}

export interface Event {
  id: string;
  coworkingId: string;
  coworkingName?: string;
  title: string;
  description: string;
  eventType: 'workshop' | 'networking' | 'meetup' | 'party' | 'conference' | 'other';
  startDate: string;
  endDate: string | null;
  isAllDay: boolean;
  maxAttendees: number | null;
  price: number | null;
  isFree: boolean;
  imageUrl: string;
}

export interface Booking {
  id: string;
  userId: string;
  coworkingId: string;
  bookingType: 'day_pass' | 'hourly' | 'monthly' | 'meeting_room';
  date: string;
  startTime: string;
  endTime: string;
  seats: number;
  totalPrice: number | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

export interface MarketplaceListing {
  id: string;
  userId: string;
  userName?: string;
  title: string;
  description: string;
  category: 'job_offer' | 'job_seeking' | 'service_offer' | 'service_seeking' | 'item_for_sale' | 'item_wanted';
  tags: string[];
  price: number | null;
  priceType: 'fixed' | 'hourly' | 'negotiable' | 'free' | null;
  location: string;
  isActive: boolean;
  contactEmail: string;
  createdAt: string;
}

export interface PlatformPricing {
  tier: 'small' | 'medium' | 'large';
  name: string;
  maxSeats: number;
  maxArea: number;
  monthlyPrice: number;
  yearlyDiscount: number;
  includedAddresses: number;
  extraAddressPrice: number;
}

export const PLATFORM_PRICING: PlatformPricing[] = [
  {
    tier: 'small',
    name: 'Malý cowork',
    maxSeats: 20,
    maxArea: 500,
    monthlyPrice: 490,
    yearlyDiscount: 0.20,
    includedAddresses: 1,
    extraAddressPrice: 270,
  },
  {
    tier: 'medium',
    name: 'Střední cowork',
    maxSeats: 100,
    maxArea: 1000,
    monthlyPrice: 990,
    yearlyDiscount: 0.20,
    includedAddresses: 2,
    extraAddressPrice: 490,
  },
  {
    tier: 'large',
    name: 'Velký cowork',
    maxSeats: 99999,
    maxArea: 99999,
    monthlyPrice: 1900,
    yearlyDiscount: 0.20,
    includedAddresses: 2,
    extraAddressPrice: 490,
  },
];

export const COWORKER_MEMBERSHIP = {
  monthlyPrice: 250,
  yearlyPrice: 1900,
  freeVisitsPerMonth: 1,
};

export const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Wi-Fi',
  meeting_rooms: 'Zasedací místnosti',
  kitchen: 'Kuchyňka',
  parking: 'Parkování',
  printer: 'Tiskárna',
  phone_booth: 'Telefonní budka',
  shower: 'Sprcha',
  locker: 'Skříňka',
  reception: 'Recepce',
  '24h_access': 'Přístup 24/7',
  cafe: 'Kavárna',
  terrace: 'Terasa',
  pet_friendly: 'Pet-friendly',
  childcare: 'Hlídání dětí',
  workshop_tools: 'Dílna/nástroje',
  events: 'Eventy',
  mail_service: 'Poštovní služby',
  virtual_office: 'Virtuální kancelář',
  air_conditioning: 'Klimatizace',
  projector: 'Projektor / TV',
  standing_desk: 'Výškově stavitelné stoly',
  phone_line: 'Pevná linka',
  bike_storage: 'Úložiště kol',
  electric_car: 'Nabíjení EV',
  accessibility: 'Bezbariérový přístup',
  soundproof: 'Zvukotěsné místnosti',
};

export const VENUE_TYPE_LABELS: Record<string, string> = {
  yoga: 'Jóga / meditace',
  party: 'Oslava / večírek',
  coworking: 'Coworking',
  workshop: 'Školení / workshop',
  teambuilding: 'Teambuilding',
  leisure: 'Volnočasové aktivity',
  exhibition: 'Výstava / vernisáž',
  filming: 'Filmování / focení',
  meeting: 'Meeting',
  wedding: 'Svatba',
  conference: 'Konference',
  sport: 'Sport',
  streaming: 'Streaming',
  tasting: 'Degustace',
  concert: 'Koncert',
  fashion: 'Módní přehlídka',
};

export const VENUE_TYPE_EMOJIS: Record<string, string> = {
  yoga: '🧘',
  party: '🎉',
  coworking: '💼',
  workshop: '📚',
  teambuilding: '🤝',
  leisure: '🎯',
  exhibition: '🖼️',
  filming: '📸',
  meeting: '💼',
  wedding: '💒',
  conference: '🎤',
  sport: '⚽',
  streaming: '📡',
  tasting: '🍷',
  concert: '🎸',
  fashion: '👗',
};

export const CITY_REGIONS: Record<string, string> = {
  'Praha': 'Praha',
  'Brno': 'Jihomoravský kraj',
  'Ostrava': 'Moravskoslezský kraj',
  'Plzeň': 'Plzeňský kraj',
  'Olomouc': 'Olomoucký kraj',
  'Liberec': 'Liberecký kraj',
  'České Budějovice': 'Jihočeský kraj',
  'Hradec Králové': 'Královéhradecký kraj',
  'Pardubice': 'Pardubický kraj',
  'Zlín': 'Zlínský kraj',
  'Karlovy Vary': 'Karlovarský kraj',
  'Jihlava': 'Kraj Vysočina',
};

export type FilterOptions = {
  city?: string;
  amenities?: string[];
  minCapacity?: number;
  maxPrice?: number;
  search?: string;
  hasEvents?: boolean;
};
