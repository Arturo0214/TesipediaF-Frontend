import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '../features/auth/authSlice';
import paymentReducer from '../features/payments/paymentSlice';
import guestPaymentReducer from '../features/payments/guestPaymentSlice';
import quoteReducer from '../features/quotes/quoteSlice';
import visitReducer from '../features/visits/visitsSlice';
import chatReducer from '../features/chat/chatSlice';
import notificationsReducer from '../features/notifications/notificationSlice';
import userReducer from '../features/auth/userSlice';

// Especialmente para el chat
const chatPersistConfig = {
    key: 'chat',
    storage,
    blacklist: ['socket', 'isConnected'],
};

// Reducers combinados
const rootReducer = combineReducers({
    auth: authReducer,
    payments: paymentReducer,
    guestPayments: guestPaymentReducer,
    quotes: quoteReducer,
    visits: visitReducer,
    notifications: notificationsReducer,
    users: userReducer,
    chat: persistReducer(chatPersistConfig, chatReducer), // ✅ Persistir chat ignorando socket
});

// Configuración de persistencia global
const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['chat'], // 🔥 Evitamos persistir dos veces el chat
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
