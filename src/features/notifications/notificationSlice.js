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
      console.log('Respuesta del servidor al marcar como leída:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      return rejectWithValue(error.response?.data?.message || 'Error al marcar notificación como leída');
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
      return rejectWithValue(error.response?.data?.message || 'Error al marcar todas las notificaciones como leídas');
    }
  }
);

// Marcar notificaciones de un tipo como leídas
export const markNotificationsByType = createAsyncThunk(
  'notifications/markNotificationsByType',
  async (type, { rejectWithValue }) => {
    try {
      console.log('Marcando notificaciones de tipo:', type);
      const response = await axiosWithAuth.post('/notifications/mark-type-read', { type });
      console.log('Resultado marcar por tipo:', response.data);
      return { type, ...response.data };
    } catch (error) {
      console.error('Error al marcar notificaciones por tipo:', error);
      return rejectWithValue(error.response?.data?.message || `Error al marcar notificaciones de tipo ${type}`);
    }
  }
);

// Eliminar una notificación
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await axiosWithAuth.delete(`/notifications/${id}`);
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
      const response = await axiosWithAuth.get('/notifications/stats');
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
      const response = await axiosWithAuth.post('/notifications', notificationData);
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
    },
    addNotification: (state, action) => {
      // Insertar la nueva notificación al inicio del array
      state.notifications.unshift(action.payload);
      // Si la notificación no está leída, incrementar el contador
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action) => {
      const idx = state.notifications.findIndex(n => n._id === action.payload._id);
      if (idx !== -1) {
        state.notifications[idx] = action.payload;
        // Recalcular el contador de no leídas
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
      // Recalcular el contador de no leídas
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
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
        // Try to get ID from response, or fallback to the original arg (the ID we sent)
        const notificationId = action.payload?._id || action.payload?.id || action.meta?.arg;
        if (!notificationId) {
          console.error('Respuesta del servidor sin ID de notificación:', action.payload);
          // Fallback: usar el argumento original (el ID que enviamos)
          return;
        }

        // Actualizar el estado localmente
        const index = state.notifications.findIndex(n => n._id === notificationId);
        if (index !== -1) {
          console.log('Actualizando notificación en store:', notificationId);
          // Si la respuesta del servidor tiene la estructura completa, usarla
          // Si no, solo marcar como leída en el estado local
          if (action.payload._id || action.payload.id) {
            state.notifications[index] = { ...state.notifications[index], ...action.payload, isRead: true };
          } else {
            state.notifications[index].isRead = true;
          }
          // Recalcular el contador de notificaciones no leídas
          state.unreadCount = state.notifications.filter(notification => !notification.isRead).length;
          console.log('Contador de notificaciones no leídas actualizado:', state.unreadCount);
        } else {
          console.warn('Notificación no encontrada en el estado local:', notificationId);
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
      })
      .addCase(markNotificationsByType.fulfilled, (state, action) => {
        const { type } = action.payload;
        console.log('Todas las notificaciones de tipo', type, 'marcadas como leídas');
        state.notifications.forEach(notification => {
          if (notification.type === type) {
            notification.isRead = true;
          }
        });
        state.unreadCount = state.notifications.filter(notification => !notification.isRead).length;
        console.log('Contador de notificaciones no leídas actualizado:', state.unreadCount);
      });
  }
});

// 🧹 Actions
export const { clearNotifications, addNotification, updateNotification, removeNotification } = notificationSlice.actions;

// 📦 Reducer
export default notificationSlice.reducer;
