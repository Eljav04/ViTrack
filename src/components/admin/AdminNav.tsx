import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, Calendar, Building2, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function AdminNav({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'İdarə Paneli', icon: LayoutDashboard },
    { path: '/admin/attendance', label: 'Davamiyyət', icon: ClipboardList },
    { path: '/admin/employees', label: 'İşçilər', icon: Users },
    { path: '/admin/departments', label: 'Şöbələr', icon: Building2 },
    { path: '/admin/schedules', label: 'Cədvəllər', icon: Calendar },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Paneli
            </h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/admin/profile"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                location.pathname === '/admin/profile' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin İstifadəçi</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <Link
              to="/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/admin/profile'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              Profil
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}