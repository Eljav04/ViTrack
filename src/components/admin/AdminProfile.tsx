import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Shield, LogOut as LogOutIcon, Calendar, Clock, AlertCircle, Coffee } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { AdminNav } from './AdminNav';
import { Button } from '../ui/button';
import { UserAvatar } from '../ui/UserAvatar';
import { statisticsService, StatisticsResponse } from '../../services/statisticsService';
import { toast } from 'sonner';


export function AdminProfile({ onLogout }: { onLogout: () => void }) {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsService.getOverallMonthlyStats();
        setStats(data);
      } catch (error) {
        console.error('Monthly stats fetch failed', error);
        toast.error('Aylıq statistikanı yükləmək mümkün olmadı');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  const round = (num: number) => Math.round(num * 10) / 10;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profil</h2>

        <div className="space-y-4">
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
                <p className="text-sm text-gray-600">{user.role === 'User' ? 'İşçi' : user.role === 'Boss' ? 'Direktor' : 'Administrator'}</p>
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

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Rol</p>
                  <p className="text-sm font-medium text-gray-900">{user.role === 'User' ? 'İşçi' : user.role === 'Boss' ? 'Direktor' : 'Administrator'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Şöbə</p>
                  <p className="text-sm font-medium text-gray-900">{user.department?.name || 'Təyin edilməyib'}</p>
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
            <h3 className="font-semibold text-gray-900 mb-4">Aylıq statistika</h3>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-2xl font-semibold text-blue-600">{stats.wholeDays}</p>
                  <p className="text-xs text-blue-700">Ümumi günlər</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-2xl font-semibold text-green-600">{stats.restDays}</p>
                  <p className="text-xs text-green-700">İstirahət günləri sayı</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-2xl font-semibold text-red-600">{stats.absentDays}</p>
                  <p className="text-xs text-red-700">Qayıb günləri sayı</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-2xl font-semibold text-orange-600">{stats.lateCount}</p>
                  <p className="text-xs text-orange-700">Gecikmə sayı</p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-2xl font-semibold text-indigo-600">{round(stats.workHours)}</p>
                  <p className="text-xs text-indigo-700">İşlənilən saatlar</p>
                </div>

                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-2xl font-semibold text-teal-600">{round(stats.overtimeHours)}</p>
                  <p className="text-xs text-teal-700">Əlavə saatlar</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Məlumat yüklənmədi</p>
            )}
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
