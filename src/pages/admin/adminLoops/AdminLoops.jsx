import { useState, useEffect, useCallback } from 'react';
import {
  FaSyncAlt,
  FaDollarSign,
  FaFireAlt,
  FaComments,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaRecycle,
} from 'react-icons/fa';
import loopsService from '../../../services/loopsService';
import './AdminLoops.css';

const money = (n) =>
  n == null ? '—' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const pct = (n) => (n == null ? '—' : `${n}%`);

const OBJ_LABELS = {
  precio_alto: 'Precio alto',
  presupuesto_bajo: 'Presupuesto bajo',
  lo_pensare: '"Lo voy a pensar"',
  pide_descuento: 'Pide descuento',
  desconfianza: 'Desconfianza',
  tiempo_urgencia: 'Tiempo / urgencia',
};
const OBJ_COLORS = {
  presupuesto_bajo: '#f87171',
  precio_alto: '#fb923c',
  lo_pensare: '#fbbf24',
  desconfianza: '#a78bfa',
  tiempo_urgencia: '#38bdf8',
  pide_descuento: '#34d399',
};

const SENAL_META = {
  subir_precio: { label: 'Margen para subir precio', color: '#34d399', icon: <FaArrowUp /> },
  revisar_precio: { label: 'Revisar: cierre muy bajo', color: '#f87171', icon: <FaArrowDown /> },
};

