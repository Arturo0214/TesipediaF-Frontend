/**
 * Servicio WhatsApp — Panel de administración
 * Conecta con el Backend de Tesipedia (que a su vez habla con Supabase y WhatsApp API)
 * Las credenciales sensibles quedan en el Backend, nunca en el frontend.
 */

import axiosWithAuth from '../../utils/axioswithAuth';

const BASE = '/api/v1/whatsapp';

/**
 * Obtener todos los leads con conversaciones
 */
export async function getLeads() {
  const { data } = await axiosWithAuth.get(`${BASE}/leads`);
  return data;
}

/**
 * Obtener un lead específico por wa_id
 */
export async function getLeadByWaId(waId) {
  const { data } = await axiosWithAuth.get(`${BASE}/leads/${waId}`);
  return data;
}

/**
 * Activar/desactivar modo humano para un lead
 */
export async function toggleModoHumano(waId, modoHumano) {
  const { data } = await axiosWithAuth.patch(`${BASE}/leads/${waId}/modo-humano`, {
    modo_humano: modoHumano,
  });
  return data;
}

/**
 * Enviar mensaje de WhatsApp (y archivo) y guardar en historial
 * Todo pasa por el Backend (seguro)
 */
export async function sendWhatsAppMessage(waId, mensaje, file = null) {
  let payload;

  if (file) {
    payload = new FormData();
    payload.append('wa_id', waId);
    if (mensaje) payload.append('mensaje', mensaje);
    payload.append('file', file);
  } else {
    payload = { wa_id: waId, mensaje };
  }

  const { data } = await axiosWithAuth.post(`${BASE}/send`, payload);
  return data;
}

/**
 * Ya no se necesita appendMessageToHistory — el Backend lo hace en /send
 */

/**
 * Parsear historial_chat que puede venir como string JSON o array
 */
export function parseHistorial(historialRaw) {
  if (Array.isArray(historialRaw)) return historialRaw;
  if (typeof historialRaw === 'string' && historialRaw.trim()) {
    try {
      return JSON.parse(historialRaw.replace(/^=/, ''));
    } catch {
      return [];
    }
  }
  return [];
}
