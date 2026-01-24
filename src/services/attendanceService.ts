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
};
