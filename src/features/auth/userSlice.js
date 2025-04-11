import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../services/userService';

// Helper function to check admin permissions
const checkAdminPermission = (thunkAPI) => {
    const { auth } = thunkAPI.getState();
    if (!auth.isAdmin) {
        return 'Permission denied: Admin access required';
    }
    return null;
};

// Async thunks
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, thunkAPI) => {
        try {
            // Check admin permissions
            const permissionError = checkAdminPermission(thunkAPI);
            if (permissionError) {
                return thunkAPI.rejectWithValue(permissionError);
            }

            return await userService.getUsers();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al obtener usuarios');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchUserById',
    async (id, thunkAPI) => {
        try {
            // Check if admin or if the user is fetching their own profile
            const { auth } = thunkAPI.getState();
            if (!auth.isAdmin && auth.user._id !== id) {
                return thunkAPI.rejectWithValue('Permission denied: Cannot access other user data');
            }

            return await userService.getUserById(id);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al obtener usuario');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }, thunkAPI) => {
        try {
            // Check if admin or if the user is updating their own profile
            const { auth } = thunkAPI.getState();
            if (!auth.isAdmin && auth.user._id !== id) {
                return thunkAPI.rejectWithValue('Permission denied: Cannot update other user data');
            }

            return await userService.updateUser(id, userData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al actualizar usuario');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id, thunkAPI) => {
        try {
            // Check admin permissions
            const permissionError = checkAdminPermission(thunkAPI);
            if (permissionError) {
                return thunkAPI.rejectWithValue(permissionError);
            }

            await userService.deleteUser(id);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al eliminar usuario');
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'users/updateUserRole',
    async ({ id, role }, thunkAPI) => {
        try {
            // Check admin permissions
            const permissionError = checkAdminPermission(thunkAPI);
            if (permissionError) {
                return thunkAPI.rejectWithValue(permissionError);
            }

            return await userService.updateUserRole(id, role);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al actualizar rol de usuario');
        }
    }
);

export const updateUserStatus = createAsyncThunk(
    'users/updateUserStatus',
    async ({ id, isActive }, thunkAPI) => {
        try {
            // Check admin permissions
            const permissionError = checkAdminPermission(thunkAPI);
            if (permissionError) {
                return thunkAPI.rejectWithValue(permissionError);
            }

            return await userService.updateUserStatus(id, isActive);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al actualizar estado de usuario');
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'users/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            return await userService.getUserProfile();
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al obtener perfil de usuario');
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'users/updateUserProfile',
    async (userData, { rejectWithValue }) => {
        try {
            return await userService.updateUserProfile(userData);
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al actualizar perfil de usuario');
        }
    }
);

// Admin-specific thunks
export const getAllWriters = createAsyncThunk(
    'users/getAllWriters',
    async (_, thunkAPI) => {
        try {
            // Check admin permissions
            const permissionError = checkAdminPermission(thunkAPI);
            if (permissionError) {
                return thunkAPI.rejectWithValue(permissionError);
            }

            return await userService.getAllWriters();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al obtener redactores');
        }
    }
);

export const toggleWriterStatus = createAsyncThunk(
    'users/toggleWriterStatus',
    async (writerId, thunkAPI) => {
        try {
            // Check admin permissions
            const permissionError = checkAdminPermission(thunkAPI);
            if (permissionError) {
                return thunkAPI.rejectWithValue(permissionError);
            }

            return await userService.toggleWriterStatus(writerId);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Error al cambiar estado del redactor');
        }
    }
);

// Slice
const initialState = {
    users: [],
    writers: [],
    currentUser: null,
    userProfile: null,
    selectedUser: null,
    loading: false,
    error: null,
    success: false,
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
                state.success = true;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch User By ID
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
                state.success = true;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update User
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                state.selectedUser = action.payload;
                state.success = true;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(user => user._id !== action.payload);
                state.selectedUser = null;
                state.success = true;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update User Role
            .addCase(updateUserRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map(user =>
                    user._id === action.payload.user._id ? action.payload.user : user
                );
                if (state.selectedUser && state.selectedUser._id === action.payload.user._id) {
                    state.selectedUser = action.payload.user;
                }
                state.success = true;
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get All Writers (Admin)
            .addCase(getAllWriters.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllWriters.fulfilled, (state, action) => {
                state.loading = false;
                state.writers = action.payload;
                state.success = true;
            })
            .addCase(getAllWriters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Toggle Writer Status (Admin)
            .addCase(toggleWriterStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleWriterStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.writers = state.writers.map(writer =>
                    writer._id === action.payload.writer._id ? action.payload.writer : writer
                );
                state.users = state.users.map(user =>
                    user._id === action.payload.writer._id ? action.payload.writer : user
                );
                state.success = true;
            })
            .addCase(toggleWriterStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;
