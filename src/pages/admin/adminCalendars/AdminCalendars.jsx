import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
  FaCalendarAlt, FaGoogle, FaSync, FaLink, FaUnlink, FaTimes,
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaClock, FaPlus,
  FaExternalLinkAlt, FaToggleOn, FaToggleOff, FaWhatsapp, FaPhone,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './AdminCalendars.css';

const ADMINS = [
  { key: 'arturo', label: 'Arturo', color: '#f59e0b' },
  { key: 'sandy', label: 'Sandy', color: '#9b8afb' },
  { key: 'hugo', label: 'Hugo', color: '#3b82f6' },
];

export default function AdminCalendars() {
  const { user } = useSelector(state => state.auth || {});
  const [connectedAdmins, setConnectedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState('arturo');
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());

  // Cargar admins conectados
  const fetchAdmins = useCallback(async () => {
    try {
      const { data } = await axiosWithAuth.get('/google/admins');
      setConnectedAdmins(data);
    } catch (err) {
      console.error('Error cargando admins:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // Cargar eventos del admin seleccionado
  const fetchEvents = useCallback(async () => {
    const admin = connectedAdmins.find(a => a.adminKey === selectedAdmin);
    if (!admin) { setEvents([]); return; }

    setEventsLoading(true);
    try {
      const year = calMonth.getFullYear();
      const month = calMonth.getMonth();
      const timeMin = new Date(year, month, 1).toISOString();
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const { data } = await axiosWithAuth.get(`/google/events?admin=${selectedAdmin}&timeMin=${timeMin}&timeMax=${timeMax}`);
      setEvents(data.items || []);
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setEvents([]);
    }
    setEventsLoading(false);
  }, [selectedAdmin, calMonth, connectedAdmins]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Conectar calendario
  const connectCalendar = async (adminKey) => {
    try {
      const { data } = await axiosWithAuth.get(`/google/auth-url?admin=${adminKey}`);
      window.location.href = data.authUrl;
    } catch (err) {
      toast.error('Error al obtener URL de autenticación');
    }
  };

  // Desconectar
  const disconnectCalendar = async (adminKey) => {
    try {
      await axiosWithAuth.post('/google/disconnect', { adminKey });
      toast.success(`Calendario de ${adminKey} desconectado`);
      fetchAdmins();
    } catch (err) {
      toast.error('Error al desconectar');
    }
  };

  // Toggle auto-sync
  const toggleAutoSync = async (adminKey, current) => {
    try {
      await axiosWithAuth.post('/google/toggle-autosync', { adminKey, autoSync: !current });
      toast.success(`Auto-sync ${!current ? 'activado' : 'desactivado'} para ${adminKey}`);
      fetchAdmins();
    } catch (err) {
      toast.error('Error al cambiar auto-sync');
    }
  };

  // Render calendario
  const renderCalendar = () => {
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
      <div className="ac-cal-grid">
        {dayLabels.map(d => <div key={d} className="ac-cal-day-header">{d}</div>)}
        {calDays.map((day, idx) => {
          const isToday = day && day.toDateString() === new Date().toDateString();
          const dayEvents = day ? events.filter(e => {
            const eDate = new Date(e.start?.dateTime || e.start?.date);
            return eDate.toDateString() === day.toDateString();
          }) : [];

          return (
            <div key={idx} className={`ac-cal-day ${isToday ? 'today' : ''} ${!day ? 'empty' : ''}`}>
              {day && <span className="ac-cal-day-num">{day.getDate()}</span>}
              <div className="ac-cal-events">
                {dayEvents.slice(0, 3).map((ev, i) => (
                  <div key={i} className="ac-cal-chip" title={ev.summary}>
                    <span className="ac-cal-chip-dot" style={{ background: ev.summary?.startsWith('📋') ? '#f59e0b' : ev.summary?.startsWith('💰') ? '#16a34a' : ev.summary?.startsWith('📞') ? '#3b82f6' : '#6b7280' }} />
                    <span className="ac-cal-chip-text">{ev.summary?.replace(/^[📋💰📞]\s*/, '').slice(0, 20)}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="ac-cal-more">+{dayEvents.length - 3}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const isConnected = (key) => connectedAdmins.some(a => a.adminKey === key);
  const getAdminInfo = (key) => connectedAdmins.find(a => a.adminKey === key);

  return (
    <div className="ac-container">
      <div className="ac-header">
        <h1><FaCalendarAlt /> Calendarios</h1>
        <p className="ac-subtitle">Conecta y gestiona los calendarios de Google de cada admin</p>
      </div>

      {/* Admin Cards */}
      <div className="ac-admins-grid">
        {ADMINS.map(admin => {
          const connected = isConnected(admin.key);
          const info = getAdminInfo(admin.key);
          return (
            <div key={admin.key} className={`ac-admin-card ${connected ? 'connected' : ''} ${selectedAdmin === admin.key ? 'selected' : ''}`}
              onClick={() => connected && setSelectedAdmin(admin.key)}>
              <div className="ac-admin-card-header" style={{ borderTopColor: admin.color }}>
                <div className="ac-admin-avatar" style={{ background: admin.color }}>
                  {admin.label[0]}
                </div>
                <div className="ac-admin-info">
                  <strong>{admin.label}</strong>
                  {connected ? (
                    <span className="ac-admin-email"><FaGoogle /> {info?.googleEmail || 'Conectado'}</span>
                  ) : (
                    <span className="ac-admin-disconnected">No conectado</span>
                  )}
                </div>
              </div>
              <div className="ac-admin-card-actions">
                {connected ? (
                  <>
                    <button className="ac-btn ac-btn-autosync" onClick={(e) => { e.stopPropagation(); toggleAutoSync(admin.key, info?.autoSync); }}>
                      {info?.autoSync ? <FaToggleOn style={{ color: '#16a34a' }} /> : <FaToggleOff />}
                      <span>Auto-sync</span>
                    </button>
                    <button className="ac-btn ac-btn-disconnect" onClick={(e) => { e.stopPropagation(); disconnectCalendar(admin.key); }}>
                      <FaUnlink /> Desconectar
                    </button>
                  </>
                ) : (
                  <button className="ac-btn ac-btn-connect" onClick={(e) => { e.stopPropagation(); connectCalendar(admin.key); }}>
                    <FaLink /> Conectar Google Calendar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar View */}
      {isConnected(selectedAdmin) && (
        <div className="ac-calendar-section">
          <div className="ac-cal-header">
            <div className="ac-cal-title">
              <h2>Calendario de {ADMINS.find(a => a.key === selectedAdmin)?.label}</h2>
              <button className="ac-btn ac-btn-sm" onClick={fetchEvents} disabled={eventsLoading}>
                <FaSync className={eventsLoading ? 'spinning' : ''} />
              </button>
            </div>
            <div className="ac-cal-nav">
              <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))}><FaChevronLeft /></button>
              <span className="ac-cal-month">
                {calMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))}><FaChevronRight /></button>
            </div>
          </div>
          {renderCalendar()}

          {/* Legend */}
          <div className="ac-legend">
            <span><span className="ac-legend-dot" style={{ background: '#f59e0b' }} /> Proyectos</span>
            <span><span className="ac-legend-dot" style={{ background: '#16a34a' }} /> Pagos</span>
            <span><span className="ac-legend-dot" style={{ background: '#3b82f6' }} /> Llamadas</span>
            <span><span className="ac-legend-dot" style={{ background: '#6b7280' }} /> Otros</span>
          </div>
        </div>
      )}

      {!isConnected(selectedAdmin) && !loading && (
        <div className="ac-empty">
          <FaGoogle style={{ fontSize: '3rem', color: '#d1d5db' }} />
          <p>Conecta el calendario de {ADMINS.find(a => a.key === selectedAdmin)?.label} para ver sus eventos</p>
        </div>
      )}
    </div>
  );
}
