'use client';

import {
  Wifi, Users, Coffee, Car, Printer, PhoneCall, Droplets, KeyRound,
  ConciergeBell, Clock, Sun, PawPrint, Baby, Wrench, CalendarDays,
  MailOpen, Monitor, Wind, Tv2, MoveVertical, Bike, Zap,
  Accessibility, VolumeX, Package, Building2,
} from 'lucide-react';
import { AMENITY_LABELS } from '@/lib/types';

type IconComponent = React.ComponentType<{ className?: string }>;

const AMENITY_ICONS: Record<string, IconComponent> = {
  wifi:             Wifi,
  meeting_rooms:    Users,
  kitchen:          Coffee,
  parking:          Car,
  printer:          Printer,
  phone_booth:      PhoneCall,
  shower:           Droplets,
  locker:           KeyRound,
  reception:        ConciergeBell,
  '24h_access':     Clock,
  cafe:             Coffee,
  terrace:          Sun,
  pet_friendly:     PawPrint,
  childcare:        Baby,
  workshop_tools:   Wrench,
  events:           CalendarDays,
  mail_service:     MailOpen,
  virtual_office:   Monitor,
  air_conditioning: Wind,
  projector:        Tv2,
  standing_desk:    MoveVertical,
  phone_line:       PhoneCall,
  bike_storage:     Bike,
  electric_car:     Zap,
  accessibility:    Accessibility,
  soundproof:       VolumeX,
};

const AMENITY_COLORS: Record<string, string> = {
  wifi:             'text-blue-600 bg-blue-50 border-blue-100',
  meeting_rooms:    'text-purple-600 bg-purple-50 border-purple-100',
  kitchen:          'text-amber-600 bg-amber-50 border-amber-100',
  parking:          'text-gray-600 bg-gray-50 border-gray-200',
  printer:          'text-gray-600 bg-gray-50 border-gray-200',
  phone_booth:      'text-teal-600 bg-teal-50 border-teal-100',
  shower:           'text-cyan-600 bg-cyan-50 border-cyan-100',
  locker:           'text-slate-600 bg-slate-50 border-slate-200',
  reception:        'text-indigo-600 bg-indigo-50 border-indigo-100',
  '24h_access':     'text-green-600 bg-green-50 border-green-100',
  cafe:             'text-amber-700 bg-amber-50 border-amber-100',
  terrace:          'text-yellow-600 bg-yellow-50 border-yellow-100',
  pet_friendly:     'text-orange-500 bg-orange-50 border-orange-100',
  childcare:        'text-pink-500 bg-pink-50 border-pink-100',
  workshop_tools:   'text-red-600 bg-red-50 border-red-100',
  events:           'text-blue-500 bg-blue-50 border-blue-100',
  mail_service:     'text-violet-600 bg-violet-50 border-violet-100',
  virtual_office:   'text-sky-600 bg-sky-50 border-sky-100',
  air_conditioning: 'text-cyan-500 bg-cyan-50 border-cyan-100',
  projector:        'text-gray-700 bg-gray-50 border-gray-200',
  standing_desk:    'text-emerald-600 bg-emerald-50 border-emerald-100',
  phone_line:       'text-teal-600 bg-teal-50 border-teal-100',
  bike_storage:     'text-lime-600 bg-lime-50 border-lime-100',
  electric_car:     'text-yellow-500 bg-yellow-50 border-yellow-100',
  accessibility:    'text-blue-500 bg-blue-50 border-blue-100',
  soundproof:       'text-slate-600 bg-slate-50 border-slate-200',
};

export default function AmenityGrid({ amenities }: { amenities: string[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {amenities.map((amenity) => {
        const Icon = AMENITY_ICONS[amenity] || Package;
        const colorClass = AMENITY_COLORS[amenity] || 'text-gray-600 bg-gray-50 border-gray-200';
        return (
          <div
            key={amenity}
            className={`flex items-center gap-3 p-4 rounded-xl border ${colorClass} transition-transform hover:scale-[1.02]`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">
              {AMENITY_LABELS[amenity] || amenity}
            </span>
          </div>
        );
      })}
    </div>
  );
}
