import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { attendanceService } from '../services/attendanceService';

export interface AttendanceState {
    today: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: AttendanceState = {
    today: null,
    loading: false,
    error: null,
};

export const fetchTodayRecord = createAsyncThunk('attendance/fetchToday', async () => {
    const data = await attendanceService.getToday();
    return data;
});

export const submitCheckIn = createAsyncThunk(
    'attendance/checkIn',
    async (payload: { arrivalImg?: Blob | null; arrivalLatitude?: number | null; arrivalLongitude?: number | null; lateReason?: string | null; arrivalTime: string }) => {
        const data = await attendanceService.submitCheckIn(payload);
        return data;
    }
);

export const submitCheckOut = createAsyncThunk(
    'attendance/checkOut',
    async (payload: { leaveImg?: Blob | null; leaveLatitude?: number | null; leaveLongitude?: number | null; earlyLeaveReason?: string | null; leaveTime: string }) => {
        const data = await attendanceService.submitCheckOut(payload);
        return data;
    }
);

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        clearToday(state) {
            state.today = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodayRecord.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTodayRecord.fulfilled, (state, action: PayloadAction<any>) => {
                state.today = action.payload;
                state.loading = false;
            })
            .addCase(fetchTodayRecord.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch';
            })
            .addCase(submitCheckIn.fulfilled, (state, action: PayloadAction<any>) => {
                state.today = action.payload;
            })
            .addCase(submitCheckOut.fulfilled, (state, action: PayloadAction<any>) => {
                state.today = action.payload;
            });
    },
});

export const { clearToday } = attendanceSlice.actions;
export default attendanceSlice.reducer;
