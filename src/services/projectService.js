import axiosWithAuth from '../utils/axioswithAuth';

const API_URL = '/projects';

// Get all projects (admin only)
const getAllProjects = async () => {
    const response = await axiosWithAuth.get(API_URL);
    return response.data;
};

// Get writer's projects
const getWriterProjects = async () => {
    const response = await axiosWithAuth.get(`${API_URL}/writer`);
    return response.data;
};

// Get client's projects
const getClientProjects = async () => {
    const response = await axiosWithAuth.get(`${API_URL}/client`);
    return response.data;
};

// Get project by ID
const getProjectById = async (id) => {
    const response = await axiosWithAuth.get(`${API_URL}/${id}`);
    return response.data;
};

// Create project from quote
const createProjectFromQuote = async (quoteId) => {
    const response = await axiosWithAuth.post(API_URL, { quoteId });
    return response.data;
};

// Assign writer to project
const assignWriter = async (projectId, writerId) => {
    const response = await axiosWithAuth.put(`${API_URL}/${projectId}/assign`, { writerId });
    return response.data;
};

// Update project status
const updateProjectStatus = async (projectId, status) => {
    const response = await axiosWithAuth.put(`${API_URL}/${projectId}/status`, { status });
    return response.data;
};

// Update project progress
const updateProgress = async (projectId, progress) => {
    const response = await axiosWithAuth.put(`${API_URL}/${projectId}/progress`, { progress });
    return response.data;
};

// Add comment to project
const addComment = async (projectId, text) => {
    const response = await axiosWithAuth.post(`${API_URL}/${projectId}/comments`, { text });
    return response.data;
};

// Create new project
const createProject = async (projectData) => {
    const response = await axiosWithAuth.post(API_URL, projectData);
    return response.data;
};

// Update project
const updateProject = async (id, projectData) => {
    const response = await axiosWithAuth.put(`${API_URL}/${id}`, projectData);
    return response.data;
};

// Delete project
const deleteProject = async (id) => {
    const response = await axiosWithAuth.delete(`${API_URL}/${id}`);
    return response.data;
};

const projectService = {
    getAllProjects,
    getWriterProjects,
    getClientProjects,
    getProjectById,
    createProjectFromQuote,
    assignWriter,
    updateProjectStatus,
    updateProgress,
    addComment,
    createProject,
    updateProject,
    deleteProject
};

export default projectService; 