'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/coworkingy', label: 'Coworkingy', key: 'coworkingy' },
    { href: '/mapa', label: 'Mapa', key: 'mapa' },
    { href: '/udalosti', label: 'Události', key: 'udalosti' },
    { href: '/marketplace', label: 'Marketplace', key: 'marketplace' },
    { href: '/pro-coworkingy', label: 'Pro coworkingy', key: 'pro-coworkingy' },
  ];

  const isActive = (key: string) => {
    return pathname.includes(key);
  };

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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
