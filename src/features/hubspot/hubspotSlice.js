import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hubspotService from '../../services/hubspotService';

export const fetchHubspotSummary = createAsyncThunk(
  'hubspot/fetchSummary',
  async (_, thunkAPI) => {
    try {
      return await hubspotService.getSummary();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener datos de HubSpot';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchHubspotDeals = createAsyncThunk(
  'hubspot/fetchDeals',
  async (params, thunkAPI) => {
    try {
      return await hubspotService.getDeals(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchHubspotContacts = createAsyncThunk(
  'hubspot/fetchContacts',
  async (params, thunkAPI) => {
    try {
      return await hubspotService.getContacts(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const hubspotSlice = createSlice({
  name: 'hubspot',
  initialState: {
    summary: null,
    deals: [],
    contacts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearHubspotError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchHubspotSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHubspotSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchHubspotSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Deals
      .addCase(fetchHubspotDeals.fulfilled, (state, action) => {
        state.deals = action.payload.results || [];
      })
      // Contacts
      .addCase(fetchHubspotContacts.fulfilled, (state, action) => {
        state.contacts = action.payload.results || [];
      });
  },
});

export const { clearHubspotError } = hubspotSlice.actions;
export default hubspotSlice.reducer;
