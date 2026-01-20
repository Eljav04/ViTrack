import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, X, Trash2 } from 'lucide-react';
import { employees } from '../../data/mockData'; // Keeping for fallback or types if needed? No, should replace.
import { Button } from '../ui/button';
import { AdminNav } from './AdminNav';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsers, createUser, deleteUser } from '../../store/userSlice';
import { User, CreateUserDTO } from '../../services/userService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Zod schema for User creation (Registr)
const azLettersRegex = /^[A-Za-zА-Яа-яЁёÇçƏəÖöŞşÜüİIıĞğ]+$/;

const userSchema = z.object({
  firstname: z.string()
    .min(1, 'Ad mütləqdir')
    .regex(azLettersRegex, 'Ad yalnız hərflərdən ibarət olmalıdır'),
  lastname: z.string()
    .min(1, 'Soyad mütləqdir')
    .regex(azLettersRegex, 'Soyad yalnız hərflərdən ibarət olmalıdır'),
  login: z.string()
    .min(5, 'Login ən azı 5 simvol olmalıdır')
    .max(100, 'Login ən çox 100 simvol ola bilər'),
  password: z.string().min(4, 'Şifrə ən azı 4 simvol olmalıdır'),
  role: z.enum(['User', 'Admin']),
});

type UserFormValues = z.infer<typeof userSchema>;

export function AdminEmployees({ onLogout }: { onLogout: () => void }) {
  const dispatch = useAppDispatch();
  const { items: users, loading } = useAppSelector(state => state.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'User'
    }
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(user => user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.login && user.login.toLowerCase().includes(searchQuery.toLowerCase())));

  const handleAdd = () => {
    reset();
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await dispatch(deleteUser(showDeleteConfirm)).unwrap();
        toast.success('İstifadəçi uğurla silindi');
        setShowDeleteConfirm(null);
      } catch (error) {
        toast.error('Silinmə zamanı xəta baş verdi');
      }
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      await dispatch(createUser(data)).unwrap();
      toast.success('İstifadəçi uğurla yaradıldı');
      handleClose();
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : 'Yaradılma zamanı xəta baş verdi');
    }
  };







  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">İşçilərin İdarə Edilməsi</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredUsers.length} işçi</p>
          </div>
          <Button variant="primary" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            İşçi Əlavə Et
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ad, Soyad və ya login üzrə axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                    Vəzifə
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Cədvəl
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {user.firstname[0]}{user.lastname[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.firstname} {user.lastname}</p>
                          <p className="text-sm text-gray-600">{user.login}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.department || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.position || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{user.startTime && user.endTime ? `${user.startTime} - ${user.endTime}` : '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Status currently relying on isDeleted if detailed not available in create response but list has it */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!user.isDeleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {!user.isDeleted ? 'Aktiv' : 'Silinib'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                İşçi Əlavə Et
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <input
                    type="text"
                    {...register('firstname')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ad"
                  />
                  {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    {...register('lastname')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Soyad"
                  />
                  {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login
                </label>
                <input
                  type="text"
                  {...register('login')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Login daxil edin"
                />
                {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifrə
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
                Qeyd: Şöbə, Vəzifə və İş Cədvəli yaradıldıqdan sonra təyin olunmalıdır.
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" className="flex-1" onClick={handleClose} type="button">
                  Ləğv Et
                </Button>
                <Button variant="primary" className="flex-1" type="submit">
                  Əlavə Et
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {
        showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                İstifadəçini Sil
              </h3>
              <p className="text-gray-600 mb-6">
                Bu istifadəçini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
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
        )
      }
    </div >
  );
}