import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
  FaCalendarAlt, FaGoogle, FaSync, FaLink, FaUnlink, FaTimes,
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaClock, FaPlus,
  FaToggleOn, FaToggleOff, FaWhatsapp, FaEdit, FaTrash,
  FaCloudUploadAlt, FaProjectDiagram, FaDollarSign, FaPhone,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './AdminCalendars.css';

const ADMINS = [
  { key: 'arturo', label: 'Arturo', color: '#f59e0b' },
  { key: 'sandy', label: 'Sandy', color: '#9b8afb' },
  { key: 'hugo', label: 'Hugo', color: '#3b82f6' },
];

const EVENT_COLORS = {
  '📋': { bg: '#fef3c7', border: '#f59e0b', label: 'Proyecto' },
  '💰': { bg: '#dcfce7', border: '#16a34a', label: 'Pago' },
  '📞': { bg: '#dbeafe', border: '#3b82f6', label: 'Llamada' },
};

function getEventStyle(summary) {
  for (const [emoji, style] of Object.entries(EVENT_COLORS)) {
    if (summary?.startsWith(emoji)) return style;
  }
  return { bg: '#f3f4f6', border: '#9ca3af', label: 'Evento' };
}

export default function AdminCalendars() {
  const { user } = useSelector(state => state.auth || {});
  const [connectedAdmins, setConnectedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState('arturo');
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [syncing, setSyncing] = useState(false);

  // Modals
  const [dayDetail, setDayDetail] = useState(null); // { date, events }
  const [editEvent, setEditEvent] = useState(null); // event object or 'new'
  const [eventForm, setEventForm] = useState({ summary: '', description: '', date: '', time: '', endTime: '' });
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
  const openNewEvent = (date) => {
    const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setEventForm({ summary: '', description: '', date: dateStr, time: '10:00', endTime: '11:00' });
    setEditEvent('new');
  };

  const openEditEvent = (ev) => {
    const start = ev.start?.dateTime || ev.start?.date || '';
    const end = ev.end?.dateTime || ev.end?.date || '';
    const isAllDay = !!ev.start?.date;
    setEventForm({
      summary: ev.summary || '',
      description: ev.description || '',
      date: isAllDay ? start : start.split('T')[0],
      time: isAllDay ? '' : start.split('T')[1]?.slice(0, 5) || '',
      endTime: isAllDay ? '' : end.split('T')[1]?.slice(0, 5) || '',
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
      };

      if (editEvent === 'new') {
        await axiosWithAuth.post('/google/events', payload);
        toast.success('Evento creado');
      } else {
        await axiosWithAuth.put(`/google/events/${editEvent.id}`, payload);
        toast.success('Evento actualizado');
      }
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar evento');
    }
    setSaving(false);
  };

  const handleDeleteEvent = async (ev) => {
    try {
      await axiosWithAuth.delete(`/google/events/${ev.id}?admin=${selectedAdmin}`);
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

  const formatTime = (ev) => {
    if (ev.start?.date) return 'Todo el día';
    const t = ev.start?.dateTime?.split('T')[1]?.slice(0, 5);
    return t || '';
  };

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
        {ADMINS.map(admin => {
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
              const dayEvents = day ? events.filter(e => {
                const eDate = new Date(e.start?.dateTime || e.start?.date);
                return eDate.toDateString() === day.toDateString();
              }) : [];
              const hasEvents = dayEvents.length > 0;

              return (
                <div key={idx}
                  className={`ac-cal-day ${isToday ? 'today' : ''} ${!day ? 'empty' : ''} ${hasEvents ? 'has-events' : ''}`}
                  onClick={() => day && (hasEvents ? openDay(day, dayEvents) : openNewEvent(day))}>
                  {day && <span className="ac-cal-day-num">{day.getDate()}</span>}
                  <div className="ac-cal-events">
                    {dayEvents.slice(0, 3).map((ev, i) => {
                      const style = getEventStyle(ev.summary);
                      return (
                        <div key={i} className="ac-cal-chip" title={ev.summary}
                          style={{ background: style.bg, borderLeft: `3px solid ${style.border}` }}
                          onClick={(e) => { e.stopPropagation(); openEditEvent(ev); }}>
                          <span className="ac-cal-chip-text">{ev.summary?.replace(/^[📋💰📞🔔]\s*/, '').slice(0, 18)}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && <div className="ac-cal-more">+{dayEvents.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ac-legend">
            <span><span className="ac-legend-dot" style={{ background: '#f59e0b' }} /> Proyectos</span>
            <span><span className="ac-legend-dot" style={{ background: '#16a34a' }} /> Pagos</span>
            <span><span className="ac-legend-dot" style={{ background: '#3b82f6' }} /> Llamadas</span>
            <span><span className="ac-legend-dot" style={{ background: '#9ca3af' }} /> Otros</span>
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

      {/* ===== DAY DETAIL MODAL ===== */}
      {dayDetail && (
        <div className="ac-modal-overlay" onClick={() => setDayDetail(null)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <div className="ac-modal-header">
              <h3><FaCalendarAlt /> {dayDetail.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <button onClick={() => setDayDetail(null)}><FaTimes /></button>
            </div>
            <div className="ac-modal-body">
              {dayDetail.events.map((ev, i) => {
                const style = getEventStyle(ev.summary);
                return (
                  <div key={i} className="ac-day-event" style={{ borderLeft: `4px solid ${style.border}` }}>
                    <div className="ac-day-event-main">
                      <strong>{ev.summary}</strong>
                      <span className="ac-day-event-time">{formatTime(ev)}</span>
                    </div>
                    {ev.description && <p className="ac-day-event-desc">{ev.description}</p>}
                    <div className="ac-day-event-actions">
                      <button className="ac-btn ac-btn-sm" onClick={() => { setDayDetail(null); openEditEvent(ev); }}><FaEdit /> Editar</button>
                      <button className="ac-btn ac-btn-sm ac-btn-disconnect" onClick={() => handleDeleteEvent(ev)}><FaTrash /></button>
                    </div>
                  </div>
                );
              })}
              <button className="ac-btn ac-btn-new ac-btn-full" onClick={() => { setDayDetail(null); openNewEvent(dayDetail.date); }}>
                <FaPlus /> Nuevo evento este día
              </button>
            </div>
          </div>
        </div>
      )}

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
