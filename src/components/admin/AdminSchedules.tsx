import { useState } from 'react';
import { Plus, Edit2, X, Clock } from 'lucide-react';
import { schedules, employees, Schedule } from '../../data/mockData';
import { Button } from '../ui/button';
import { AdminNav } from './AdminNav';

export function AdminSchedules({ onLogout }: { onLogout: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const getEmployeeCount = (scheduleId: string) => {
    return employees.filter(e => e.scheduleId === scheduleId && e.active).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">İş Cədvəllərinin İdarə Edilməsi</h2>
            <p className="text-sm text-gray-600 mt-1">{schedules.length} cədvəl konfiqurasiya edilib</p>
          </div>
          <Button variant="primary" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Cədvəl Əlavə Et
          </Button>
        </div>

        {/* Schedule Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {schedules.map(schedule => {
            const empCount = getEmployeeCount(schedule.id);
            
            return (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                      <p className="text-sm text-gray-600">{empCount} işçi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Başlama Vaxtı</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {schedule.startTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Bitmə Vaxtı</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {schedule.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">İş Saatları</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {schedule.workHours} saat
                    </span>
                  </div>
                </div>

                {empCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Təyin edilmiş işçilər</p>
                    <div className="flex -space-x-2">
                      {employees
                        .filter(e => e.scheduleId === schedule.id && e.active)
                        .slice(0, 5)
                        .map(emp => (
                          <img
                            key={emp.id}
                            src={emp.photo}
                            alt={emp.name}
                            title={emp.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                        ))}
                      {empCount > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{empCount - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingSchedule ? 'Cədvəli Redaktə Et' : 'Cədvəl Əlavə Et'}
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cədvəlin Adı
                </label>
                <input
                  type="text"
                  defaultValue={editingSchedule?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Standart 9-17"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlama Vaxtı
                  </label>
                  <input
                    type="time"
                    defaultValue={editingSchedule?.startTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitmə Vaxtı
                  </label>
                  <input
                    type="time"
                    defaultValue={editingSchedule?.endTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İş Saatları
                </label>
                <input
                  type="number"
                  defaultValue={editingSchedule?.workHours}
                  min="1"
                  max="24"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" fullWidth onClick={handleClose}>
                  Ləğv Et
                </Button>
                <Button variant="primary" fullWidth type="submit">
                  {editingSchedule ? 'Yenilə' : 'Əlavə Et'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}