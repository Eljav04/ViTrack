import { api } from '../lib/api';

export interface WorkSchedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}

export interface CreateWorkScheduleDTO {
    name: string;
    startTime: string;
    endTime: string;
}

export interface UpdateWorkScheduleDTO extends CreateWorkScheduleDTO {
    id: number;
}

export const workScheduleService = {
    getAll: async () => {
        const response = await api.get<WorkSchedule[]>('/api/workschedule');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<WorkSchedule>(`/api/workschedule/${id}`);
        return response.data;
    },

    create: async (data: CreateWorkScheduleDTO) => {
        const response = await api.post<WorkSchedule>('/api/workschedule', data);
        return response.data;
    },

    update: async (id: number, data: UpdateWorkScheduleDTO) => {
        const response = await api.put(`/api/workschedule/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/workschedule/${id}`);
    }
};
