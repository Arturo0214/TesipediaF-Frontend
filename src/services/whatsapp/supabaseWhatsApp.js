/**
 * Servicio WhatsApp — Panel de administración
 * Conecta con el Backend de Tesipedia (que a su vez habla con Supabase y WhatsApp API)
 * Las credenciales sensibles quedan en el Backend, nunca en el frontend.
 */

import { API_URL } from '../../config/constants';

const BASE = `${API_URL}/api/v1/whatsapp`;

/**
 * Helper: fetch con credenciales (cookies JWT)
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `Error ${res.status}` }));
    throw new Error(errorData.message || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * Obtener todos los leads con conversaciones
 */
export async function getLeads() {
  return apiFetch('/leads');
}

/**
 * Obtener un lead específico por wa_id
 */
export async function getLeadByWaId(waId) {
  return apiFetch(`/leads/${waId}`);
}

/**
 * Activar/desactivar modo humano para un lead
 */
export async function toggleModoHumano(waId, modoHumano) {
  return apiFetch(`/leads/${waId}/modo-humano`, {
    method: 'PATCH',
    body: JSON.stringify({ modo_humano: modoHumano }),
  });
}

/**
 * Enviar mensaje de WhatsApp y guardar en historial
 * Todo pasa por el Backend (seguro)
 */
export async function sendWhatsAppMessage(waId, mensaje) {
  return apiFetch('/send', {
    method: 'POST',
    body: JSON.stringify({ wa_id: waId, mensaje }),
  });
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
