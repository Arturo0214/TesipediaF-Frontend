import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import orderReducer from '../features/orders/orderSlice';
import paymentReducer from '../features/payments/paymentSlice';
import quoteReducer from '../features/quotes/quoteSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        orders: orderReducer,
        payments: paymentReducer,
        quotes: quoteReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export default store; 