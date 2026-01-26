import { useState, useEffect } from 'react';
import { MapPin, Camera, MessageSquare, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { attendanceService, AttendanceItem, MetaData } from '../../services/attendanceService';
import { StatusBadge, AttendanceStatus } from '../ui/StatusBadge';
import { EmployeeNav } from './EmployeeNav';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../ui/pagination";
import { format, parseISO } from 'date-fns';
import { az } from 'date-fns/locale';

export function EmployeeHistory() {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceItem | null>(null);
  const [records, setRecords] = useState<AttendanceItem[]>([]);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchRecords();
  }, [pageNumber]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getMyRecords(pageNumber, pageSize);
      setRecords(response.items || []);
      setMetaData(response.metaData);
    } catch (error) {
      console.error('Failed to fetch records', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecordStatus = (rec: AttendanceItem): AttendanceStatus => {
    if (!rec) return 'waiting';
    if (rec.isLate && rec.isEarlyLeave) return 'late-and-early';
    if (rec.isLate) return 'late';
    if (rec.isEarlyLeave) return 'early-leave';
    if (!rec.arrivalTime && !rec.leaveTime) return 'waiting';
    return 'on-time';
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'd MMM, yyyy', { locale: az });
    } catch {
      return dateStr;
    }
  };

  const formatDayOfWeek = (dateStr: string) => {
    try {
      const day = format(parseISO(dateStr), 'EEE', { locale: az });
      return day.charAt(0).toUpperCase() + day.slice(1);
    } catch {
      return '';
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    try {
      return timeStr.substring(0, 5);
    } catch {
      return timeStr;
    }
  };

  // Group records by Month Year
  const groupedRecords = records.reduce((groups, record) => {
    const date = parseISO(record.date);
    const monthYear = format(date, 'MMMM yyyy', { locale: az });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(record);
    return groups;
  }, {} as Record<string, AttendanceItem[]>);

  const renderPagination = () => {
    if (!metaData || metaData.totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, metaData.currentPage - 2);
    let endPage = Math.min(metaData.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return (
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (metaData.hasPrevious) setPageNumber(p => p - 1); }}
                className={!metaData.hasPrevious ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {startPage > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === metaData.currentPage}
                  onClick={(e) => { e.preventDefault(); setPageNumber(p); }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < metaData.totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (metaData.hasNext) setPageNumber(p => p + 1); }}
                className={!metaData.hasNext ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <EmployeeNav onLogout={() => { }} />

      {!selectedRecord ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Davamiyyət Tarixçəsi</h2>
            <p className="text-sm text-gray-600 mt-1">{metaData?.totalCount || 0} qeyd tapıldı</p>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedRecords).map(([monthYear, monthRecords]) => (
              <div key={monthYear} className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider pl-1">{monthYear}</h3>
                {monthRecords.map(record => (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[3rem]">
                          <div className="text-xs text-gray-600 uppercase">
                            {formatDayOfWeek(record.date)}
                          </div>
                          <div className="text-xl font-semibold text-gray-900">
                            {parseISO(record.date).getDate()}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(record.arrivalTime)} - {formatTime(record.leaveTime) === '—' ? 'Davam edir' : formatTime(record.leaveTime)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={getRecordStatus(record)} size="sm" />
                        {((record.lateReason || record.earlyLeaveReason) && !record.isLate && !record.isEarlyLeave) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Qeyd
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {(record.arrivalLocation || record.leaveLocation) && (
                          <span className="flex items-center gap-1" title="Lokasiya">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Yer</span>
                          </span>
                        )}
                        {(record.arrivalImage || record.leaveImage) && (
                          <span className="flex items-center gap-1" title="Şəkil">
                            <Camera className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Şəkil</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {(record.lateReason || record.earlyLeaveReason) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {record.lateReason && (
                          <p className={`text-sm flex items-center gap-1 mb-1 ${!record.isLate ? 'text-green-700' : 'text-gray-600'}`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-medium text-xs text-gray-500 mr-1">Gecikmə səbəbi:</span>
                            {record.lateReason}
                          </p>
                        )}
                        {record.earlyLeaveReason && (
                          <p className={`text-sm flex items-center gap-1 ${!record.isEarlyLeave ? 'text-green-700' : 'text-gray-600'}`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-medium text-xs text-gray-500 mr-1">Tez çıxış səbəbi:</span>
                            {record.earlyLeaveReason}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            )}

            {!loading && records.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                <p>Hələ heç bir qeyd yoxdur</p>
              </div>
            )}

            {renderPagination()}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => setSelectedRecord(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <ChevronLeftIcon className="w-4 h-4" /> Tarixçəyə Qayıt
          </button>

          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {formatDate(selectedRecord.date)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {formatDayOfWeek(selectedRecord.date)}
                  </p>
                </div>
                <StatusBadge status={getRecordStatus(selectedRecord)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Giriş</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTime(selectedRecord.arrivalTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Çıxış</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTime(selectedRecord.leaveTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Photos */}
            {(selectedRecord.arrivalImage || selectedRecord.leaveImage) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Şəkillər
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRecord.arrivalImage && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Giriş</p>
                      <img
                        src={getImageUrl(selectedRecord.arrivalImage)}
                        alt="Check in"
                        className="w-full aspect-square object-cover rounded-lg border border-gray-100"
                      />
                    </div>
                  )}
                  {selectedRecord.leaveImage && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Çıxış</p>
                      <img
                        src={getImageUrl(selectedRecord.leaveImage)}
                        alt="Check out"
                        className="w-full aspect-square object-cover rounded-lg border border-gray-100"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {(selectedRecord.arrivalLocation || selectedRecord.leaveLocation) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Yer
                </h3>
                <div className="space-y-3">
                  {selectedRecord.arrivalLocation && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Giriş Yeri</p>
                      <p className="text-sm text-gray-900">
                        {selectedRecord.arrivalLocation.address || 'Ünvan təyin edilməyib'}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {selectedRecord.arrivalLocation.latitude.toFixed(6)},{' '}
                        {selectedRecord.arrivalLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                  {selectedRecord.leaveLocation && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Çıxış Yeri</p>
                      <p className="text-sm text-gray-900">
                        {selectedRecord.leaveLocation.address || 'Ünvan təyin edilməyib'}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {selectedRecord.leaveLocation.latitude.toFixed(6)},{' '}
                        {selectedRecord.leaveLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reasons */}
            {(selectedRecord.lateReason || selectedRecord.earlyLeaveReason) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Qeydlər
                </h3>
                <div className="space-y-3">
                  {selectedRecord.lateReason && (
                    <div className={`p-3 rounded-lg ${!selectedRecord.isLate ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 font-medium ${!selectedRecord.isLate ? 'text-green-800' : 'text-gray-500'}`}>Gecikmə Səbəbi {!selectedRecord.isLate && '(Qəbul edildi)'}</p>
                      <p className={`text-sm ${!selectedRecord.isLate ? 'text-green-900' : 'text-gray-900'}`}>{selectedRecord.lateReason}</p>
                    </div>
                  )}
                  {selectedRecord.earlyLeaveReason && (
                    <div className={`p-3 rounded-lg ${!selectedRecord.isEarlyLeave ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 font-medium ${!selectedRecord.isEarlyLeave ? 'text-green-800' : 'text-gray-500'}`}>Erkən Çıxış Səbəbi {!selectedRecord.isEarlyLeave && '(Qəbul edildi)'}</p>
                      <p className={`text-sm ${!selectedRecord.isEarlyLeave ? 'text-green-900' : 'text-gray-900'}`}>
                        {selectedRecord.earlyLeaveReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

// Simple helper to get full image URL if needed, similar to AdminAttendance logic
const getImageUrl = (path: string | null) => {
  if (!path) return '';
  // Assuming relative path needs base URL or it's already full
  // If your API returns full URL, just return path.
  // If it returns relative, prepend base url. 
  // Adapting based on other files, it seems just path is used or helper needed.
  // I'll grab the helper from imageUtils if available, but for now strict implementation:
  if (path.startsWith('http')) return path;
  // You might need to adjust this base URL
  return `https://vitrack-api.eljan.dev${path}`;
};
