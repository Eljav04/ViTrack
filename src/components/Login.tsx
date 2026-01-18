import { useState } from 'react';
import { UserRole } from '../App';
import { Users, UserCog } from 'lucide-react';
import { Button } from './ui/button';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo logic - in real app, validate credentials
    if (email.includes('admin')) {
      onLogin('admin');
    } else {
      onLogin('employee');
    }
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-poçt
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@sirket.com"
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

            <Button variant="primary" size="lg" fullWidth type="submit">
              Daxil ol
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-3">Demo üçün:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onLogin('employee')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Users className="w-4 h-4" />
                İşçi kimi
              </button>
              <button
                onClick={() => onLogin('admin')}
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