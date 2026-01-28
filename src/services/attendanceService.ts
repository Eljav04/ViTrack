import { api } from '../lib/api';

export interface Employee {
    id: string;
    firstname: string;
    lastname: string;
    departmentName: string;
}

export interface Location {
    longitude: number;
    latitude: number;
    address?: string;
}

export interface AttendanceItem {
    id: number;
    employee: Employee;
    date: string;
    arrivalTime: string | null;
    leaveTime: string | null;
    qrApprovedArrival: boolean;
    qrApprovedLeave: boolean;
    locationApprovedArrival: boolean;
    arrivalLocation: Location | null;
    locationApprovedLeave: boolean;
    leaveLocation: Location | null;
    arrivalImage: string | null;
    leaveImage: string | null;
    lateReason: string | null;
    earlyLeaveReason: string | null;
    isLate: boolean;
    isEarlyLeave: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MetaData {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface AttendanceResponse {
    items: AttendanceItem[];
    metaData: MetaData;
}

export const attendanceService = {
    getAll: async (pageNumber: number = 1, pageSize: number = 20): Promise<AttendanceResponse> => {
        const response = await api.get<AttendanceResponse>('/api/attendance-record/all', {
            params: {
                PageNumber: pageNumber,
                PageSize: pageSize,
            },
        });
        return response.data;
    },

    getMyRecords: async (pageNumber: number = 1, pageSize: number = 20): Promise<AttendanceResponse> => {
        const response = await api.get<AttendanceResponse>('/api/attendance-record/get-my-records', {
            params: {
                PageNumber: pageNumber,
                PageSize: pageSize,
            },
        });
        return response.data;
    },

    getToday: async (): Promise<AttendanceItem | null> => {
        try {
            const response = await api.get<AttendanceItem>('/api/attendance-record/get-current-status');
            return response.data;
        } catch (error) {
            return null;
        }
    },

    submitCheckIn: async (data: { arrivalImg?: Blob | null; arrivalLatitude?: number | null; arrivalLongitude?: number | null; lateReason?: string | null; arrivalTime: string }) => {
        const formData = new FormData();

        formData.append('ArrivalTime', data.arrivalTime);

        if (data.arrivalImg) {
            formData.append('ArrivalImg', data.arrivalImg, 'checkin.jpg');
        }

        if (data.arrivalLatitude !== null && data.arrivalLatitude !== undefined) {
            formData.append('ArrivalLatitude', data.arrivalLatitude.toString());
        }
        if (data.arrivalLongitude !== null && data.arrivalLongitude !== undefined) {
            formData.append('ArrivalLongitude', data.arrivalLongitude.toString());
        }

        if (data.lateReason) {
            formData.append('LateReason', data.lateReason);
        }

        const response = await api.post('/api/attendance-record/check-in', formData);
        return response.data;
    },

    submitCheckOut: async (data: { leaveImg?: Blob | null; leaveLatitude?: number | null; leaveLongitude?: number | null; earlyLeaveReason?: string | null; leaveTime: string }) => {
        const formData = new FormData();

        formData.append('LeaveTime', data.leaveTime);

        if (data.leaveImg) {
            formData.append('LeaveImg', data.leaveImg, 'checkout.jpg');
        }

        if (data.leaveLatitude !== null && data.leaveLatitude !== undefined) {
            formData.append('LeaveLatitude', data.leaveLatitude.toString());
        }
        if (data.leaveLongitude !== null && data.leaveLongitude !== undefined) {
            formData.append('LeaveLongitude', data.leaveLongitude.toString());
        }

        if (data.earlyLeaveReason) {
            formData.append('EarlyLeaveReason', data.earlyLeaveReason);
        }

        const response = await api.post('/api/attendance-record/check-out', formData);
        return response.data;
    },
};
