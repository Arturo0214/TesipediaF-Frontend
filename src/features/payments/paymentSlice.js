import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

// Thunks
export const checkPaymentStatus = createAsyncThunk(
    'payment/checkStatus',
    async ({ orderId }, { rejectWithValue }) => {
        try {
            const response = await paymentService.checkPaymentStatus(orderId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al verificar el estado del pago');
        }
    }
);

export const createPaymentSession = createAsyncThunk(
    'payment/createSession',
    async ({ publicId }, { rejectWithValue }) => {
        try {
            console.log('Starting payment session creation for quote:', publicId);

            // 1. Link quote to user
            console.log('Linking quote to user...');
            try {
                await paymentService.linkQuoteToUser(publicId);
                console.log('Quote linked to user successfully');
            } catch (error) {
                if (error.response?.status === 400 && error.response?.data?.message?.includes('already linked')) {
                    console.log('Quote was already linked to user, continuing...');
                } else {
                    throw error;
                }
            }

            // 2. Get quote details
            console.log('Getting quote details...');
            const quoteResponse = await paymentService.getQuoteDetails(publicId);
            const quote = quoteResponse.data;

            // 3. Create or get existing order
            console.log('Creating order from quote...');
            const orderResponse = await paymentService.createOrderFromQuote(publicId);
            console.log('Order created:', orderResponse.data);
            const orderId = orderResponse.data.order._id;
            console.log('Using order ID:', orderId);

            // 4. Create Stripe session
            console.log('Creating Stripe session...');
            const sessionResponse = await paymentService.createStripeSession(orderId);
            console.log('Session created:', sessionResponse);

            return {
                sessionUrl: sessionResponse.data.url,
                orderId: orderId
            };
        } catch (error) {
            console.error('Error in createPaymentSession:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data || 'Error al crear la sesión de pago');
        }
    }
);

const initialState = {
    paymentStatus: null,
    sessionUrl: null,
    loading: false,
    error: null,
    orderId: null
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearPaymentState: (state) => {
            state.paymentStatus = null;
            state.sessionUrl = null;
            state.loading = false;
            state.error = null;
            state.orderId = null;
        }
    },
    extraReducers: (builder) => {
        // Check Payment Status
        builder
            .addCase(checkPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentStatus = action.payload.status;
                state.error = null;
            })
            .addCase(checkPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error al verificar el estado del pago';
            })
            // Create Payment Session
            .addCase(createPaymentSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaymentSession.fulfilled, (state, action) => {
                state.loading = false;
                state.sessionUrl = action.payload.sessionUrl;
                state.orderId = action.payload.orderId;
                state.error = null;
            })
            .addCase(createPaymentSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error al crear la sesión de pago';
            });
    }
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
