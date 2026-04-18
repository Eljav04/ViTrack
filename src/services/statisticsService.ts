import { api } from '../lib/api';

export interface StatisticsResponse {
    wholeDays: number;
    workDays: number;
    restDays: number;
    absentDays: number;
    lateCount: number;
    earlyLeaveCount: number;
    workHours: number;
    overtimeHours: number;
    missingDates: string[];
}


export interface EmployeeDailyStatus {
    id: string;
    firstname: string;
    lastname: string;
    departmentName: string;
    checkInTime: string | null;
    isLate: boolean;
    isRest: boolean;
    isAbsent: boolean;
}

export interface DepartmentDailyStats {
    id: number;
    name: string;
    totalEmployees: number;
    presentEmployees: number;
    lateCount: number;
}

export interface TodayOverallStatisticsResponse {
    totalEmployees: number;
    presentEmployees: number;
    absentEmployees: number;
    restEmployees: number;
    lateArrivalsCount: number;
    employeesList: EmployeeDailyStatus[];
    departmentsList: DepartmentDailyStats[];
}

export const statisticsService = {
    getStatisticsByEmployee: async (employeeId: string, start: string, end: string) => {
        const response = await api.get<StatisticsResponse>('/api/statistics/attendance/get-stats-by-employee', {
            params: {
                employeeId,
                start,
                end
            }
        });
        return response.data;
    },

    getMyStats: async (start: string, end: string) => {
        const response = await api.get<StatisticsResponse>('/api/statistics/attendance/get-my-stats', {
            params: {
                start,
                end
            }
        });
        return response.data;
    },

    getTodayOverall: async () => {
        const response = await api.get<TodayOverallStatisticsResponse>('/api/statistics/attendance/get-today-overall');
        return response.data;
    },

    getOverallMonthlyStats: async () => {
        const response = await api.get<StatisticsResponse>('/api/statistics/attendance/get-overall-monthly-stats');
        return response.data;
    },

    getMyOverallMonthlyStats: async () => {
        const response = await api.get<StatisticsResponse>('/api/statistics/attendance/get-my-overall-monthly-stats');
        return response.data;
    }
};

