import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DayOffSteps } from './DayOffSteps';
import { useAppDispatch } from '../../store/hooks';
import { fetchTodayRecord } from '../../store/attendanceSlice';

export function DayOffPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

    const handleBack = () => {
        navigate('/employee/check-in'); // Return to check-in selection
    };

    const handleComplete = async () => {
        await dispatch(fetchTodayRecord()).unwrap();
        navigate('/employee');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-60">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-gray-900">İstirahət Günü</h1>
                            <p className="text-sm text-gray-600">{time}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
                <DayOffSteps
                    onBack={handleBack}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
