import axiosWithAuth from '../utils/axioswithAuth';

const BASE = '/noticias';

export const listNoticias = () => axiosWithAuth.get(`${BASE}/admin`).then((r) => r.data.noticias || []);
export const getNoticia = (id) => axiosWithAuth.get(`${BASE}/admin/${id}`).then((r) => r.data);
export const crearNoticia = (data) => axiosWithAuth.post(`${BASE}/admin`, data).then((r) => r.data);
export const actualizarNoticia = (id, data) => axiosWithAuth.patch(`${BASE}/admin/${id}`, data).then((r) => r.data);
export const publicarNoticia = (id) => axiosWithAuth.post(`${BASE}/admin/${id}/publicar`).then((r) => r.data);
export const despublicarNoticia = (id) => axiosWithAuth.post(`${BASE}/admin/${id}/despublicar`).then((r) => r.data);
export const borrarNoticia = (id) => axiosWithAuth.delete(`${BASE}/admin/${id}`).then((r) => r.data);
export const recolectarRSS = (categoria) => axiosWithAuth.post(`${BASE}/admin/recolectar`, { categoria }, { timeout: 60000 }).then((r) => r.data);

export default {
  listNoticias, getNoticia, crearNoticia, actualizarNoticia,
  publicarNoticia, despublicarNoticia, borrarNoticia, recolectarRSS,
};
