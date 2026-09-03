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

// Contenido de redes (imágenes, tabla contenido_social)
export const getSocial = (params = {}) =>
  axiosWithAuth.get(`${BASE}/social`, { params }).then((r) => r.data);
export const updateSocial = (id, data) =>
  axiosWithAuth.patch(`${BASE}/social/${id}`, data).then((r) => r.data);
export const approveSocial = (id) =>
  axiosWithAuth.post(`${BASE}/social/${id}/approve`).then((r) => r.data);
export const discardSocial = (id) =>
  axiosWithAuth.post(`${BASE}/social/${id}/discard`).then((r) => r.data);
export const uploadSocialImage = (id, file, index) => {
  const fd = new FormData();
  fd.append('imagen', file);
  fd.append('index', String(index));
  return axiosWithAuth.post(`${BASE}/social/${id}/imagen`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};
export const publishSocial = (id) => axiosWithAuth.post(`${BASE}/social/${id}/publish`).then((r) => r.data);
export const deleteSocial = (id) => axiosWithAuth.delete(`${BASE}/social/${id}`).then((r) => r.data);
export const sugerenciasSocial = (id) => axiosWithAuth.post(`${BASE}/social/${id}/sugerencias`).then((r) => r.data);

export default {
  getChannels, updateChannel, getVideos, createVideo, generateScript,
  updateVideo, deleteVideo, approveVideo, publishVideo,
  getSocial, updateSocial, approveSocial, discardSocial, uploadSocialImage,
  publishSocial, deleteSocial, sugerenciasSocial,
};
