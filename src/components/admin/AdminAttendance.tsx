import { useState } from 'react';
import { Search, Camera, MapPin, MessageSquare, X } from 'lucide-react';
import { employees, attendanceRecords, AttendanceRecord, getDepartmentName, departments } from '../../data/mockData';
import { StatusBadge } from '../ui/StatusBadge';
import { AdminNav } from './AdminNav';

export function AdminAttendance({ onLogout }: { onLogout: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const departmentOptions = ['all', ...departments.map(d => d.name)];

  const filteredRecords = attendanceRecords.filter(record => {
    const employee = employees.find(e => e.id === record.employeeId);
    if (!employee) return false;

    const empDept = getDepartmentName(employee.departmentId);
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         empDept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || empDept === filterDepartment;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  }).sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.checkIn || '').localeCompare(a.checkIn || '');
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Davamiyyətin İdarə Edilməsi</h2>
          <p className="text-sm text-gray-600 mt-1">{filteredRecords.length} qeyd tapıldı</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ad və ya şöbə üzrə axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'Bütün Şöbələr' : dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Bütün Statuslar</option>
                <option value="on-time">Vaxtında</option>
                <option value="late">Gecikdi</option>
                <option value="early-leave">Erkən Çıxdı</option>
                <option value="absent">İşə Gəlmədi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    İşçi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Şöbə
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tarix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Çıxış
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Yoxlama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map(record => {
                  const employee = employees.find(e => e.id === record.employeeId);
                  if (!employee) return null;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={employee.photo}
                            alt={employee.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-600">{employee.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{getDepartmentName(employee.departmentId)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatDate(record.date)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {record.checkIn || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {record.checkOut || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={record.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {record.checkInPhoto && (
                            <span className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                              <Camera className="w-3 h-3 text-green-600" />
                            </span>
                          )}
                          {record.checkInLocation && (
                            <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                              <MapPin className="w-3 h-3 text-blue-600" />
                            </span>
                          )}
                          {record.qrApproved && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                              QR
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Ətraflı Bax
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Davamiyyət Təfərrüatları</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">İşçi</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={employees.find(e => e.id === selectedRecord.employeeId)?.photo}
                    alt="Employee"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {employees.find(e => e.id === selectedRecord.employeeId)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getDepartmentName(employees.find(e => e.id === selectedRecord.employeeId)?.departmentId || '')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Times */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Vaxt Qeydləri</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Tarix</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedRecord.date)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <StatusBadge status={selectedRecord.status} size="sm" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Giriş</p>
                    <p className="font-medium text-gray-900">{selectedRecord.checkIn || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Çıxış</p>
                    <p className="font-medium text-gray-900">{selectedRecord.checkOut || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              {(selectedRecord.checkInPhoto || selectedRecord.checkOutPhoto) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Şəkillər</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRecord.checkInPhoto && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Giriş</p>
                        <img
                          src={selectedRecord.checkInPhoto}
                          alt="Check in"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {selectedRecord.checkOutPhoto && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Çıxış</p>
                        <img
                          src={selectedRecord.checkOutPhoto}
                          alt="Check out"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedRecord.checkInLocation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Yer</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">
                      {selectedRecord.checkInLocation.address}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedRecord.checkInLocation.lat.toFixed(4)}°,{' '}
                      {selectedRecord.checkInLocation.lng.toFixed(4)}°
                    </p>
                  </div>
                </div>
              )}

              {/* Comments Section - Employee comments visible to admin */}
              {(selectedRecord.employeeComment ||
                selectedRecord.comment ||
                selectedRecord.lateReason ||
                selectedRecord.earlyLeaveReason) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Şərhlər və Səbəblər</h4>
                  <div className="space-y-2">
                    {selectedRecord.lateReason && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs text-orange-700 font-medium mb-1">Gecikmə Səbəbi</p>
                        <p className="text-sm text-orange-900">{selectedRecord.lateReason}</p>
                      </div>
                    )}
                    {selectedRecord.earlyLeaveReason && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-medium mb-1">Erkən Çıxış Səbəbi</p>
                        <p className="text-sm text-blue-900">{selectedRecord.earlyLeaveReason}</p>
                      </div>
                    )}
                    {selectedRecord.employeeComment && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700 font-medium mb-1">İşçi Şərhi</p>
                        <p className="text-sm text-purple-900">{selectedRecord.employeeComment}</p>
                      </div>
                    )}
                    {selectedRecord.comment && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-700 font-medium mb-1">Əlavə Şərh</p>
                        <p className="text-sm text-gray-900">{selectedRecord.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QR Approval */}
              {selectedRecord.qrApproved && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                    QR Kod Təsdiqləndi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
