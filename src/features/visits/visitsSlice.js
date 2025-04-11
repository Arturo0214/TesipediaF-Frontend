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
            // Check if admin in state
            const { auth } = thunkAPI.getState();
            if (!auth.isAdmin) {
                return thunkAPI.rejectWithValue('Permission denied: Admin access required');
            }
            return await visitService.getVisits();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// New thunks for admin functionality
export const getVisitStats = createAsyncThunk(
    'visits/getStats',
    async (_, thunkAPI) => {
        try {
            // Check if admin in state
            const { auth } = thunkAPI.getState();
            if (!auth.isAdmin) {
                return thunkAPI.rejectWithValue('Permission denied: Admin access required');
            }
            return await visitService.getVisitStats();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getVisitAnalytics = createAsyncThunk(
    'visits/getAnalytics',
    async (_, thunkAPI) => {
        try {
            // Check if admin in state
            const { auth } = thunkAPI.getState();
            if (!auth.isAdmin) {
                return thunkAPI.rejectWithValue('Permission denied: Admin access required');
            }
            return await visitService.getVisitAnalytics();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteVisit = createAsyncThunk(
    'visits/deleteVisit',
    async (id, thunkAPI) => {
        try {
            // Check if admin in state
            const { auth } = thunkAPI.getState();
            if (!auth.isAdmin) {
                return thunkAPI.rejectWithValue('Permission denied: Admin access required');
            }
            await visitService.deleteVisit(id);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    visits: [],
    loading: false,
    error: null,
    lastVisit: null,
    stats: null,
    analytics: null
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
            })
            // Get Visit Stats (Admin)
            .addCase(getVisitStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVisitStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(getVisitStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Visit Analytics (Admin)
            .addCase(getVisitAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVisitAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(getVisitAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Visit (Admin)
            .addCase(deleteVisit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVisit.fulfilled, (state, action) => {
                state.loading = false;
                state.visits = state.visits.filter(visit => visit._id !== action.payload);
            })
            .addCase(deleteVisit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearVisits, clearError } = visitsSlice.actions;
export default visitsSlice.reducer; 