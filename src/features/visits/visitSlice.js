import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import visitService from '../../services/visitService';

// Obtener todas las visitas
export const fetchVisits = createAsyncThunk('visits/fetchVisits', async () => {
    const visits = await visitService.getVisits();
    return visits;
});

// Obtener visita por ID
export const fetchVisitById = createAsyncThunk('visits/fetchVisitById', async (id) => {
    const visit = await visitService.getVisitById(id);
    return visit;
});

// Crear una nueva visita
export const createVisit = createAsyncThunk('visits/createVisit', async (visitData) => {
    const visit = await visitService.trackVisit(visitData);
    return visit;
});

// Actualizar visita
export const updateVisit = createAsyncThunk('visits/updateVisit', async ({ id, visitData }) => {
    const visit = await visitService.updateVisit(id, visitData);
    return visit;
});

// Eliminar visita
export const deleteVisit = createAsyncThunk('visits/deleteVisit', async (id) => {
    const response = await visitService.deleteVisit(id);
    return response;
});

// Obtener estadísticas de visitas
export const fetchVisitStats = createAsyncThunk('visits/fetchVisitStats', async () => {
    const stats = await visitService.getVisitStats();
    return stats;
});

// Obtener análisis de visitas
export const fetchVisitAnalytics = createAsyncThunk('visits/fetchVisitAnalytics', async () => {
    const analytics = await visitService.getVisitAnalytics();
    return analytics;
});

const visitSlice = createSlice({
    name: 'visits',
    initialState: {
        visits: [],
        visit: null,
        loading: false,
        error: null,
        stats: null,
        analytics: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVisits.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchVisits.fulfilled, (state, action) => {
                state.loading = false;
                state.visits = action.payload;
            })
            .addCase(fetchVisits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchVisitById.fulfilled, (state, action) => {
                state.visit = action.payload;
            })
            .addCase(createVisit.fulfilled, (state, action) => {
                state.visits.push(action.payload);
            })
            .addCase(updateVisit.fulfilled, (state, action) => {
                const index = state.visits.findIndex(visit => visit._id === action.payload._id);
                if (index !== -1) {
                    state.visits[index] = action.payload;
                }
            })
            .addCase(deleteVisit.fulfilled, (state, action) => {
                state.visits = state.visits.filter(visit => visit._id !== action.payload._id);
            })
            .addCase(fetchVisitStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            .addCase(fetchVisitAnalytics.fulfilled, (state, action) => {
                state.analytics = action.payload;
            });
    },
});

export default visitSlice.reducer; 