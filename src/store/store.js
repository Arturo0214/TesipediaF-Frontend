import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '../features/auth/authSlice';
import orderReducer from '../features/orders/orderSlice';
import paymentReducer from '../features/payments/paymentSlice';
import quoteReducer from '../features/quotes/quoteSlice';
import visitReducer from '../features/visits/visitsSlice';
import chatReducer from '../features/chat/chatSlice'; // 👈

import { persistReducer as persistReducerChat } from 'redux-persist';

// 🔥 Especialmente para el chat
const chatPersistConfig = {
    key: 'chat',
    storage,
    blacklist: ['socket', 'isConnected'], //  No guardar socket ni isConnected
};

// Reducers combinados
const rootReducer = combineReducers({
    auth: authReducer,
    orders: orderReducer,
    payments: paymentReducer,
    quotes: quoteReducer,
    visits: visitReducer,
    chat: persistReducerChat(chatPersistConfig, chatReducer), // ✅ Persistir chat ignorando socket
});

// Configuración de persistencia global
const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['chat'], // 🔥 Evitamos persistir dos veces el chat, ya lo hacemos arriba
};

// Reducer principal persistido
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
