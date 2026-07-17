import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  FaServer,
  FaRobot,
  FaDatabase,
  FaSyncAlt,
  FaCloud,
  FaMemory,
  FaExclamationTriangle,
  FaChevronDown,
  FaRegCopy,
  FaBolt,
  FaWhatsapp,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import statusService from '../../../services/statusService';
import './AdminStatus.css';

const REFRESH_OPTIONS = [
  { label: '10s', ms: 10000 },
  { label: '30s', ms: 30000 },
  { label: '1m', ms: 60000 },
  { label: 'Off', ms: 0 },
];

const STATUS_META = {
  up: { label: 'Operativo', color: 'var(--st-green)' },
  degraded: { label: 'Degradado', color: 'var(--st-amber)' },
  down: { label: 'Caído', color: 'var(--st-red)' },
  unknown: { label: 'Desconocido', color: 'var(--st-muted)' },
};

// Formatea segundos de uptime a "2d 4h 13m 05s"
const formatUptime = (sec = 0) => {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (d || h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  parts.push(`${String(s).padStart(2, '0')}s`);
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

const formatDuration = (ms) => {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

/* ── Piezas visuales ── */

const StatusDot = ({ status, size = 10 }) => (
  <span
    className={`st-dot st-dot--${status || 'unknown'}`}
    style={{ width: size, height: size }}
  />
);

const StatusPill = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.unknown;
  return (
    <span className={`st-pill st-pill--${status || 'unknown'}`}>
      <StatusDot status={status} size={8} /> {meta.label}
    </span>
  );
};

// Sparkline SVG de latencia (historial local de polls)
const Spark = ({ points, width = 120, height = 34 }) => {
  if (!points || points.length < 2) return <div className="st-spark st-spark--empty" />;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const range = Math.max(max - min, 1);
  const step = width / (points.length - 1);
  const coords = points
    .map((p, i) => `${(i * step).toFixed(1)},${(height - 4 - ((p - min) / range) * (height - 8)).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="st-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={(points.length - 1) * step}
        cy={height - 4 - ((points[points.length - 1] - min) / range) * (height - 8)}
        r="2.6"
        fill="currentColor"
      />
    </svg>
  );
};

// Anillo de progreso (éxito de Sofia, memoria, etc.)
const Ring = ({ percent, size = 56, stroke = 5, color, children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const val = Math.max(0, Math.min(100, percent ?? 0));
  return (
    <div className="st-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--st-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * val) / 100}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="st-ring__arc"
        />
      </svg>
      <div className="st-ring__label">{children}</div>
    </div>
  );
};

// Barra de consumo con umbrales de color
const UsageBar = ({ percent, label, detail }) => {
  const val = Math.max(0, Math.min(100, percent ?? 0));
  const tone = val >= 90 ? 'var(--st-red)' : val >= 75 ? 'var(--st-amber)' : 'var(--st-green)';
  return (
    <div className="st-usage">
      <div className="st-usage__top">
        <span className="st-usage__label">{label}</span>
        <span className="st-usage__detail mono">{detail}</span>
      </div>
      <div className="st-usage__track">
        <div className="st-usage__fill" style={{ width: `${val}%`, background: tone }} />
      </div>
    </div>
  );
};

const Row = ({ label, children }) => (
  <div className="st-row">
    <span className="st-row__label">{label}</span>
    <span className="st-row__value mono">{children}</span>
  </div>
);

const Kpi = ({ icon, title, children, tone, delay = 0 }) => (
  <div className="st-kpi" style={{ '--enter-delay': `${delay}ms`, '--kpi-tone': tone || 'var(--st-cyan)' }}>
    <div className="st-kpi__icon">{icon}</div>
    <div className="st-kpi__body">
      <span className="st-kpi__title">{title}</span>
      <div className="st-kpi__value">{children}</div>
    </div>
  </div>
);

/* ── Página ── */

const AdminStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const [refreshMs, setRefreshMs] = useState(30000);
  const [apiLatency, setApiLatency] = useState([]); // historial round-trip del propio panel
  const [showLog, setShowLog] = useState(false);
  const [tick, setTick] = useState(0); // re-render por segundo para uptime vivo
  const timerRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const t0 = performance.now();
    try {
      const res = await statusService.getSystemStatus();
      const ms = Math.round(performance.now() - t0);
      setData(res);
      setError('');
      setLastFetch(Date.now());
      setApiLatency((prev) => [...prev.slice(-19), ms]);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo obtener el estado del sistema.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll según intervalo elegido
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (refreshMs > 0) timerRef.current = setInterval(() => load(true), refreshMs);
    return () => clearInterval(timerRef.current);
  }, [refreshMs, load]);

  // Tick de 1s para uptime en vivo y "hace Xs"
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const server = data?.server;
  const n8n = data?.n8n;
  const sofia = n8n?.sofia;
  const mongo = data?.mongo;
  const supa = data?.supabase;
  const cloud = data?.cloudinary;

  // Uptime vivo: base del servidor + segundos transcurridos desde el fetch
  const liveUptime = useMemo(() => {
    if (!server?.uptimeSec || !lastFetch) return null;
    return server.uptimeSec + Math.floor((Date.now() - lastFetch) / 1000);
  }, [server, lastFetch, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastApiMs = apiLatency[apiLatency.length - 1];
  const overallMeta = STATUS_META[data?.overall] || STATUS_META.unknown;
  const memPercent = server?.memory ? Math.round((server.memory.heapUsedMB / server.memory.heapTotalMB) * 100) : null;

  const copyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success('Diagnóstico copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <div className={`st-page st-page--${data?.overall || 'unknown'}`}>
      {/* ── Header ── */}
      <div className="st-header">
        <div className="st-header__title">
          <div className="st-heartbeat" aria-hidden="true">
            <svg viewBox="0 0 120 32" preserveAspectRatio="none">
              <path
                className="st-heartbeat__line"
                d="M0 16 H30 L38 16 L44 4 L52 28 L58 10 L63 16 H88 L94 16 L99 9 L105 16 H120"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <h2>Estado del sistema</h2>
            <p className="st-sub">
              Monitoreo en vivo · Railway · Sofia · MongoDB · Supabase · Cloudinary
              {lastFetch && <span className="st-sub__time"> · actualizado {timeAgo(new Date(lastFetch).toISOString())}</span>}
            </p>
          </div>
        </div>

        <div className="st-controls">
          <div className="st-interval" role="group" aria-label="Intervalo de actualización">
            {REFRESH_OPTIONS.map((o) => (
              <button
                key={o.label}
                className={`st-interval__opt ${refreshMs === o.ms ? 'is-active' : ''}`}
                onClick={() => setRefreshMs(o.ms)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button className="st-btn" onClick={copyDiagnostics} title="Copiar diagnóstico JSON">
            <FaRegCopy />
          </button>
          <button className="st-btn st-btn--primary" onClick={() => load()} disabled={loading}>
            <FaSyncAlt className={loading ? 'st-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── Banner global ── */}
      {data && (
        <div className={`st-banner st-banner--${data.overall}`}>
          <StatusDot status={data.overall} size={12} />
          <strong>
            {data.overall === 'up'
              ? 'Todos los sistemas operativos'
              : data.overall === 'degraded'
              ? 'Sistema con incidencias parciales'
              : 'Hay un sistema caído'}
          </strong>
          <span className="st-banner__scan" aria-hidden="true" />
        </div>
      )}

      {error && (
        <div className="st-error">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="st-loading">
          <span className="st-loading__pulse" /> Cargando telemetría…
        </div>
      ) : (
        data && (
          <>
            {/* ── KPIs ── */}
            <div className="st-kpis">
              <Kpi icon={<FaBolt />} title="Estado general" tone={overallMeta.color} delay={0}>
                <span style={{ color: overallMeta.color }}>{overallMeta.label}</span>
              </Kpi>
              <Kpi icon={<FaServer />} title="Uptime" delay={60}>
                <span className="mono">{liveUptime != null ? formatUptime(liveUptime) : '—'}</span>
              </Kpi>
              <Kpi icon={<FaBolt />} title={`Latencia panel${lastApiMs != null ? ` · ${lastApiMs}ms` : ''}`} delay={120}>
                <span className="st-kpi__spark"><Spark points={apiLatency} /></span>
              </Kpi>
              <Kpi
                icon={<FaRobot />}
                title="Éxito Sofia (últimas 20)"
                tone={sofia?.recent?.successRate >= 90 ? 'var(--st-green)' : 'var(--st-amber)'}
                delay={180}
              >
                <span className="mono">{sofia?.recent?.successRate != null ? `${sofia.recent.successRate}%` : '—'}</span>
              </Kpi>
              <Kpi icon={<FaWhatsapp />} title="Leads activos hoy" tone="var(--st-cyan)" delay={240}>
                <span className="mono">{supa?.leadsActivosHoy ?? '—'}</span>
              </Kpi>
            </div>

            {/* ── Cards ── */}
            <div className="st-grid">
              {/* Servidor */}
              <div className="st-card" style={{ '--enter-delay': '80ms' }}>
                <div className="st-card__head">
                  <div className="st-card__title"><FaServer /> Servidor · Railway</div>
                  <StatusPill status={server?.status} />
                </div>
                <div className="st-card__body">
                  <Row label="Uptime">{liveUptime != null ? formatUptime(liveUptime) : '—'}</Row>
                  <Row label="Encendido desde">
                    {server?.startedAt ? new Date(server.startedAt).toLocaleString('es-MX') : '—'}
                  </Row>
                  <Row label="Entorno">
                    <span className={`st-env st-env--${server?.nodeEnv === 'production' ? 'prod' : 'dev'}`}>
                      {server?.nodeEnv || '—'}
                    </span>
                  </Row>
                  <div className="st-mem">
                    <div className="st-mem__ring">
                      {/* el heap de Node vive cerca del tope por diseño — informativo, no alerta */}
                      <Ring percent={memPercent} color="var(--st-cyan)">
                        <span className="mono">{memPercent != null ? `${memPercent}%` : '—'}</span>
                      </Ring>
                    </div>
                    <div className="st-mem__info">
                      <span className="st-row__label"><FaMemory /> Memoria heap</span>
                      <span className="mono">
                        {server?.memory ? `${server.memory.heapUsedMB} / ${server.memory.heapTotalMB} MB` : '—'}
                      </span>
                      <span className="st-dim mono">RSS {server?.memory?.rssMB ?? '—'} MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Base de datos */}
              <div className="st-card" style={{ '--enter-delay': '140ms' }}>
                <div className="st-card__head">
                  <div className="st-card__title"><FaDatabase /> MongoDB</div>
                  <StatusPill status={server?.db?.connected ? 'up' : 'down'} />
                </div>
                <div className="st-card__body">
                  <Row label="Base">{server?.db?.name || '—'}</Row>
                  <Row label="Ping">{server?.db?.pingMs != null ? `${server.db.pingMs} ms` : '—'}</Row>
                  <Row label="Datos">
                    {mongo ? `${mongo.dataSizeMB} MB · ${mongo.collections ?? '—'} colecciones` : '—'}
                  </Row>
                  {mongo?.counts && (
                    <div className="st-minigrid">
                      <div className="st-mini"><span className="mono">{mongo.counts.users}</span><label>usuarios</label></div>
                      <div className="st-mini"><span className="mono">{mongo.counts.quotes}</span><label>cotizaciones</label></div>
                      <div className="st-mini st-mini--hl"><span className="mono">+{mongo.counts.quotesToday}</span><label>cotiz. hoy</label></div>
                      <div className="st-mini"><span className="mono">{mongo.counts.projects}</span><label>proyectos</label></div>
                    </div>
                  )}
                  {supa && (
                    <Row label={<><FaWhatsapp /> Leads WhatsApp</>}>
                      {supa.leadsTotal ?? '—'} totales
                      {supa.esperandoAprobacion != null && supa.esperandoAprobacion > 0 && (
                        <span className="st-warn"> · {supa.esperandoAprobacion} esperando aprobación</span>
                      )}
                    </Row>
                  )}
                </div>
              </div>

              {/* Sofia */}
              <div className="st-card" style={{ '--enter-delay': '200ms' }}>
                <div className="st-card__head">
                  <div className="st-card__title"><FaRobot /> Sofia · n8n</div>
                  <StatusPill status={n8n?.status} />
                </div>
                <div className="st-card__body">
                  <Row label="Instancia">
                    <span style={{ color: n8n?.reachable ? 'var(--st-green)' : 'var(--st-red)' }}>
                      {n8n?.reachable ? 'Alcanzable' : 'Sin respuesta'}
                    </span>
                    {n8n?.latencyMs != null && <span className="st-dim"> · {n8n.latencyMs} ms</span>}
                  </Row>
                  <Row label="Workflow">
                    {sofia?.active === undefined ? (sofia?.name || 'Tesipedia - Sofia Agent') : (
                      <>
                        <span style={{ color: sofia.active ? 'var(--st-green)' : 'var(--st-red)' }}>
                          {sofia.active ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="st-dim"> · {sofia?.name}</span>
                      </>
                    )}
                  </Row>
                  <Row label="Última ejecución">
                    {sofia?.lastExecution ? (
                      <>
                        <span style={{ color: sofia.lastExecution.status === 'success' ? 'var(--st-green)' : 'var(--st-red)' }}>
                          {sofia.lastExecution.status}
                        </span>{' '}
                        · {timeAgo(sofia.lastExecution.startedAt)}
                      </>
                    ) : '—'}
                  </Row>

                  {sofia?.recent && (
                    <div className="st-sofia-rate">
                      <Ring
                        percent={sofia.recent.successRate}
                        color={sofia.recent.successRate >= 90 ? 'var(--st-green)' : sofia.recent.successRate >= 60 ? 'var(--st-amber)' : 'var(--st-red)'}
                      >
                        <span className="mono">{sofia.recent.successRate}%</span>
                      </Ring>
                      <div>
                        <span className="mono">{sofia.recent.success}/{sofia.recent.total}</span> exitosas
                        {sofia.recent.error > 0 && <span className="st-warn"> · {sofia.recent.error} con error</span>}
                      </div>
                    </div>
                  )}

                  {sofia?.executions?.length > 0 && (
                    <>
                      <button className="st-log-toggle" onClick={() => setShowLog((v) => !v)}>
                        <FaChevronDown className={showLog ? 'is-open' : ''} />
                        {showLog ? 'Ocultar ejecuciones' : `Ver ejecuciones (${sofia.executions.length})`}
                      </button>
                      <div className={`st-log ${showLog ? 'is-open' : ''}`}>
                        {sofia.executions.map((e) => (
                          <div className="st-log__row" key={e.id}>
                            <StatusDot status={e.status === 'success' ? 'up' : 'down'} size={7} />
                            <span className={`st-log__status ${e.status === 'success' ? 'ok' : 'bad'}`}>{e.status}</span>
                            <span className="st-log__mode">{e.mode}</span>
                            <span className="st-log__dur mono">{formatDuration(e.durationMs)}</span>
                            <span className="st-log__time">{timeAgo(e.startedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {n8n && !n8n.apiConfigured && (
                    <div className="st-note">
                      <FaExclamationTriangle /> Solo se verifica alcanzabilidad. Configura{' '}
                      <code>N8N_API_KEY</code> en Railway para ver workflow y ejecuciones.
                    </div>
                  )}
                </div>
              </div>

              {/* Cloudinary */}
              <div className="st-card" style={{ '--enter-delay': '260ms' }}>
                <div className="st-card__head">
                  <div className="st-card__title"><FaCloud /> Cloudinary</div>
                  {cloud?.credits && (
                    <StatusPill status={cloud.credits.usedPercent >= 95 ? 'down' : cloud.credits.usedPercent >= 80 ? 'degraded' : 'up'} />
                  )}
                </div>
                <div className="st-card__body">
                  {cloud ? (
                    <>
                      {cloud.credits && (
                        <UsageBar
                          percent={cloud.credits.usedPercent}
                          label={`Créditos del mes (plan ${cloud.plan || '—'})`}
                          detail={`${cloud.credits.usage} / ${cloud.credits.limit} (${cloud.credits.usedPercent}%)`}
                        />
                      )}
                      <Row label="Storage">{cloud.storageGB != null ? `${cloud.storageGB} GB` : '—'}</Row>
                      <Row label="Bandwidth (mes)">{cloud.bandwidthGB != null ? `${cloud.bandwidthGB} GB` : '—'}</Row>
                      <Row label="Transformaciones">{cloud.transformations ?? '—'}</Row>
                      {cloud.credits?.usedPercent >= 85 && (
                        <div className="st-note st-note--warn">
                          <FaExclamationTriangle /> Créditos por agotarse: al llegar al 100% fallarán las subidas de PDFs y media.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="st-dim">Sin datos de Cloudinary.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default AdminStatus;
