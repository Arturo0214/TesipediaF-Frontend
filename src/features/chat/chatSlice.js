import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  generatePublicIdService,
  sendMessageService,
  getMessagesByOrderService,
  getPublicMessagesByPublicIdService,
  getPublicMessagesByOrderService,
  markMessagesAsReadService,
  getConversationsService,
  getAuthenticatedConversationsService,
  getPublicConversationsService,
  trackVisitService,
  deleteMessageService,
  markSingleMessageAsReadService,
  getDirectMessagesService,
  updateConversationStatusService
} from '../../services/chat/chatService';

// Helper function to check admin permissions
const checkAdminPermission = (thunkAPI) => {
  const { auth } = thunkAPI.getState();
  if (!auth.isAdmin) {
    return 'Permission denied: Admin access required';
  }
  return null;
};

// 🎯 Estado inicial
const initialState = {
  messages: [],
  conversations: [],
  loading: false,
  success: false,
  error: null,
  publicId: null,
  isConnected: false,
};

// 🔥 Async Thunks

export const generatePublicId = createAsyncThunk('chat/generatePublicId', async (_, thunkAPI) => {
  try {
    return await generatePublicIdService();
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async (messageData, thunkAPI) => {
  try {
    // For admin messages, verify admin permissions
    if (messageData.isAdmin) {
      const permissionError = checkAdminPermission(thunkAPI);
      if (permissionError) {
        return thunkAPI.rejectWithValue(permissionError);
      }
    }

    return await sendMessageService(messageData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getMessagesByOrder = createAsyncThunk('chat/getMessagesByOrder', async (orderId, thunkAPI) => {
  try {
    // If accessing all messages without specific order connection, check admin permissions
    if (orderId === 'all') {
      const permissionError = checkAdminPermission(thunkAPI);
      if (permissionError) {
        return thunkAPI.rejectWithValue(permissionError);
      }
    }

    // Verificar que el usuario esté autenticado antes de hacer la petición
    const { auth } = thunkAPI.getState();
    if (!auth.isAuthenticated) {
      return thunkAPI.rejectWithValue('Debes iniciar sesión para ver los mensajes');
    }

    console.log("Llamando a getMessagesByOrderService con orderId:", orderId);
    return await getMessagesByOrderService(orderId);
  } catch (error) {
    console.error("Error en getMessagesByOrder:", error);
    // Manejar específicamente errores de autenticación
    if (error.response?.status === 401) {
      return thunkAPI.rejectWithValue('Sesión expirada o no válida. Inicia sesión nuevamente.');
    }

    // Manejar errores de permisos
    if (error.response?.status === 403) {
      return thunkAPI.rejectWithValue('No tienes permisos para acceder a estos mensajes');
    }

    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || 'Error al obtener mensajes');
  }
});

export const getPublicMessagesByPublicId = createAsyncThunk('chat/getPublicMessagesByPublicId', async (publicId, thunkAPI) => {
  try {
    return await getPublicMessagesByPublicIdService(publicId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getPublicMessagesByOrder = createAsyncThunk('chat/getPublicMessagesByOrder', async (orderId, thunkAPI) => {
  try {
    return await getPublicMessagesByOrderService(orderId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const markMessagesAsRead = createAsyncThunk('chat/markMessagesAsRead', async (orderId, thunkAPI) => {
  try {
    return await markMessagesAsReadService(orderId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getConversations = createAsyncThunk('chat/getConversations', async (_, thunkAPI) => {
  try {
    // Admin-only endpoint - check permissions
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }

    return await getConversationsService();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getAuthenticatedConversations = createAsyncThunk('chat/getAuthenticatedConversations', async (_, thunkAPI) => {
  try {
    return await getAuthenticatedConversationsService();
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getPublicConversations = createAsyncThunk('chat/getPublicConversations', async (_, thunkAPI) => {
  try {
    return await getPublicConversationsService();
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const trackVisit = createAsyncThunk('chat/trackVisit', async (visitData, thunkAPI) => {
  try {
    return await trackVisitService(visitData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

// Agregando las funciones faltantes
export const deleteMessage = createAsyncThunk('chat/deleteMessage', async (messageId, thunkAPI) => {
  try {
    // Admin-only action - check permissions
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }

    return await deleteMessageService(messageId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const markMessageAsRead = createAsyncThunk('chat/markMessageAsRead', async (messageId, thunkAPI) => {
  try {
    return await markSingleMessageAsReadService(messageId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

// Añadir nueva acción para obtener mensajes directos entre usuarios
export const getDirectMessages = createAsyncThunk('chat/getDirectMessages', async (userId, thunkAPI) => {
  try {
    // Verificar que el usuario esté autenticado antes de hacer la petición
    const { auth } = thunkAPI.getState();
    if (!auth.isAuthenticated) {
      return thunkAPI.rejectWithValue('Debes iniciar sesión para ver los mensajes');
    }

    console.log("Obteniendo mensajes directos con el usuario:", userId);

    // Usar el servicio específico para mensajes directos
    return await getDirectMessagesService(userId);
  } catch (error) {
    console.error("Error en getDirectMessages:", error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || 'Error al obtener mensajes');
  }
});

// Añadir acción para actualizar el estado de una conversación
export const updateConversationStatus = createAsyncThunk(
  'chat/updateConversationStatus',
  async (payload, thunkAPI) => {
    try {
      // Admin-only action - check permissions
      const permissionError = checkAdminPermission(thunkAPI);
      if (permissionError) {
        return thunkAPI.rejectWithValue(permissionError);
      }

      return await updateConversationStatusService(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

// 🧩 Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePublicId.fulfilled, (state, action) => {
        state.publicId = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(getMessagesByOrder.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(getPublicMessagesByPublicId.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(getPublicMessagesByOrder.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(getDirectMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(getAuthenticatedConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(getPublicConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(msg => msg._id !== action.payload._id);
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const index = state.messages.findIndex(msg => msg._id === action.payload._id);
        if (index !== -1) {
          state.messages[index].read = true;
        }
      })
      .addCase(updateConversationStatus.fulfilled, (state, action) => {
        if (state.conversations && state.conversations.length > 0) {
          // Actualizar el estado de la conversación en el array de conversaciones
          const index = state.conversations.findIndex(
            conv => conv.senderId === action.meta.arg.conversationId
          );

          if (index !== -1) {
            state.conversations[index].status = action.meta.arg.status;
          }
        }
      })
      .addMatcher(
        (action) => action.type.startsWith('chat/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('chat/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
          state.success = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('chat/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

// 🧩 Export
export const { clearMessages, clearError, setConnectionStatus, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
