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
export async function getLeads(origen = 'regular', limit = 100, offset = 0, filters = {}) {
  const params = new URLSearchParams({ origen, limit, offset });
  if (filters.estado && filters.estado !== 'all') params.set('estado', filters.estado);
  if (filters.atendido && filters.atendido !== 'all') params.set('atendido', filters.atendido);
  if (filters.fecha) params.set('fecha', filters.fecha);
  if (filters.search) params.set('search', filters.search);
  const { data } = await axiosWithAuth.get(`${BASE}/leads?${params.toString()}`);
  return data; // { leads: [...], total, limit, offset, hasMore }
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
 * Actualizar notas y etiquetas de un lead
 */
export async function updateLeadNotes(waId, { notas_admin, etiquetas }) {
  const { data } = await axiosWithAuth.patch(`${BASE}/leads/${waId}/notes`, { notas_admin, etiquetas });
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

// ─── Lead Revival (Cold leads re-engagement) ─────────────────

/**
 * Obtener estado del sistema de revival de leads
 */
export async function getRevivalStatus() {
  const { data } = await axiosWithAuth.get(`${BASE}/revival/status`);
  return data;
}

/**
 * Configurar el sistema de revival automático
 * @param {{ active?: boolean, intervalHours?: number, maxPerRun?: number }} config
 */
export async function configRevival(config) {
  const { data } = await axiosWithAuth.post(`${BASE}/revival/config`, config);
  return data;
}

/**
 * Ejecutar revival manualmente
 * @param {{ maxPerRun?: number, dryRun?: boolean, tiers?: number[] }} opts
 */
export async function runRevival(opts = {}) {
  const { data } = await axiosWithAuth.post(`${BASE}/revival`, opts);
  return data;
}

// ─── Quote Follow-up ──────────────────────────────────────────

/**
 * Obtener estado del sistema de seguimiento de cotizaciones
 */
export async function getQuoteFollowUpStatus() {
  const { data } = await axiosWithAuth.get(`${BASE}/quote-followup/status`);
  return data;
}

/**
 * Configurar el sistema de seguimiento automático de cotizaciones
 * @param {{ active?: boolean, intervalHours?: number, maxPerRun?: number }} config
 */
export async function configQuoteFollowUp(config) {
  const { data } = await axiosWithAuth.post(`${BASE}/quote-followup/config`, config);
  return data;
}

/**
 * Ejecutar seguimiento de cotizaciones manualmente
 * @param {{ maxPerRun?: number, dryRun?: boolean, tiers?: number[] }} opts
 */
export async function runQuoteFollowUp(opts = {}) {
  const { data } = await axiosWithAuth.post(`${BASE}/quote-followup`, opts);
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

// ─── ManyChat Reactivation ─────────────────────────────────────

/**
 * Obtener status de la reactivación ManyChat
 */
export async function getManyChatStatus() {
  const { data } = await axiosWithAuth.get(`${BASE}/manychat/status`);
  return data;
}

/**
 * Importar contactos ManyChat a Supabase
 * @param {Object} options - { segments, dryRun }
 */
export async function importManyChatLeads(options = {}) {
  const { data } = await axiosWithAuth.post(`${BASE}/manychat/import`, options);
  return data;
}

/**
 * Enviar reactivación ManyChat
 * @param {Object} options - { segments, maxPerRun, dryRun, startIndex }
 */
export async function sendManyChatReactivation(options = {}) {
  const { data } = await axiosWithAuth.post(`${BASE}/manychat/send`, options);
  return data;
}

/**
 * Preview de mensajes ManyChat sin enviar
 * @param {string} segment - Segmento a previsualizar
 * @param {number} limit - Cantidad de previews
 */
export async function previewManyChatMessages(segment = 'SUPER_HOT', limit = 5) {
  const { data } = await axiosWithAuth.get(`${BASE}/manychat/preview?segment=${segment}&limit=${limit}`);
  return data;
}

/**
 * Obtener leads ManyChat con vista inteligente
 * @param {string} filter - 'respondieron' | 'enviados' | 'pendientes' | 'todos'
 * @param {number} page
 * @param {number} limit
 */
export async function getManyChatLeads(filter = 'respondieron', page = 1, limit = 20) {
  const { data } = await axiosWithAuth.get(`${BASE}/manychat/leads?filter=${filter}&page=${page}&limit=${limit}`);
  return data;
}

// ─── Leads Stats (Informes) ───────────────────────────

/**
 * Obtener métricas completas de leads para el panel de informes
 */
export async function getLeadsStats(origen = 'all') {
  const { data } = await axiosWithAuth.get(`${BASE}/leads-stats?origen=${origen}`);
  return data;
}

// ─── Calificación Follow-Up ──────────────────────────

export async function getCalificacionFollowUpStatus() {
  const { data } = await axiosWithAuth.get(`${BASE}/calificacion-followup/status`);
  return data;
}

export async function configCalificacionFollowUp(config) {
  const { data } = await axiosWithAuth.post(`${BASE}/calificacion-followup/config`, config);
  return data;
}

export async function runCalificacionFollowUp(opts = {}) {
  const { data } = await axiosWithAuth.post(`${BASE}/calificacion-followup`, opts);
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
