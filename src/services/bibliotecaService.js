import axiosWithAuth from '../utils/axioswithAuth';

const BASE = '/biblioteca';

export const getResumen = () => axiosWithAuth.get(`${BASE}/resumen`).then((r) => r.data);
export const getCotizaciones = (params = {}) =>
  axiosWithAuth.get(`${BASE}/cotizaciones`, { params }).then((r) => r.data);
export const getProyectos = () => axiosWithAuth.get(`${BASE}/proyectos`).then((r) => r.data);
export const getArchivos = () => axiosWithAuth.get(`${BASE}/archivos`).then((r) => r.data);

export const getResenas = () => axiosWithAuth.get(`${BASE}/resenas`).then((r) => r.data);
export const createResena = (data) => axiosWithAuth.post(`${BASE}/resenas`, data).then((r) => r.data);
export const updateResena = (id, data) => axiosWithAuth.put(`${BASE}/resenas/${id}`, data).then((r) => r.data);
export const deleteResena = (id) => axiosWithAuth.delete(`${BASE}/resenas/${id}`).then((r) => r.data);

export const getContextoIA = () => axiosWithAuth.get(`${BASE}/contexto-ia`).then((r) => r.data);
