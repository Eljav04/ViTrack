import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MessageSquare, CheckCircle, ArrowLeft, Loader2, Coffee } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { attendanceService } from '../../services/attendanceService';

interface DayOffStepsProps {
    onBack: () => void;
    onComplete: () => void;
}

type Step = 'warning' | 'comment' | 'success' | 'error';

export function DayOffSteps({ onBack, onComplete }: DayOffStepsProps) {
    const [step, setStep] = useState<Step>('warning');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleWarningContinue = () => {
        setStep('comment');
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await attendanceService.setDayOff(comment.trim() || undefined);
            setStep('success');
            setTimeout(() => {
                onComplete();
            }, 2000);
        } catch (e: any) {
            console.error('Day off submission error:', e);
            setError(e?.response?.data?.Message || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
            setStep('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 'warning') {
        return (
            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>

                        <h2 className="text-xl font-bold text-yellow-800">
                            Diqqət!
                        </h2>

                        <p className="text-yellow-700 leading-relaxed">
                            Bu bölmə sizin istirahət gününüzü qeyd etmək üçün nəzərdə tutulub.
                            Əgər gəliş vaxtınızı qeyd etmək istəyirsinizsə, geri qayıdın və başqa bölmə seçin.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>
                    <Button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={handleWarningContinue}
                    >
                        Davam et
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'comment') {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                        Şərh Əlavə Edin (İstəyə bağlı)
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        İstirahət günü ilə bağlı qeyd əlavə edə bilərsiniz
                    </p>

                    <div className="relative">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={300}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-[120px] resize-none disabled:bg-gray-50 pb-6"
                            placeholder="Şərh daxil edin..."
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-medium bg-white/80 px-1 rounded">
                            {comment.length}/300
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setStep('warning')}
                            disabled={isSubmitting}
                        >
                            Geri
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Gözləyin...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Təsdiq Et
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Coffee className="w-10 h-10 text-green-600 animate-[bounce_1s_ease-in-out_1]" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Uğurlu!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        İstirahət gününüz qeydə alındı.
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Uğursuz
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {error}
                    </p>

                    <Button
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => setStep('warning')}
                    >
                        Yenidən Cəhd Et
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
