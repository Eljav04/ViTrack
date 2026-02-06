import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Clock, Building2, Shield, LogOut as LogOutIcon, Calendar, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { EmployeeNav } from './EmployeeNav';
import { Button } from '../ui/button';
import { UserAvatar } from '../ui/UserAvatar';
import { statisticsService, StatisticsResponse } from '../../services/statisticsService';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { formatMinutesToHoursMinutesShort } from '../../lib/timeUtils';


export function EmployeeProfile({ onLogout }: { onLogout: () => void }) {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsService.getMyOverallMonthlyStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch monthly stats', error);
        toast.error('Aylıq statistikanı yükləmək mümkün olmadı');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Rol</p>
                  <p className="text-sm font-medium text-gray-900">{user.role === 'User' ? 'İşçi' : 'Administrator'}</p>
                </div>
              </div>

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
              İş cədvəli
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cədvəl tipi</span>
                <span className="font-medium text-gray-900">{user.workSchedule?.name || 'Təyin edilməyib'}</span>
              </div>

              {user.workSchedule && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Başlama vaxtı</span>
                    <span className="font-medium text-gray-900">{user.workSchedule.startTime.substring(0, 5)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bitmə vaxtı</span>
                    <span className="font-medium text-gray-900">{user.workSchedule.endTime.substring(0, 5)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Aylıq statistika
            </h3>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xl font-bold text-blue-900">{stats.workDays} / {stats.wholeDays}</p>
                    <p className="text-xs text-blue-700">İş günləri</p>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-xl font-bold text-emerald-900">{stats.restDays}</p>
                    <p className="text-xs text-emerald-700">İstirahət günlər</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-xl font-bold text-red-900">{stats.absentDays}</p>
                    <p className="text-xs text-red-700">Qayıb günlər</p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-xl font-bold text-orange-900">{stats.lateCount}</p>
                    <p className="text-xs text-orange-700">Gecikmə sayı</p>
                  </div>
                </div>

                {/* Work Hours & Overtime */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Toplam iş yükü</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">İşlənmiş saat</p>
                      <p className="text-2xl font-bold text-gray-900 font-mono">
                        {formatMinutesToHoursMinutesShort(stats.workHours * 60)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1 flex items-center justify-end gap-1">
                        Overtime
                        {stats.overtimeHours > 0 ? <ArrowUp className="w-3 h-3 text-green-600" /> : <ArrowDown className="w-3 h-3 text-red-600" />}
                      </p>
                      <p className={cn(
                        "text-lg font-bold font-mono",
                        stats.overtimeHours > 0 ? "text-green-600" : stats.overtimeHours < 0 ? "text-red-600" : "text-gray-400"
                      )}>
                        {formatMinutesToHoursMinutesShort(stats.overtimeHours * 60)}
                      </p>
                    </div>
                  </div>
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
