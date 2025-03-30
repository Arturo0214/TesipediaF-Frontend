import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    payments: [],
    payment: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
};

export const createPayment = createAsyncThunk(
    'payments/create',
    async (paymentData, thunkAPI) => {
        try {
            // Aquí irá la llamada a la API
            return paymentData;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPayment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPayment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.payments.push(action.payload);
            })
            .addCase(createPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = paymentSlice.actions;
export default paymentSlice.reducer;
