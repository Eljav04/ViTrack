import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService, User, CreateUserDTO } from '../services/userService';

interface UserState {
    items: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            // Try detailed first, fallback to simple if needed or just use detailed
            const data = await userService.getAllDetailed();
            return data;
        } catch (error: any) {
            // If detailed fails (e.g. 403 or server error), maybe try simple? 
            // For now, let's stick to simple error handling
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (data: CreateUserDTO, { rejectWithValue, dispatch }) => {
        try {
            await userService.create(data);
            // Backend doesn't return the created user object suitable for the list immediately (missing ID usually in identity)
            // So we re-fetch the list to be safe and accurate
            dispatch(fetchUsers());
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id: string, { rejectWithValue }) => {
        try {
            await userService.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteUser.pending, (state) => {
                state.loading = true; // Optional: maybe we don't want global loading for delete or we want optimistic?
                // Let's keep it simple
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default userSlice.reducer;
