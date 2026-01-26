import { useState } from 'react';
import { Calendar, MapPin, Camera, MessageSquare, ChevronRight } from 'lucide-react';
import { currentUser, attendanceRecords, getDepartmentName } from '../../data/mockData';
import { StatusBadge, AttendanceStatus } from '../ui/StatusBadge';
import { EmployeeNav } from './EmployeeNav';

export function EmployeeHistory() {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  const userRecords = attendanceRecords
    .filter(r => r.employeeId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedRecordData = userRecords.find(r => r.id === selectedRecord);

  const getRecordStatus = (rec: any): AttendanceStatus => {
    if (!rec) return 'waiting';
    // If we have explicit flags, use them
    const isLate = rec?.isLate ?? rec?.IsLate ?? (rec.status === 'late');
    const isEarly = rec?.isEarlyLeave ?? rec?.IsEarlyLeave ?? (rec.status === 'early-leave');

    if (isLate && isEarly) return 'late-and-early';
    if (isLate) return 'late';
    if (isEarly) return 'early-leave';
    if (rec.status === 'absent') return 'absent';
    if (!rec.checkIn && !rec.checkOut) return 'waiting';
    return 'on-time';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const formatDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Baz', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş'];
    return days[date.getDay()];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <EmployeeNav onLogout={() => { }} />

      {!selectedRecord ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Davamiyyət Tarixçəsi</h2>
            <p className="text-sm text-gray-600 mt-1">{userRecords.length} qeyd tapıldı</p>
          </div>

          <div className="space-y-3">
            {userRecords.map(record => (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record.id)}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 uppercase">
                        {formatDayOfWeek(record.date)}
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {new Date(record.date).getDate()}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                      <p className="text-sm text-gray-600">
                        {record.checkIn || '—'} - {record.checkOut || 'Davam edir'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between">
                  <StatusBadge status={getRecordStatus(record)} size="sm" />
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {record.checkInLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Yer
                      </span>
                    )}
                    {record.checkInPhoto && (
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Şəkil
                      </span>
                    )}
                  </div>
                </div>

                {(record.employeeComment || record.comment || record.lateReason || record.earlyLeaveReason) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {record.employeeComment || record.comment || record.lateReason || record.earlyLeaveReason}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => setSelectedRecord(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← Tarixçəyə Qayıt
          </button>

          {selectedRecordData && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {formatDate(selectedRecordData.date)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {formatDayOfWeek(selectedRecordData.date)}
                    </p>
                  </div>
                  <StatusBadge status={getRecordStatus(selectedRecordData)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Giriş</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedRecordData.checkIn || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Çıxış</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedRecordData.checkOut || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              {(selectedRecordData.checkInPhoto || selectedRecordData.checkOutPhoto) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Şəkillər
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRecordData.checkInPhoto && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Giriş</p>
                        <img
                          src={selectedRecordData.checkInPhoto}
                          alt="Check in"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {selectedRecordData.checkOutPhoto && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Çıxış</p>
                        <img
                          src={selectedRecordData.checkOutPhoto}
                          alt="Check out"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedRecordData.checkInLocation && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Yer
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Giriş Yeri</p>
                      <p className="text-sm text-gray-900">
                        {selectedRecordData.checkInLocation.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedRecordData.checkInLocation.lat.toFixed(4)}°,{' '}
                        {selectedRecordData.checkInLocation.lng.toFixed(4)}°
                      </p>
                    </div>
                    {selectedRecordData.checkOutLocation && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600 mb-1">Çıxış Yeri</p>
                        <p className="text-sm text-gray-900">
                          {selectedRecordData.checkOutLocation.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedRecordData.checkOutLocation.lat.toFixed(4)}°,{' '}
                          {selectedRecordData.checkOutLocation.lng.toFixed(4)}°
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comments & Reasons */}
              {(selectedRecordData.employeeComment ||
                selectedRecordData.comment ||
                selectedRecordData.lateReason ||
                selectedRecordData.earlyLeaveReason) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Qeydlər
                    </h3>
                    <div className="space-y-3">
                      {selectedRecordData.lateReason && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Gecikmə Səbəbi</p>
                          <p className="text-sm text-gray-900">{selectedRecordData.lateReason}</p>
                        </div>
                      )}
                      {selectedRecordData.earlyLeaveReason && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Erkən Çıxış Səbəbi</p>
                          <p className="text-sm text-gray-900">
                            {selectedRecordData.earlyLeaveReason}
                          </p>
                        </div>
                      )}
                      {selectedRecordData.employeeComment && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">İşçi Şərhi</p>
                          <p className="text-sm text-gray-900">{selectedRecordData.employeeComment}</p>
                        </div>
                      )}
                      {selectedRecordData.comment && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Şərh</p>
                          <p className="text-sm text-gray-900">{selectedRecordData.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* QR Approval */}
              {selectedRecordData.qrApproved && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full" />
                    QR Kod Təsdiqləndi
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
