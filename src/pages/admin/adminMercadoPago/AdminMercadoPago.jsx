import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  FaStore, FaShoppingCart, FaMoneyBillWave, FaSyncAlt, FaEye, FaCreditCard,
  FaCheckCircle, FaClock, FaTimesCircle, FaReceipt, FaChartLine, FaBoxOpen,
  FaArrowDown, FaPercentage,
} from 'react-icons/fa';
import { getStoreStats } from '../../../services/mercadoPagoService';
import './AdminMercadoPago.css';

const money = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const STATUS_META = {
  paid: { lbl: 'Pagado', c: '#4ADE80', bg: 'rgba(34,197,94,0.15)', icon: <FaCheckCircle /> },
  pending: { lbl: 'Pendiente', c: '#FBBF24', bg: 'rgba(245,179,1,0.15)', icon: <FaClock /> },
  failed: { lbl: 'Fallido', c: '#FCA5A5', bg: 'rgba(239,68,68,0.15)', icon: <FaTimesCircle /> },
};

export default function AdminMercadoPago() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await getStoreStats(days);
      setData(d);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Error al cargar métricas');
    }
  }, [days]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading && !data) {
    return <div className="mp"><div className="mp-loading"><div className="mp-spinner" /> Cargando métricas de la tienda…</div></div>;
  }

  const funnel = data?.funnel || {};
  const pagos = data?.pagos || {};
  const serie = (data?.serieDiaria || []).map((s) => ({
    label: `${s.fecha.slice(8, 10)}/${s.fecha.slice(5, 7)}`,
    ingresos: s.monto,
    compras: s.compras,
  }));

  // Pasos del embudo con su ancho relativo a las vistas de tienda
  const base = Math.max(funnel.vistasTienda || 0, 1);
  const pasos = [
    { key: 'vistas', lbl: 'Ven la tienda', val: funnel.vistasTienda || 0, icon: <FaEye />, c: '#2563EB' },
    { key: 'checkout', lbl: 'Inician pago', val: funnel.checkoutsIniciados || 0, icon: <FaCreditCard />, c: '#7C3AED', tasa: funnel.tasaCheckout },
    { key: 'compra', lbl: 'Compran', val: funnel.compras || 0, icon: <FaCheckCircle />, c: '#15803d', tasa: funnel.tasaCompra },
  ];

  return (
    <div className="mp">
      {/* HEADER */}
      <div className="mp-header">
        <div className="mp-header-left">
          <div className="mp-logo"><FaStore /></div>
          <div>
            <h2 className="mp-title">Mercado Pago · Tienda de guías</h2>
            <span className="mp-subtitle">Cuánta gente ve la tienda, cuánta compra y cómo van los pagos</span>
          </div>
        </div>
        <div className="mp-header-actions">
          <select className="mp-period" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 días</option>
            <option value={14}>14 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
            <option value={365}>1 año</option>
          </select>
          <button className={`mp-refresh ${refreshing ? 'spin' : ''}`} onClick={refresh} disabled={refreshing}>
            <FaSyncAlt /> {refreshing ? '' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mp-error">
          <strong>No se pudieron cargar las métricas.</strong> {error}
        </div>
      )}

      {/* KPIs */}
      <div className="mp-kpis">
        <div className="mp-kpi">
          <span className="mp-kpi-ico blue"><FaEye /></span>
          <div className="mp-kpi-val">{(funnel.vistasTienda || 0).toLocaleString()}</div>
          <div className="mp-kpi-lbl">Visitantes en la tienda</div>
        </div>
        <div className="mp-kpi">
          <span className="mp-kpi-ico purple"><FaCreditCard /></span>
          <div className="mp-kpi-val">{(funnel.checkoutsIniciados || 0).toLocaleString()}</div>
          <div className="mp-kpi-lbl">Iniciaron pago</div>
          <div className="mp-kpi-sub">{funnel.tasaCheckout || 0}% de los visitantes</div>
        </div>
        <div className="mp-kpi">
          <span className="mp-kpi-ico green"><FaCheckCircle /></span>
          <div className="mp-kpi-val">{(pagos.pagadas || 0).toLocaleString()}</div>
          <div className="mp-kpi-lbl">Compras pagadas</div>
          <div className="mp-kpi-sub">{funnel.tasaGlobal || 0}% conversión global</div>
        </div>
        <div className="mp-kpi">
          <span className="mp-kpi-ico gold"><FaMoneyBillWave /></span>
          <div className="mp-kpi-val">{money(pagos.ingresos)}</div>
          <div className="mp-kpi-lbl">Ingresos confirmados</div>
          <div className="mp-kpi-sub">Ticket prom. {money(pagos.ticketPromedio)}</div>
        </div>
      </div>

      {/* EMBUDO */}
      <div className="mp-card">
        <h3 className="mp-card-title"><FaArrowDown /> Embudo de conversión</h3>
        <div className="mp-funnel">
          {pasos.map((p, i) => {
            const width = Math.max(Math.round((p.val / base) * 100), p.val > 0 ? 8 : 3);
            return (
              <div className="mp-funnel-row" key={p.key}>
                <div className="mp-funnel-info">
                  <span className="mp-funnel-ico" style={{ color: p.c }}>{p.icon}</span>
                  <span className="mp-funnel-lbl">{p.lbl}</span>
                </div>
                <div className="mp-funnel-bar-wrap">
                  <div className="mp-funnel-bar" style={{ width: `${width}%`, background: p.c }}>
                    <span className="mp-funnel-val">{p.val.toLocaleString()}</span>
                  </div>
                  {i > 0 && p.tasa != null && (
                    <span className="mp-funnel-rate"><FaPercentage /> {p.tasa}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mp-funnel-note">
          Las vistas y checkouts se miden con la trazabilidad propia (eventos de la tienda).
          Los pagos vienen de Mercado Pago/Stripe confirmados en el servidor.
        </p>
      </div>

      {/* Estado de pagos + proveedor */}
      <div className="mp-row">
        <div className="mp-card">
          <h3 className="mp-card-title"><FaReceipt /> Estado de pagos</h3>
          <div className="mp-paystatus">
            <div className="mp-paystatus-item">
              <span className="mp-ps-ico" style={{ color: STATUS_META.paid.c }}><FaCheckCircle /></span>
              <div className="mp-ps-val">{pagos.pagadas || 0}</div>
              <div className="mp-ps-lbl">Pagadas</div>
            </div>
            <div className="mp-paystatus-item">
              <span className="mp-ps-ico" style={{ color: STATUS_META.pending.c }}><FaClock /></span>
              <div className="mp-ps-val">{pagos.pendientes || 0}</div>
              <div className="mp-ps-lbl">Pendientes</div>
            </div>
            <div className="mp-paystatus-item">
              <span className="mp-ps-ico" style={{ color: STATUS_META.failed.c }}><FaTimesCircle /></span>
              <div className="mp-ps-val">{pagos.fallidas || 0}</div>
              <div className="mp-ps-lbl">Fallidas</div>
            </div>
          </div>
          {(data?.porProveedor || []).length > 0 && (
            <div className="mp-provider">
              {data.porProveedor.map((p) => (
                <div className="mp-provider-row" key={p.provider}>
                  <span className={`mp-provider-badge ${p.provider}`}>{p.provider === 'mercadopago' ? 'Mercado Pago' : p.provider === 'stripe' ? 'Stripe' : p.provider}</span>
                  <span className="mp-provider-count">{p.count} compras</span>
                  <span className="mp-provider-monto">{money(p.monto)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingresos por día */}
        <div className="mp-card">
          <h3 className="mp-card-title"><FaChartLine /> Ingresos por día</h3>
          {serie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={serie} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="mpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip formatter={(v, n) => (n === 'ingresos' ? money(v) : v)} />
                <Area type="monotone" dataKey="ingresos" stroke="#15803d" fill="url(#mpGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="mp-empty">Aún no hay ventas pagadas en este periodo.</div>
          )}
        </div>
      </div>

      {/* Ventas por producto */}
      {(data?.porProducto || []).length > 0 && (
        <div className="mp-card">
          <h3 className="mp-card-title"><FaBoxOpen /> Ventas por guía</h3>
          <div className="mp-prod-table">
            <div className="mp-prod-head">
              <span className="mp-prod-name">Guía</span>
              <span className="mp-prod-num">Vendidas</span>
              <span className="mp-prod-num">Ingresos</span>
            </div>
            {data.porProducto.map((p, i) => (
              <div className="mp-prod-row" key={p.productId}>
                <span className="mp-prod-name"><span className="mp-prod-pos">{i + 1}</span>{p.nombre}</span>
                <span className="mp-prod-num"><strong>{p.count}</strong></span>
                <span className="mp-prod-num">{money(p.monto)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compras recientes */}
      <div className="mp-card">
        <h3 className="mp-card-title"><FaShoppingCart /> Compras recientes</h3>
        {(data?.recientes || []).length > 0 ? (
          <div className="mp-tx-table">
            <div className="mp-tx-head">
              <span>Fecha</span>
              <span>Guía</span>
              <span>Correo</span>
              <span>Monto</span>
              <span>Método</span>
              <span>Estado</span>
            </div>
            {data.recientes.map((r, i) => {
              const st = STATUS_META[r.status] || STATUS_META.pending;
              return (
                <div className="mp-tx-row" key={i}>
                  <span className="mp-tx-date">{fmtDate(r.createdAt)}</span>
                  <span className="mp-tx-name" title={r.nombre}>{r.nombre}</span>
                  <span className="mp-tx-email" title={r.email}>{r.email}</span>
                  <span className="mp-tx-amount">{money(r.amount)}</span>
                  <span className="mp-tx-prov">{r.provider === 'mercadopago' ? 'MP' : r.provider === 'stripe' ? 'Stripe' : r.provider}</span>
                  <span className="mp-tx-status" style={{ color: st.c, background: st.bg }}>{st.icon} {st.lbl}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mp-empty">Sin compras registradas en este periodo.</div>
        )}
      </div>
    </div>
  );
}
