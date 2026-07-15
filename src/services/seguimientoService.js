import axiosWithAuth from '../utils/axioswithAuth';

const BASE = '/seguimientos';

export const getSeguimientos = () => axiosWithAuth.get(BASE).then((r) => r.data);

export const addNota = (type, id, texto) =>
  axiosWithAuth.post(`${BASE}/${type}/${id}/nota`, { texto }).then((r) => r.data);

export const deleteNota = (type, id, notaId) =>
  axiosWithAuth.delete(`${BASE}/${type}/${id}/nota/${notaId}`).then((r) => r.data);

export const updateSeguimiento = (type, id, data) =>
  axiosWithAuth.patch(`${BASE}/${type}/${id}`, data).then((r) => r.data);

export const uploadArchivo = (type, id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosWithAuth.post(`${BASE}/${type}/${id}/archivo`, fd).then((r) => r.data);
};

export const deleteArchivo = (type, id, archivoId) =>
  axiosWithAuth.delete(`${BASE}/${type}/${id}/archivo/${archivoId}`).then((r) => r.data);
