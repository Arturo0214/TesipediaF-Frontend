import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaServer,
  FaRobot,
  FaDatabase,
  FaSyncAlt,
  FaCircle,
  FaMemory,
  FaExclamationTriangle,
} from 'react-icons/fa';
import statusService from '../../../services/statusService';
import './AdminStatus.css';

const REFRESH_MS = 30000;

const STATUS_META = {
  up: { label: 'Operativo', color: '#10B981' },
  degraded: { label: 'Degradado', color: '#F59E0B' },
  down: { label: 'Caído', color: '#EF4444' },
  unknown: { label: 'Desconocido', color: '#9CA3AF' },
};

// Formatea segundos de uptime a "2d 4h 13m"
const formatUptime = (sec = 0) => {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
};

// Tiempo relativo en español ("hace 3 min")
const timeAgo = (iso) => {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
};

const StatusPill = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.unknown;
  return (
    <span className="status-pill" style={{ background: `${meta.color}1a`, color: meta.color }}>
      <FaCircle size={9} /> {meta.label}
    </span>
  );
};

const Row = ({ label, children }) => (
  <div className="status-row">
    <span className="status-row__label">{label}</span>
    <span className="status-row__value">{children}</span>
  </div>
);

const AdminStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await statusService.getSystemStatus();
      setData(res);
      setError('');
      setLastFetch(Date.now());
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo obtener el estado del sistema.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [load]);

  const server = data?.server;
  const n8n = data?.n8n;
  const sofia = n8n?.sofia;

  return (
    <div className="admin-status">
      <div className="admin-status__header">
        <div>
          <h2>Estado del sistema</h2>
          <p className="admin-status__sub">
            Salud en tiempo real del servidor y del agente Sofia.
            {lastFetch && (
              <span className="admin-status__updated"> · Actualizado {timeAgo(new Date(lastFetch).toISOString())}</span>
            )}
          </p>
        </div>
        <button className="admin-status__refresh" onClick={() => load()} disabled={loading}>
          <FaSyncAlt className={loading ? 'spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Banner global */}
      {data && (
        <div
          className="admin-status__banner"
          style={{
            background: `${(STATUS_META[data.overall] || STATUS_META.unknown).color}14`,
            borderColor: (STATUS_META[data.overall] || STATUS_META.unknown).color,
          }}
        >
          <FaCircle color={(STATUS_META[data.overall] || STATUS_META.unknown).color} />
          <strong>
            {data.overall === 'up'
              ? 'Todos los sistemas operativos'
              : data.overall === 'degraded'
              ? 'Sistema con incidencias parciales'
              : 'Hay un sistema caído'}
          </strong>
        </div>
      )}

      {error && (
        <div className="admin-status__error">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="admin-status__loading">Cargando estado…</div>
      ) : (
        <div className="admin-status__grid">
          {/* ── Servidor (Railway) ── */}
          <div className="status-card">
            <div className="status-card__head">
              <div className="status-card__title">
                <FaServer /> Servidor (Railway)
              </div>
              <StatusPill status={server?.status} />
            </div>
            <div className="status-card__body">
              <Row label="Uptime">{formatUptime(server?.uptimeSec)}</Row>
              <Row label="Encendido desde">
                {server?.startedAt ? new Date(server.startedAt).toLocaleString('es-MX') : '—'}
              </Row>
              <Row label="Entorno">{server?.nodeEnv || '—'}</Row>
              <Row label={<><FaDatabase /> Base de datos</>}>
                <span style={{ color: server?.db?.connected ? '#10B981' : '#EF4444' }}>
                  {server?.db?.connected ? 'Conectada' : (server?.db?.status || '—')}
                </span>
                {server?.db?.name ? ` · ${server.db.name}` : ''}
              </Row>
              <Row label={<><FaMemory /> Memoria</>}>
                {server?.memory ? `${server.memory.heapUsedMB} / ${server.memory.heapTotalMB} MB (RSS ${server.memory.rssMB})` : '—'}
              </Row>
            </div>
          </div>

          {/* ── Sofia (n8n) ── */}
          <div className="status-card">
            <div className="status-card__head">
              <div className="status-card__title">
                <FaRobot /> Sofia (n8n)
              </div>
              <StatusPill status={n8n?.status} />
            </div>
            <div className="status-card__body">
              <Row label="Instancia n8n">
                <span style={{ color: n8n?.reachable ? '#10B981' : '#EF4444' }}>
                  {n8n?.reachable ? 'Alcanzable' : 'Sin respuesta'}
                </span>
              </Row>
              <Row label="Workflow activo">
                {sofia?.active === undefined ? '—' : (
                  <span style={{ color: sofia.active ? '#10B981' : '#EF4444' }}>
                    {sofia.active ? 'Sí' : 'No'}
                  </span>
                )}
              </Row>
              <Row label="Nombre">{sofia?.name || 'Tesipedia - Sofia Agent'}</Row>
              <Row label="Última ejecución">
                {sofia?.lastExecution ? (
                  <>
                    <span
                      style={{ color: sofia.lastExecution.status === 'success' ? '#10B981' : '#EF4444' }}
                    >
                      {sofia.lastExecution.status}
                    </span>{' '}
                    · {timeAgo(sofia.lastExecution.startedAt)}
                  </>
                ) : '—'}
              </Row>
              <Row label="Éxito reciente">
                {sofia?.recent ? (
                  <>
                    {sofia.recent.success}/{sofia.recent.total}
                    {sofia.recent.successRate != null && ` (${sofia.recent.successRate}%)`}
                    {sofia.recent.error > 0 && (
                      <span className="status-error-count"> · {sofia.recent.error} con error</span>
                    )}
                  </>
                ) : '—'}
              </Row>

              {n8n && !n8n.apiConfigured && (
                <div className="status-note">
                  <FaExclamationTriangle /> Solo se verifica alcanzabilidad. Configura{' '}
                  <code>N8N_API_KEY</code> en Railway para ver workflow y ejecuciones.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStatus;
