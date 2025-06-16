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
  updateConversationStatusService,
  deleteConversationService
} from '../../services/chat/chatService';

// 🔐 Helper para verificar permisos de admin
const checkAdminPermission = (thunkAPI) => {
  const { auth } = thunkAPI.getState();
  if (!auth.isAdmin) return 'Permission denied: Admin access required';
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

// ✅ Thunks
export const generatePublicId = createAsyncThunk('chat/generatePublicId', async (_, thunkAPI) => {
  try {
    const result = await generatePublicIdService();
    console.log('🔑 PublicId generado:', result);
    return result;
  } catch (error) {
    console.error('❌ generatePublicId error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async (data, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    if (data.isAdmin) {
      const error = checkAdminPermission(thunkAPI);
      if (error) return thunkAPI.rejectWithValue(error);
    }
    const result = await sendMessageService(data);
    console.log('📤 Mensaje enviado:', result);
    return result;
  } catch (error) {
    console.error('❌ sendMessage error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getMessagesByOrder = createAsyncThunk('chat/getMessagesByOrder', async (params, thunkAPI) => {
  try {
    const orderId = typeof params === 'string' ? params : params?.orderId;
    const publicId = typeof params === 'object' ? params?.publicId : null;
    if (publicId) return await getMessagesByOrderService({ publicId });
    if (orderId === 'all') {
      const error = checkAdminPermission(thunkAPI);
      if (error) return thunkAPI.rejectWithValue(error);
    }
    const { auth } = thunkAPI.getState();
    if (!auth.isAuthenticated) return thunkAPI.rejectWithValue('Debes iniciar sesión');
    const result = await getMessagesByOrderService(orderId);
    console.log(`📩 Mensajes obtenidos para ${orderId}:`, result);
    return result;
  } catch (error) {
    console.error('❌ getMessagesByOrder error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getPublicMessagesByPublicId = createAsyncThunk('chat/getPublicMessagesByPublicId', async (publicId, thunkAPI) => {
  try {
    const result = await getPublicMessagesByPublicIdService(publicId);
    console.log('📩 Mensajes públicos obtenidos para:', publicId, result);
    return result;
  } catch (error) {
    console.error('❌ getPublicMessagesByPublicId error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getPublicMessagesByOrder = createAsyncThunk('chat/getPublicMessagesByOrder', async (orderId, thunkAPI) => {
  try {
    const result = await getPublicMessagesByOrderService(orderId);
    console.log('📩 Mensajes públicos por orden obtenidos para:', orderId, result);
    return result;
  } catch (error) {
    console.error('❌ getPublicMessagesByOrder error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const markMessagesAsRead = createAsyncThunk('chat/markMessagesAsRead', async (orderId, thunkAPI) => {
  try {
    const result = await markMessagesAsReadService(orderId);
    console.log('✅ Mensajes marcados como leídos para orden:', orderId);
    return result;
  } catch (error) {
    console.error('❌ markMessagesAsRead error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getConversations = createAsyncThunk('chat/getConversations', async (_, thunkAPI) => {
  const error = checkAdminPermission(thunkAPI);
  if (error) return thunkAPI.rejectWithValue(error);
  const result = await getConversationsService();
  console.log('💬 Conversaciones cargadas:', result);
  return result;
});

export const getAuthenticatedConversations = createAsyncThunk('chat/getAuthenticatedConversations', async () => {
  const result = await getAuthenticatedConversationsService();
  console.log('💬 Conversaciones autenticadas cargadas:', result);
  return result;
});

export const getPublicConversations = createAsyncThunk('chat/getPublicConversations', async () => {
  const result = await getPublicConversationsService();
  console.log('💬 Conversaciones públicas cargadas:', result);
  return result;
});

export const trackVisit = createAsyncThunk('chat/trackVisit', async (data, thunkAPI) => {
  try {
    const result = await trackVisitService(data);
    console.log('👁️ Visita registrada:', data);
    return result;
  } catch (error) {
    console.error('❌ trackVisit error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const deleteMessage = createAsyncThunk('chat/deleteMessage', async (id, thunkAPI) => {
  const error = checkAdminPermission(thunkAPI);
  if (error) return thunkAPI.rejectWithValue(error);
  const result = await deleteMessageService(id);
  console.log('🗑️ Mensaje eliminado:', id);
  return result;
});

export const markMessageAsRead = createAsyncThunk('chat/markMessageAsRead', async (id, thunkAPI) => {
  try {
    const result = await markSingleMessageAsReadService(id);
    console.log('✅ Mensaje marcado como leído:', id);
    return result;
  } catch (error) {
    console.error('❌ markMessageAsRead error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getDirectMessages = createAsyncThunk('chat/getDirectMessages', async (userId, thunkAPI) => {
  try {
    const result = await getDirectMessagesService(userId);
    console.log('📩 Mensajes directos obtenidos para:', userId, result);
    return result;
  } catch (error) {
    console.error('❌ getDirectMessages error:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const updateConversationStatus = createAsyncThunk('chat/updateConversationStatus', async (payload, thunkAPI) => {
  const error = checkAdminPermission(thunkAPI);
  if (error) return thunkAPI.rejectWithValue(error);
  const result = await updateConversationStatusService(payload);
  console.log('✅ Estado de conversación actualizado:', payload);
  return result;
});

export const deleteConversation = createAsyncThunk('chat/deleteConversation', async (conversationId, thunkAPI) => {
  try {
    console.log('🔄 Ejecutando thunk deleteConversation para ID:', conversationId);

    const error = checkAdminPermission(thunkAPI);
    if (error) {
      console.error('🚫 Error de permisos:', error);
      return thunkAPI.rejectWithValue(error);
    }

    console.log('✅ Permisos verificados, enviando petición al servidor...');
    const result = await deleteConversationService(conversationId);
    console.log('✅ Conversación eliminada en el servidor:', result);
    return { conversationId, result };
  } catch (error) {
    console.error('❌ Error en thunk deleteConversation:', error);
    console.log('📋 Error completo:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

// 🧩 Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      console.log('🧹 Mensajes limpiados');
      state.messages = [];
      state.error = null;
      state.success = false;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setConnectionStatus: (state, action) => {
      console.log('🌐 Estado de conexión actualizado:', action.payload);
      state.isConnected = action.payload;
    },
    addMessage: (state, action) => {
      const newMessage = action.payload;
      // Evitar duplicados
      if (!state.messages.some(msg => msg._id === newMessage._id)) {
        console.log('➕ Mensaje añadido al estado:', newMessage);
        state.messages.push(newMessage);
      } else {
        console.log('⛔ Mensaje duplicado ignorado:', newMessage._id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // generatePublicId
      .addCase(generatePublicId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePublicId.fulfilled, (state, action) => {
        state.loading = false;
        state.publicId = action.payload.publicId;
        console.log('✅ PublicId registrado en slice:', action.payload.publicId);
      })
      .addCase(generatePublicId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!state.messages.some(msg => msg._id === action.payload._id)) {
          state.messages.push(action.payload);
          console.log('✅ Mensaje registrado en slice:', action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      // getMessagesByOrder
      .addCase(getMessagesByOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessagesByOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        console.log('✅ Mensajes cargados en slice:', action.payload);
      })
      .addCase(getMessagesByOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.messages = [];
      })
      // getPublicMessagesByPublicId
      .addCase(getPublicMessagesByPublicId.fulfilled, (state, action) => {
        state.messages = action.payload;
        console.log('✅ Mensajes públicos cargados en slice:', action.payload);
      })
      // getPublicMessagesByOrder
      .addCase(getPublicMessagesByOrder.fulfilled, (state, action) => {
        state.messages = action.payload;
        console.log('✅ Mensajes públicos por orden cargados en slice:', action.payload);
      })
      // markMessagesAsRead
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.messages = action.payload;
        console.log('✅ Mensajes marcados como leídos en slice:', action.payload);
      })
      // getConversations
      .addCase(getConversations.fulfilled, (state, action) => {
        const map = new Map();
        action.payload.forEach(conv => map.set(conv.conversationId, conv));
        state.conversations = Array.from(map.values());
        console.log('📊 Actualizando lista de conversaciones en el slice');
      })
      // updateConversationStatus
      .addCase(updateConversationStatus.fulfilled, (state, action) => {
        const { conversationId, status } = action.meta.arg;
        const idx = state.conversations.findIndex(c => c.conversationId === conversationId);
        if (idx !== -1) {
          state.conversations[idx].status = status;
          console.log('✅ Estado de conversación actualizado en slice:', conversationId, status);
        }
      })
      // getDirectMessages
      .addCase(getDirectMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
        console.log('✅ Mensajes directos cargados en slice:', action.payload);
      })
      // markMessageAsRead
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const messageId = action.payload._id;
        const messageIndex = state.messages.findIndex(msg => msg._id === messageId);
        if (messageIndex !== -1) {
          state.messages[messageIndex].isRead = true;
          console.log('✅ Mensaje marcado como leído en slice:', messageId);
        }
      })
      // deleteConversation
      .addCase(deleteConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.loading = false;
        // Eliminar la conversación del estado
        state.conversations = state.conversations.filter(
          conv => conv.conversationId !== action.payload.conversationId
        );
        // Si la conversación actual es la que se eliminó, limpiar los mensajes
        if (action.payload.conversationId === state.currentConversationId) {
          state.messages = [];
          state.currentConversationId = null;
        }
        console.log('🗑️ Conversación eliminada del estado:', action.payload.conversationId);
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages, clearError, setConnectionStatus, addMessage } = chatSlice.actions;
export default chatSlice.reducer;

