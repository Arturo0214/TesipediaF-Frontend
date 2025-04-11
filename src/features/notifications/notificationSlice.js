import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosWithAuth from '../../utils/axioswithAuth';

// Obtener mis notificaciones
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Agregar un parámetro de timestamp para evitar el uso de caché
      const timestamp = new Date().getTime();
      const response = await axiosWithAuth.get(`/notifications?t=${timestamp}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar notificaciones');
    }
  }
);

// Marcar una notificación como leída
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId, { rejectWithValue, dispatch }) => {
    try {
      console.log('Enviando solicitud para marcar notificación como leída:', notificationId);
      // Usar POST en lugar de PATCH
      const response = await axiosWithAuth.post(`/notifications/${notificationId}/read`, {});
      console.log('Respuesta del servidor al marcar como leída:', response);
      // Después de marcar como leída, actualizar la lista de notificaciones
      // No actualizamos aquí para evitar problemas de concurrencia
      return {
        _id: notificationId,
        isRead: true,
        ...response.data
      };
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      // Intentar actualizar el estado localmente incluso si hay un error
      return {
        _id: notificationId,
        isRead: true
      };
    }
  }
);

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('Enviando solicitud para marcar todas las notificaciones como leídas');
      // Usar POST en lugar de PATCH
      const response = await axiosWithAuth.post('/notifications/mark-all-read', {});
      console.log('Respuesta del servidor al marcar todas como leídas:', response);
      // Después de marcar todas como leídas, actualizar la lista de notificaciones
      // No actualizamos aquí para evitar problemas de concurrencia
      return response.data;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      // Intentar actualizar el estado localmente incluso si hay un error
      return { success: true };
    }
  }
);

// Eliminar una notificación
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await axiosWithAuth.delete(`/notifications/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar la notificación');
    }
  }
);

// Obtener estadísticas de notificaciones
export const fetchNotificationStats = createAsyncThunk(
  'notifications/fetchNotificationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosWithAuth.get('/notifications/notifications/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estadísticas de notificaciones');
    }
  }
);

// Crear una nueva notificación
export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await axiosWithAuth.post('/notifications/notifications', notificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear la notificación');
    }
  }
);

// 🎯 Initial State
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

// 🛠️ Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log('Notificaciones recibidas:', action.payload);
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(notification => !notification.isRead).length;
        console.log('Contador de notificaciones no leídas actualizado:', state.unreadCount);
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        console.log('Notificación marcada como leída:', action.payload);
        // Verificar si la respuesta tiene la estructura esperada
        const notificationId = action.payload._id || action.payload.id;
        if (!notificationId) {
          console.error('Respuesta del servidor sin ID de notificación:', action.payload);
          return;
        }

        // Actualizar el estado localmente
        const index = state.notifications.findIndex(n => n._id === notificationId);
        if (index !== -1) {
          state.notifications[index].isRead = true;
          // Recalcular el contador de notificaciones no leídas
          state.unreadCount = state.notifications.filter(notification => !notification.isRead).length;
          console.log('Contador de notificaciones no leídas actualizado:', state.unreadCount);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        console.log('Todas las notificaciones marcadas como leídas');
        // Actualizar el estado localmente
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        // Asegurarse de que el contador se actualice correctamente
        state.unreadCount = 0;
        console.log('Contador de notificaciones no leídas actualizado:', state.unreadCount);
      });
  }
});

// 🧹 Actions
export const { clearNotifications } = notificationSlice.actions;

// 📦 Reducer
export default notificationSlice.reducer;
