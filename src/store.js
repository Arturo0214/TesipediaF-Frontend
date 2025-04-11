import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './features/notifications/notificationSlice';

export const store = configureStore({
    reducer: {
        notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
}); 