import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quoteService from '../../services/quoteService';

const initialState = {
    quotes: [],
    quote: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

// Crear cotización
export const createQuote = createAsyncThunk(
    'quotes/create',
    async (quoteData, thunkAPI) => {
        try {
            return await quoteService.createQuote(quoteData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Obtener cotizaciones del usuario
export const getMyQuotes = createAsyncThunk(
    'quotes/getMyQuotes',
    async (_, thunkAPI) => {
        try {
            return await quoteService.getMyQuotes();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Obtener una cotización específica
export const getQuoteById = createAsyncThunk(
    'quotes/getQuote',
    async (id, thunkAPI) => {
        try {
            return await quoteService.getQuoteById(id);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const quoteSlice = createSlice({
    name: 'quotes',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Quote
            .addCase(createQuote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createQuote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.quote = action.payload;
            })
            .addCase(createQuote.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get My Quotes
            .addCase(getMyQuotes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMyQuotes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.quotes = action.payload;
            })
            .addCase(getMyQuotes.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get Quote By Id
            .addCase(getQuoteById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getQuoteById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.quote = action.payload;
            })
            .addCase(getQuoteById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = quoteSlice.actions;
export default quoteSlice.reducer; 