function AdminLoops() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    try {
      const res = await loopsService.getLoopMetrics({ fresh });
      setData(res);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las métricas de loops.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const p = data?.precios;
  const r = data?.reactivacion;
  const o = data?.objeciones;
  const maxObj = Math.max(1, ...(o?.categorias || []).map((c) => c.total));
  const maxCarrera = Math.max(1, ...(p?.porCarrera || []).map((s) => s.tasaCierre));

  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h2>Loops de negocio</h2>
          <p className="lp-sub">
            Mide tus ciclos: cada cotización, lead frío y conversación es materia prima del siguiente mes.
            {data?.cached && <span className="lp-dim"> · cacheado 5 min</span>}
          </p>
        </div>
        <button className="lp-refresh" onClick={() => load(true)} disabled={loading}>
          <FaSyncAlt className={loading ? 'lp-spin' : ''} /> Recalcular
        </button>
      </div>

      {error && <div className="lp-error"><FaExclamationTriangle /> {error}</div>}

      {loading && !data ? (
        <div className="lp-loading">Calculando loops sobre datos reales…</div>
      ) : data && (
        <div className="lp-grid">

          {/* ── Loop de precios / elasticidad ── */}
          <div className="lp-card lp-card--precios">
            <div className="lp-card__head">
              <div className="lp-card__title"><FaDollarSign /> Loop de precios · elasticidad</div>
              <div className="lp-kpi-inline">
                <span className="lp-big">{pct(p?.tasaGlobal)}</span>
                <span className="lp-dim">{p?.totalCerradas}/{p?.totalQuotes} cierran</span>
              </div>
            </div>
            <p className="lp-card__hint">Tasa de cierre por carrera. Donde cierra muy por encima de la media hay margen para subir precio; muy por debajo, revísalo.</p>

            <div className="lp-bars">
              {(p?.porCarrera || []).map((s) => (
                <div className="lp-bar-row" key={s.segmento}>
                  <span className="lp-bar-label" title={s.segmento}>{s.segmento}</span>
                  <div className="lp-bar-track">
                    <div className="lp-bar-fill" style={{ width: `${(s.tasaCierre / maxCarrera) * 100}%` }} />
                  </div>
                  <span className="lp-bar-val mono">{s.tasaCierre}%</span>
                  <span className="lp-bar-extra mono">{s.total} · {money(s.ticketPromedio)}</span>
                </div>
              ))}
            </div>

            {p?.recomendaciones?.length > 0 && (
              <div className="lp-recos">
                <span className="lp-recos__title">Señales de elasticidad</span>
                {p.recomendaciones.map((s) => {
                  const m = SENAL_META[s.señal];
                  return (
                    <div className="lp-reco" key={s.segmento} style={{ '--tone': m.color }}>
                      {m.icon}
                      <strong>{s.segmento}</strong>
                      <span>{m.label}</span>
                      <span className="mono lp-dim">{s.tasaCierre}% · {money(s.ticketPromedio)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Loop de reactivación ── */}
          <div className="lp-card lp-card--revival">
            <div className="lp-card__head">
              <div className="lp-card__title"><FaFireAlt /> Loop de reactivación</div>
            </div>
            <p className="lp-card__hint">Los leads no convertidos no son pérdida: son inventario del siguiente ciclo.</p>

            <div className="lp-stat-grid">
              <div className="lp-stat"><span className="lp-stat__n mono">{r?.descartados ?? '—'}</span><label>leads muertos</label></div>
              <div className="lp-stat"><span className="lp-stat__n mono">{r?.conRevival ?? '—'}</span><label>reactivados</label></div>
              <div className="lp-stat lp-stat--good"><span className="lp-stat__n mono">{r?.revividosConvertidos ?? '—'}</span><label>revividos → pago</label></div>
              <div className="lp-stat lp-stat--money"><span className="lp-stat__n mono">{money(r?.revenueRecuperado)}</span><label>revenue recuperado</label></div>
            </div>

            <div className="lp-loop-metric">
              <FaRecycle />
              <span>Tasa de reactivación</span>
              <strong className="mono">{pct(r?.tasaRevival)}</strong>
              <span className="lp-dim">de {r?.conRevival ?? 0} reactivados vuelven a comprar</span>
            </div>

            <div className="lp-inventory">
              <span className="lp-dim">Inventario disponible</span>
              <div className="lp-inventory__bar">
                <div className="lp-inventory__used" style={{ width: `${((r?.conRevival || 0) / (r?.leadsTotal || 1)) * 100}%` }} />
              </div>
              <span className="mono">{r?.conRevival}/{r?.leadsTotal} tocados · {(r?.descartados || 0) - (r?.conRevival || 0) > 0 ? `${(r?.descartados || 0)} muertos por reciclar` : 'al día'}</span>
            </div>
          </div>

          {/* ── Loop de inteligencia conversacional ── */}
          <div className="lp-card lp-card--obj">
            <div className="lp-card__head">
              <div className="lp-card__title"><FaComments /> Loop de inteligencia conversacional</div>
              <div className="lp-kpi-inline">
                <span className="lp-big">{o?.leadsConObjecion ?? '—'}</span>
                <span className="lp-dim">leads con objeción · {o?.totalMsgsUsuario} msgs</span>
              </div>
            </div>
            <p className="lp-card__hint">Objeciones reales minadas de las conversaciones. Cada una es un guion que mejorar en Sofia y en Sandy/Hugo.</p>

            <div className="lp-obj-list">
              {(o?.categorias || []).map((c) => {
                const color = OBJ_COLORS[c.categoria] || '#8294b5';
                return (
                  <div className="lp-obj" key={c.categoria}>
                    <div className="lp-obj__head">
                      <span className="lp-obj__label" style={{ color }}>{OBJ_LABELS[c.categoria] || c.categoria}</span>
                      <span className="lp-obj__count mono">{c.total} <span className="lp-dim">· {c.leads} leads</span></span>
                    </div>
                    <div className="lp-obj__track">
                      <div className="lp-obj__fill" style={{ width: `${(c.total / maxObj) * 100}%`, background: color }} />
                    </div>
                    {c.ejemplos?.length > 0 && (
                      <div className="lp-obj__examples">
                        {c.ejemplos.slice(0, 2).map((e, i) => (
                          <span className="lp-obj__quote" key={i}>“{e}”</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLoops;
