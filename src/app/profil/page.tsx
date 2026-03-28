'use client';

import { useState } from 'react';
import { Mail, MapPin, Briefcase, User, Award, Pencil, LogOut, Heart, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Jan Novák',
    email: 'jan.novak@email.cz',
    profession: 'Senior Frontend Developer',
    bio: 'Zaměřuji se na React a TypeScript. Ráda pracuji v coworkingech s dobrou komunitou.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    membershipTier: 'premium',
    homeCoworking: 'SpaceMesh Praha',
  });

  const [editData, setEditData] = useState(profile);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setProfile(editData);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {profile.name}
                </h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" />
                  {profile.profession}
                </p>
                {profile.membershipTier === 'premium' && (
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold">
                    <Award className="w-4 h-4" />
                    Premium člen
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {!isEditMode && (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 sm:flex-none py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Upravit
                  </button>
                  <button className="flex-1 sm:flex-none py-2 px-4 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Odhlásit
                  </button>
                </>
              )}
              {isEditMode && (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Uložit
                  </button>
                  <button
                    onClick={() => {
                      setEditData(profile);
                      setIsEditMode(false);
                    }}
                    className="flex-1 sm:flex-none py-2 px-4 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Zrušit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Edit Form */}
          <div className="lg:col-span-2">
            {isEditMode ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Upravit profil</h2>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Jméno a příjmení
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Profesion
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={editData.profession}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Krátká biografická poznámka
                  </label>
                  <textarea
                    name="bio"
                    value={editData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field w-full"
                  />
                </div>

                {/* Home Coworking */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Domácí coworking
                  </label>
                  <input
                    type="text"
                    name="homeCoworking"
                    value={editData.homeCoworking}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bio Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">O mně</h2>
                  <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Dovednosti</h2>
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Home Coworking */}
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Domácí coworking</h2>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {profile.homeCoworking}
                      </p>
                      <p className="text-sm text-gray-600">Praha</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Kontakt</h3>
              <div className="space-y-4">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile.email}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Membership Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 mb-6">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Premium člen
              </h3>
              <p className="text-sm text-amber-800 mb-4">
                Aktivní do 30. března 2026
              </p>
              <button className="w-full py-2 px-4 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors">
                Prodloužit členství
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Oblíbené
              </button>
              <button className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Zprávy
              </button>
            </div>

            {/* Settings */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Nastavení</h3>
              <div className="space-y-3 text-sm">
                <Link
                  href="#"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Bezpečnost a heslo
                </Link>
                <Link
                  href="#"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Oznámení
                </Link>
                <Link
                  href="#"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Soukromí
                </Link>
                <Link
                  href="#"
                  className="block text-red-600 hover:text-red-700 font-medium pt-3 border-t border-gray-200"
                >
                  Smazat účet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
