import { createSelector } from '@reduxjs/toolkit';

const selectProjectsState = state => state.projects;

export const selectCurrentProject = createSelector(
    [selectProjectsState],
    projects => projects?.currentProject || null
);

export const selectProjectStatus = createSelector(
    [selectProjectsState],
    projects => ({
        isLoading: projects?.isLoading || false,
        isError: projects?.isError || false,
        message: projects?.message || ''
    })
); 