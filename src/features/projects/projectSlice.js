import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from '../../services/projectService';

const initialState = {
    projects: [],
    currentProject: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get all projects (admin)
export const getAllProjects = createAsyncThunk(
    'projects/getAll',
    async (_, thunkAPI) => {
        try {
            return await projectService.getAllProjects();
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get writer projects
export const getWriterProjects = createAsyncThunk(
    'projects/getWriterProjects',
    async (_, thunkAPI) => {
        try {
            return await projectService.getWriterProjects();
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get client projects
export const getClientProjects = createAsyncThunk(
    'projects/getClientProjects',
    async (_, thunkAPI) => {
        try {
            return await projectService.getClientProjects();
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get project by ID
export const getProjectById = createAsyncThunk(
    'projects/getById',
    async (id, thunkAPI) => {
        try {
            return await projectService.getProjectById(id);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create project from quote
export const createProjectFromQuote = createAsyncThunk(
    'projects/createFromQuote',
    async (quoteId, thunkAPI) => {
        try {
            return await projectService.createProjectFromQuote(quoteId);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update project status
export const updateProjectStatus = createAsyncThunk(
    'projects/updateStatus',
    async ({ projectId, status }, thunkAPI) => {
        try {
            return await projectService.updateProjectStatus(projectId, status);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update project progress
export const updateProgress = createAsyncThunk(
    'projects/updateProgress',
    async ({ projectId, progress }, thunkAPI) => {
        try {
            return await projectService.updateProgress(projectId, progress);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Add comment
export const addComment = createAsyncThunk(
    'projects/addComment',
    async ({ projectId, text }, thunkAPI) => {
        try {
            return await projectService.addComment(projectId, text);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all projects
            .addCase(getAllProjects.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects = action.payload;
            })
            .addCase(getAllProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get writer projects
            .addCase(getWriterProjects.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getWriterProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects = action.payload;
            })
            .addCase(getWriterProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get client projects
            .addCase(getClientProjects.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getClientProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects = action.payload;
            })
            .addCase(getClientProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get project by ID
            .addCase(getProjectById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProjectById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.currentProject = action.payload;
            })
            .addCase(getProjectById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Create project from quote
            .addCase(createProjectFromQuote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createProjectFromQuote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects.push(action.payload);
            })
            .addCase(createProjectFromQuote.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Update project status
            .addCase(updateProjectStatus.fulfilled, (state, action) => {
                state.isSuccess = true;
                const index = state.projects.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.projects[index] = action.payload;
                }
                if (state.currentProject?._id === action.payload._id) {
                    state.currentProject = action.payload;
                }
            })
            // Update progress
            .addCase(updateProgress.fulfilled, (state, action) => {
                state.isSuccess = true;
                const index = state.projects.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.projects[index] = action.payload;
                }
                if (state.currentProject?._id === action.payload._id) {
                    state.currentProject = action.payload;
                }
            })
            // Add comment
            .addCase(addComment.fulfilled, (state, action) => {
                state.isSuccess = true;
                if (state.currentProject?._id === action.payload._id) {
                    state.currentProject = action.payload;
                }
            });
    },
});

export const { reset, clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer; 