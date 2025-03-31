import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quoteService from '../../services/quoteService';

const initialState = {
  quote: null,
  quotes: [],
  loading: false,
  success: false,
  error: null,
};

// Thunks

export const createQuote = createAsyncThunk('quotes/create', async (quoteData, thunkAPI) => {
  try {
    return await quoteService.createQuote(quoteData);
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
    return await quoteService.updateQuote(quoteId, updatedData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating quote');
  }
});

export const deleteQuote = createAsyncThunk('quotes/delete', async (quoteId, thunkAPI) => {
  try {
    return await quoteService.deleteQuote(quoteId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error deleting quote');
  }
});

export const searchQuotes = createAsyncThunk('quotes/search', async (query, thunkAPI) => {
  try {
    return await quoteService.searchQuotes(query);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error searching quotes');
  }
});

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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.quote = action.payload;
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
        state.quote = action.payload;
      })

      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.success = true;
        state.quotes = state.quotes.filter((q) => q._id !== action.meta.arg);
      })

      .addCase(searchQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
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

export const { resetQuoteState } = quoteSlice.actions;

export default quoteSlice.reducer;

