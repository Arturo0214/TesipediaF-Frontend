import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quoteService from '../../services/quoteService';

const initialState = {
  quote: null,
  quotes: [],
  loading: false,
  success: false,
  error: null,
  formData: null,
  stats: null
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

export const createQuote = createAsyncThunk('quotes/create', async ({ formDataToSend, formData }, thunkAPI) => {
  try {
    const response = await quoteService.createQuote(formDataToSend);
    return { ...response, formData };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error creating quote');
  }
});

export const getQuoteByPublicId = createAsyncThunk('quotes/getByPublicId', async (publicId, thunkAPI) => {
  try {
    return await quoteService.getQuoteByPublicId(publicId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching quote');
  }
});

export const linkQuoteToUser = createAsyncThunk('quotes/linkToUser', async (publicId, thunkAPI) => {
  try {
    return await quoteService.linkQuoteToUser(publicId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error linking quote');
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
    // Check admin permissions
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }

    return await quoteService.getAllQuotes();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching all quotes');
  }
});

export const getQuoteById = createAsyncThunk('quotes/getById', async (quoteId, thunkAPI) => {
  try {
    return await quoteService.getQuoteById(quoteId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching quote by ID');
  }
});

export const updateQuote = createAsyncThunk('quotes/update', async ({ quoteId, updatedData }, thunkAPI) => {
  try {
    // Admin permission required to update any quote
    if (updatedData.adminAction) {
      const permissionError = checkAdminPermission(thunkAPI);
      if (permissionError) {
        return thunkAPI.rejectWithValue(permissionError);
      }
    }

    return await quoteService.updateQuote(quoteId, updatedData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating quote');
  }
});

export const updatePublicQuote = createAsyncThunk('quotes/updatePublic', async ({ publicId, updatedData }, thunkAPI) => {
  try {
    return await quoteService.updatePublicQuote(publicId, updatedData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating public quote');
  }
});

export const deleteQuote = createAsyncThunk('quotes/delete', async (quoteId, thunkAPI) => {
  try {
    // Check admin permissions
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }

    return await quoteService.deleteQuote(quoteId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error deleting quote');
  }
});

export const searchQuotes = createAsyncThunk('quotes/search', async (query, thunkAPI) => {
  try {
    // Check admin permissions
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
    // Check admin permissions
    const permissionError = checkAdminPermission(thunkAPI);
    if (permissionError) {
      return thunkAPI.rejectWithValue(permissionError);
    }

    return await quoteService.getQuoteStats();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching quote statistics');
  }
});

// Helper para obtener el texto y color del estado
export const getQuoteStatusLabel = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return { text: 'Pendiente', color: 'warning' };
    case 'approved':
      return { text: 'Aprobada', color: 'success' };
    case 'rejected':
      return { text: 'Rechazada', color: 'danger' };
    case 'paid':
      return { text: 'Pagada', color: 'primary' };
    case 'cancelled':
      return { text: 'Cancelada', color: 'secondary' };
    default:
      return { text: 'Desconocido', color: 'secondary' };
  }
};

// Slice

const quoteSlice = createSlice({
  name: 'quote',
  initialState,
  reducers: {
    resetQuoteState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.quote = null;
      state.formData = null;
    },
    loadQuoteFromStorage: (state, action) => {
      if (action.payload) {
        state.quote = action.payload;
        state.success = true;
        state.loading = false;
        state.error = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.quote) {
          state.quote = action.payload.quote;
          state.formData = action.meta.arg.formData;
        }
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getQuoteByPublicId.fulfilled, (state, action) => {
        state.quote = action.payload;
      })

      .addCase(linkQuoteToUser.fulfilled, (state, action) => {
        state.success = true;
        state.quote = action.payload;
      })

      .addCase(getMyQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
      })

      .addCase(getAllQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
      })

      .addCase(getQuoteById.fulfilled, (state, action) => {
        state.quote = action.payload;
      })

      .addCase(updateQuote.fulfilled, (state, action) => {
        state.success = true;
        if (action.payload) {
          state.quote = action.payload;
        }
      })

      .addCase(updatePublicQuote.fulfilled, (state, action) => {
        state.success = true;
        if (action.payload) {
          state.quote = action.payload;
        }
      })

      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.success = true;
        state.quotes = state.quotes.filter((q) => q._id !== action.meta.arg);
      })

      .addCase(searchQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
      })

      // Admin stats case
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

      // common rejections
      .addMatcher(
        (action) => action.type.startsWith('quotes/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetQuoteState, loadQuoteFromStorage } = quoteSlice.actions;

export default quoteSlice.reducer;