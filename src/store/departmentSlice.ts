import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../lib/api';

export interface Department {
    id: number;
    name: string;
}

interface DepartmentState {
    items: Department[];
    isLoading: boolean;
    error: string | null;
}

const initialState: DepartmentState = {
    items: [],
    isLoading: false,
    error: null,
};

export const fetchDepartments = createAsyncThunk(
    'departments/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/department');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
        }
    }
);

export const createDepartment = createAsyncThunk(
    'departments/create',
    async (data: { name: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/department', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create department');
        }
    }
);

export const updateDepartment = createAsyncThunk(
    'departments/update',
    async ({ id, name }: { id: number; name: string }, { rejectWithValue }) => {
        try {
            await api.put(`/api/department/${id}`, { id, name });
            return { id, name };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update department');
        }
    }
);

export const deleteDepartment = createAsyncThunk(
    'departments/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/api/department/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete department');
        }
    }
);

const departmentSlice = createSlice({
    name: 'departments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchDepartments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateDepartment.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default departmentSlice.reducer;
