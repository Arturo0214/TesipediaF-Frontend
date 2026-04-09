import React, { useEffect, useState, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import {
  FaFilter, FaWhatsapp, FaRocket, FaUsers, FaExclamationTriangle,
  FaSync, FaChartBar, FaArrowRight, FaDollarSign, FaBan, FaClock,
} from 'react-icons/fa';
import { getLeadsStats } from '../../../services/whatsapp/supabaseWhatsApp';
import './AdminFunnel.css';

const AdminFunnel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [origen, setOrigen] = useState('all'); // all | regular | manychat

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeadsStats(origen);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [origen]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="af-loading">
        <Spinner animation="border" variant="primary" />
        <p>Cargando funnel...</p>
      </div>
    );
  }

  if (!stats) return <div className="af-error">Error al cargar datos</div>;

  const { general, porEstado, porAdmin, recientes, embudo, perdidos, alertas } = stats;
  const maxFunnel = Math.max(...embudo.map(e => e.value), 1);

  return (
    <div className="af-container">
      {/* Header */}
      <div className="af-header">
        <div className="af-header-left">
          <FaChartBar className="af-header-icon" />
          <h2>Funnel de Ventas</h2>
        </div>
        <div className="af-header-actions">
          <div className="af-campaign-filter">
            <button
              className={`af-filter-btn ${origen === 'all' ? 'active' : ''}`}
              onClick={() => setOrigen('all')}
            >
              <FaUsers /> Todos
            </button>
            <button
              className={`af-filter-btn af-filter-sofia ${origen === 'regular' ? 'active' : ''}`}
              onClick={() => setOrigen('regular')}
            >
              <FaWhatsapp /> Sofia (WhatsApp)
            </button>
            <button
              className={`af-filter-btn af-filter-manychat ${origen === 'manychat' ? 'active' : ''}`}
              onClick={() => setOrigen('manychat')}
            >
              <FaRocket /> ManyChat
            </button>
          </div>
          <button className="af-refresh-btn" onClick={fetchStats} disabled={loading}>
            <FaSync className={loading ? 'af-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="af-kpis">
        <div className="af-kpi">
          <span className="af-kpi-value">{general.total}</span>
          <span className="af-kpi-label">Total leads</span>
        </div>
        <div className="af-kpi af-kpi-green">
          <span className="af-kpi-value">{recientes.h24}</span>
          <span className="af-kpi-label">Nuevos 24h</span>
        </div>
        <div className="af-kpi">
          <span className="af-kpi-value">{recientes.d7}</span>
          <span className="af-kpi-label">Nuevos 7d</span>
        </div>
        <div className="af-kpi">
          <span className="af-kpi-value">{recientes.d30}</span>
          <span className="af-kpi-label">Nuevos 30d</span>
        </div>
        <div className="af-kpi af-kpi-blue">
          <span className="af-kpi-value">{general.tasaConversion}%</span>
          <span className="af-kpi-label">Tasa conversión</span>
        </div>
        <div className="af-kpi af-kpi-gold">
          <span className="af-kpi-value">${general.precioPromedio?.toLocaleString()}</span>
          <span className="af-kpi-label">Precio prom.</span>
        </div>
      </div>

      {/* Funnel visual */}
      <div className="af-funnel-section">
        <h3>Embudo de conversión</h3>
        <div className="af-funnel">
          {embudo.map((step, i) => {
            const widthPct = Math.max((step.value / maxFunnel) * 100, 8);
            const dropOff = i > 0 && embudo[i - 1].value > 0
              ? Math.round(((embudo[i - 1].value - step.value) / embudo[i - 1].value) * 100)
              : null;
            return (
              <div key={step.etapa} className="af-funnel-row">
                <div className="af-funnel-label">
                  <span className="af-funnel-name">{step.etapa}</span>
                  <span className="af-funnel-count">{step.value}</span>
                </div>
                <div className="af-funnel-bar-wrap">
                  <div
                    className="af-funnel-bar"
                    style={{ width: `${widthPct}%`, background: step.color }}
                  />
                  {dropOff !== null && dropOff > 0 && (
                    <span className="af-funnel-dropoff">-{dropOff}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perdidos */}
      {perdidos && perdidos.length > 0 && (
        <div className="af-lost-section">
          <h3><FaBan /> Perdidos</h3>
          <div className="af-lost-grid">
            {perdidos.map(p => (
              <div key={p.etapa} className="af-lost-card">
                <span className="af-lost-value" style={{ color: p.color }}>{p.value}</span>
                <span className="af-lost-label">{p.etapa}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desglose por estado completo */}
      <div className="af-breakdown-row">
        <div className="af-breakdown-card">
          <h3>Por estado</h3>
          <div className="af-estado-list">
            {Object.entries(porEstado).filter(([, v]) => v > 0).map(([estado, count]) => (
              <div key={estado} className="af-estado-item">
                <span className="af-estado-name">{estado.replace(/_/g, ' ')}</span>
                <span className="af-estado-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="af-breakdown-card">
          <h3>Por admin</h3>
          <div className="af-admin-list">
            {Object.entries(porAdmin).map(([admin, count]) => (
              <div key={admin} className="af-admin-item">
                <span className="af-admin-name">{admin === 'sinAtender' ? 'Sin atender' : admin.charAt(0).toUpperCase() + admin.slice(1)}</span>
                <span className="af-admin-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="af-breakdown-card">
          <h3>Origen</h3>
          <div className="af-origin-list">
            <div className="af-origin-item">
              <FaWhatsapp style={{ color: '#25d366' }} />
              <span>WhatsApp (Sofia)</span>
              <span className="af-origin-count">{general.regular}</span>
            </div>
            <div className="af-origin-item">
              <FaRocket style={{ color: '#7c3aed' }} />
              <span>ManyChat</span>
              <span className="af-origin-count">{general.manychat}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertas && alertas.length > 0 && (
        <div className="af-alerts-section">
          <h3><FaExclamationTriangle /> Alertas</h3>
          <div className="af-alerts-grid">
            {alertas.map(a => (
              <div key={a.id} className={`af-alert-card af-alert-${a.severidad}`}>
                <div className="af-alert-header">
                  <span className="af-alert-count">{a.count}</span>
                  <span className="af-alert-title">{a.titulo}</span>
                </div>
                <p className="af-alert-desc">{a.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFunnel;
