import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/authSlice';
import { User, UserCog } from 'lucide-react';
import { Button } from '../components/ui/button';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, error, isLoading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(login({ login: email, password }));
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {typeof error === 'string' ? error : 'Gözlənilməz xəta baş verdi'}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                İstifadəçi adı / Login
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Login daxil edin"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Şifrə
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                required
                            />
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
                        {/* Removed demo buttons as we are implementing real auth, 
                 but keeping structure just in case users want to see it clean */}
                        <div className="text-center text-xs text-gray-100 italic">
                            v1.0.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
