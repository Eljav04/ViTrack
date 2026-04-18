import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { EmployeeNav } from './EmployeeNav';
import { statisticsService, StatisticsResponse } from '../../services/statisticsService';
import { toast } from 'sonner';

export function EmployeeStatistics({ onLogout }: { onLogout: () => void }) {
    const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Date state
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // First day of current month
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0]; // Today
    });


    const fetchStatistics = async () => {
        setLoading(true);
        try {
            // Format dates for API: YYYY.MM.DD
            const formatForApi = (dateString: string) => {
                return dateString.replace(/-/g, '.');
            };

            const data = await statisticsService.getMyStats(
                formatForApi(startDate),
                formatForApi(endDate)
            );
            setStatistics(data);
        } catch (error) {
            toast.error('Statistika məlumatlarını yükləmək mümkün olmadı');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (newStart: string, newEnd: string) => {
        if (new Date(newEnd) < new Date(newStart)) {
            toast.error('Bitmə tarixi başlanğıc tarixindən əvvəl ola bilməz');
            return;
        }

        setStartDate(newStart);
        setEndDate(newEnd);
    };

    // Effect to trigger fetch when dates change validly
    useEffect(() => {
        if (new Date(endDate) >= new Date(startDate)) {
            fetchStatistics();
        }
    }, [startDate, endDate]);


    const formatDuration = (hours: number) => {
        return Math.round(hours * 10) / 10;
    };

    const getRomanDay = (dayIndex: number) => {
        const romans = ['VII', 'I', 'II', 'III', 'IV', 'V', 'VI']; // Sunday is 0 -> VII
        return romans[dayIndex];
    };

    const getAzDay = (dayIndex: number) => {
        const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
        return days[dayIndex];
    };

    const formatMissingDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const weekDayIndex = date.getDay();

        return `${day}.${month}.${year} - ${getAzDay(weekDayIndex)} (${getRomanDay(weekDayIndex)})`;
    };

    const groupDatesByMonth = (dates: string[]) => {
        const groups: { [key: string]: string[] } = {};

        dates.forEach(dateStr => {
            const date = new Date(dateStr);
            const key = date.toLocaleDateString('az-AZ', { month: 'long', year: 'numeric' });
            // Capitalize first letter
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);

            if (!groups[formattedKey]) {
                groups[formattedKey] = [];
            }
            groups[formattedKey].push(dateStr);
        });

        return groups;
    };


    // Prepare content only if statistics is available
    const statCards = statistics ? [
        {
            label: 'Ümumi Günlər',
            value: statistics.wholeDays,
            icon: Calendar,
            color: 'blue',
        },
        {
            label: 'İş Günləri',
            value: statistics.workDays,
            icon: Calendar,
            color: 'green',
        },
        {
            label: 'İstirahət Günləri',
            value: statistics.restDays,
            icon: Calendar,
            color: 'purple',
        },
        {
            label: 'Qayıb Günlər',
            value: statistics.absentDays,
            icon: AlertCircle,
            color: 'red',
        },
        {
            label: 'Gecikmə Sayı',
            value: statistics.lateCount,
            icon: Clock,
            color: 'orange',
        },
        {
            label: 'Erkən Çıxma',
            value: statistics.earlyLeaveCount,
            icon: Clock,
            color: 'yellow',
        },
        {
            label: 'İş Saatları',
            value: `${formatDuration(statistics.workHours)}s`,
            icon: Clock,
            color: 'teal',
        },
        {
            label: 'Əlavə Saat',
            value: `${formatDuration(statistics.overtimeHours)}s`,
            icon: TrendingUp,
            color: 'indigo',
        },
    ] : [];

    const groupedMissingDates = statistics ? groupDatesByMonth(statistics.missingDates) : {};

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
        orange: 'bg-orange-50 text-orange-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        teal: 'bg-teal-50 text-teal-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            <EmployeeNav onLogout={onLogout} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-semibold text-gray-900">Mənim Statistikam</h2>
                    </div>

                    {/* Date Filters */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="relative">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => handleDateChange(e.target.value, endDate)}
                                className="pl-3 pr-2 py-1.5 text-sm border-none focus:ring-0 text-gray-700 bg-transparent outline-none cursor-pointer"
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="relative">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    const newEnd = e.target.value;
                                    if (new Date(newEnd) < new Date(startDate)) {
                                        toast.error('Bitmə tarixi başlanğıc tarixindən əvvəl ola bilməz');
                                        return;
                                    }
                                    setEndDate(newEnd);
                                }}
                                className="pl-3 pr-2 py-1.5 text-sm border-none focus:ring-0 text-gray-700 bg-transparent outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Məlumat yüklənir...</p>
                    </div>
                ) : statistics ? (
                    <>
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {statCards.map((card, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                                            <card.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                                    <p className="text-sm text-gray-600">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Missing Dates */}
                        {statistics.missingDates.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    Çatışmayan Tarixlər
                                </h3>

                                {Object.entries(groupedMissingDates).map(([month, dates]) => (
                                    <div key={month} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h4 className="text-md font-medium text-gray-700 mb-4 border-b border-gray-100 pb-2">
                                            {month}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {dates.map((date, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200"
                                                >
                                                    <Calendar className="w-4 h-4 mr-1.5" />
                                                    {formatMissingDate(date)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {statistics.missingDates.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Əla!</h3>
                                    <p className="text-sm text-gray-600">Sizin heç bir çatışmayan tarixiniz yoxdur.</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Məlumat tapılmadı</p>
                    </div>
                )}
            </div>
        </div>
    );
}
