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
import { getImageUrl } from '../../lib/imageUtils';

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
                        <div className="text-center min-w-12">
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
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Arrival Photo */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${record.arrivalImage ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                          <Camera className="w-4 h-4" />
                        </div>
                        {/* Arrival Location */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${record.arrivalLocation ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        {/* Leave Photo */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${record.leaveImage ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                          <Camera className="w-4 h-4" />
                        </div>
                        {/* Leave Location */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${record.leaveLocation ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {(record.lateReason || record.earlyLeaveReason) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {record.lateReason && (
                          <p className="text-sm flex items-center gap-2 text-emerald-700 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span className="wrap-break-word line-clamp-2">Qeyd: {record.lateReason.length > 30 ? record.lateReason.substring(0, 30) + '...' : record.lateReason}</span>
                          </p>
                        )}
                        {record.earlyLeaveReason && (
                          <p className="text-sm flex items-center gap-2 text-sky-700 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span className="wrap-break-word line-clamp-2">Qeyd: {record.earlyLeaveReason.length > 30 ? record.earlyLeaveReason.substring(0, 30) + '...' : record.earlyLeaveReason}</span>
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
                      <div className="rounded-lg overflow-hidden border border-gray-100 aspect-square flex items-center justify-center bg-gray-50">
                        <img
                          src={getImageUrl(selectedRecord.arrivalImage)}
                          alt="Check in"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex flex-col items-center text-gray-400 p-2"><svg class="w-8 h-8 mb-1 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="text-[10px]">Yüklənmədi</span></div>';
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedRecord.leaveImage && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Çıxış</p>
                      <div className="rounded-lg overflow-hidden border border-gray-100 aspect-square flex items-center justify-center bg-gray-50">
                        <img
                          src={getImageUrl(selectedRecord.leaveImage)}
                          alt="Check out"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex flex-col items-center text-gray-400 p-2"><svg class="w-8 h-8 mb-1 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="text-[10px]">Yüklənmədi</span></div>';
                            }
                          }}
                        />
                      </div>
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

                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {selectedRecord.arrivalLocation.latitude.toFixed(6)},{' '}
                        {selectedRecord.arrivalLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                  {selectedRecord.leaveLocation && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Çıxış Yeri</p>

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
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <p className="text-xs mb-1 font-medium text-emerald-800">Qeyd:</p>
                      <p className="text-sm text-emerald-900 wrap-break-word">{selectedRecord.lateReason}</p>
                    </div>
                  )}
                  {selectedRecord.earlyLeaveReason && (
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                      <p className="text-xs mb-1 font-medium text-sky-800">Qeyd:</p>
                      <p className="text-sm text-sky-900 wrap-break-word">
                        {selectedRecord.earlyLeaveReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )
      }
    </div >
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}


