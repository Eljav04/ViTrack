import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import departmentReducer from './departmentSlice';
import workScheduleReducer from './workScheduleSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        departments: departmentReducer,
        workSchedules: workScheduleReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
