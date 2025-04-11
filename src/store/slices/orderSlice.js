import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../services/orderService';

// Async thunks
export const fetchOrderById = createAsyncThunk(
    'order/fetchById',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchAllOrders = createAsyncThunk(
    'order/fetchAll',
    async ({ page, keyword }, { rejectWithValue }) => {
        try {
            const response = await orderService.getAllOrders(page, keyword);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const response = await orderService.updateOrderStatus(orderId, status);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'order/cancel',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.cancelOrder(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchOrderAnalytics = createAsyncThunk(
    'order/fetchAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderAnalytics();
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const initialState = {
    currentOrder: null,
    orders: [],
    analytics: null,
    loading: false,
    error: null,
    page: 1,
    pages: 1
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrderState: (state) => {
            state.currentOrder = null;
            state.error = null;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Order By ID
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al obtener la orden';
            })
            // Fetch All Orders
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al obtener las órdenes';
            })
            // Update Order Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentOrder?._id === action.payload._id) {
                    state.currentOrder = action.payload;
                }
                state.orders = state.orders.map(order =>
                    order._id === action.payload._id ? action.payload : order
                );
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al actualizar el estado de la orden';
            })
            // Cancel Order
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentOrder?._id === action.payload._id) {
                    state.currentOrder = action.payload;
                }
                state.orders = state.orders.map(order =>
                    order._id === action.payload._id ? action.payload : order
                );
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al cancelar la orden';
            })
            // Fetch Order Analytics
            .addCase(fetchOrderAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(fetchOrderAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error al obtener analytics de órdenes';
            });
    }
});

export const { clearOrderState, setPage } = orderSlice.actions;
export default orderSlice.reducer; 