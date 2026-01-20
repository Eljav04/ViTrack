import { UserRole } from '../App';
import { Users, UserCog, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin').min(1, 'E-poçt mütləqdir'),
  password: z.string().min(1, 'Şifrə mütləqdir'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login({ onLogin }: LoginProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const resultAction = await dispatch(login({ login: data.email, password: data.password }));

      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        // Map backend role to frontend role (assuming basic mapping or just passing through)
        // If backend returns 'Admin', use 'admin', else 'employee'
        const role = user.role === 'Admin' ? 'admin' : 'employee';
        onLogin(role);
        toast.success(role === 'admin' ? 'Admin kimi daxil oldunuz' : 'İşçi kimi daxil oldunuz');
      } else {
        const error: any = resultAction.payload;

        // Handle specific error codes if available in error object
        if (error?.errorCodeSetter === 1002) { // INPUT_ERROR
          toast.error('Daxil edilən məlumatlar yanlışdır.');
        } else if (error?.errorCodeSetter === 1003) { // LOGIN_PASSWORD_ERROR
          toast.error('İstifadəçi adı və ya şifrə yanlışdır.');
        } else if (error?.errorCodeSetter === 1004) { // LOCKED_OUT_ERROR
          toast.error('Hesabınız bloklanıb. Zəhmət olmasa adminlə əlaqə saxlayın.');
        } else {
          // Check for server not responding or other errors
          if (typeof error === 'string' && error.includes('Network Error')) {
            toast.error('Server cavab vermir. Zəhmət olmasa internet bağlantınızı yoxlayın və ya bir az sonra cəhd edin.');
          } else {
            toast.error('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
          }
        }
      }
    } catch (err) {
      toast.error('Gözlənilməz xəta baş verdi.');
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    setValue('email', role === 'admin' ? 'admin@sirket.com' : 'employee@sirket.com');
    setValue('password', '123456');
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Davamiyyət İdarəetmə Sistemi
          </h1>
          <p className="text-gray-600">Daxil olmaq üçün məlumatlarınızı daxil edin</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-poçt
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@sirket.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifrə
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gözləyin...
                </>
              ) : (
                'Daxil ol'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 ">
            <p className="text-xs text-gray-600 text-center mb-3">Demo üçün:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin('employee')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Users className="w-4 h-4" />
                İşçi kimi
              </button>
              <button
                onClick={() => handleDemoLogin('admin')}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <UserCog className="w-4 h-4" />
                Admin kimi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}