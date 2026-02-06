
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { AttendanceItem, AttendanceUpdateDTO } from '../../services/attendanceService';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

interface EditAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: AttendanceItem;
    onUpdate: (data: AttendanceUpdateDTO) => Promise<void>;
}

export function EditAttendanceModal({ isOpen, onClose, record, onUpdate }: EditAttendanceModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const [arrivalTime, setArrivalTime] = useState<string>('');
    const [leaveTime, setLeaveTime] = useState<string>('');

    const [isLate, setIsLate] = useState(false);
    const [isEarlyLeave, setIsEarlyLeave] = useState(false);
    const [isAbsent, setIsAbsent] = useState(false);
    const [isRest, setIsRest] = useState(false);

    useEffect(() => {
        if (isOpen && record) {
            // Format time for datetime-local input (though backend sends full ISO, we might need just time or handled carefully)
            // The record has arrivalTime as "10:47:36.4900887"
            // Let's assume input type="time" ok? Or text? 
            // The prompt asks for "2 section arrivalTime and leave time"
            // Standard time input accepts HH:mm
            setArrivalTime(formatTimeForInput(record.arrivalTime));
            setLeaveTime(formatTimeForInput(record.leaveTime));

            setIsLate(record.isLate);
            setIsEarlyLeave(record.isEarlyLeave);
            setIsAbsent(record.isAbsent);
            setIsRest(record.isRest);
        }
    }, [isOpen, record]);

    const formatTimeForInput = (timeStr: string | null) => {
        if (!timeStr) return '';
        // Extract HH:mm:ss or HH:mm
        return timeStr.substring(0, 5);
    };

    // Logic for toggles
    const handleAbsentChange = (checked: boolean) => {
        setIsAbsent(checked);
        if (checked) {
            setIsRest(false);
            setIsLate(false);
            setIsEarlyLeave(false);
            setArrivalTime('');
            setLeaveTime('');
        }
    };

    const handleRestChange = (checked: boolean) => {
        setIsRest(checked);
        if (checked) {
            setIsAbsent(false);
            setIsLate(false);
            setIsEarlyLeave(false);
            setArrivalTime('');
            setLeaveTime('');
        }
    };

    const handleLateChange = (checked: boolean) => {
        if (!isAbsent && !isRest) {
            setIsLate(checked);
        }
    };

    const handleEarlyLeaveChange = (checked: boolean) => {
        if (!isAbsent && !isRest) {
            setIsEarlyLeave(checked);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation 3: check if arrivale time is earlier and not equal to leave time
        // Only if both are present and not absent/rest
        if (!isAbsent && !isRest && arrivalTime && leaveTime) {
            if (leaveTime <= arrivalTime) {
                toast.error("Çıxış vaxtı gəlmə vaxtından kiçik ola bilməz.");
                return;
            }
        }

        setIsLoading(true);
        try {
            // Prepare DTO
            // 4) For disable data send null
            // We need to match backend expectation. API usually takes ISO dates for updates if it maps to `DateTime?`. 
            // BUT here `AttendanceUpdateDTO` uses strings.
            // If the original record arrivalTime was full ISO date, we might need to preserve the date part?
            // "data to send: "arrivalTime": "09:21:12.121Z"" 
            // So it sends correct format. 
            // If we use type="time", we get "HH:mm". 
            // We should attach the original date to "HH:mm" to make it "YYYY-MM-DDTHH:mm:00".
            // Or if backend handles just time? The prompt example shows full ISO. 
            // Let's try to construct full ISO string using record.date.

            const constructTimeOnly = (timeVal: string) => {
                if (!timeVal) return null;
                // timeVal is "HH:mm" from input type="time"
                // Backend expects time only? User said "send ONLY time. No date"
                // Let's add seconds to be safe: HH:mm:00
                return `${timeVal}:00`;
            };

            const dto: AttendanceUpdateDTO = {
                id: record.id,
                isAbsent: isAbsent,
                isRest: isRest,
                // If absent/rest, others are null/false
                arrivalTime: (isAbsent || isRest) ? null : constructTimeOnly(arrivalTime),
                leaveTime: (isAbsent || isRest) ? null : constructTimeOnly(leaveTime),
                isLate: (isAbsent || isRest) ? false : isLate,
                isEarlyLeave: (isAbsent || isRest) ? false : isEarlyLeave,
            };

            await onUpdate(dto);
            onClose();
        } catch (error) {
            console.error(error);
            // toast handled by parent or service usually, but good to ensure
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Davamiyyətə düzəliş et</h3>
                        <p className="text-sm text-gray-500">
                            {record.employee?.firstname} {record.employee?.lastname}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Time Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Gəlmə vaxtı</label>
                            <input
                                type="time"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                disabled={isAbsent || isRest}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Getmə vaxtı</label>
                            <input
                                type="time"
                                value={leaveTime}
                                onChange={(e) => setLeaveTime(e.target.value)}
                                disabled={isAbsent || isRest}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Switches */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-gray-900">Qayıb (Absent)</label>
                                <p className="text-xs text-gray-500">İşçinin tam gün iştirak etməməsi</p>
                            </div>
                            <Switch
                                checked={isAbsent}
                                onCheckedChange={handleAbsentChange}
                                disabled={isRest}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-gray-900">İstirahət (Rest)</label>
                                <p className="text-xs text-gray-500">Qeyri-iş günü və ya məzuniyyət</p>
                            </div>
                            <Switch
                                checked={isRest}
                                onCheckedChange={handleRestChange}
                                disabled={isAbsent}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-gray-900">Gecikmə (Late)</label>
                                <p className="text-xs text-gray-500">İşə gec gəlmə halı</p>
                            </div>
                            <Switch
                                checked={isLate}
                                onCheckedChange={handleLateChange}
                                disabled={isAbsent || isRest}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-gray-900">Erkən çıxış (Early Leave)</label>
                                <p className="text-xs text-gray-500">İşdən tez getmə halı</p>
                            </div>
                            <Switch
                                checked={isEarlyLeave}
                                onCheckedChange={handleEarlyLeaveChange}
                                disabled={isAbsent || isRest}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Ləğv et
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Yadda saxlanılır...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Yadda saxla
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
