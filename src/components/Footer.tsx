import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div className="space-y-4">
            <div>
              <div className="inline-block bg-white rounded-xl px-3 py-2">
                <img
                  src="/logo-kings.png"
                  alt="Coworkings.cz"
                  className="h-9 w-auto object-contain"
                  draggable={false}
                />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Propojujeme coworkery a coworkingové prostory v celé České republice. Najdi si ideální místo pro práci.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Pro coworkers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Pro coworkery</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/coworkingy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Procházet coworkingy
                </Link>
              </li>
              <li>
                <Link
                  href="/udalosti"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kalendář akcí
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/registrace"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Členství
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Coworking Spaces */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Pro coworkingy</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/ceniky"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Ceníky
                </Link>
              </li>
              <li>
                <Link
                  href="/registrace"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Přidat coworking
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Admin panel
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Podpora
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:info@coworkings.cz"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  info@coworkings.cz
                </a>
              </li>
              <li>
                <a
                  href="tel:+420123456789"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +420 123 456 789
                </a>
              </li>
              <li>
                <p className="text-gray-400">Česká republika</p>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Napsat nám
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} COWORKINGS.cz - Všechna práva vyhrazena
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Soukromí
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Podmínky
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
