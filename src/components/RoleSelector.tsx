import { UserRole } from '../App';
import { Users, UserCog } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            ERP Attendance System
          </h1>
          <p className="text-gray-600">Select your role to continue</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => onSelectRole('employee')}
            className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Users className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Employee</h2>
                <p className="text-sm text-gray-600">
                  Check in/out, view attendance history
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onSelectRole('admin')}
            className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <UserCog className="w-8 h-8 text-purple-600 group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Admin / Manager</h2>
                <p className="text-sm text-gray-600">
                  Monitor attendance, manage employees
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
