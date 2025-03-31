import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '../features/auth/authSlice';
import orderReducer from '../features/orders/orderSlice';
import paymentReducer from '../features/payments/paymentSlice';
import quoteReducer from '../features/quotes/quoteSlice';
import visitReducer from '../features/visits/visitSlice';

// ✅ Combinar reducers primero
const rootReducer = combineReducers({
    auth: authReducer,
    orders: orderReducer,
    payments: paymentReducer,
    quotes: quoteReducer,
    visits: visitReducer,
});

// Configuración de persistencia
const persistConfig = {
    key: 'root',
    storage,
};

// ✅ Crear reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

const persistor = persistStore(store);

export { store, persistor };
