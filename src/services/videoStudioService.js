import axiosWithAuth from '../utils/axioswithAuth';

const BASE = '/video-studio';

// Destinos (canales)
export const getChannels = () => axiosWithAuth.get(`${BASE}/channels`).then((r) => r.data);
export const updateChannel = (id, data) =>
  axiosWithAuth.patch(`${BASE}/channels/${id}`, data).then((r) => r.data);

// Cola de contenido
export const getVideos = (params = {}) =>
  axiosWithAuth.get(BASE, { params }).then((r) => r.data);

export const createVideo = (data) => axiosWithAuth.post(BASE, data).then((r) => r.data);

export const generateScript = (data) =>
  axiosWithAuth.post(`${BASE}/generate`, data).then((r) => r.data);

export const updateVideo = (id, data) =>
  axiosWithAuth.patch(`${BASE}/${id}`, data).then((r) => r.data);

export const deleteVideo = (id) => axiosWithAuth.delete(`${BASE}/${id}`).then((r) => r.data);

export const approveVideo = (id) =>
  axiosWithAuth.post(`${BASE}/${id}/approve`).then((r) => r.data);

export const publishVideo = (id) =>
  axiosWithAuth.post(`${BASE}/${id}/publish`).then((r) => r.data);

export default {
  getChannels, updateChannel, getVideos, createVideo, generateScript,
  updateVideo, deleteVideo, approveVideo, publishVideo,
};
