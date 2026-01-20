import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { workScheduleService, WorkSchedule, CreateWorkScheduleDTO, UpdateWorkScheduleDTO } from '../services/workScheduleService';

interface WorkScheduleState {
    items: WorkSchedule[];
    loading: boolean;
    error: string | null;
}

const initialState: WorkScheduleState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchWorkSchedules = createAsyncThunk(
    'workSchedules/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await workScheduleService.getAll();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gözlənilməz xəta baş verdi');
        }
    }
);

export const createWorkSchedule = createAsyncThunk(
    'workSchedules/create',
    async (data: CreateWorkScheduleDTO, { rejectWithValue }) => {
        try {
            return await workScheduleService.create(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Yaradılarkən xəta baş verdi');
        }
    }
);

export const updateWorkSchedule = createAsyncThunk(
    'workSchedules/update',
    async (data: UpdateWorkScheduleDTO, { rejectWithValue }) => {
        try {
            await workScheduleService.update(data.id, data);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Yenilənərkən xəta baş verdi');
        }
    }
);

export const deleteWorkSchedule = createAsyncThunk(
    'workSchedules/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await workScheduleService.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Silinərkən xəta baş verdi');
        }
    }
);

const workScheduleSlice = createSlice({
    name: 'workSchedules',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch
        builder.addCase(fetchWorkSchedules.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchWorkSchedules.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
        });
        builder.addCase(fetchWorkSchedules.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create
        builder.addCase(createWorkSchedule.fulfilled, (state, action) => {
            state.items.push(action.payload);
        });

        // Update
        builder.addCase(updateWorkSchedule.fulfilled, (state, action) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload };
            }
        });

        // Delete
        builder.addCase(deleteWorkSchedule.fulfilled, (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        });
    },
});

export default workScheduleSlice.reducer;
