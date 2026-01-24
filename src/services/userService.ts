import { api } from '../lib/api';

export interface User {
    id: string; // GUID from backend
    firstname: string;
    lastname: string;
    login: string; // username/email
    role: string;
    department?: {
        id: number;
        name: string;
    } | null;
    workSchedule?: {
        id: number;
        name: string;
        startTime: string;
        endTime: string;
    } | null;
    isDeleted?: boolean;
}

export interface CreateUserDTO {
    login: string;
    firstname: string;
    lastname: string;
    password: string;
    role: 'User' | 'Admin';
}

export interface UpdateUserDTO {
    id: string;
    firstname: string;
    lastname: string;
    login: string;
    departmentId?: number | null;
    workScheduleId?: number | null;
}

export const userService = {
    getAllDetailed: async () => {
        const response = await api.get<User[]>('/api/user/all-detailed');
        return response.data;
    },

    getAll: async () => {
        const response = await api.get<User[]>('/api/user/all');
        return response.data;
    },

    create: async (data: CreateUserDTO) => {
        const endpoint = data.role === 'Admin' ? '/api/user/registr-admin' : '/api/user/registr';
        const response = await api.post(endpoint, {
            login: data.login,
            firstname: data.firstname,
            lastname: data.lastname, // Backend DTO likely expects 'Lastname' or 'Surname' based on DTO naming, but checking controller: `Surname = userRegistrDTO.Lastname`. So DTO property is likely `Lastname`
            password: data.password
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/api/user/delete/${id}`);
        return response.data;
    },

    update: async (data: UpdateUserDTO) => {
        const response = await api.put('/api/user/update', data);
        return response.data;
    },

    changePassword: async (id: string, newPassword: string) => {
        const response = await api.put(`/api/user/change-password/${id}`, JSON.stringify(newPassword), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<User>('/api/user/me');
        return response.data;
    }
};
