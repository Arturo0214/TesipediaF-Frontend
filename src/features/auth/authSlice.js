import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import axiosWithAuth from '../../utils/axioswithAuth';

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
};

// Helper function to check if user is admin (includes superadmin)
const checkIsAdmin = (user) => {
  if (!user) return false;
  const isAdminRole = user.role === 'admin' || user.role === 'superadmin';
  const hasAdminPermissions = user.permissions?.includes('admin') ||
    user.isAdmin === true ||
    user.admin === true;
  return isAdminRole || hasAdminPermissions;
};

// Helper to check if user is superadmin
const checkIsSuperAdmin = (user) => {
  if (!user) return false;
  return user.role === 'superadmin';
};

// Thunks

export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.login(userData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axiosWithAuth.post('/auth/reset-password',
        { token, password },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error al restablecer la contraseña' });
    }
  }
);

// Nuevo thunk para recuperar perfil usando cookie
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      return await authService.getProfile();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    checkAdminStatus: (state) => {
      state.isAdmin = checkIsAdmin(state.user);
      state.isSuperAdmin = checkIsSuperAdmin(state.user);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isAdmin = checkIsAdmin(action.payload);
        state.isSuperAdmin = checkIsSuperAdmin(action.payload);
        // Guardar token inmediatamente en localStorage para que axiosWithAuth
        // pueda usarlo antes de que redux-persist haga flush
        if (action.payload?.token) {
          try { localStorage.setItem('jwt_backup', action.payload.token); } catch (_) {}
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.isSuperAdmin = false;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isAdmin = checkIsAdmin(action.payload);
        state.isSuperAdmin = checkIsSuperAdmin(action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.isSuperAdmin = false;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, {
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isSuperAdmin: false,
          isLoading: false,
          isError: false,
          isSuccess: true,
          message: 'Sesión cerrada exitosamente'
        });
        try { localStorage.removeItem('jwt_backup'); } catch (_) {}
      })
      .addCase(logout.rejected, (state) => {
        Object.assign(state, {
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isSuperAdmin: false,
          isLoading: false,
          isError: false,
          isSuccess: true,
          message: 'Sesión cerrada localmente'
        });
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Error al restablecer la contraseña';
      })

      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Preservar el token del login si getProfile no lo devuelve
        const existingToken = state.user?.token;
        state.user = { ...action.payload, token: action.payload.token || existingToken };
        state.isAdmin = checkIsAdmin(action.payload);
        state.isSuperAdmin = checkIsSuperAdmin(action.payload);
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isAdmin = false;
        state.isSuperAdmin = false;
      });
  },
});

export const { reset, checkAdminStatus } = authSlice.actions;
export default authSlice.reducer;

