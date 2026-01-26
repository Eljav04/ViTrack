import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, User, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { currentUser, schedules } from '../../data/mockData';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { StatusBadge, AttendanceStatus } from '../ui/StatusBadge';
import { EmployeeNav } from './EmployeeNav';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTodayRecord } from '../../store/attendanceSlice';

export function EmployeeDashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const dispatch = useAppDispatch();
  const todayRecord = useAppSelector((s) => s.attendance.today);
  const { user } = useAppSelector((state) => state.auth);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // derive work status from backend today's record if available
  const workStatus = todayRecord
    ? (todayRecord.leaveTime ? 'finished' : (todayRecord.arrivalTime ? 'at-work' : 'not-started'))
    : 'not-started';

  useEffect(() => {
    dispatch(fetchTodayRecord());
  }, [dispatch]);

  const formatTimeShort = (value: any) => {
    if (!value) return '—';
    if (typeof value === 'string') {
      // If value like '13:48:44' or '13:48:44.298' just take HH:mm
      const match = value.match(/^(\d{2}:\d{2})/);
      if (match) return match[1];

      // Try ISO parse
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) {
        return new Date(parsed).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return value;
    }
    if (value instanceof Date) {
      return value.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return String(value);
  };

  const getRecordStatus = (rec: any): AttendanceStatus => {
    if (!rec) return 'waiting';
    const arrivalTime = rec?.arrivalTime ?? rec?.ArrivalTime ?? rec?.checkIn;
    if (!arrivalTime) return 'waiting';

    const isLate = rec?.isLate ?? rec?.IsLate ?? false;
    const isEarly = rec?.isEarlyLeave ?? rec?.IsEarlyLeave ?? false;
    if (isLate && isEarly) return 'late-and-early';
    if (isLate) return 'late';
    if (isEarly) return 'early-leave';
    return 'on-time';
  };

  const statusConfig = {
    'not-started': {
      label: 'Gözlənilir',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    'at-work': {
      label: 'İşdədir',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    finished: {
      label: 'Tamamlanıb',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  };

  const currentStatus = statusConfig[workStatus];

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNav onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile optimized layout */}
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cari Vəziyyət</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStatus.bgColor} ${currentStatus.color} border-2 border-current`} />
                  <span className={`text-xl font-semibold ${currentStatus.color}`}>
                    {currentStatus.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Cari Vaxt</p>
                <p className="text-xl font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            {workStatus === 'not-started' && (
              <Button
                className={cn(
                  "w-full lg:py-6 lg:text-lg",
                  workStatus === 'not-started'
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                size="lg"
                onClick={() => navigate('/employee/check-in')}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Giriş Et
              </Button>
            )}

            {workStatus === 'at-work' && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white lg:py-6 lg:text-lg"
                size="lg"
                onClick={() => navigate('/employee/check-out')}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Çıxış Et
              </Button>
            )}

            {workStatus === 'finished' && (
              <div className="flex items-center justify-center gap-2 py-3 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">İş günü başa çatdı</span>
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Bu Günün Cədvəli
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cədvəl</span>
                <span className="font-medium text-gray-900">{user?.workSchedule?.name || 'Təyin edilməyib'}</span>
              </div>

              {user?.workSchedule && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Başlama Vaxtı</span>
                    <span className="font-medium text-gray-900">{formatTimeShort(user.workSchedule.startTime)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bitmə Vaxtı</span>
                    <span className="font-medium text-gray-900">{formatTimeShort(user.workSchedule.endTime)}</span>
                  </div>
                </>
              )}

              {todayRecord && (
                <>
                  <div className="border-t border-gray-200 my-4" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giriş</span>
                    <span className="font-medium text-gray-900">
                      {formatTimeShort(todayRecord?.arrivalTime ?? todayRecord?.ArrivalTime ?? todayRecord?.checkIn)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Çıxış</span>
                    <span className="font-medium text-gray-900">
                      {formatTimeShort(todayRecord?.leaveTime ?? todayRecord?.LeaveTime ?? todayRecord?.checkOut)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={getRecordStatus(todayRecord)} size="sm" />
                  </div>

                  {(todayRecord?.lateReason || todayRecord?.LateReason || todayRecord?.earlyLeaveReason || todayRecord?.EarlyLeaveReason) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                      <p className="text-xs text-amber-800 font-medium mb-1">
                        {todayRecord?.lateReason || todayRecord?.LateReason ? 'Gecikmə Səbəbi' : 'Erkən Çıxış Səbəbi'}
                      </p>
                      <p className="text-sm text-amber-900">
                        {todayRecord?.lateReason || todayRecord?.LateReason || todayRecord?.earlyLeaveReason || todayRecord?.EarlyLeaveReason}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Stats - Desktop only */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bu Həftə</p>
                  <p className="text-xl font-semibold text-gray-900">5 Gün</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gecikmə Sayı</p>
                  <p className="text-xl font-semibold text-gray-900">1 Dəfə</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bu Ay</p>
                  <p className="text-xl font-semibold text-gray-900">22 Gün</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}