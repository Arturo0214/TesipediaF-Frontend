import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import visitsReducer from '../features/visits/visitsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        visits: visitsReducer
    }
}); 