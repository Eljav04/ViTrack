import { useState, useEffect } from 'react';
import { Plus, Edit2, X, Trash2, Building2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { employees } from '../../data/mockData';
import { Button } from '../ui/button';
import { AdminNav } from './AdminNav';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment, Department } from '../../store/departmentSlice';
import { toast, Toaster } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';

const departmentSchema = z.object({
  name: z.string().min(1, 'Şöbənin adı tələb olunur'),
  description: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

export function AdminDepartments({ onLogout }: { onLogout: () => void }) {
  const dispatch = useAppDispatch();
  const { items: departments, isLoading } = useAppSelector((state) => state.departments);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const isBoss = currentUser?.role === 'Boss';
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Sync form when editing
  useEffect(() => {
    if (editingDepartment) {
      setValue('name', editingDepartment.name);
      // description not in Department type from slice yet, assume it might come later or just ignore
    } else {
      reset();
    }
  }, [editingDepartment, setValue, reset]);

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    reset();
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingDepartment(null);
    reset();
  };

  const handleDelete = (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm !== null) {
      try {
        await dispatch(deleteDepartment(showDeleteConfirm)).unwrap();
        toast.success('Şöbə uğurla silindi');
        setShowDeleteConfirm(null);
      } catch (error) {
        toast.error('Şöbəni silmək mümkün olmadı');
      }
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (editingDepartment) {
        await dispatch(updateDepartment({ id: editingDepartment.id, name: data.name })).unwrap();
        toast.success('Şöbə uğurla yeniləndi');
      } else {
        await dispatch(createDepartment({ name: data.name })).unwrap();
        toast.success('Şöbə uğurla əlavə olundu');
      }
      handleClose();
    } catch (error) {
      toast.error(editingDepartment ? 'Yeniləmək mümkün olmadı' : 'Əlavə etmək mümkün olmadı');
    }
  };

  // Mock employee count for now, as we don't have real employees connected to real departments yet
  const getEmployeeCount = (departmentId: number) => {
    // Logic would need to change when we have real employee data structure
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />
      <Toaster position="top-right" richColors />

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

        {/* Loading State */}
        {isLoading && departments.length === 0 && (
          <div className="text-center py-10">Yüklənir...</div>
        )}

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
                      {/* <p className="text-sm text-gray-600">{empCount} işçi</p> */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => !isBoss && handleDelete(department.id)}
                            className={`p-2 rounded-lg transition-colors ${isBoss ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </TooltipTrigger>
                        {isBoss && (
                          <TooltipContent>
                            <p>Bu əməliyyat üçün administrator icazəsi lazımdır</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

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

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şöbənin Adı
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Mühəndislik"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Description field - optional, backend doesn't seem to persist it in example? 
                   Added based on previous UI, but disabled if backend doesn't support it or mapped to name only */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Təsvir (İstəyə bağlı)
                </label>
                <textarea
                  {...register('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                  placeholder="Şöbə haqqında qısa məlumat"
                />
              </div> */}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" className="flex-1" onClick={handleClose} type="button">
                  Ləğv Et
                </Button>
                <Button variant="primary" className="flex-1" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gözləyin...
                    </>
                  ) : (
                    editingDepartment ? 'Yenilə' : 'Əlavə Et'
                  )}
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
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>
                Ləğv Et
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
