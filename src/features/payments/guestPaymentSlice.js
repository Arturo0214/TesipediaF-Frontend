import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as paymentService from '../../services/paymentService';

// Async thunks
export const createPaymentSession = createAsyncThunk(
    'payment/createSession',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await paymentService.createStripeSession(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const processGuestPayment = createAsyncThunk(
    'payment/processGuestPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await paymentService.createGuestPayment(paymentData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const checkPaymentStatus = createAsyncThunk(
    'payment/checkStatus',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await paymentService.checkPaymentStatus(sessionId);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const checkGuestPaymentStatus = createAsyncThunk(
    'payment/checkGuestStatus',
    async (trackingToken, { rejectWithValue }) => {
        try {
            const response = await paymentService.checkGuestPaymentStatus(trackingToken);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Initial state
const initialState = {
    currentPayment: null,
    paymentHistory: [],
    loading: false,
    error: null,
    paymentStatus: null,
    sessionUrl: null,
    trackingToken: null,
    paymentDetails: null,
    lastUpdated: null
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearPaymentState: () => initialState,
        setPaymentStatus: (state, action) => {
            state.paymentStatus = action.payload;
        },
        setTrackingToken: (state, action) => {
            state.trackingToken = action.payload;
        },
        updatePaymentDetails: (state, action) => {
            state.paymentDetails = {
                ...state.paymentDetails,
                ...action.payload
            };
            state.lastUpdated = new Date().toISOString();
        }
    },
    extraReducers: (builder) => {
        builder
            // Crear sesión normal
            .addCase(createPaymentSession.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.sessionUrl = null;
            })
            .addCase(createPaymentSession.fulfilled, (state, action) => {
                state.loading = false;
                state.sessionUrl = action.payload.sessionUrl;
                state.currentPayment = action.payload;
                state.error = null;
            })
            .addCase(createPaymentSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al crear la sesión de pago';
                state.sessionUrl = null;
            })

            // Pago de invitado
            .addCase(processGuestPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.sessionUrl = null;
                state.trackingToken = null;
            })
            .addCase(processGuestPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.sessionUrl = action.payload.url || action.payload.sessionUrl;
                state.trackingToken = action.payload.trackingToken;
                state.error = null;
                state.currentPayment = action.payload;
            })
            .addCase(processGuestPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al procesar el pago';
                state.sessionUrl = null;
                state.trackingToken = null;
            })

            // Verificar estado de pago normal
            .addCase(checkPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentStatus = action.payload.status;
                state.error = null;
                if (action.payload.details) {
                    state.paymentDetails = action.payload.details;
                }
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(checkPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al verificar el estado del pago';
            })

            // Verificar estado de pago de invitado
            .addCase(checkGuestPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkGuestPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;

                // Manejar diferentes estados de respuesta
                if (action.payload.status === 'rate_limited') {
                    state.error = action.payload.message;
                    return;
                }

                // Actualizar el estado de pago - Asegurarse de que se actualice correctamente
                state.paymentStatus = action.payload.status;

                state.paymentDetails = {
                    amount: action.payload.amount,
                    createdAt: action.payload.createdAt,
                    updatedAt: action.payload.updatedAt,
                    message: action.payload.message
                };
                state.lastUpdated = new Date().toISOString();

                // Limpiar error si había uno
                if (state.error && action.payload.status !== 'failed') {
                    state.error = null;
                }
            })
            .addCase(checkGuestPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al verificar el estado del pago';

                // Si es un error de red o del servidor, mantener el último estado conocido
                if (action.payload?.status >= 500) {
                    console.warn("Error del servidor al verificar estado, manteniendo último estado conocido");
                } else {
                    state.paymentStatus = 'error';
                }
            });
    }
});

export const { clearPaymentState, setPaymentStatus, setTrackingToken, updatePaymentDetails } = paymentSlice.actions;

export default paymentSlice.reducer;
