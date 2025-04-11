import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import visitsReducer from '../features/visits/visitsSlice';
import quoteReducer from '../features/quotes/quoteSlice';

// Configuración de persistencia para auth
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isAuthenticated']
};

// Configuración de persistencia para quotes
const quotePersistConfig = {
    key: 'quotes',
    storage,
    whitelist: ['quote', 'formData']
};

// Reducers con persistencia
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedQuoteReducer = persistReducer(quotePersistConfig, quoteReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        chat: chatReducer,
        visits: visitsReducer,
        quotes: persistedQuoteReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
});

export const persistor = persistStore(store); 