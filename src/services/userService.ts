import { api } from '../lib/api';

export interface User {
    id: string; // GUID from backend
    firstname: string;
    lastname: string; // Backend uses 'Surname' in DTO, mapped to lastname
    login: string; // username/email
    role: string;
    department?: string; // from all-detailed
    position?: string; // from all-detailed
    startTime?: string; // from all-detailed
    endTime?: string; // from all-detailed
    isDeleted?: boolean;
}

export interface CreateUserDTO {
    login: string;
    firstname: string;
    lastname: string;
    password: string;
    role: 'User' | 'Admin';
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
    }
};
