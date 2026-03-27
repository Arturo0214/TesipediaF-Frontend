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
  let config = {};

  if (file) {
    payload = new FormData();
    payload.append('wa_id', waId);
    // Siempre enviar mensaje (puede ser vacío para notas de voz)
    payload.append('mensaje', mensaje || '');
    payload.append('file', file);
    // NO establecer Content-Type manualmente — axios auto-detecta multipart/form-data con boundary
    // Si se pone 'multipart/form-data' sin boundary, multer no puede parsear el archivo
    config = {};
  } else {
    payload = { wa_id: waId, mensaje };
  }

  const { data } = await axiosWithAuth.post(`${BASE}/send`, payload, config);
  return data;
}

/**
 * Actualizar estado_sofia de un lead
 */
export async function updateLeadEstado(waId, estado_sofia) {
  const { data } = await axiosWithAuth.patch(`${BASE}/leads/${waId}/estado`, { estado_sofia });
  return data;
}

/**
 * Verificar estado de ventana de 24h para un lead
 */
export async function getWindowStatus(waId) {
  const { data } = await axiosWithAuth.get(`${BASE}/leads/${waId}/window-status`);
  return data;
}

/**
 * Enviar solo la plantilla de seguimiento para revivir una conversación
 */
export async function sendTemplateMessage(waId) {
  const { data } = await axiosWithAuth.post(`${BASE}/send-template`, { wa_id: waId });
  return data;
}

/**
 * Ya no se necesita appendMessageToHistory — el Backend lo hace en /send
 */

/**
 * Reclamar un lead (asignar atendido_por).
 * Solo se asigna si el lead NO tiene dueño aún.
 * El backend decide si acepta o rechaza.
 */
export async function claimLead(waId, adminName) {
  const { data } = await axiosWithAuth.patch(`${BASE}/leads/${waId}/claim`, {
    atendido_por: adminName,
  });
  return data;
}

/**
 * Enviar recordatorios de Sofia a leads estancados.
 * @param {number} hours — ventana de tiempo en horas (default 24)
 */
export async function sendSofiaReminders(hours = 24) {
  const { data } = await axiosWithAuth.post(`${BASE}/reengagement`, { hours });
  return data;
}

/**
 * Obtener estado del auto-reminder de Sofia
 */
export async function getAutoReminderStatus() {
  const { data } = await axiosWithAuth.get(`${BASE}/auto-reminder`);
  return data;
}

/**
 * Configurar / activar / desactivar el auto-reminder de Sofia
 * @param {{ active?: boolean, intervalMinutes?: number, staleMinutes?: number, maxPerRun?: number }} config
 */
export async function configAutoReminder(config) {
  const { data } = await axiosWithAuth.post(`${BASE}/auto-reminder`, config);
  return data;
}

// ─── Lead Notes ───────────────────────────────────────────────

const NOTES_BASE = '/api/v1/lead-notes';

export async function getLeadNotes(waId) {
  const { data } = await axiosWithAuth.get(`${NOTES_BASE}/${waId}`);
  return data;
}

export async function createLeadNote(waId, content) {
  const { data } = await axiosWithAuth.post(`${NOTES_BASE}/${waId}`, { content });
  return data;
}

export async function deleteLeadNote(noteId) {
  const { data } = await axiosWithAuth.delete(`${NOTES_BASE}/${noteId}`);
  return data;
}

// ─── Bloqueo de contactos ─────────────────────────────────────

/**
 * Bloquear o desbloquear un contacto
 * @param {string} waId - WhatsApp ID del lead
 * @param {boolean} blocked - true para bloquear, false para desbloquear
 */
export async function toggleBlockLead(waId, blocked) {
  const { data } = await axiosWithAuth.patch(`${BASE}/leads/${waId}/block`, { blocked });
  return data;
}

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
