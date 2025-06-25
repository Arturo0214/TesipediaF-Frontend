import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as paymentService from '../../services/paymentService';
import quoteService from '../../services/quoteService';

const initialState = {
    payments: [],
    payment: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    sessionUrl: null,
    order: null
};

// Create order from quote and then create payment session
export const createPaymentSession = createAsyncThunk(
    'payments/createSession',
    async ({ publicId }, thunkAPI) => {
        try {
            console.log('Starting payment session creation for quote:', publicId);

            // First try to link the quote to the user
            try {
                console.log('Linking quote to user...');
                await quoteService.linkQuoteToUser(publicId);
                console.log('Quote linked successfully');
            } catch (error) {
                // If the error is that the quote is already linked, continue with the flow
                // Otherwise, rethrow the error
                if (error.response?.status !== 400 || !error.response?.data?.message?.includes('ya está vinculada')) {
                    throw error;
                }
                console.log('Quote was already linked to user, continuing...');
            }

            // Get the quote details to properly format the data
            console.log('Getting quote details...');
            const quoteResponse = await quoteService.getQuoteByPublicId(publicId);
            const quote = quoteResponse;

            // Format the data according to the Order model schema
            const orderData = {
                requirements: {
                    text: quote.requirements?.text || '',
                    file: quote.requirements?.file?.path || ''
                },
                price: Number(quote.priceDetails?.finalPrice || quote.estimatedPrice || 0)
            };

            // Then create the order from the quote with formatted data
            console.log('Creating order from quote...');
            const orderResponse = await paymentService.createOrderFromQuote(publicId, orderData);
            console.log('Order created:', orderResponse);

            // Get the order ID, whether it's a new order or an existing one
            const orderId = orderResponse.order._id;
            console.log('Using order ID:', orderId);

            // Finally create the payment session with the order ID
            console.log('Creating Stripe session...');
            const sessionResponse = await paymentService.createStripeSession(orderId);
            console.log('Session created:', sessionResponse);

            return {
                order: orderResponse.order,
                sessionUrl: sessionResponse.url
            };
        } catch (error) {
            console.error('Full error object:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
            console.error('Payment session creation error:', errorMessage);
            return thunkAPI.rejectWithValue(errorMessage);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
            state.sessionUrl = null;
            state.order = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPaymentSession.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(createPaymentSession.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.sessionUrl = action.payload.sessionUrl;
                state.order = action.payload.order;
            })
            .addCase(createPaymentSession.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = paymentSlice.actions;
export default paymentSlice.reducer;
