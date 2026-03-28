'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Building2, MapPin, Eye, EyeOff, CheckCircle } from 'lucide-react';

type UserType = 'coworker' | 'coworking';

export default function RegistracePage() {
  const [userType, setUserType] = useState<UserType>('coworker');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Coworker form
  const [coworkerData, setCoworkerData] = useState({
    name: '',
    email: '',
    password: '',
    profession: '',
  });

  // Coworking form
  const [coworkingData, setCoworkingData] = useState({
    contactName: '',
    email: '',
    password: '',
    coworkingName: '',
    city: '',
  });

  const cities = [
    'Praha',
    'Brno',
    'Ostrava',
    'Plzeň',
    'Liberec',
    'České Budějovice',
    'Olomouc',
    'Hradec Králové',
    'Pardubice',
    'Zlín',
  ];

  const handleCoworkerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCoworkerData({
      ...coworkerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCoworkingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCoworkingData({
      ...coworkingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCoworkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle coworker registration
  };

  const handleCoworkingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle coworking registration
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className="text-2xl font-bold text-gray-900">
              COWORKINGS<span className="text-blue-600">.cz</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrace</h1>
          <p className="text-gray-600">Připoj se k naší komunitě</p>
        </div>

        {/* Type Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setUserType('coworker')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all border-2 ${
              userType === 'coworker'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
            }`}
          >
            <User className="w-5 h-5 inline-block mr-2" />
            Jsem coworker
          </button>
          <button
            onClick={() => setUserType('coworking')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all border-2 ${
              userType === 'coworking'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
            }`}
          >
            <Building2 className="w-5 h-5 inline-block mr-2" />
            Registruji coworking
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          {userType === 'coworker' ? (
            // Coworker Form
            <form onSubmit={handleCoworkerSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Registrace coworkera</h2>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Jméno a příjmení
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={coworkerData.name}
                    onChange={handleCoworkerChange}
                    placeholder="Jan Novák"
                    className="input-field pl-12 w-full"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={coworkerData.email}
                    onChange={handleCoworkerChange}
                    placeholder="tvůj@email.cz"
                    className="input-field pl-12 w-full"
                    required
                  />
                </div>
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Profesion
                </label>
                <input
                  type="text"
                  name="profession"
                  value={coworkerData.profession}
                  onChange={handleCoworkerChange}
                  placeholder="Např. Software engineer, Designer, ..."
                  className="input-field w-full"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Heslo
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={coworkerData.password}
                    onChange={handleCoworkerChange}
                    placeholder="••••••••"
                    className="input-field pl-12 pr-10 w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600 mt-0.5 flex-shrink-0"
                  required
                />
                <span className="text-sm text-gray-700">
                  Souhlasím s{' '}
                  <Link href="#" className="text-blue-600 hover:underline">
                    podmínkami
                  </Link>
                  {' '}a{' '}
                  <Link href="#" className="text-blue-600 hover:underline">
                    zásadami ochrany osobních údajů
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={!acceptTerms}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Zaregistrovat se
              </button>
            </form>
          ) : (
            // Coworking Form
            <form onSubmit={handleCoworkingSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Registrace coworkingu</h2>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Vaše jméno
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="contactName"
                    value={coworkingData.contactName}
                    onChange={handleCoworkingChange}
                    placeholder="Jan Novák"
                    className="input-field pl-12 w-full"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email coworkingu
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={coworkingData.email}
                    onChange={handleCoworkingChange}
                    placeholder="info@coworking.cz"
                    className="input-field pl-12 w-full"
                    required
                  />
                </div>
              </div>

              {/* Coworking Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Jméno coworkingu
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="coworkingName"
                    value={coworkingData.coworkingName}
                    onChange={handleCoworkingChange}
                    placeholder="SpaceMesh"
                    className="input-field pl-12 w-full"
                    required
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Město
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <select
                    name="city"
                    value={coworkingData.city}
                    onChange={handleCoworkingChange}
                    className="input-field pl-12 w-full"
                    required
                  >
                    <option value="">Vyber město</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Heslo
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={coworkingData.password}
                    onChange={handleCoworkingChange}
                    placeholder="••••••••"
                    className="input-field pl-12 pr-10 w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600 mt-0.5 flex-shrink-0"
                  required
                />
                <span className="text-sm text-gray-700">
                  Souhlasím s{' '}
                  <Link href="#" className="text-blue-600 hover:underline">
                    podmínkami
                  </Link>
                  {' '}a{' '}
                  <Link href="#" className="text-blue-600 hover:underline">
                    zásadami ochrany osobních údajů
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={!acceptTerms}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Zaregistrovat coworking
              </button>
            </form>
          )}

          {/* Sign In Link */}
          <p className="text-center text-gray-600 mt-6">
            Už máš účet?{' '}
            <Link href="/prihlaseni" className="text-blue-600 hover:text-blue-700 font-semibold">
              Přihlaš se
            </Link>
          </p>
        </div>

        {/* Benefits Box */}
        <div className="mt-6 bg-white rounded-lg border border-gray-100 p-6 space-y-3">
          <h3 className="font-bold text-gray-900 mb-4">Výhody registrace</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Bezplatný profil a přístup k coworkingům</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Snadná rezervace a správa rezervací</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Přístup k marketplace a eventům</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Podpora a komunita</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
