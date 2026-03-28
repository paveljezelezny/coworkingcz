import { BarChart3, Users, Calendar, TrendingUp, Settings, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-gray-900 text-white p-6 min-h-screen">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-lg">
              C
            </div>
            <span className="font-bold text-lg">COWORKINGS.cz</span>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold"
            >
              <BarChart3 className="w-5 h-5 inline-block mr-2" />
              Přehled
            </Link>
            <Link
              href="/admin/profil"
              className="block py-3 px-4 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
            >
              👤 Profil
            </Link>
            <Link
              href="/admin/rezervace"
              className="block py-3 px-4 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Rezervace
            </Link>
            <Link
              href="/admin/ceny"
              className="block py-3 px-4 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
            >
              💰 Ceny
            </Link>
            <Link
              href="/admin/nastaveni"
              className="block py-3 px-4 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
            >
              <Settings className="w-5 h-5 inline-block mr-2" />
              Nastavení
            </Link>
          </nav>

          <div className="border-t border-gray-800 mt-8 pt-4">
            <button className="block w-full text-left py-3 px-4 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">
              <LogOut className="w-5 h-5 inline-block mr-2" />
              Odhlásit se
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Administrace</h1>
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Page Content */}
          <div className="p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vítejte v administraci
              </h2>
              <p className="text-gray-600">
                Spravujte svůj coworking a sledujte statistiky
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: 'Celkem rezervací',
                  value: '247',
                  change: '+12%',
                  icon: Calendar,
                },
                {
                  title: 'Aktivních členů',
                  value: '89',
                  change: '+5%',
                  icon: Users,
                },
                {
                  title: 'Příjmy tento měsíc',
                  value: '45,230 Kč',
                  change: '+18%',
                  icon: TrendingUp,
                },
                {
                  title: 'Průměrná obsazenost',
                  value: '78%',
                  change: '+3%',
                  icon: BarChart3,
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-600">
                        {stat.title}
                      </h3>
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bookings Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6">Rezervace za poslední 7 dní</h3>
                <div className="h-64 flex items-end justify-between">
                  {[65, 59, 80, 81, 56, 55, 40].map((height, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-blue-600 rounded-t opacity-80 hover:opacity-100 transition-opacity mx-1"
                      style={{ height: `${height}%` }}
                      title={`Den ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-600">
                  <span>Po</span>
                  <span>Út</span>
                  <span>St</span>
                  <span>Čt</span>
                  <span>Pá</span>
                  <span>So</span>
                  <span>Ne</span>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6">Poslední rezervace</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Jan Novák', type: 'Day pass', date: 'Dnes' },
                    { name: 'Marie Svobodová', type: 'Měsíční', date: 'Včera' },
                    { name: 'David Procházka', type: 'Hodinový', date: 'Před 2 dny' },
                    { name: 'Petra Kučerová', type: 'Day pass', date: 'Před 3 dny' },
                  ].map((booking, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.name}
                        </p>
                        <p className="text-sm text-gray-600">{booking.type}</p>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {booking.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Edit Profile CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-200 p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Upravit profil coworkingu
              </h3>
              <p className="text-gray-600 mb-6">
                Aktualizuj informace, fotografie a ceny svého coworkingu
              </p>
              <Link
                href="/admin/profil"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upravit profil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
