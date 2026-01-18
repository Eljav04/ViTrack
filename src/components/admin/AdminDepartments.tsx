import { useState } from 'react';
import { Plus, Edit2, X, Trash2, Building2 } from 'lucide-react';
import { departments, employees, Department } from '../../data/mockData';
import { Button } from '../ui/button';
import { AdminNav } from './AdminNav';

export function AdminDepartments({ onLogout }: { onLogout: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingDepartment(null);
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    // In real app, would delete from database
    setShowDeleteConfirm(null);
  };

  const getEmployeeCount = (departmentId: string) => {
    return employees.filter(e => e.departmentId === departmentId && e.active).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Şöbələrin İdarə Edilməsi</h2>
            <p className="text-sm text-gray-600 mt-1">{departments.length} şöbə konfiqurasiya edilib</p>
          </div>
          <Button variant="primary" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Şöbə Əlavə Et
          </Button>
        </div>

        {/* Department Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {departments.map(department => {
            const empCount = getEmployeeCount(department.id);
            
            return (
              <div
                key={department.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{department.name}</h3>
                      <p className="text-sm text-gray-600">{empCount} işçi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {department.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {department.description}
                  </p>
                )}

                {empCount > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Təyin edilmiş işçilər</p>
                    <div className="flex -space-x-2">
                      {employees
                        .filter(e => e.departmentId === department.id && e.active)
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
                {editingDepartment ? 'Şöbəni Redaktə Et' : 'Şöbə Əlavə Et'}
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
                  Şöbənin Adı
                </label>
                <input
                  type="text"
                  defaultValue={editingDepartment?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mühəndislik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Təsvir (İstəyə bağlı)
                </label>
                <textarea
                  defaultValue={editingDepartment?.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                  placeholder="Şöbə haqqında qısa məlumat"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" fullWidth onClick={handleClose}>
                  Ləğv Et
                </Button>
                <Button variant="primary" fullWidth type="submit">
                  {editingDepartment ? 'Yenilə' : 'Əlavə Et'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Şöbəni Sil
            </h3>
            <p className="text-gray-600 mb-6">
              Bu şöbəni silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDeleteConfirm(null)}>
                Ləğv Et
              </Button>
              <Button variant="danger" fullWidth onClick={confirmDelete}>
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
