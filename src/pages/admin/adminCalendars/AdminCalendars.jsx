import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
  FaCalendarAlt, FaGoogle, FaSync, FaLink, FaUnlink, FaTimes,
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaClock, FaPlus,
  FaToggleOn, FaToggleOff, FaWhatsapp, FaEdit, FaTrash,
  FaCloudUploadAlt, FaProjectDiagram, FaDollarSign, FaPhone, FaRegCopy,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './AdminCalendars.css';

const ADMINS = [
  { key: 'arturo', label: 'Arturo', color: '#f59e0b' },
  { key: 'sandy', label: 'Sandy', color: '#9b8afb' },
  { key: 'hugo', label: 'Hugo', color: '#3b82f6' },
];

// Paleta dark-friendly: fondos traslúcidos + texto claro (antes eran pasteles
// claros con texto oscuro que en modo oscuro no se leían)
const EVENT_COLORS = {
  '📦': { bg: 'rgba(250,204,21,0.18)', border: '#facc15', text: '#fde047', label: 'Entrega' },     // entregas = AMARILLO
  '📋': { bg: 'rgba(245,158,11,0.16)', border: '#f59e0b', text: '#fcd34d', label: 'Proyecto' },
  '💰': { bg: 'rgba(16,185,129,0.16)', border: '#10b981', text: '#6ee7b7', label: 'Pago' },
  '📞': { bg: 'rgba(59,130,246,0.16)', border: '#3b82f6', text: '#93c5fd', label: 'Llamada' },
};
const MEET_STYLE = { bg: 'rgba(59,130,246,0.2)', border: '#3b82f6', text: '#93c5fd', label: 'Reunión Meet' }; // reuniones con Meet = AZUL

