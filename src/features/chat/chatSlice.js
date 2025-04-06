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
} from '../../services/chat/chatService';

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
    return await sendMessageService(messageData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const getMessagesByOrder = createAsyncThunk('chat/getMessagesByOrder', async (orderId, thunkAPI) => {
  try {
    return await getMessagesByOrderService(orderId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message);
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
    return await getConversationsService();
  } catch (error) {
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
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(getAuthenticatedConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(getPublicConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
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
export const { clearMessages, setConnectionStatus, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
