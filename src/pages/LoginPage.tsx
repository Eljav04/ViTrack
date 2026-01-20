import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/authSlice';
import { Button } from '../components/ui/button';
import { Toaster, toast } from 'sonner';

const loginSchema = z.object({
    login: z.string().min(1, 'İstifadəçi adı tələb olunur'),
    password: z.string().min(1, 'Şifrə tələb olunur'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, error, isLoading } = useAppSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(typeof error === 'string' ? error : 'Giriş uğursuz oldu');
        }
    }, [error]);

    const onSubmit = (data: LoginFormData) => {
        dispatch(login({ login: data.login, password: data.password }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Toaster position="top-right" richColors />
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
                                Login
                            </label>
                            <input
                                type="text"
                                {...register('login')}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.login ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Login daxil edin"
                            />
                            {errors.login && (
                                <p className="text-red-500 text-xs mt-1">{errors.login.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Şifrə
                            </label>
                            <input
                                type="password"
                                {...register('password')}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Gözləyin...' : 'Daxil ol'}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center text-xs text-gray-500 italic">
                            v1.0.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
