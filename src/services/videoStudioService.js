import axiosWithAuth from '../utils/axioswithAuth';

const BASE = '/video-studio';

export const getChannels = () => axiosWithAuth.get(`${BASE}/channels`).then((r) => r.data);

export const getVideos = (params = {}) =>
  axiosWithAuth.get(BASE, { params }).then((r) => r.data);

export const createVideo = (data) => axiosWithAuth.post(BASE, data).then((r) => r.data);

export const generateScript = (data) =>
  axiosWithAuth.post(`${BASE}/generate`, data).then((r) => r.data);

export const updateVideo = (id, data) =>
  axiosWithAuth.patch(`${BASE}/${id}`, data).then((r) => r.data);

export const deleteVideo = (id) => axiosWithAuth.delete(`${BASE}/${id}`).then((r) => r.data);

export const enqueueRender = (id) =>
  axiosWithAuth.post(`${BASE}/${id}/enqueue`).then((r) => r.data);

export const approveVideo = (id) =>
  axiosWithAuth.post(`${BASE}/${id}/approve`).then((r) => r.data);

export const publishVideo = (id, publishedUrl) =>
  axiosWithAuth.post(`${BASE}/${id}/publish`, { publishedUrl }).then((r) => r.data);

export default {
  getChannels, getVideos, createVideo, generateScript,
  updateVideo, deleteVideo, enqueueRender, approveVideo, publishVideo,
};
