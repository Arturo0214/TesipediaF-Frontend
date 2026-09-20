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

// Comprobantes de pago (por parcialidad) — el backend comprime imágenes con sharp
export const uploadComprobante = (type, id, file, installmentIdx) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('installmentIdx', String(installmentIdx));
  return axiosWithAuth.post(`${BASE}/${type}/${id}/comprobante`, fd).then((r) => r.data);
};

export const deleteComprobante = (type, id, comprobanteId) =>
  axiosWithAuth.delete(`${BASE}/${type}/${id}/comprobante/${comprobanteId}`).then((r) => r.data);

// Acuerdos con el lead (correcciones + fecha de entrega)
export const addAcuerdo = (type, id, data) =>
  axiosWithAuth.post(`${BASE}/${type}/${id}/acuerdo`, data).then((r) => r.data);

export const deleteAcuerdo = (type, id, acuerdoId) =>
  axiosWithAuth.delete(`${BASE}/${type}/${id}/acuerdo/${acuerdoId}`).then((r) => r.data);

// Importar acuerdos desde sesiones de Fireflies (IA)
export const syncFireflies = (dias = 14) =>
  axiosWithAuth.post(`${BASE}/fireflies/sync`, { dias }).then((r) => r.data);
