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
      return rejectWithValue(error.response?.data?.message || 'Error al calcular costos automáticos');
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
      return rejectWithValue(error.response?.data?.message || 'Error al cargar categorías');
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
    syncResult: null,
    syncing: false,
    loading: false,
    expensesLoading: false,
    error: null,
  },
  reducers: {
    clearRevenueError: (state) => {
      state.error = null;
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
      .addCase(syncProviders.pending, (state) => { state.syncing = true; state.syncResult = null; })
      .addCase(syncProviders.fulfilled, (state, action) => { state.syncing = false; state.syncResult = action.payload; })
      .addCase(syncProviders.rejected, (state, action) => { state.syncing = false; state.error = action.payload; })

      // Sync status
      .addCase(fetchSyncStatus.fulfilled, (state, action) => { state.syncStatus = action.payload; })

      // Auto-calculate costs
      .addCase(autoCalculateCosts.fulfilled, (state, action) => {
        if (action.payload.expenses) {
          state.expenses.unshift(...action.payload.expenses);
        }
      });
  },
});

export const { clearRevenueError } = revenueSlice.actions;
export default revenueSlice.reducer;
