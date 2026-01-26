import { User as UserIcon, Mail, Clock, Building2, Shield, LogOut as LogOutIcon } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { EmployeeNav } from './EmployeeNav';
import { Button } from '../ui/button';
import { UserAvatar } from '../ui/UserAvatar';


export function EmployeeProfile({ onLogout }: { onLogout: () => void }) {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <EmployeeNav onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profil</h2>

        <div className="space-y-4">
          {/* Profile Photo & Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <UserAvatar
                firstname={user.firstname}
                lastname={user.lastname}
                imageUrl={null}
                size="lg"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.firstname} {user.lastname}</h3>
                <p className="text-sm text-gray-600">{user.role === 'User' ? 'İşçi' : 'Administrator'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">İstifadəçi adı</p>
                  <p className="text-sm font-medium text-gray-900">{user.login}</p>
                </div>
              </div>

              {/* Added Role section */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Rol</p>
                  <p className="text-sm font-medium text-gray-900">{user.role === 'User' ? 'İşçi' : 'Administrator'}</p>
                </div>
              </div>
              {/* End of Added Role section */}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Şöbə</p>
                  <p className="text-sm font-medium text-gray-900">{user.department?.name || 'Təyin edilməyib'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              İş Cədvəli
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cədvəl Tipi</span>
                <span className="font-medium text-gray-900">{user.workSchedule?.name || 'Təyin edilməyib'}</span>
              </div>

              {user.workSchedule && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Başlama Vaxtı</span>
                    <span className="font-medium text-gray-900">{user.workSchedule.startTime.substring(0, 5)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bitmə Vaxtı</span>
                    <span className="font-medium text-gray-900">{user.workSchedule.endTime.substring(0, 5)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Bu Ay Statistikası</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-green-600">22</p>
                <p className="text-xs text-green-700">İş Günləri</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-orange-600">1</p>
                <p className="text-xs text-orange-700">Gecikmələr</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-blue-600">0</p>
                <p className="text-xs text-blue-700">Erkən Çıxışlar</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-semibold text-purple-600">176</p>
                <p className="text-xs text-purple-700">Cəmi Saat</p>
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
