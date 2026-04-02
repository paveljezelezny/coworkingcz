'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, ChevronDown, LogOut, Settings, Shield, User } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  coworking_admin: 'Správce',
  coworker: 'Uživatel',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  coworking_admin: 'bg-blue-100 text-blue-700',
  coworker: 'bg-gray-100 text-gray-600',
};

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Zavřít dropdown při kliku mimo
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!session?.user) {
    return (
      <>
        <Link
          href="/prihlaseni"
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Přihlásit se
        </Link>
        <Link
          href="/registrace"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Registrace
        </Link>
      </>
    );
  }

  const user = session.user as any;
  const role = user.role ?? 'coworker';
  const email = user.email ?? '';
  const name = user.name ?? email;
  const image = user.image;

  // Iniciály pro avatar bez fotky
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
      >
        {/* Avatar */}
        {image ? (
          <img src={image} alt={name} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}

        {/* Email + role */}
        <div className="text-left hidden lg:block">
          <div className="text-xs font-medium text-gray-900 leading-tight max-w-[160px] truncate">
            {email}
          </div>
          <div className={`text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block ${ROLE_COLORS[role]}`}>
            {ROLE_LABELS[role] ?? role}
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
          {/* Hlavička s emailem */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {image ? (
                <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
                <div className="text-xs text-gray-500 truncate">{email}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${ROLE_COLORS[role]}`}>
                  {ROLE_LABELS[role] ?? role}
                </span>
              </div>
            </div>
          </div>

          {/* Odkazy */}
          <div className="py-1">
            {role === 'super_admin' && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4 text-purple-500" />
                Admin panel
              </Link>
            )}
            {(role === 'coworking_admin' || role === 'super_admin') && (
              <Link
                href="/spravce"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-blue-500" />
                Správce coworkingů
              </Link>
            )}
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              Můj profil
            </Link>
          </div>

          {/* Odhlášení */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: '/coworkingy', label: 'Coworkingy', key: 'coworkingy' },
    { href: '/mapa', label: 'Mapa', key: 'mapa' },
    { href: '/udalosti', label: 'Události', key: 'udalosti' },
    { href: '/marketplace', label: 'Marketplace', key: 'marketplace' },
    { href: '/pro-coworkingy', label: 'Pro coworkingy', key: 'pro-coworkingy' },
  ];

  const isActive = (key: string) => pathname.includes(key);

  const user = session?.user as any;
  const role = user?.role ?? 'coworker';

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              COWORKINGS<span className="text-blue-600">.cz</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`text-sm font-medium transition-colors relative ${
                  isActive(link.key)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.label}
                {isActive(link.key) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 animate-slide-up">
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.key)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
              {session?.user ? (
                <>
                  {/* Přihlášený uživatel - mobile */}
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    <div className="text-xs font-semibold text-gray-900 truncate">{user?.email}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${ROLE_COLORS[role]}`}>
                      {ROLE_LABELS[role] ?? role}
                    </span>
                  </div>
                  {role === 'super_admin' && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Shield className="w-4 h-4" /> Admin panel
                    </Link>
                  )}
                  {(role === 'coworking_admin' || role === 'super_admin') && (
                    <Link href="/spravce" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" /> Správce coworkingů
                    </Link>
                  )}
                  <Link href="/profil" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <User className="w-4 h-4" /> Můj profil
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Odhlásit se
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/prihlaseni"
                    className="px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Přihlásit se
                  </Link>
                  <Link
                    href="/registrace"
                    className="px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrace
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
