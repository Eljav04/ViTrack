import { useState, useEffect } from 'react';
import { Plus, Edit2, X, Clock, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminNav } from './AdminNav';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchWorkSchedules, createWorkSchedule, updateWorkSchedule, deleteWorkSchedule } from '../../store/workScheduleSlice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// Zod Schema
const scheduleSchema = z.object({
  name: z.string().min(1, 'Cədvəl adı mütləqdir'),
  startTime: z.string().min(1, 'Başlama vaxtı mütləqdir'),
  endTime: z.string().min(1, 'Bitmə vaxtı mütləqdir'),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function AdminSchedules({ onLogout }: { onLogout: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: schedules, loading } = useSelector((state: RootState) => state.workSchedules);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

  // Local loading state for form submission since Redux loading might be global/table related
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkSchedules());
  }, [dispatch]);

  const handleEdit = (schedule: any) => {
    setEditingId(schedule.id);
    setValue('name', schedule.name);
    setValue('startTime', schedule.startTime);
    setValue('endTime', schedule.endTime);
    // Calculate regular hours if workHours is not retrieved or just use default
    // For now we don't have workHours in the API response type explicitly defined in the prompt text 
    // but the previous mockup had it. We can calculate it or leave it optional.
    // The previous mockup had input for it.
    // Let's assume we can compute it or it comes from API but for now we won't strictly rely on it from API if not present.
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    reset({
      name: '',
      startTime: '',
      endTime: ''
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm !== null) {
      try {
        await dispatch(deleteWorkSchedule(showDeleteConfirm)).unwrap();
        toast.success('Cədvəl uğurla silindi');
        setShowDeleteConfirm(null);
      } catch (error) {
        toast.error('Xəta baş verdi: ' + error);
      }
    }
  };

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await dispatch(updateWorkSchedule({ id: editingId, ...data })).unwrap();
        toast.success('Cədvəl uğurla yeniləndi');
      } else {
        await dispatch(createWorkSchedule(data)).unwrap();
        toast.success('Cədvəl uğurla yaradıldı');
      }
      handleClose();
    } catch (error) {
      toast.error('Əməliyyat zamanı xəta baş verdi');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to calculate hours difference
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60;
    return (diff / 60).toFixed(1);
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
        {loading ? (
          <p>Yüklənir...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {schedules.map(schedule => {
              const duration = calculateDuration(schedule.startTime, schedule.endTime);

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
                        {/* Static employee count as per plan */}
                        <p className="text-sm text-gray-600">0 işçi</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="Düzəliş et"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                        {duration} saat
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Cədvəli Redaktə Et' : 'Cədvəl Əlavə Et'}
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
                  Cədvəlin Adı
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Standart 9-17"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlama Vaxtı
                  </label>
                  <input
                    type="time"
                    {...register('startTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitmə Vaxtı
                  </label>
                  <input
                    type="time"
                    {...register('endTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

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
                    editingId ? 'Yenilə' : 'Əlavə Et'
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
              Cədvəli Sil
            </h3>
            <p className="text-gray-600 mb-6">
              Bu cədvəli silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
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