const hexToRgba = (hex, a) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return `rgba(148,163,184,${a})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
};

// Si el evento no es de Tesipedia (📋💰📞), hereda el color de SU calendario de Google
function getEventStyle(summary, calendarColor, hasMeet = false) {
  for (const [emoji, style] of Object.entries(EVENT_COLORS)) {
    if (summary?.startsWith(emoji)) return style;
  }
  if (hasMeet) return MEET_STYLE;
  const c = calendarColor || '#94a3b8';
  return { bg: hexToRgba(c, 0.15), border: c, text: '#e2e8f0', label: 'Evento' };
}

// Google manda eventos de todo el día como "YYYY-MM-DD"; parsearlo con new Date()
// lo interpreta en UTC y en México el evento se pintaba UN DÍA ANTES.
const parseEventDate = (ev) => {
  if (ev.start?.dateTime) return new Date(ev.start.dateTime);
  const [y, m, d] = String(ev.start?.date || '').split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
};

const toYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function AdminCalendars() {
  const { user, isSuperAdmin } = useSelector(state => state.auth || {});
  const currentUserName = (user?.name || '').toLowerCase().trim();
  // Paula gestiona las entregas de Arturo: ve los calendarios igual que los dueños
  const isOwner = isSuperAdmin || currentUserName === 'arturo' || currentUserName === 'hugo serrano' || currentUserName.includes('paula');
  const [connectedAdmins, setConnectedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(isOwner ? 'arturo' : currentUserName.split(' ')[0]);
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]); // calendarios de la cuenta Google
  const [eventsLoading, setEventsLoading] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [syncing, setSyncing] = useState(false);

  // Modals
  const [dayDetail, setDayDetail] = useState(null); // { date, events }
  const [expandedEv, setExpandedEv] = useState(null); // evento expandido en la agenda del día
  const [editEvent, setEditEvent] = useState(null); // event object or 'new'
  const [eventForm, setEventForm] = useState({ summary: '', description: '', date: '', time: '', endTime: '', attendees: '', meet: false });
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const { data } = await axiosWithAuth.get('/google/admins');
      setConnectedAdmins(data);
    } catch (err) { console.error('Error cargando admins:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const fetchEvents = useCallback(async () => {
    if (!connectedAdmins.some(a => a.adminKey === selectedAdmin)) { setEvents([]); return; }
    setEventsLoading(true);
    try {
      const year = calMonth.getFullYear();
      const month = calMonth.getMonth();
      const timeMin = new Date(year, month, 1).toISOString();
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const { data } = await axiosWithAuth.get(`/google/events?admin=${selectedAdmin}&timeMin=${timeMin}&timeMax=${timeMax}`);
      setEvents(data.items || []);
      setCalendars(data.calendarios || []);
    } catch (err) { setEvents([]); }
    setEventsLoading(false);
  }, [selectedAdmin, calMonth, connectedAdmins]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const connectCalendar = async (adminKey) => {
    try {
      const { data } = await axiosWithAuth.get(`/google/auth-url?admin=${adminKey}`);
      window.location.href = data.authUrl;
    } catch (err) { toast.error('Error al obtener URL de autenticación'); }
  };

  const disconnectCalendar = async (adminKey) => {
    try {
      await axiosWithAuth.post('/google/disconnect', { adminKey });
      toast.success(`Calendario de ${adminKey} desconectado`);
      fetchAdmins();
    } catch (err) { toast.error('Error al desconectar'); }
  };

  const toggleAutoSync = async (adminKey, current) => {
    try {
      await axiosWithAuth.post('/google/toggle-autosync', { adminKey, autoSync: !current });
      toast.success(`Auto-sync ${!current ? 'activado' : 'desactivado'}`);
      fetchAdmins();
    } catch (err) { toast.error('Error al cambiar auto-sync'); }
  };

  // Bulk sync
  const handleBulkSync = async () => {
    setSyncing(true);
    try {
      const { data } = await axiosWithAuth.post('/google/bulk-sync', { adminKey: selectedAdmin });
      toast.success(`Sincronizados ${data.syncedProjects} proyectos y ${data.syncedPayments} pagos`);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al sincronizar');
    }
    setSyncing(false);
  };

  // Create/Edit event
  const openNewEvent = (date, time = '10:00') => {
    const dateStr = toYMD(date || new Date());
    const endTime = `${String(Math.min(23, Number(time.split(':')[0]) + 1)).padStart(2, '0')}:${time.split(':')[1]}`;
    setEventForm({ summary: '', description: '', date: dateStr, time, endTime, attendees: '', meet: false });
    setEditEvent('new');
  };

  const openEditEvent = (ev) => {
    if (ev.readOnly) { toast('Este evento es de un calendario de solo lectura', { icon: '🔒' }); return; }
    const start = ev.start?.dateTime || ev.start?.date || '';
    const end = ev.end?.dateTime || ev.end?.date || '';
    const isAllDay = !!ev.start?.date;
    setEventForm({
      summary: ev.summary || '',
      description: ev.description || '',
      date: isAllDay ? start : start.split('T')[0],
      time: isAllDay ? '' : start.split('T')[1]?.slice(0, 5) || '',
      endTime: isAllDay ? '' : end.split('T')[1]?.slice(0, 5) || '',
      attendees: (ev.attendees || []).map((a) => a.email).filter(Boolean).join(', '),
      meet: false, // solo aplica al crear; el link existente se muestra aparte
    });
    setEditEvent(ev);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.summary || !eventForm.date) { toast.error('Título y fecha requeridos'); return; }
    setSaving(true);
    try {
      const payload = {
        adminKey: selectedAdmin,
        summary: eventForm.summary,
        description: eventForm.description,
        startDate: eventForm.date,
        endDate: eventForm.date,
        startTime: eventForm.time || undefined,
        endTime: eventForm.endTime || undefined,
        attendees: eventForm.attendees,
        meet: eventForm.meet,
      };

      if (editEvent === 'new') {
        const { data } = await axiosWithAuth.post('/google/events', payload);
        if (data.hangoutLink) {
          // Reunión con Meet: dejar el modal abierto mostrando el link recién generado
          toast.success('Reunión creada — aquí está tu link de Meet 🎥');
          setEditEvent(data);
          fetchEvents();
          setSaving(false);
          return;
        }
        toast.success('Evento creado');
      } else {
        await axiosWithAuth.put(`/google/events/${editEvent.id}`, { ...payload, calendarId: editEvent.calendarId || 'primary' });
        toast.success('Evento actualizado');
      }
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar evento');
    }
    setSaving(false);
  };

  const copyMeetLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link de Meet copiado 📋');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('Link de Meet copiado 📋');
    }
  };

  const handleDeleteEvent = async (ev) => {
    try {
      await axiosWithAuth.delete(`/google/events/${ev.id}?admin=${selectedAdmin}&calendarId=${encodeURIComponent(ev.calendarId || 'primary')}`);
      toast.success('Evento eliminado');
      setEditEvent(null);
      setDayDetail(null);
      fetchEvents();
    } catch (err) { toast.error('Error al eliminar evento'); }
  };

  // Day click
  const openDay = (day, dayEvents) => {
    if (dayEvents.length > 0) setDayDetail({ date: day, events: dayEvents });
  };

  const isConnected = (key) => connectedAdmins.some(a => a.adminKey === key);
  const getAdminInfo = (key) => connectedAdmins.find(a => a.adminKey === key);

  // Calendar render
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDow = firstDay.getDay();
  const calDays = [];
  for (let i = 0; i < startingDow; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(new Date(year, month, i));
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="ac-container">
      <div className="ac-header">
        <div>
          <h1><FaCalendarAlt /> Calendarios</h1>
          <p className="ac-subtitle">Google Calendar vinculado con proyectos y pagos</p>
        </div>
      </div>

      {/* Admin Cards */}
      <div className="ac-admins-grid">
        {ADMINS.filter(admin => isOwner || admin.key === currentUserName.split(' ')[0]).map(admin => {
          const connected = isConnected(admin.key);
          const info = getAdminInfo(admin.key);
          return (
            <div key={admin.key}
              className={`ac-admin-card ${connected ? 'connected' : ''} ${selectedAdmin === admin.key ? 'selected' : ''}`}
              onClick={() => connected && setSelectedAdmin(admin.key)}>
              <div className="ac-admin-card-header" style={{ borderTopColor: admin.color }}>
                <div className="ac-admin-avatar" style={{ background: admin.color }}>{admin.label[0]}</div>
                <div className="ac-admin-info">
                  <strong>{admin.label}</strong>
                  {connected
                    ? <span className="ac-admin-email"><FaGoogle /> {info?.googleEmail || 'Conectado'}</span>
                    : <span className="ac-admin-disconnected">No conectado</span>}
                </div>
              </div>
              <div className="ac-admin-card-actions">
                {connected ? (
                  <>
                    <button className="ac-btn ac-btn-autosync" onClick={(e) => { e.stopPropagation(); toggleAutoSync(admin.key, info?.autoSync); }}>
                      {info?.autoSync ? <FaToggleOn style={{ color: '#16a34a', fontSize: '1.1rem' }} /> : <FaToggleOff style={{ fontSize: '1.1rem' }} />}
                      <span>Auto-sync</span>
                    </button>
                    <button className="ac-btn ac-btn-disconnect" onClick={(e) => { e.stopPropagation(); disconnectCalendar(admin.key); }}>
                      <FaUnlink />
                    </button>
                  </>
                ) : (
                  <button className="ac-btn ac-btn-connect" onClick={(e) => { e.stopPropagation(); connectCalendar(admin.key); }}>
                    <FaLink /> Conectar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar */}
      {isConnected(selectedAdmin) && (
        <div className="ac-calendar-section">
          <div className="ac-cal-header">
            <div className="ac-cal-title">
              <h2>Calendario de {ADMINS.find(a => a.key === selectedAdmin)?.label}</h2>
              <div className="ac-cal-actions">
                <button className="ac-btn ac-btn-sync" onClick={handleBulkSync} disabled={syncing} title="Sincronizar todos los proyectos y pagos activos">
                  <FaCloudUploadAlt className={syncing ? 'spinning' : ''} /> {syncing ? 'Sincronizando...' : 'Sync Todo'}
                </button>
                <button className="ac-btn ac-btn-new" onClick={() => openNewEvent(null)}>
                  <FaPlus /> Evento
                </button>
                <button className="ac-btn ac-btn-sm" onClick={fetchEvents} disabled={eventsLoading}>
                  <FaSync className={eventsLoading ? 'spinning' : ''} />
                </button>
              </div>
            </div>
            <div className="ac-cal-nav">
              <button onClick={() => setCalMonth(new Date(year, month - 1))}><FaChevronLeft /></button>
              <span className="ac-cal-month">{calMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCalMonth(new Date(year, month + 1))}><FaChevronRight /></button>
            </div>
          </div>

          <div className="ac-cal-grid">
            {dayLabels.map(d => <div key={d} className="ac-cal-day-header">{d}</div>)}
            {calDays.map((day, idx) => {
              const isToday = day && day.toDateString() === new Date().toDateString();
              // parseEventDate evita el corrimiento de -1 día en eventos de todo el día.
              // Los eventos que cruzan medianoche (ej. 😴 Sueño 22:30→6:30) cuentan en
              // AMBOS días: el que empiezan y el que terminan.
              const dayEvents = day ? events.filter(e => {
                if (parseEventDate(e).toDateString() === day.toDateString()) return true;
                if (e.start?.dateTime && e.end?.dateTime) {
                  const s = new Date(e.start.dateTime); const en = new Date(e.end.dateTime);
                  if (s.toDateString() !== en.toDateString() && en.toDateString() === day.toDateString()) return true;
                }
                return false;
              }) : [];
              const hasEvents = dayEvents.length > 0;

              return (
                <div key={idx}
                  className={`ac-cal-day ${isToday ? 'today' : ''} ${!day ? 'empty' : ''} ${hasEvents ? 'has-events' : ''}`}
                  onClick={() => day && (hasEvents ? openDay(day, dayEvents) : openNewEvent(day))}>
                  {day && <span className="ac-cal-day-num">{day.getDate()}</span>}
                  <div className="ac-cal-events">
                    {dayEvents.map((ev, i) => {
                      const style = getEventStyle(ev.summary, ev.calendarColor, !!ev.hangoutLink);
                      const hora = ev.start?.dateTime ? ev.start.dateTime.split('T')[1]?.slice(0, 5) : '';
                      return (
                        <div key={i} className="ac-cal-chip" title={`${hora ? hora + ' · ' : ''}${ev.summary}${ev.calendarSummary ? ` · ${ev.calendarSummary}` : ''}`}
                          style={{ background: style.bg, borderLeft: `3px solid ${style.border}` }}
                          onClick={(e) => { e.stopPropagation(); openEditEvent(ev); }}>
                          <span className="ac-cal-chip-text" style={{ color: style.text }}>
                            {hora && <em className="ac-chip-hora">{hora}</em>}
                            {ev.summary?.replace(/^[📋💰📞🔔📦]\s*/, '') || '(sin título)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {dayEvents.length > 4 && <span className="ac-cal-count">{dayEvents.length}</span>}
                </div>
              );
            })}
          </div>

          <div className="ac-legend">
            <span><span className="ac-legend-dot" style={{ background: '#facc15' }} /> Entregas</span>
            <span><span className="ac-legend-dot" style={{ background: '#3b82f6' }} /> Reuniones Meet</span>
            <span><span className="ac-legend-dot" style={{ background: '#f59e0b' }} /> Proyectos</span>
            <span><span className="ac-legend-dot" style={{ background: '#10b981' }} /> Pagos</span>
            <span><span className="ac-legend-dot" style={{ background: '#3b82f6' }} /> Llamadas</span>
            {calendars.filter(c => !c.primary).map(c => (
              <span key={c.id} title={`Calendario: ${c.nombre}`}>
                <span className="ac-legend-dot" style={{ background: c.color }} /> {c.nombre}
              </span>
            ))}
            <span className="ac-legend-total">{events.length} eventos este mes · {calendars.length} calendario{calendars.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {!isConnected(selectedAdmin) && !loading && (
        <div className="ac-empty">
          <FaGoogle style={{ fontSize: '3rem', color: '#d1d5db' }} />
          <p>Conecta el calendario de {ADMINS.find(a => a.key === selectedAdmin)?.label} para ver y editar eventos</p>
          <button className="ac-btn ac-btn-connect" onClick={() => connectCalendar(selectedAdmin)}>
            <FaLink /> Conectar Google Calendar
          </button>
        </div>
      )}

      {/* ===== DAY DETAIL MODAL: agenda hora por hora ===== */}
      {dayDetail && (() => {
        const allDay = dayDetail.events.filter((e) => !e.start?.dateTime);
        const dayStr = dayDetail.date.toDateString();
        // Hora "efectiva" en ESTE día: un evento que empezó el día anterior
        // (ej. Sueño 22:30→6:30) se pinta desde la medianoche
        const horaEfectiva = (e) => {
          const s = new Date(e.start.dateTime);
          return s.toDateString() === dayStr ? s.getHours() : 0;
        };
        const timed = dayDetail.events
          .filter((e) => e.start?.dateTime)
          .sort((a, b) => (horaEfectiva(a) - horaEfectiva(b)) || (new Date(a.start.dateTime) - new Date(b.start.dateTime)));
        // Rango de horas: 7–21 por default, extendido si hay eventos fuera
        // (los que cruzan medianoche abren el rango hasta 23 o desde 00)
        let minH = 7, maxH = 21;
        for (const e of timed) {
          const en = e.end?.dateTime ? new Date(e.end.dateTime) : null;
          const h = horaEfectiva(e);
          const hEnd = en ? (en.toDateString() === dayStr ? en.getHours() + (en.getMinutes() > 0 ? 1 : 0) : 24) : h + 1;
          if (h < minH) minH = h;
          maxH = Math.min(23, Math.max(maxH, hEnd, h));
        }
        const hours = Array.from({ length: maxH - minH + 1 }, (_, i) => minH + i);
        // ── Layout tipo calendario: un solo bloque por evento, alto según su duración ──
        const HPX = 46; // px por hora
        const lanes = [];
        const posiciones = timed.map((e) => {
          const s = new Date(e.start.dateTime);
          const en = e.end?.dateTime ? new Date(e.end.dateTime) : null;
          const iniMin = s.toDateString() === dayStr ? s.getHours() * 60 + s.getMinutes() : 0;
          const finMin = en ? (en.toDateString() === dayStr ? en.getHours() * 60 + en.getMinutes() : 24 * 60) : iniMin + 60;
          // carril para eventos encimados (se desplazan un poco a la derecha)
          let lane = 0;
          while (lanes[lane] && lanes[lane] > iniMin) lane++;
          lanes[lane] = finMin;
          return {
            e, lane,
            top: ((iniMin / 60) - minH) * HPX + 2,
            height: Math.max(24, ((finMin - iniMin) / 60) * HPX - 4),
          };
        });
        const fmtH = (h) => `${String(h).padStart(2, '0')}:00`;

        const renderEv = (ev) => {
          const style = getEventStyle(ev.summary, ev.calendarColor, !!ev.hangoutLink);
          const id = `${ev.id}-${ev.calendarId || ''}`;
          const open = expandedEv === id;
          const ini = ev.start?.dateTime ? ev.start.dateTime.split('T')[1].slice(0, 5) : '';
          const fin = ev.end?.dateTime ? ev.end.dateTime.split('T')[1].slice(0, 5) : '';
          return (
            <div key={id} className={`ac-tl-ev ${open ? 'open' : ''}`}
              style={{ background: style.bg, borderLeft: `3px solid ${style.border}` }}
              onClick={(e) => { e.stopPropagation(); setExpandedEv(open ? null : id); }}>
              <div className="ac-tl-ev-head">
                <strong style={{ color: style.text }}>{ev.summary || '(sin título)'}</strong>
                <span className="ac-tl-ev-time">{ini ? `${ini}–${fin}` : 'Todo el día'}</span>
              </div>
              {open && (
                <div className="ac-tl-ev-body" onClick={(e) => e.stopPropagation()}>
                  {ev.calendarSummary && <span className="ac-day-event-cal" style={{ color: style.border }}>{ev.calendarSummary}</span>}
                  {ev.description && <p className="ac-day-event-desc">{ev.description}</p>}
                  {(ev.attendees?.length > 0) && (
                    <p className="ac-day-event-desc">👥 {ev.attendees.map((a) => a.email).join(', ')}</p>
                  )}
                  <div className="ac-day-event-actions">
                    {ev.hangoutLink && (
                      <a className="ac-btn ac-btn-sm ac-btn-meet" href={ev.hangoutLink} target="_blank" rel="noopener noreferrer">🎥 Unirse a Meet</a>
                    )}
                    {!ev.readOnly && (
                      <>
                        <button className="ac-btn ac-btn-sm" onClick={() => { setDayDetail(null); openEditEvent(ev); }}><FaEdit /> Editar</button>
                        <button className="ac-btn ac-btn-sm ac-btn-disconnect" onClick={() => handleDeleteEvent(ev)}><FaTrash /></button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="ac-modal-overlay" onClick={() => { setDayDetail(null); setExpandedEv(null); }}>
            <div className="ac-modal ac-modal-day" onClick={e => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h3><FaCalendarAlt /> {dayDetail.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <button onClick={() => { setDayDetail(null); setExpandedEv(null); }}><FaTimes /></button>
              </div>
              <div className="ac-modal-body">
                {allDay.length > 0 && (
                  <div className="ac-tl-allday">
                    <span className="ac-tl-hour">Todo el día</span>
                    <div className="ac-tl-slot">{allDay.map(renderEv)}</div>
                  </div>
                )}
                <div className="ac-timeline ac-timeline-abs" style={{ height: hours.length * HPX }}>
                  {hours.map((h) => (
                    <div key={h} className="ac-tl-gridrow" style={{ top: (h - minH) * HPX, height: HPX }}
                      title="Clic para agendar a esta hora"
                      onClick={() => { setDayDetail(null); openNewEvent(dayDetail.date, fmtH(h)); }}>
                      <span className="ac-tl-hour">{fmtH(h)}</span>
                    </div>
                  ))}
                  {posiciones.map(({ e: ev, lane, top, height }) => {
                    const id = `${ev.id}-${ev.calendarId || ''}`;
                    return (
                      <div key={id} className="ac-tl-abs"
                        style={{ top, minHeight: height, height: expandedEv === id ? 'auto' : height, left: 68 + lane * 16, zIndex: expandedEv === id ? 30 : 10 + lane }}>
                        {renderEv(ev)}
                      </div>
                    );
                  })}
                </div>
                <button className="ac-btn ac-btn-new ac-btn-full" onClick={() => { setDayDetail(null); openNewEvent(dayDetail.date); }}>
                  <FaPlus /> Nuevo evento este día
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== CREATE/EDIT EVENT MODAL ===== */}
      {editEvent && (
        <div className="ac-modal-overlay" onClick={() => setEditEvent(null)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <div className="ac-modal-header">
              <h3>{editEvent === 'new' ? <><FaPlus /> Nuevo Evento</> : <><FaEdit /> Editar Evento</>}</h3>
              <button onClick={() => setEditEvent(null)}><FaTimes /></button>
            </div>
            <div className="ac-modal-body">
              <div className="ac-form-group">
                <label>Título *</label>
                <input type="text" value={eventForm.summary} onChange={e => setEventForm({ ...eventForm, summary: e.target.value })} placeholder="Ej: Llamada con cliente..." autoFocus />
              </div>
              <div className="ac-form-row">
                <div className="ac-form-group">
                  <label>Fecha *</label>
                  <input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                </div>
                <div className="ac-form-group">
                  <label>Hora inicio</label>
                  <input type="time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
                </div>
                <div className="ac-form-group">
                  <label>Hora fin</label>
                  <input type="time" value={eventForm.endTime} onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })} />
                </div>
              </div>
              <div className="ac-form-group">
                <label>Invitados (correos, separados por coma)</label>
                <input type="text" value={eventForm.attendees} onChange={e => setEventForm({ ...eventForm, attendees: e.target.value })} placeholder="cliente@gmail.com, sandy@..." />
                <small className="ac-form-hint">Google les manda la invitación por correo automáticamente.</small>
              </div>
              {editEvent === 'new' && (
                <label className="ac-meet-check">
                  <input type="checkbox" checked={eventForm.meet} onChange={e => setEventForm({ ...eventForm, meet: e.target.checked })} />
                  🎥 Crear link de Google Meet (reunión por videollamada)
                </label>
              )}
              {editEvent === 'new' && eventForm.meet && (
                <div className={`ac-meet-link ${saving ? 'generating' : ''}`}>
                  {saving
                    ? <span className="ac-meet-url"><FaSync className="spinning" /> Generando link de Meet…</span>
                    : <span className="ac-meet-url faint">El link aparecerá aquí al guardar la reunión.</span>}
                </div>
              )}
              {editEvent !== 'new' && editEvent?.hangoutLink && (
                <div className="ac-meet-link">
                  <a className="ac-meet-url" href={editEvent.hangoutLink} target="_blank" rel="noopener noreferrer" title="Abrir Google Meet">
                    🎥 {editEvent.hangoutLink.replace(/^https?:\/\//, '')}
                  </a>
                  <button type="button" className="ac-btn ac-btn-sm" onClick={() => copyMeetLink(editEvent.hangoutLink)}>
                    <FaRegCopy /> Copiar
                  </button>
                  <a className="ac-btn ac-btn-sm ac-btn-meet" href={editEvent.hangoutLink} target="_blank" rel="noopener noreferrer">Abrir</a>
                </div>
              )}
              <div className="ac-form-group">
                <label>Descripción</label>
                <textarea rows="3" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Notas, teléfono, detalles..." />
              </div>
            </div>
            <div className="ac-modal-footer">
              {editEvent !== 'new' && (
                <button className="ac-btn ac-btn-disconnect" onClick={() => handleDeleteEvent(editEvent)}>
                  <FaTrash /> Eliminar
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button className="ac-btn" onClick={() => setEditEvent(null)}>Cancelar</button>
              <button className="ac-btn ac-btn-save" onClick={handleSaveEvent} disabled={saving}>
                {saving ? <><FaSync className="spinning" /> Guardando...</> : editEvent === 'new' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
