import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quoteService from '../../services/quoteService';

const initialState = {
  quote: null,
  quotes: [],
  loading: false,
  success: false,
  error: null,
  formData: null,
  stats: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  estimatedPrice: 0
};

// Helper function to check for admin permissions
const checkAdminPermission = (thunkAPI) => {
  const { auth } = thunkAPI.getState();
  if (!auth.isAdmin) {
    return 'Permission denied: Admin access required';
  }
  return null;
};

// Thunks

export const createQuote = createAsyncThunk(
  'quotes/create',
  async ({ formDataToSend, formData }, thunkAPI) => {
    try {
      const response = await quoteService.createQuote(formDataToSend);
      return { quote: response, formData };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al crear la cotización');
    }
  }
);

export const getQuoteByPublicId = createAsyncThunk(
  'quotes/getByPublicId',
  async (publicId, thunkAPI) => {
    try {
      return await quoteService.getQuoteByPublicId(publicId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al obtener la cotización');
    }
  }
);

export const linkQuoteToUser = createAsyncThunk('quotes/linkToUser', async (publicId, thunkAPI) => {
  try {
    return await quoteService.linkQuoteToUser(publicId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al vincular la cotización');
  }
});

export const getMyQuotes = createAsyncThunk('quotes/getMyQuotes', async (_, thunkAPI) => {
  try {
    return await quoteService.getMyQuotes();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching my quotes');
  }
});

export const getAllQuotes = createAsyncThunk('quotes/getAll', async (_, thunkAPI) => {
  try {
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }
    return await quoteService.getAllQuotes();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al obtener cotizaciones');
  }
});

export const getQuoteById = createAsyncThunk('quotes/getById', async (quoteId, thunkAPI) => {
  try {
    return await quoteService.getQuoteById(quoteId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching quote by ID');
  }
});

export const updateQuote = createAsyncThunk(
  'quotes/update',
  async ({ quoteId, updatedData }, thunkAPI) => {
    try {
      return await quoteService.updateQuote(quoteId, updatedData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al actualizar la cotización');
    }
  }
);

export const updatePublicQuote = createAsyncThunk(
  'quotes/updatePublic',
  async ({ publicId, updatedData }, thunkAPI) => {
    try {
      return await quoteService.updatePublicQuote(publicId, updatedData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al actualizar la cotización pública');
    }
  }
);

export const deleteQuote = createAsyncThunk('quotes/delete', async (quoteId, thunkAPI) => {
  try {
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }
    await quoteService.deleteQuote(quoteId);
    return quoteId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al eliminar la cotización');
  }
});

export const searchQuotes = createAsyncThunk('quotes/search', async (query, thunkAPI) => {
  try {
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }
    return await quoteService.searchQuotes(query);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error searching quotes');
  }
});

// Admin-specific thunks
export const getQuoteStats = createAsyncThunk('quotes/stats', async (_, thunkAPI) => {
  try {
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }
    return await quoteService.getQuoteStats();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching quote statistics');
  }
});

// Verificar estado del pago
export const checkPaymentStatus = createAsyncThunk(
  'quotes/checkPaymentStatus',
  async ({ trackingToken, sessionId }, thunkAPI) => {
    try {
      let response;
      if (trackingToken) {
        response = await quoteService.checkGuestPaymentStatus(trackingToken);
      } else if (sessionId) {
        response = await quoteService.checkPaymentStatus(sessionId);
      } else {
        throw new Error('Se requiere trackingToken o sessionId');
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔄 Actualizar mi cotización (usuario autenticado)
export const updateMyQuote = createAsyncThunk(
  'quotes/updateMyQuote',
  async ({ quoteId, updatedData }, { rejectWithValue }) => {
    try {
      console.log('🚀 Enviando actualización al servidor...', {
        quoteId,
        formDataEntries: Array.from(updatedData.entries())
      });
      const response = await quoteService.updateMyQuote(quoteId, updatedData);
      console.log('✅ Respuesta del servidor:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en updateMyQuote:', error);
      console.log('📝 Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar la cotización');
    }
  }
);

// 💰 Calcular precio de cotización de venta
export const calculateSalesQuotePrice = createAsyncThunk(
  'quotes/calculateSalesPrice',
  async (priceData, thunkAPI) => {
    try {
      const response = await quoteService.calculateSalesQuotePrice(priceData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al calcular el precio');
    }
  }
);

// Slice

const quoteSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    resetQuoteState: (state) => {
      return initialState;
    },
    reset: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = '';
    },
    clearQuote: (state) => {
      state.quote = null;
    },
    loadQuoteFromStorage: (state, action) => {
      if (action.payload) {
        state.quote = action.payload.quote;
        state.formData = action.payload.formData;
      }
    },
    updateQuoteStatus: (state, action) => {
      if (state.quote) {
        state.quote.status = action.payload;
      }
    },
    updateQuoteState: (state, action) => {
      state.quote = action.payload;
      state.success = true;
      state.error = null;
    },
    setActiveQuote: (state, action) => {
      state.quote = action.payload;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // El backend devuelve { message, quote }, entonces action.payload es { quote: { message, quote }, formData }
        // Necesitamos acceder a action.payload.quote.quote para obtener la cotización real
        const serverResponse = action.payload.quote;
        const actualQuote = serverResponse?.quote || serverResponse;
        state.quote = actualQuote;
        state.estimatedPrice = actualQuote?.estimatedPrice || 0;
        // Si hay una lista de cotizaciones, agregar la nueva
        if (state.quotes && actualQuote) {
          state.quotes.unshift(actualQuote);
        }
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getQuoteByPublicId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuoteByPublicId.fulfilled, (state, action) => {
        state.loading = false;
        state.quote = action.payload;
        state.estimatedPrice = action.payload.estimatedPrice || 0;
        state.error = null;
      })
      .addCase(getQuoteByPublicId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.quote = action.payload;
        state.estimatedPrice = action.payload.estimatedPrice || 0;

        // Actualizar la cotización en la lista si existe
        if (state.quotes) {
          state.quotes = state.quotes.map(quote =>
            quote._id === action.payload._id ? action.payload : quote
          );
        }
      })
      .addCase(updateQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(linkQuoteToUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(linkQuoteToUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload) {
          state.quote = action.payload;
        }
      })
      .addCase(linkQuoteToUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMyQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
      })
      .addCase(getAllQuotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllQuotes.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.quotes = action.payload;
      })
      .addCase(getAllQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getQuoteById.fulfilled, (state, action) => {
        state.quote = action.payload;
      })
      .addCase(updatePublicQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePublicQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        // Preservar el usuario si existe
        if (state.quote && state.quote.user && !action.payload.user) {
          state.quote = {
            ...action.payload,
            user: state.quote.user
          };
        } else {
          state.quote = action.payload;
        }

        state.estimatedPrice = action.payload.estimatedPrice || 0;

        // Actualizar la cotización en la lista si existe
        if (state.quotes) {
          state.quotes = state.quotes.map(quote =>
            quote._id === action.payload._id || quote.publicId === action.payload.publicId
              ? action.payload
              : quote
          );
        }
      })
      .addCase(updatePublicQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (state.quotes) {
          state.quotes = state.quotes.filter(quote => quote._id !== action.payload);
        }
      })
      .addCase(deleteQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
      })
      .addCase(getQuoteStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getQuoteStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getQuoteStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.status === 'completed' || action.payload.status === 'paid') {
          if (state.quote) {
            state.quote.status = 'paid';
          }
        }
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMyQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMyQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.quote = action.payload;
        state.estimatedPrice = action.payload.estimatedPrice || 0;

        // Actualizar la cotización en la lista si existe
        if (state.quotes) {
          state.quotes = state.quotes.map(quote =>
            quote._id === action.payload._id ? action.payload : quote
          );
        }
      })
      .addCase(updateMyQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(calculateSalesQuotePrice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateSalesQuotePrice.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // El precio calculado viene en action.payload.pricing.totalPrice
        if (action.payload.success && action.payload.pricing) {
          state.estimatedPrice = action.payload.pricing.totalPrice;
        }
      })
      .addCase(calculateSalesQuotePrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  resetQuoteState,
  reset,
  clearQuote,
  loadQuoteFromStorage,
  updateQuoteStatus,
  updateQuoteState,
  setActiveQuote
} = quoteSlice.actions;

export default quoteSlice.reducer;