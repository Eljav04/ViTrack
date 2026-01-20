import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, X, Trash2, Loader2, KeyRound } from 'lucide-react';
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
import { fetchDepartments } from '../../store/departmentSlice';
import { fetchWorkSchedules } from '../../store/workScheduleSlice';
import { RootState, AppDispatch } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, changePassword } from '../../store/userSlice';
const azLettersRegex = /^[A-Za-zА-Яа-яЁёÇçƏəÖöŞşÜüİIıĞğ]+$/;

// Schema for Creating a User
const createUserSchema = z.object({
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

// Schema for Editing a User (Password is optional/handled separately)
const updateUserSchema = z.object({
  firstname: z.string()
    .min(1, 'Ad mütləqdir')
    .regex(azLettersRegex, 'Ad yalnız hərflərdən ibarət olmalıdır'),
  lastname: z.string()
    .min(1, 'Soyad mütləqdir')
    .regex(azLettersRegex, 'Soyad yalnız hərflərdən ibarət olmalıdır'),
  login: z.string()
    .min(5, 'Login ən azı 5 simvol olmalıdır')
    .max(100, 'Login ən çox 100 simvol ola bilər'),
  departmentId: z.string().nullable().optional(), // Select value likely comes as string
  workScheduleId: z.string().nullable().optional(), // Select value likely comes as string
});

// Schema for Changing Password
const changePasswordSchema = z.object({
  newPassword: z.string().min(4, 'Şifrə ən azı 4 simvol olmalıdır'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// This part is extensive, replacing the entire component logic to handle modes.
// Since the tool limits might be hit if I replace EVERYTHING at once, I will do it in chunks.
// First chunk: State and Hooks.
export function AdminEmployees({ onLogout }: { onLogout: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: users, loading } = useSelector((state: RootState) => state.users);

  // Need departments and schedules for the select dropdowns
  const { items: departments } = useSelector((state: RootState) => state.departments);
  const { items: schedules } = useSelector((state: RootState) => state.workSchedules);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Changed to boolean, uses selectedUser

  // Form for Creation/Editing (Dynamic Schema?)
  // We can use a single form with dynamic resolver or just one form that handles both fields but validation changes?
  // Let's use separate forms or a unified one with mode check. 
  // Easier to use one form for main user data.
  // BUT creation has password, edit does not. 
  // Let's use a "UserForm" that adapts.

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues & UpdateUserFormValues>({
    resolver: zodResolver(modalMode === 'create' ? createUserSchema : updateUserSchema) as any,
    defaultValues: {
      role: 'User'
    }
  });

  // Separate form for password change to avoid conflicts
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
    dispatch(fetchWorkSchedules());
  }, [dispatch]);

  const filteredUsers = users.filter(user => user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.login && user.login.toLowerCase().includes(searchQuery.toLowerCase())));

  const handleAdd = () => {
    setModalMode('create');
    setSelectedUser(null);
    reset({
      firstname: '',
      lastname: '',
      login: '',
      password: '',
      role: 'User'
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);

    // Find department/schedule IDs by name if possible, or we need IDs from backend.
    // The User interface currently has department: string (name). 
    // We need IDs to send to backend.
    // Assuming we can map names to IDs or the backend gives IDs in 'all-detailed'?
    // The current User interface: department?: string. 
    // If backend only gives names, we are in trouble for binding to ID-based selects.
    // Let's assume for now we map by name match or the User obj needs update to include IDs.
    // For this task, I will try to match by name from the departments list.

    // Department and WorkSchedule are now objects with IDs in the User interface.
    const deptId = user.department?.id?.toString() || '';
    const schedId = user.workSchedule?.id?.toString() || '';

    reset({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      departmentId: deptId,
      workScheduleId: schedId
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setShowDeleteConfirm(false);
    reset();
  };

  const handleDeleteClick = () => {
    // Triggered from inside Edit Modal
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await dispatch(deleteUser(selectedUser.id)).unwrap();
        toast.success('İstifadəçi uğurla silindi');
        // Close modals
        setShowDeleteConfirm(false);
        setShowModal(false);
      } catch (error) {
        toast.error('Silinmə zamanı xəta baş verdi');
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createUser(data)).unwrap();
        toast.success('İstifadəçi uğurla yaradıldı');
        handleClose();
      } else {
        if (!selectedUser) return;
        // Prepare update DTO
        const updateData = {
          id: selectedUser.id,
          firstname: data.firstname,
          lastname: data.lastname,
          login: data.login,
          departmentId: data.departmentId ? parseInt(data.departmentId) : null,
          workScheduleId: data.workScheduleId ? parseInt(data.workScheduleId) : null,
        };
        await dispatch(updateUser(updateData)).unwrap();
        toast.success('İstifadəçi uğurla yeniləndi');
        handleClose();
      }
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : 'Əməliyyat zamanı xəta baş verdi');
    }
  };

  const onChangePasswordClick = () => {
    setShowPasswordModal(true);
    resetPassword();
  };

  const onChangePasswordSubmit = async (data: ChangePasswordFormValues) => {
    if (!selectedUser) return;
    try {
      await dispatch(changePassword({ id: selectedUser.id, newPassword: data.newPassword })).unwrap();
      toast.success('Şifrə uğurla dəyişdirildi');
      setShowPasswordModal(false);
    } catch (error) {
      toast.error('Şifrə dəyişdirilərkən xəta baş verdi');
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
                    Cədvəl
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    İş saatları
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
                      <span className="text-sm text-gray-900">{user.department?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.workSchedule?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {/* Try to find full schedule details from store if available, otherwise show name from user obj */}
                        <p className="text-sm text-gray-900">
                          {(() => {
                            if (!user.workSchedule) return '-';
                            const fullSchedule = schedules.find(s => s.id === user.workSchedule?.id);
                            // If we found the full schedule in the store, show times.
                            // Otherwise, fallback to '-' or additional info.
                            if (fullSchedule) return `${fullSchedule.startTime} - ${fullSchedule.endTime}`;
                            return '-';
                          })()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Düzəliş Et
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
                {modalMode === 'create' ? 'İşçi Əlavə Et' : 'İşçi Redaktə Et'}
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
                  {/* @ts-ignore */}
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
                  {/* @ts-ignore */}
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
                {/* @ts-ignore */}
                {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login.message}</p>}
              </div>

              {/* Password field only for CREATE mode */}
              {modalMode === 'create' && (
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
                    {/* @ts-ignore */}
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              )}

              {/* Department and Schedule Selects (Available in Edit for now, or Create if backend supported it but notes said no) */}
              {/* Note said: "Qeyd: Şöbə, Vəzifə və İş Cədvəli yaradıldıqdan sonra təyin olunmalıdır." */}
              {/* So we show these preferentially in EDIT mode. */}

              {modalMode === 'edit' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şöbə
                    </label>
                    <select
                      {...register('departmentId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçin...</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İş Cədvəli
                    </label>
                    <select
                      {...register('workScheduleId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçin...</option>
                      {schedules.map(sch => (
                        <option key={sch.id} value={sch.id}>{sch.name} ({sch.startTime}-{sch.endTime})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {modalMode === 'create' && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
                  Qeyd: Şöbə və İş Cədvəli yaradıldıqdan sonra "Düzəliş Et" bölməsindən təyin olunmalıdır.
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200 items-center">
                {/* Delete Button (Only in Edit Mode) */}
                {modalMode === 'edit' && (
                  <Button variant="danger" type="button" onClick={handleDeleteClick}>
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </Button>
                )}

                {/* Change Password Button (Only in Edit Mode) */}
                {modalMode === 'edit' && (
                  <Button variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800" type="button" onClick={onChangePasswordClick}>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Parolu dəyiş
                  </Button>
                )}

                <div className="flex-1"></div> {/* Spacer */}

                <Button variant="outline" onClick={handleClose} type="button">
                  Ləğv Et
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gözləyin...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Əlavə Et' : 'Yadda Saxla'
                  )}
                </Button>
              </div>
            </form>

            {/* Nested Delete Confirmation (Overlay) */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 bg-white/90 z-10 flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                  <h4 className="text-lg font-bold text-red-600 mb-2">İstifadəçini Sil</h4>
                  <p className="text-gray-600 mb-4">Bu istifadəçini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Ləğv Et</Button>
                    <Button variant="danger" onClick={confirmDelete}>Təsdiqlə və Sil</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parolu Dəyiş</h3>
            <form onSubmit={handleSubmitPassword(onChangePasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifrə
                </label>
                <input
                  type="password"
                  {...registerPassword('newPassword')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Yeni şifrə"
                />
                {/* @ts-ignore */}
                {errorsPassword.newPassword && <p className="text-red-500 text-xs mt-1">{errorsPassword.newPassword.message}</p>}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)} type="button">Ləğv Et</Button>
                <Button variant="primary" type="submit" disabled={isSubmittingPassword}>
                  {isSubmittingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yadda Saxla'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div >
  );
}