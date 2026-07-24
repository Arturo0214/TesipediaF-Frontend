import axiosWithAuth from '../utils/axioswithAuth';

const BASE = '/api/v1/whatsapp';

// Tablero diario: todos los leads que llegaron un día + métricas + patrón de compradores
export const getLeadsDiario = (fecha) =>
  axiosWithAuth
    .get(`${BASE}/leads-diario${fecha ? `?fecha=${fecha}` : ''}`)
    .then((r) => r.data);

// Guardar observaciones / razón de descarte de un lead (reusa el endpoint de notas)
export const updateLeadSeguimiento = (waId, data) =>
  axiosWithAuth.patch(`${BASE}/leads/${waId}/notes`, data).then((r) => r.data);
