import { User, Mail, Shield, Calendar, LogOut as LogOutIcon } from 'lucide-react';
import { AdminNav } from './AdminNav';
import { Button } from '../ui/button';

export function AdminProfile({ onLogout }: { onLogout: () => void }) {
  const adminUser = {
    name: 'Admin İstifadəçi',
    email: 'admin@sirket.com',
    role: 'Administrator',
    department: 'İdarəetmə',
    joinDate: '15 Yan, 2023',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profil</h2>

        <div className="space-y-4">
          {/* Profile Photo & Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                A
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{adminUser.name}</h3>
                <p className="text-sm text-gray-600">{adminUser.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">E-poçt</p>
                  <p className="text-sm font-medium text-gray-900">{adminUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Rol</p>
                  <p className="text-sm font-medium text-gray-900">{adminUser.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Şöbə</p>
                  <p className="text-sm font-medium text-gray-900">{adminUser.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Qoşulma Tarixi</p>
                  <p className="text-sm font-medium text-gray-900">{adminUser.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Permissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Səlahiyyətlər</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-gray-900">Davamiyyət idarəetməsi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-gray-900">İşçilərin idarə edilməsi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-gray-900">Şöbələrin idarə edilməsi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-gray-900">Cədvəllərin idarə edilməsi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-gray-900">Hesabatların görüntülənməsi</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sistem Statistikası</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-blue-600">48</p>
                <p className="text-xs text-blue-700">Cəmi İşçilər</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-green-600">5</p>
                <p className="text-xs text-green-700">Şöbələr</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-purple-600">4</p>
                <p className="text-xs text-purple-700">İş Cədvəlləri</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-orange-600">92%</p>
                <p className="text-xs text-orange-700">Davamiyyət Faizi</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <Button variant="danger" fullWidth onClick={onLogout}>
              <LogOutIcon className="w-4 h-4 mr-2" />
              Çıxış
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
