import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import revenueService from '../../services/revenueService';

// ── Thunks ──────────────────────────────────────────

export const fetchRevenueDashboard = createAsyncThunk(
  'revenue/fetchDashboard',
  async ({ year, month } = {}, { rejectWithValue }) => {
    try {
      return await revenueService.getDashboard(year, month);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar dashboard de revenue');
    }
  }
);

export const fetchExpenses = createAsyncThunk(
  'revenue/fetchExpenses',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await revenueService.getExpenses(filters);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar gastos');
    }
  }
);

export const createExpense = createAsyncThunk(
  'revenue/createExpense',
  async (data, { rejectWithValue }) => {
    try {
      return await revenueService.createExpense(data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear gasto');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'revenue/updateExpense',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await revenueService.updateExpense(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar gasto');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'revenue/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await revenueService.deleteExpense(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar gasto');
    }
  }
);

export const fetchCostPerSale = createAsyncThunk(
  'revenue/fetchCostPerSale',
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      return await revenueService.getCostPerSale(startDate, endDate);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar costo por venta');
    }
  }
);

export const autoCalculateCosts = createAsyncThunk(
  'revenue/autoCalculateCosts',
  async (paymentId, { rejectWithValue }) => {
    try {
      return await revenueService.autoCalculateCosts(paymentId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al calcular costos automaticos');
    }
  }
);

export const syncProviders = createAsyncThunk(
  'revenue/syncProviders',
  async ({ year, month } = {}, { rejectWithValue }) => {
    try {
      return await revenueService.syncProviders(year, month);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al sincronizar proveedores');
    }
  }
);

export const fetchSyncStatus = createAsyncThunk(
  'revenue/fetchSyncStatus',
  async (_, { rejectWithValue }) => {
    try {
      return await revenueService.getSyncStatus();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estado de sync');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'revenue/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await revenueService.getCategories();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar categorias');
    }
  }
);

export const fetchCampaigns = createAsyncThunk(
  'revenue/fetchCampaigns',
  async ({ year, month } = {}, { rejectWithValue }) => {
    try {
      return await revenueService.getCampaigns(year, month);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar campañas');
    }
  }
);

export const fetchUsage = createAsyncThunk(
  'revenue/fetchUsage',
  async (_, { rejectWithValue }) => {
    try {
      return await revenueService.getUsage();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar uso de servicios');
    }
  }
);

export const cleanupDuplicates = createAsyncThunk(
  'revenue/cleanupDuplicates',
  async ({ year, month } = {}, { rejectWithValue }) => {
    try {
      return await revenueService.cleanupDuplicates(year, month);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al limpiar duplicados');
    }
  }
);

// ── Slice ────────────────────────────────────────────

const revenueSlice = createSlice({
  name: 'revenue',
  initialState: {
    dashboard: null,
    expenses: [],
    pagination: null,
    costPerSale: null,
    categories: [],
    syncStatus: null,
    syncStatusLoading: false,
    syncResult: null,
    syncError: null,
    syncing: false,
    cleanupResult: null,
    cleanupLoading: false,
    campaigns: null,
    campaignsLoading: false,
    campaignsError: null,
    usage: null,
    usageLoading: false,
    loading: false,
    expensesLoading: false,
    error: null,
  },
  reducers: {
    clearRevenueError: (state) => {
      state.error = null;
      state.syncError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchRevenueDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRevenueDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload; })
      .addCase(fetchRevenueDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Expenses list
      .addCase(fetchExpenses.pending, (state) => { state.expensesLoading = true; })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expensesLoading = false;
        state.expenses = action.payload.expenses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => { state.expensesLoading = false; state.error = action.payload; })

      // Create expense
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })

      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const idx = state.expenses.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.expenses[idx] = action.payload;
      })

      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
      })

      // Cost per sale
      .addCase(fetchCostPerSale.pending, (state) => { state.loading = true; })
      .addCase(fetchCostPerSale.fulfilled, (state, action) => { state.loading = false; state.costPerSale = action.payload; })
      .addCase(fetchCostPerSale.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; })

      // Sync providers
      .addCase(syncProviders.pending, (state) => { state.syncing = true; state.syncResult = null; state.syncError = null; })
      .addCase(syncProviders.fulfilled, (state, action) => { state.syncing = false; state.syncResult = action.payload; state.syncError = null; })
      .addCase(syncProviders.rejected, (state, action) => { state.syncing = false; state.syncError = action.payload; })

      // Sync status
      .addCase(fetchSyncStatus.pending, (state) => { state.syncStatusLoading = true; })
      .addCase(fetchSyncStatus.fulfilled, (state, action) => { state.syncStatusLoading = false; state.syncStatus = action.payload; })
      .addCase(fetchSyncStatus.rejected, (state, action) => { state.syncStatusLoading = false; state.error = action.payload; })

      // Auto-calculate costs
      .addCase(autoCalculateCosts.fulfilled, (state, action) => {
        if (action.payload.expenses) {
          state.expenses.unshift(...action.payload.expenses);
        }
      })

      // Campaigns
      .addCase(fetchCampaigns.pending, (state) => { state.campaignsLoading = true; state.campaignsError = null; })
      .addCase(fetchCampaigns.fulfilled, (state, action) => { state.campaignsLoading = false; state.campaigns = action.payload; })
      .addCase(fetchCampaigns.rejected, (state, action) => { state.campaignsLoading = false; state.campaignsError = action.payload; })

      // Usage
      .addCase(fetchUsage.pending, (state) => { state.usageLoading = true; })
      .addCase(fetchUsage.fulfilled, (state, action) => { state.usageLoading = false; state.usage = action.payload; })
      .addCase(fetchUsage.rejected, (state, action) => { state.usageLoading = false; state.error = action.payload; })

      // Cleanup duplicates
      .addCase(cleanupDuplicates.pending, (state) => { state.cleanupLoading = true; state.cleanupResult = null; })
      .addCase(cleanupDuplicates.fulfilled, (state, action) => { state.cleanupLoading = false; state.cleanupResult = action.payload; })
      .addCase(cleanupDuplicates.rejected, (state, action) => { state.cleanupLoading = false; state.error = action.payload; });
  },
});

export const { clearRevenueError } = revenueSlice.actions;
export default revenueSlice.reducer;
