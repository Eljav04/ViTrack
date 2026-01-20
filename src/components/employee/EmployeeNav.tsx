import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, Menu, X } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { currentUser } from '../../data/mockData'; // Keep for photo
import { useState } from 'react';
import logo from '../../assets/img/logo.png';

export function EmployeeNav({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { path: '/employee', label: 'Ana Səhifə', icon: Home },
    { path: '/employee/history', label: 'Tarixçə', icon: Calendar },
    { path: '/employee/profile', label: 'Profil', icon: User },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-12 h-12 mx-auto" />
              <h1 className="text-xl font-bold text-blue-900">ViTrack</h1>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <button onClick={onLogout} className="text-gray-600 hover:text-red-600 text-sm">
                Çıxış
              </button>
            </div>

            <div className="md:hidden">
              <img
                src={currentUser.photo}
                alt={user?.firstname}
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-3 px-4 flex-1 ${location.pathname === item.path
                ? 'text-blue-600'
                : 'text-gray-600'
                }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={onLogout}
            className={`flex flex-col items-center gap-1 py-3 px-4 flex-1 text-gray-600`}
          >
            <X className="w-6 h-6" />
            <span className="text-xs font-medium">Çıxış</span>
          </button>
        </div>
      </nav>
    </>
  );
}