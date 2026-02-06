import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, LogIn, LogOut, CheckCircle, Coffee, AlertCircle } from 'lucide-react';
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
    ? (todayRecord.isRest ? 'rest' : (todayRecord.leaveTime ? 'finished' : (todayRecord.arrivalTime ? 'at-work' : 'not-started')))
    : 'not-started';

  useEffect(() => {
    dispatch(fetchTodayRecord());
  }, [dispatch]);

  const formatTimeShort = (value: any) => {
    if (!value) return '—';
    if (typeof value === 'string') {
      const match = value.match(/^(\d{2}:\d{2})/);
      if (match) return match[1];
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
    if (rec.isRest) return 'rest';
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
    'finished': {
      label: 'Tamamlanıb',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    'rest': {
      label: 'İstirahət',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  };

  const currentStatus = statusConfig[workStatus] || statusConfig['not-started'];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <EmployeeNav onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-row items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cari vəziyyət</p>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full animate-pulse", currentStatus.bgColor, currentStatus.color.replace('text', 'bg'))} />
                  <span className={cn("text-xl font-semibold", currentStatus.color)}>
                    {currentStatus.label}
                  </span>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-gray-600 mb-1">Cari vaxt</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">
                  {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {workStatus === 'not-started' && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white lg:py-6 lg:text-lg shadow-lg shadow-green-100"
                  size="lg"
                  onClick={() => navigate('/employee/check-in')}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Giriş et
                </Button>
              )}

              {workStatus === 'at-work' && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white lg:py-6 lg:text-lg shadow-lg shadow-blue-100"
                  size="lg"
                  onClick={() => navigate('/employee/check-out')}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Çıxış et
                </Button>
              )}

              {workStatus === 'finished' && (
                <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">İş günü başa çatdı</span>
                </div>
              )}

              {workStatus === 'rest' && (
                <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                  <Coffee className="w-5 h-5" />
                  <span className="font-medium">Bu gün istirahət günüdür</span>
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Bu günün cədvəli
            </h2>

            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Cədvəl</span>
                <span className="text-sm font-semibold text-gray-900">{user?.workSchedule?.name || 'Təyin edilməyib'}</span>
              </div>

              {user?.workSchedule && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Başlama</p>
                    <p className="font-semibold text-gray-900">{formatTimeShort(user.workSchedule.startTime)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Bitmə</p>
                    <p className="font-semibold text-gray-900">{formatTimeShort(user.workSchedule.endTime)}</p>
                  </div>
                </div>
              )}

              {todayRecord && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">Giriş </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatTimeShort(todayRecord?.arrivalTime ?? todayRecord?.ArrivalTime ?? todayRecord?.checkIn)}

                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">Çıxış</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatTimeShort(todayRecord?.leaveTime ?? todayRecord?.LeaveTime ?? todayRecord?.checkOut)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={getRecordStatus(todayRecord)} size="sm" />
                  </div>

                  {(todayRecord?.lateReason || todayRecord?.LateReason || todayRecord?.earlyLeaveReason || todayRecord?.EarlyLeaveReason) && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <div className="flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-amber-800 font-bold mb-0.5">
                            {todayRecord?.lateReason || todayRecord?.LateReason ? 'Gecikmə səbəbi' : 'Erkən çıxış səbəbi'}
                          </p>
                          <p className="text-sm text-amber-900 leading-tight">
                            {todayRecord?.lateReason || todayRecord?.LateReason || todayRecord?.earlyLeaveReason || todayRecord?.EarlyLeaveReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}