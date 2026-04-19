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

/** Flexibilní tarif/členství — coworking si může přidat libovolný počet variant nad rámec 5 fixních prices.
 *  prices zůstávají jako "shop window" pro filtry; tariffs[] umožňují plný výčet členství s popisem. */
export interface Tariff {
  id: string;
  name: string;              // "Hot Desk", "Virtual membership", "Evening + Weekend"
  price: number | null;      // CZK; null = "na vyžádání"
  period: 'hour' | 'day' | 'week' | 'month' | 'year' | 'one-time';
  description?: string;      // co je v ceně, podmínky
  isPrimary?: boolean;       // doporučený / hvězdičkovaný tarif
  bookingUrl?: string;       // odkaz na detail / objednávku na webu coworku
}

/** Zasedací místnost / sdílený prostor k pronájmu.
 *  V detail page jsou už renderovány (page.tsx ~280); zde formalizuji typ + přidávám bookingUrl. */
export interface MeetingRoom {
  id: string;
  name: string;
  type: 'meeting_room' | 'phone_booth' | 'private_office' | 'event_space';
  capacity: number | null;
  pricePerHour: number;      // 0 = "součást členství / na vyžádání"
  description?: string;
  amenities?: string[];      // subset of AMENITY_LABELS keys (projector, whiteboard, ...)
  bookingUrl?: string;       // tlačítko "Rezervovat" → externí stránka coworku
}

export interface SpecialDeal {
  enabled: boolean;
  badgeText: string;       // krátký štítek, např. "1 den zdarma"
  description: string;     // delší popis pro detail stránku
  validFrom: string | null; // ISO date "2025-01-01"
  validTo: string | null;   // ISO date "2025-12-31"
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
  /** Pouze super_admin může nastavit */
  isVerified: boolean;
  /** Pouze super_admin může nastavit — zobrazení v doporučených + první pozice ve filtrech */
  isFeatured: boolean;
  /** Special Deal — coworking si zapne při roční registraci */
  specialDeal?: SpecialDeal;
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
  // Services (volný text — výčet služeb, které coworking nabízí nad rámec amenities)
  services?: string;
  // Flexibilní tarify (vedle fixních prices)
  tariffs?: Tariff[];
  // Zasedací místnosti a prostory k pronájmu (nahrazuje dřívější any[] v page.tsx)
  rooms?: MeetingRoom[];
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
  /** Odkaz na registraci / více informací — zadává se v adminu */
  url?: string | null;
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
    maxSeats: 25,
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
  monthlyPrice: 99,
  yearlyPrice: 590,
  yearlyMonthlyPrice: Math.round(590 / 12), // 49 Kč/měs
  teamYearlyPrice: 1590,        // tým až 5 lidí
  teamMaxMembers: 5,
  freeVisitsPerMonth: 1,
  yearlyMonthlySaving: Math.round(99 * 12 - 590), // 598 Kč
};

export const COWORKER_MEMBERSHIP_BENEFITS = [
  '1 bezplatná návštěva měsíčně v libovolném coworku',
  'Sleva na služby, eventy a produkty',
  'Pozvánka na naše akce a eventy',
  'Neomezené zveřejňování na marketplace',
  'Speciální akce a nabídky od coworkingů',
];

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
