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

export const statisticsService = {
    getStatisticsByEmployee: async (employeeId: string, start: string, end: string) => {
        const response = await api.get<StatisticsResponse>('/api/statistics/attendace/get-stats-by-employee', {
            params: {
                employeeId,
                start,
                end
            }
        });
        return response.data;
    }
};
