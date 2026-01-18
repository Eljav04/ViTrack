import { Users, Clock, UserX, TrendingUp, AlertCircle } from 'lucide-react';
import { employees, attendanceRecords, getDepartmentName } from '../../data/mockData';
import { StatusBadge } from '../ui/StatusBadge';
import { AdminNav } from './AdminNav';

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);

  const stats = {
    atWork: todayRecords.filter(r => r.checkIn && !r.checkOut).length,
    late: todayRecords.filter(r => r.status === 'late').length,
    absent: employees.filter(e => e.active).length - todayRecords.length,
    totalHours: todayRecords.reduce((acc, r) => {
      if (r.checkIn && r.checkOut) {
        const [inH, inM] = r.checkIn.split(':').map(Number);
        const [outH, outM] = r.checkOut.split(':').map(Number);
        const hours = outH - inH + (outM - inM) / 60;
        return acc + hours;
      }
      return acc;
    }, 0),
  };

  const departmentStats = employees.reduce((acc, emp) => {
    const deptName = getDepartmentName(emp.departmentId);
    if (!acc[deptName]) {
      acc[deptName] = { total: 0, present: 0, late: 0 };
    }
    acc[deptName].total += 1;
    
    const record = todayRecords.find(r => r.employeeId === emp.id);
    if (record) {
      acc[deptName].present += 1;
      if (record.status === 'late') {
        acc[deptName].late += 1;
      }
    }
    return acc;
  }, {} as Record<string, { total: number; present: number; late: number }>);

  const recentActivity = todayRecords
    .filter(r => r.checkIn)
    .sort((a, b) => {
      const timeA = a.checkIn || '';
      const timeB = b.checkIn || '';
      return timeB.localeCompare(timeA);
    })
    .slice(0, 8);

  const formatDate = () => {
    const date = new Date();
    const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">İdarə Paneli Ümumi Görünüş</h2>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate()}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Bu Gün</span>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.atWork}</p>
            <p className="text-sm text-gray-600">Hazırda İşdədir</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">Bu Gün</span>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.late}</p>
            <p className="text-sm text-gray-600">Gec Gələnlər</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs text-gray-500">Bu Gün</span>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.absent}</p>
            <p className="text-sm text-gray-600">İşə Gəlməyənlər</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Bu Gün</span>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">
              {stats.totalHours.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Cəmi İş Saatları</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Son Girişlər</h3>
            
            <div className="space-y-3">
              {recentActivity.map(record => {
                const employee = employees.find(e => e.id === record.employeeId);
                if (!employee) return null;
                
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={employee.photo}
                        alt={employee.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-600">{getDepartmentName(employee.departmentId)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{record.checkIn}</p>
                        <p className="text-xs text-gray-600">Giriş</p>
                      </div>
                      <StatusBadge status={record.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Şöbələrə Görə</h3>
            
            <div className="space-y-4">
              {Object.entries(departmentStats).map(([dept, stats]) => (
                <div key={dept}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{dept}</span>
                    <span className="text-xs text-gray-600">
                      {stats.present}/{stats.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(stats.present / stats.total) * 100}%` }}
                    />
                  </div>
                  {stats.late > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-orange-600" />
                      <span className="text-xs text-orange-600">{stats.late} gecikmə</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
