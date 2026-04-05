'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Mail, Globe, Linkedin, Award, Pencil, LogOut,
  Loader2, Check, X, Plus, Trash2, ShieldCheck,
  Calendar, ExternalLink, Lock, Zap,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  bio: string;
  profession: string;
  skills: string[];
  linkedinUrl: string;
  websiteUrl: string;
  avatarUrl: string | null;
  isPublic: boolean;
  membershipTier: string | null;
  membershipStart: string | null;
  membershipEnd: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function membershipLabel(tier: string | null): string {
  if (!tier) return '';
  if (tier.startsWith('trial')) return 'Trial 30 dní';
  if (tier === 'monthly') return 'Měsíční';
  if (tier === 'yearly') return 'Roční';
  if (tier === 'team') return 'Týmový';
  if (tier === 'premium') return 'Premium';
  return tier;
}

function membershipStatus(end: string | null): 'active' | 'expiring' | 'expired' | 'none' {
  if (!end) return 'none';
  const endDate = new Date(end);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'expiring';
  return 'active';
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysLeft(end: string | null): number {
  if (!end) return 0;
  return Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function roleLabel(role: string): string {
  if (role === 'super_admin') return 'Super admin';
  if (role === 'coworking_admin') return 'Správce coworkingu';
  return 'Coworker';
}

// ─── Skill Tag Component ─────────────────────────────────────────────────────

function SkillTag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:text-red-500 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// ─── Membership Card ─────────────────────────────────────────────────────────

function MembershipCard({ tier, end, role }: { tier: string | null; end: string | null; role: string }) {
  const status = membershipStatus(end);

  if (role === 'super_admin') {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-900">Super Admin</h3>
        </div>
        <p className="text-sm text-purple-700">Neomezený přístup ke všem funkcím platformy.</p>
      </div>
    );
  }

  if (!tier || status === 'none') {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700">Základní účet</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Odemkni přidávání eventů, inzerátů a další funkce.
        </p>
        <Link
          href="/ceniky"
          className="block w-full py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Začít 30 dní zdarma →
        </Link>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-red-800">{membershipLabel(tier)}</h3>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Expirováno</span>
        </div>
        <p className="text-sm text-red-700 mb-4">Členství expirovala {formatDate(end)}.</p>
        <Link
          href="/ceniky"
          className="block w-full py-2 px-4 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
        >
          Obnovit členství
        </Link>
      </div>
    );
  }

  const isTrial = tier.startsWith('trial');
  const days = daysLeft(end);
  const isExpiring = status === 'expiring';

  return (
    <div className={`rounded-xl border p-5 mb-5 ${isTrial
      ? 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'
      : isExpiring
        ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        {isTrial ? <Zap className="w-5 h-5 text-green-600" /> : <Award className="w-5 h-5 text-amber-600" />}
        <h3 className={`font-bold ${isTrial ? 'text-green-900' : 'text-amber-900'}`}>
          {membershipLabel(tier)}
        </h3>
        {isTrial && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Trial</span>
        )}
        {isExpiring && !isTrial && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">Brzy vyprší</span>
        )}
      </div>
      <p className={`text-sm mb-1 ${isTrial ? 'text-green-800' : 'text-amber-800'}`}>
        Aktivní do {formatDate(end)}
      </p>
      {days >= 0 && (
        <p className={`text-xs mb-4 ${isTrial ? 'text-green-600' : isExpiring ? 'text-orange-600' : 'text-amber-600'}`}>
          Zbývá {days} {days === 1 ? 'den' : days < 5 ? 'dny' : 'dní'}
        </p>
      )}
      <Link
        href="/ceniky"
        className={`block w-full py-2 px-4 text-white text-sm font-semibold rounded-lg transition-colors text-center ${
          isTrial ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
        }`}
      >
        {isTrial ? 'Přejít na placený plán' : 'Prodloužit členství'}
      </Link>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, image, size = 'lg' }: { name: string; image?: string | null; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';
  if (image) {
    return <img src={image} alt={name} className={`${sz} rounded-full object-cover flex-shrink-0`} />;
  }
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProfilPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const skillInputRef = useRef<HTMLInputElement>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/prihlaseni?callbackUrl=/profil');
    }
  }, [authStatus, router]);

  // Fetch profile data
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authStatus]);

  // Populate edit form when entering edit mode
  const enterEditMode = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio);
    setEditProfession(profile.profession);
    setEditSkills([...profile.skills]);
    setEditLinkedin(profile.linkedinUrl);
    setEditWebsite(profile.websiteUrl);
    setEditIsPublic(profile.isPublic);
    setSaveError('');
    setSaveSuccess(false);
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setSaveError('');
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || editSkills.includes(s)) return;
    setEditSkills([...editSkills, s]);
    setNewSkill('');
    skillInputRef.current?.focus();
  };

  const removeSkill = (skill: string) => {
    setEditSkills(editSkills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          profession: editProfession,
          skills: editSkills,
          linkedinUrl: editLinkedin,
          websiteUrl: editWebsite,
          isPublic: editIsPublic,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Chyba při ukládání');
      }
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        name: editName,
        bio: editBio,
        profession: editProfession,
        skills: editSkills,
        linkedinUrl: editLinkedin,
        websiteUrl: editWebsite,
        isPublic: editIsPublic,
      } : prev);
      setSaveSuccess(true);
      setIsEditMode(false);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Chyba');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / auth states ──

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Profil nenalezen.</p>
      </div>
    );
  }

  const memberStatus = membershipStatus(profile.membershipEnd);
  const hasMembership = memberStatus === 'active' || memberStatus === 'expiring';
  const userRole = profile.role;

  // ── Render ──

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success banner */}
        {saveSuccess && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            Profil byl úspěšně uložen.
          </div>
        )}

        {/* ── Header card ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar name={profile.name} image={profile.image ?? profile.avatarUrl} size="lg" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.name || '(bez jména)'}</h1>
                {profile.profession && (
                  <p className="text-gray-500 mt-0.5">{profile.profession}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    userRole === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    userRole === 'coworking_admin' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {roleLabel(userRole)}
                  </span>
                  {hasMembership && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {membershipLabel(profile.membershipTier)}
                    </span>
                  )}
                  {!profile.isPublic && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Soukromý profil
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {!isEditMode ? (
                <>
                  <button
                    onClick={enterEditMode}
                    className="flex-1 sm:flex-none py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Upravit
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex-1 sm:flex-none py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Odhlásit
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Uložit
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex-1 sm:flex-none py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Zrušit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Error banner ── */}
        {saveError && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
            <X className="w-4 h-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─ Left: main content ─ */}
          <div className="lg:col-span-2 space-y-6">

            {isEditMode ? (
              /* ── Edit form ── */
              <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Upravit profil</h2>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jméno a příjmení</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Tvoje jméno"
                    className="input-field w-full"
                  />
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profese / pozice</label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={e => setEditProfession(e.target.value)}
                    placeholder="např. Frontend Developer, Grafik, Marketér..."
                    className="input-field w-full"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">O mně</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    rows={4}
                    placeholder="Krátký popis — kdo jsi, na čem pracuješ, co tě zajímá..."
                    className="input-field w-full resize-none"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dovednosti</label>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                    {editSkills.map(skill => (
                      <SkillTag key={skill} label={skill} onRemove={() => removeSkill(skill)} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={skillInputRef}
                      type="text"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="Přidat dovednost..."
                      className="input-field flex-1"
                    />
                    <button
                      onClick={addSkill}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Stiskni Enter nebo klikni + pro přidání</p>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={editLinkedin}
                      onChange={e => setEditLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/tvuj-profil"
                      className="input-field w-full pl-10"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Webová stránka</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={editWebsite}
                      onChange={e => setEditWebsite(e.target.value)}
                      placeholder="https://tvoje-stranka.cz"
                      className="input-field w-full pl-10"
                    />
                  </div>
                </div>

                {/* Public toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Veřejný profil</p>
                    <p className="text-xs text-gray-500 mt-0.5">Ostatní uživatelé tě uvidí v adresáři</p>
                  </div>
                  <button
                    onClick={() => setEditIsPublic(!editIsPublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsPublic ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editIsPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <>
                {/* Bio */}
                {profile.bio ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">O mně</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center">
                    <p className="text-gray-400 text-sm">Ještě nemáš vyplněné bio.</p>
                    <button onClick={enterEditMode} className="text-blue-600 text-sm font-medium mt-1 hover:underline">
                      Přidat popis →
                    </button>
                  </div>
                )}

                {/* Skills */}
                {profile.skills.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Dovednosti</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <SkillTag key={idx} label={skill} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {(profile.linkedinUrl || profile.websiteUrl) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Odkazy</h2>
                    <div className="space-y-3">
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium text-sm">
                          <Linkedin className="w-4 h-4 flex-shrink-0" />
                          {profile.linkedinUrl.replace('https://', '')}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium text-sm">
                          <Globe className="w-4 h-4 flex-shrink-0" />
                          {profile.websiteUrl.replace('https://', '')}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ─ Right: sidebar ─ */}
          <div className="lg:col-span-1 space-y-5">

            {/* Membership card */}
            <MembershipCard tier={profile.membershipTier} end={profile.membershipEnd} role={userRole} />

            {/* Contact */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Kontakt</h3>
              <a href={`mailto:${profile.email}`}
                className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors group">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{profile.email}</span>
              </a>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Účet</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Člen od {formatDate(profile.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <span>{roleLabel(profile.role)}</span>
                </div>
                {!profile.isPublic && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span>Soukromý profil</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Rychlé akce</h3>
              <div className="space-y-2">
                <Link href="/marketplace/nova-nabidka"
                  className="flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 text-blue-500" /> Přidat inzerát
                </Link>
                <Link href="/udalosti/nova-udalost"
                  className="flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 text-blue-500" /> Přidat event
                </Link>
                {(userRole === 'coworking_admin' || userRole === 'super_admin') && (
                  <Link href="/spravce"
                    className="flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <ShieldCheck className="w-4 h-4 text-purple-500" /> Správce coworkingů
                  </Link>
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Nastavení účtu</h3>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" /> Odhlásit se
                </button>
                <button
                  onClick={() => {
                    if (confirm('Opravdu chceš smazat svůj účet? Tato akce je nevratná.')) {
                      alert('Pro smazání účtu kontaktuj: info@coworkings.cz');
                    }
                  }}
                  className="flex items-center gap-2 w-full py-2 px-3 text-gray-400 hover:bg-gray-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Smazat účet
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
