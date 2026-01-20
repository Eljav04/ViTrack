import { UserRole } from '../App';
import { Users, UserCog } from 'lucide-react';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin').min(1, 'E-poçt mütləqdir'),
  password: z.string().min(1, 'Şifrə mütləqdir'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login({ onLogin }: LoginProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    // Simple demo logic - in real app, validate credentials
    if (data.email.includes('admin')) {
      onLogin('admin');
      toast.success('Admin kimi daxil oldunuz');
    } else if (data.email.includes('isci') || data.email.includes('employee')) {
      // Added 'isci' or 'employee' check just to match standard demo behavior if needed, 
      // but originally it was just else handling everything else as employee.
      // Reverting to original logic: if includes admin -> admin, else -> employee.
      // actually let's stick to the original logic:
      // if (email.includes('admin')) { onLogin('admin'); } else { onLogin('employee'); }
      onLogin('employee');
      toast.success('İşçi kimi daxil oldunuz');
    } else {
      // Only for demonstration, maybe show error if strictly checking?
      // But original code allowed anything non-admin to be employee.
      // Let's keep it consistent with original logic but maybe add a check?
      // Original: if (email.includes('admin')) ... else ...
      onLogin('employee');
      toast.success('İşçi kimi daxil oldunuz');
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

            <Button variant="primary" size="lg" fullWidth type="submit">
              Daxil ol
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