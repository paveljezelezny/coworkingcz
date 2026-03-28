import Link from 'next/link';
import { Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-7xl font-bold text-blue-600 mb-4">404</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Stránka nenalezena
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Bohužel jsme nenašli stránku, kterou hledáš.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Na hlavní stranu
          </Link>
          <Link
            href="/coworkingy"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Search className="w-5 h-5" />
            Procházet coworkingy
          </Link>
        </div>

        <div className="mt-12 text-gray-600">
          <p>Potřebuješ pomoc? <Link href="#" className="text-blue-600 font-semibold hover:underline">Kontaktuj nás</Link></p>
        </div>
      </div>
    </div>
  );
}
