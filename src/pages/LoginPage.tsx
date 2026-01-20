import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/authSlice';
import { Button } from '../components/ui/button';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
    login: z.string().min(5, 'Login ən azı 5 simvol olmalıdır'),
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

    // Generic error effect removed in favor of specific handling in onSubmit
    // useEffect(() => {
    //     if (isAuthenticated && user) { ... } logic is fine but let's keep the redirect logic if it works, 
    //     OR we can move redirect to onSubmit success for immediate reaction. 
    //     UseEffect is 'safer' for state updates but onSubmit is fine too.
    // }, [isAuthenticated, user, navigate]);
    // Actually the user probably wants the specific error handling. Redirect can stay in useEffect or move.
    // The previous implementation had redirect in useEffect. Let's keep redirect in useEffect? 
    // No, let's keep it simple. If I handle success in onSubmit, I can redirect there too. 
    // But checkAuth might trigger isAuthenticated too. So useEffect is better for persistence.
    // However, I will REMOVE the generic error effect.

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            const resultAction = await dispatch(login({ login: data.login, password: data.password }));

            if (login.fulfilled.match(resultAction)) {
                const user = resultAction.payload;
                const role = user.role === 'Admin' ? 'admin' : 'employee';
                toast.success(role === 'admin' ? 'Admin kimi daxil oldunuz' : 'İşçi kimi daxil oldunuz');
                // Navigation will happen via useEffect when state updates
            } else {
                const errorData: any = resultAction.payload;

                // Priority 1: Use the message returned by the server (already in Azerbaijani)
                if (errorData?.message) {
                    toast.error(errorData.message);
                }
                // Priority 2: Handle Network/Server errors
                else if (typeof errorData === 'string' && (errorData.includes('Network Error') || errorData.includes('ERR_NETWORK'))) {
                    toast.error('Server cavab vermir. Zəhmət olmasa internet bağlantınızı yoxlayın.');
                }
                // Priority 3: Fallback generic error
                else {
                    toast.error('Sistem xətası baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.');
                }
            }
        } catch (err) {
            toast.error('Gözlənilməz xəta baş verdi.');
        }
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
