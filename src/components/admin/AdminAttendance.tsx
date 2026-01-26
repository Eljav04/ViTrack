import { useState, useEffect } from 'react';
import { Search, Camera, MapPin, MessageSquare, X, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { attendanceService, AttendanceItem, MetaData } from '../../services/attendanceService';
import { StatusBadge, AttendanceStatus } from '../ui/StatusBadge';
import { AdminNav } from './AdminNav';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Badge } from '../ui/badge';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { az } from 'date-fns/locale';
import { toast } from 'sonner';
import { getImageUrl } from '../../lib/imageUtils';
import { UserAvatar } from '../ui/UserAvatar';


export function AdminAttendance({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<AttendanceItem[]>([]);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceItem | null>(null);


  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getAll(pageNumber, pageSize);
      setData(response.items || []);
      setMetaData(response.metaData);
    } catch (error) {
      console.error(error);
      toast.error('Məlumatları yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize]);




  const isValidLocation = (loc: any) => {
    return loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number' && (loc.latitude !== 0 || loc.longitude !== 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'd MMM, yyyy', { locale: az });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    try {
      // Handle the strict format from API "10:47:36.4900887"
      // We can just take the first 8 chars "HH:mm:ss"
      return timeStr.substring(0, 5);
    } catch {
      return timeStr;
    }
  };

  const calculateWorkedHours = (arrival: string | null, leave: string | null) => {
    if (!arrival || !leave) return '—';
    try {
      // Need a reference date since time string doesn't have it, but for duration it doesn't matter as long as it's same day
      // Assuming strings are "HH:mm:ss..."
      const datePrefix = "2000-01-01T";
      const userTimeOffset = "Z"; // Treat as UTC for diff calculation to avoid timezone mess
      // Or just parse hours/minutes manually
      const [Ah, Am] = arrival.split(':').map(Number);
      const [Lh, Lm] = leave.split(':').map(Number);

      let minutes = (Lh * 60 + Lm) - (Ah * 60 + Am);
      if (minutes < 0) minutes += 24 * 60; // Handle overnight if needed, though rare for daily attendance

      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}s ${mins}d`;
    } catch {
      return '—';
    }
  };

  const getStatus = (record: AttendanceItem): AttendanceStatus => {
    if (record.isLate && record.isEarlyLeave) return 'late-and-early';
    if (record.isLate) return 'late';
    if (record.isEarlyLeave) return 'early-leave';
    // Logic for absent/waiting not explicitly in API flags shown, inferred:
    if (!record.arrivalTime && !record.leaveTime) return 'waiting';
    return 'on-time';
  };

  const renderPagination = () => {
    if (!metaData) return null;

    // Simple logic for brevity, can be expanded for complex ranges
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, metaData.currentPage - 2);
    let endPage = Math.min(metaData.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return (
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Davamiyyət Qeydləri</h2>
            <p className="text-sm text-gray-600 mt-1">
              {metaData?.totalCount || 0} qeyd tapıldı
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Səhifədə göstər:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Filters/Search can be re-added here if API supports filtering */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium">Melumat tapılmadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">İşçi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tarix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Giriş</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Çıxış</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">İşlənmiş saat</th>
                    {/* Status removed or consolidated? Keeping 'isLate' flags visibility via badges if needed, or stick to visual indicators */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Yoxlama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(
                    data.reduce((groups, record) => {
                      const date = parseISO(record.date);
                      const monthYear = format(date, 'MMMM yyyy', { locale: az });
                      if (!groups[monthYear]) {
                        groups[monthYear] = [];
                      }
                      groups[monthYear].push(record);
                      return groups;
                    }, {} as Record<string, AttendanceItem[]>)
                  ).map(([monthYear, records]) => (
                    <div key={monthYear} style={{ display: 'contents' }}>
                      <tr className="bg-gray-50 border-y border-gray-200">
                        <td colSpan={7} className="px-6 py-2 text-sm font-semibold text-gray-700">
                          {monthYear}
                        </td>
                      </tr>
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                firstname={record.employee?.firstname}
                                lastname={record.employee?.lastname}
                                imageUrl={null} // Attendance employee object doesn't seem to have imageUrl currently
                                size="sm"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {record.employee?.firstname} {record.employee?.lastname}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {record.employee?.departmentName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{formatDate(record.date)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatTime(record.arrivalTime)}
                              </span>
                              {record.isLate ? (
                                <StatusBadge status="late" size="sm" />
                              ) : (
                                <StatusBadge status="on-time" size="sm" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatTime(record.leaveTime)}
                              </span>
                              {!record.leaveTime ? (
                                <StatusBadge status="waiting" size="sm" />
                              ) : record.isEarlyLeave ? (
                                <StatusBadge status="early-leave" size="sm" />
                              ) : (
                                <StatusBadge status="on-time" size="sm" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 font-mono">
                              {calculateWorkedHours(record.arrivalTime, record.leaveTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TooltipProvider>
                              <div className="flex items-center gap-2">
                                {/* Arrival Photo */}
                                {record.arrivalImage && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-7 h-7 bg-green-50 rounded flex items-center justify-center border border-green-100 text-green-600">
                                        <Camera className="w-3.5 h-3.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Giriş üçün foto</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {/* Arrival Location */}
                                {record.arrivalLocation && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-7 h-7 bg-green-50 rounded flex items-center justify-center border border-green-100 text-green-600">
                                        <MapPin className="w-3.5 h-3.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Giriş üçün lokasiya</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* Leave Photo */}
                                {record.leaveImage && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-7 h-7 bg-blue-50 rounded flex items-center justify-center border border-blue-100 text-blue-600">
                                        <Camera className="w-3.5 h-3.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Çıxış üçün foto</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {/* Leave Location */}
                                {record.leaveLocation && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-7 h-7 bg-blue-50 rounded flex items-center justify-center border border-blue-100 text-blue-600">
                                        <MapPin className="w-3.5 h-3.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Çıxış üçün lokasiya</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TooltipProvider>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedRecord(record)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              Ətraflı Bax
                            </button>
                          </td>
                        </tr>
                      ))}
                    </div>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 flex justify-center">
            {renderPagination()}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row overflow-hidden">

            {/* Left Side: Info */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedRecord.employee?.firstname || 'N/A'} {selectedRecord.employee?.lastname || 'N/A'}
                  </h3>
                  <p className="text-gray-500 text-sm">{selectedRecord.employee?.departmentName || 'N/A'}</p>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tarix</p>
                    <p className="font-semibold">{formatDate(selectedRecord.date)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">İşlənmiş saat</p>
                    <p className="font-semibold font-mono">{calculateWorkedHours(selectedRecord.arrivalTime, selectedRecord.leaveTime)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2 hidden md:block"></div>

                  {/* Arrival */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h4 className="font-semibold text-gray-900">Giriş</h4>
                    </div>
                    <div className="pl-4 border-l-2 border-green-100">
                      <p className="text-2xl font-bold text-gray-900 mb-1">{formatTime(selectedRecord.arrivalTime)}</p>

                      {selectedRecord.isLate ? (
                        <StatusBadge status="late" size="sm" />
                      ) : (
                        <StatusBadge status="on-time" size="sm" />
                      )}
                    </div>

                    {selectedRecord.arrivalImage ? (
                      <div className="space-y-2">
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <img src={getImageUrl(selectedRecord.arrivalImage)} alt="Arrival" className="w-full h-40 object-cover" />
                        </div>
                        {selectedRecord.lateReason && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <p className="text-xs text-yellow-600 font-medium mb-1">Gecikmə səbəbi:</p>
                            <p className="text-sm text-yellow-800">{selectedRecord.lateReason}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Şəkil yoxdur
                      </div>
                    )}

                  </div>

                  {/* Leave */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h4 className="font-semibold text-gray-900">Çıxış</h4>
                    </div>
                    <div className="pl-4 border-l-2 border-blue-100">
                      <p className="text-2xl font-bold text-gray-900 mb-1">{formatTime(selectedRecord.leaveTime)}</p>
                      {!selectedRecord.leaveTime ? (
                        <StatusBadge status="waiting" size="sm" />
                      ) : selectedRecord.isEarlyLeave ? (
                        <StatusBadge status="early-leave" size="sm" />
                      ) : (
                        <StatusBadge status="on-time" size="sm" />
                      )}
                    </div>

                    {selectedRecord.leaveImage ? (
                      <div className="space-y-2">
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <img src={getImageUrl(selectedRecord.leaveImage)} alt="Leave" className="w-full h-40 object-cover" />
                        </div>
                        {selectedRecord.earlyLeaveReason && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium mb-1">Tez çıxış səbəbi:</p>
                            <p className="text-sm text-blue-800">{selectedRecord.earlyLeaveReason}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Şəkil yoxdur
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Map */}
            {(isValidLocation(selectedRecord.arrivalLocation) || isValidLocation(selectedRecord.leaveLocation)) && (
              <div className="md:w-1/2 bg-gray-50 flex flex-col overflow-y-auto border-l border-gray-200">
                <div className="p-6 space-y-6">
                  {isValidLocation(selectedRecord.arrivalLocation) && (
                    <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
                      <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-green-50/50">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-900 text-sm">Giriş Lokasiyası</h4>
                      </div>

                      <div className="aspect-video w-full bg-gray-100 relative">
                        {/* Static Map Image */}
                        <img
                          src={`https://static-maps.yandex.ru/1.x/?ll=${selectedRecord.arrivalLocation!.longitude},${selectedRecord.arrivalLocation!.latitude}&z=17&l=map&size=600,300&pt=${selectedRecord.arrivalLocation!.longitude},${selectedRecord.arrivalLocation!.latitude},pm2gnm`}
                          alt="Giriş xəritəsi"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>

                      <div className="p-4 flex flex-col gap-2">
                        {selectedRecord.arrivalLocation!.address && (
                          <Badge variant="outline" className="w-full justify-start text-sm py-2 gap-2 px-3 font-normal">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{selectedRecord.arrivalLocation!.address}</span>
                          </Badge>
                        )}
                        <div className="flex gap-2 w-full">
                          <Badge variant="secondary" className="font-mono text-xs text-gray-500 bg-gray-100 hover:bg-gray-100">
                            Lat: {selectedRecord.arrivalLocation!.latitude}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs text-gray-500 bg-gray-100 hover:bg-gray-100">
                            Lon: {selectedRecord.arrivalLocation!.longitude}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {isValidLocation(selectedRecord.leaveLocation) && (
                    <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                      <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-blue-50/50">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-900 text-sm">Çıxış Lokasiyası</h4>
                      </div>

                      <div className="aspect-video w-full bg-gray-100 relative">
                        {/* Static Map Image */}
                        <img
                          src={`https://static-maps.yandex.ru/1.x/?ll=${selectedRecord.leaveLocation!.longitude},${selectedRecord.leaveLocation!.latitude}&z=17&l=map&size=600,300&pt=${selectedRecord.leaveLocation!.longitude},${selectedRecord.leaveLocation!.latitude},pm2blm`}
                          alt="Çıxış xəritəsi"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>

                      <div className="p-4 flex flex-col gap-2">
                        {selectedRecord.leaveLocation!.address && (
                          <Badge variant="outline" className="w-full justify-start text-sm py-2 gap-2 px-3 font-normal">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{selectedRecord.leaveLocation!.address}</span>
                          </Badge>
                        )}
                        <div className="flex gap-2 w-full">
                          <Badge variant="secondary" className="font-mono text-xs text-gray-500 bg-gray-100 hover:bg-gray-100">
                            Lat: {selectedRecord.leaveLocation!.latitude}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs text-gray-500 bg-gray-100 hover:bg-gray-100">
                            Lon: {selectedRecord.leaveLocation!.longitude}
                          </Badge>
                        </div>
                      </div>
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



