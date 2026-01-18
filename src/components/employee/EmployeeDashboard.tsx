import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, User, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { currentUser, attendanceRecords, schedules } from '../../data/mockData';
import { Button } from '../ui/button';
import { StatusBadge } from '../ui/StatusBadge';
import { EmployeeNav } from './EmployeeNav';

export function EmployeeDashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  });

  const todayRecord = attendanceRecords.find(
    r => r.employeeId === currentUser.id && r.date === new Date().toISOString().split('T')[0]
  );

  const schedule = schedules.find(s => s.id === currentUser.scheduleId);

  const workStatus = todayRecord?.checkOut
    ? 'finished'
    : todayRecord?.checkIn
    ? 'at-work'
    : 'not-started';

  const statusConfig = {
    'not-started': {
      label: 'Başlamayıb',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    'at-work': {
      label: 'İşdədir',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    finished: {
      label: 'Başa çatdı',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
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
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            {workStatus === 'not-started' && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/employee/check-in')}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Giriş Et
              </Button>
            )}

            {workStatus === 'at-work' && (
              <Button
                variant="secondary"
                size="lg"
                fullWidth
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
                <span className="font-medium text-gray-900">{schedule?.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Başlama Vaxtı</span>
                <span className="font-medium text-gray-900">{schedule?.startTime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bitmə Vaxtı</span>
                <span className="font-medium text-gray-900">{schedule?.endTime}</span>
              </div>

              {todayRecord && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giriş</span>
                    <span className="font-medium text-gray-900">
                      {todayRecord.checkIn || '—'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Çıxış</span>
                    <span className="font-medium text-gray-900">
                      {todayRecord.checkOut || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={todayRecord.status} size="sm" />
                  </div>

                  {(todayRecord.lateReason || todayRecord.earlyLeaveReason) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                      <p className="text-xs text-amber-800 font-medium mb-1">
                        {todayRecord.lateReason ? 'Gecikmə Səbəbi' : 'Erkən Çıxış Səbəbi'}
                      </p>
                      <p className="text-sm text-amber-900">
                        {todayRecord.lateReason || todayRecord.earlyLeaveReason}
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