import { api } from '../lib/api';

export const attendanceService = {
    getToday: async () => {
        const res = await api.get('/api/attendance-record/get-current-status');
        return res.data;
    },

    submitCheckIn: async (payload: {
        arrivalImg?: Blob | null;
        arrivalLatitude?: number | null;
        arrivalLongitude?: number | null;
        lateReason?: string | null;
    }) => {
        const form = new FormData();
        if (payload.arrivalImg) form.append('ArrivalImg', payload.arrivalImg, 'photo.jpg');
        if (payload.arrivalLatitude != null) form.append('ArrivalLatitude', String(payload.arrivalLatitude));
        if (payload.arrivalLongitude != null) form.append('ArrivalLongitude', String(payload.arrivalLongitude));
        if (payload.lateReason) form.append('LateReason', payload.lateReason);

        const res = await api.post('/api/attendance-record/check-in', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    submitCheckOut: async (payload: {
        leaveImg?: Blob | null;
        leaveLatitude?: number | null;
        leaveLongitude?: number | null;
        earlyLeaveReason?: string | null;
    }) => {
        const form = new FormData();
        if (payload.leaveImg) form.append('LeaveImg', payload.leaveImg, 'photo.jpg');
        if (payload.leaveLatitude != null) form.append('LeaveLatitude', String(payload.leaveLatitude));
        if (payload.leaveLongitude != null) form.append('LeaveLongitude', String(payload.leaveLongitude));
        if (payload.earlyLeaveReason) form.append('EarlyLeaveReason', payload.earlyLeaveReason);

        const res = await api.post('/api/attendance-record/check-out', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },
};
