import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import visitService from '../../services/visitService';

// Thunks
export const trackVisit = createAsyncThunk(
    'visits/trackVisit',
    async (visitData, thunkAPI) => {
        try {
            return await visitService.trackVisit(visitData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getVisits = createAsyncThunk(
    'visits/getVisits',
    async (_, thunkAPI) => {
        try {
            return await visitService.getVisits();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    visits: [],
    loading: false,
    error: null,
    lastVisit: null
};

const visitsSlice = createSlice({
    name: 'visits',
    initialState,
    reducers: {
        clearVisits: (state) => {
            state.visits = [];
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Track Visit
            .addCase(trackVisit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(trackVisit.fulfilled, (state, action) => {
                state.loading = false;
                state.lastVisit = action.payload;
                state.visits.push(action.payload);
            })
            .addCase(trackVisit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Visits
            .addCase(getVisits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVisits.fulfilled, (state, action) => {
                state.loading = false;
                state.visits = action.payload;
            })
            .addCase(getVisits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearVisits, clearError } = visitsSlice.actions;
export default visitsSlice.reducer; 