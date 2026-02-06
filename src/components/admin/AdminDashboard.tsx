import { useState, useEffect } from 'react';
import { Users, Clock, UserX, UserMinus, Coffee, ChevronLeft, ChevronRight, AlertCircle, TrendingUp } from 'lucide-react';
import { AdminNav } from './AdminNav';
import { statisticsService, TodayOverallStatisticsResponse } from '../../services/statisticsService';
import { toast } from 'sonner';
import { StatusBadge, AttendanceStatus } from '../ui/StatusBadge';

// Skeleton Components
const StatCardSkeleton = () => (

  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="w-16 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="w-24 h-8 bg-gray-200 rounded mb-1"></div>
    <div className="w-32 h-4 bg-gray-200 rounded"></div>
  </div>
);

const EmployeeListSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
      <div className="h-8 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
      ))}
    </div>
  </div>
);

const DepartmentListSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<TodayOverallStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Determine user's role/id if needed, or just fetch global admin stats
        // Assuming getTodayOverall is global admin stat as per request
        const data = await statisticsService.getTodayOverall();
        setStats(data);
      } catch (error) {
        console.error("Dashboard stats fetch error:", error);
        toast.error("Statistika məlumatlarını yükləmək mümkün olmadı");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = () => {
    const date = new Date();
    const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Pagination logic
  const employees = stats?.employeesList || [];
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentEmployees = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const getEmployeeBadgeStatus = (emp: any): AttendanceStatus => {
    if (emp.isAbsent) return 'absent';
    if (emp.isRest) return 'rest';
    if (emp.isLate) return 'late';
    if (emp.checkInTime) return 'on-time';
    return 'waiting';
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <AdminNav onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Cari veziyyət</h2>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate()}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : stats ? (
            <>
              {/* 1. Present / Total */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500">Bu Gün</span>
                </div>
                <p className="text-3xl font-semibold text-gray-900 mb-1">
                  {stats.presentEmployees} <span className="text-lg text-gray-400 font-normal">/ {stats.totalEmployees}</span>
                </p>
                <p className="text-sm text-gray-600">İşdə olanlar</p>
              </div>

              {/* 2. OnRest employees */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">Bu Gün</span>
                </div>
                <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.restEmployees}</p>
                <p className="text-sm text-gray-600">İstirahətdə</p>
              </div>

              {/* 3. IsAbsent employees */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserMinus className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs text-gray-500">Bu Gün</span>
                </div>
                <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.absentEmployees}</p>
                <p className="text-sm text-gray-600">Qayıb olanlar</p>
              </div>

              {/* 4. lateArrivalsCount */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs text-gray-500">Bu Gün</span>
                </div>
                <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.lateArrivalsCount}</p>
                <p className="text-sm text-gray-600">Gecikmə sayı</p>
              </div>
            </>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Employee List (Left Column) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {loading ? <EmployeeListSkeleton /> : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  {/* Top Left Corner Control as requested */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-1 hover:bg-white rounded-md shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs font-medium text-gray-600 px-2 min-w-12 text-center">
                      {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-1 hover:bg-white rounded-md shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      {currentEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-medium text-xs">
                                {emp.firstname[0]}{emp.lastname[0]}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{emp.firstname} {emp.lastname}</p>
                                <p className="text-xs text-gray-500">{emp.departmentName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {/* Status Badges */}
                              <StatusBadge status={getEmployeeBadgeStatus(emp)} size="sm" />

                              {/* Time Display */}
                              <span className={`text-sm font-medium ${emp.checkInTime ? 'text-gray-900' : 'text-gray-400'}`}>
                                {emp.checkInTime ? emp.checkInTime.slice(0, 5) : '--:--'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {currentEmployees.length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-8 text-center text-gray-500 text-sm">
                            Məlumat tapılmadı
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Departments List (Right Column) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {loading ? <DepartmentListSkeleton /> : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Şöbə Statistikası</h3>
                </div>
                <div className="space-y-6">
                  {stats?.departmentsList.map(dept => (
                    <div key={dept.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                        <span className="text-xs text-gray-600 font-medium">
                          {dept.presentEmployees} / {dept.totalEmployees}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${dept.totalEmployees > 0 ? (dept.presentEmployees / dept.totalEmployees) * 100 : 0}%` }}
                        />
                      </div>
                      {dept.lateCount > 0 && (
                        <div className="flex items-center gap-1.5 pl-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                          <span className="text-xs text-orange-600 font-medium">{dept.lateCount} gecikmə</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {stats?.departmentsList.length === 0 && (
                    <p className="text-center text-gray-500 py-4 text-sm">Şöbə məlumatı yoxdur</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

