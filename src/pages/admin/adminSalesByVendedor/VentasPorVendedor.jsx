import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  FaChartBar, FaUsers, FaDollarSign, FaSync, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import './VentasPorVendedor.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

/**
 * VentasPorVendedor — receives `payments` array from parent (ManagePayments dashboard data)
 * and computes vendedor stats locally, avoiding a separate API call.
 */
const VentasPorVendedor = ({ payments = [], onRefresh }) => {
  const [period, setPeriod] = useState('all');
  const [chartType, setChartType] = useState('bar');

  // Color palette for charts
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter payments by period
  const filteredPayments = useMemo(() => {
    if (period === 'all') return payments;

    const now = new Date();
    let cutoff;

    switch (period) {
      case 'thisMonth':
        cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last30days':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return payments;
    }

    return payments.filter(p => {
      const pDate = new Date(p.paymentDate || p.createdAt || p.date);
      return pDate >= cutoff;
    });
  }, [payments, period]);

  // Capitalize vendedor names
  const capitalizeName = (name) => {
    if (!name) return name;
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // Compute vendedor stats from filtered payments
  const { vendedorStats, summary } = useMemo(() => {
    const statsMap = {};

    for (const p of filteredPayments) {
      const rawVendedor = (p.vendedor || p.atendidoPor || '').trim();
      if (!rawVendedor) continue;
      const key = rawVendedor.toLowerCase();
      const vendedor = capitalizeName(rawVendedor);

      if (!statsMap[key]) {
        statsMap[key] = {
          vendedor,
          totalSales: 0,
          count: 0,
          completedCount: 0,
          completedAmount: 0,
        };
      }

      statsMap[key].totalSales += (p.amount || 0);
      statsMap[key].count += 1;

      const status = (p.status || '').toLowerCase();
      if (status === 'completed' || status === 'paid') {
        statsMap[key].completedCount += 1;
        statsMap[key].completedAmount += (p.amount || 0);
      }
    }

    const vendedorStats = Object.values(statsMap)
      .map(stat => ({
        ...stat,
        totalSales: Math.round(stat.totalSales),
        averageSale: stat.count > 0 ? Math.round(stat.totalSales / stat.count) : 0,
        conversionRate: stat.count > 0 ? ((stat.completedCount / stat.count) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.totalSales - a.totalSales);

    const grandTotal = vendedorStats.reduce((sum, v) => sum + v.totalSales, 0);
    const totalTransactions = vendedorStats.reduce((sum, v) => sum + v.count, 0);

    return {
      vendedorStats,
      summary: {
        totalSales: grandTotal,
        totalTransactions,
        totalVendedors: vendedorStats.length,
      },
    };
  }, [filteredPayments]);

  // Prepare data for charts
  const chartDataFormatted = vendedorStats.map(v => ({
    name: v.vendedor,
    ventas: v.totalSales,
    transacciones: v.count,
    promedio: v.averageSale,
  }));

  if (!payments || payments.length === 0) {
    return (
      <div className="vv-container">
        <div className="vv-header">
          <div>
            <h1 className="vv-title"><FaChartBar /> Ventas por Vendedor</h1>
            <p className="vv-subtitle">Análisis de desempeño de vendedores</p>
          </div>
        </div>
        <p className="vv-no-data" style={{ textAlign: 'center', padding: '2rem' }}>
          No hay datos de pagos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="vv-container">
      {/* Header */}
      <div className="vv-header">
        <div>
          <h1 className="vv-title">
            <FaChartBar /> Ventas por Vendedor
          </h1>
          <p className="vv-subtitle">Análisis de desempeño de vendedores</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="vv-refresh-btn" title="Actualizar datos">
            <FaSync />
            <span>Actualizar</span>
          </button>
        )}
      </div>

      {/* Period Filter */}
      <div className="vv-period-filter">
        <label>Período:</label>
        <div className="vv-period-buttons">
          {[
            { value: 'thisMonth', label: 'Este Mes' },
            { value: 'last30days', label: 'Últimos 30 días' },
            { value: 'last90days', label: 'Últimos 90 días' },
            { value: 'all', label: 'Todo el tiempo' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`vv-period-btn ${period === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="vv-summary">
        <div className="vv-card vv-card-blue">
          <div className="vv-card-icon">
            <FaDollarSign />
          </div>
          <div className="vv-card-content">
            <p className="vv-card-label">Total Ventas</p>
            <p className="vv-card-value">{formatCurrency(summary.totalSales || 0)}</p>
          </div>
        </div>

        <div className="vv-card vv-card-green">
          <div className="vv-card-icon">
            <FaUsers />
          </div>
          <div className="vv-card-content">
            <p className="vv-card-label">Vendedores Activos</p>
            <p className="vv-card-value">{summary.totalVendedors || 0}</p>
          </div>
        </div>

        <div className="vv-card vv-card-purple">
          <div className="vv-card-icon">
            <FaArrowUp />
          </div>
          <div className="vv-card-content">
            <p className="vv-card-label">Total Transacciones</p>
            <p className="vv-card-value">{summary.totalTransactions || 0}</p>
          </div>
        </div>

        <div className="vv-card vv-card-orange">
          <div className="vv-card-icon">
            <FaArrowDown />
          </div>
          <div className="vv-card-content">
            <p className="vv-card-label">Promedio por Vendedor</p>
            <p className="vv-card-value">
              {formatCurrency(
                summary.totalVendedors > 0 ? summary.totalSales / summary.totalVendedors : 0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {chartDataFormatted.length > 0 && (
        <div className="vv-chart-card">
          <div className="vv-chart-header">
            <h3>Comparativa de Vendedores</h3>
            <div className="vv-chart-toggle">
              <button
                onClick={() => setChartType('bar')}
                className={`vv-chart-btn ${chartType === 'bar' ? 'active' : ''}`}
              >
                Barras
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`vv-chart-btn ${chartType === 'line' ? 'active' : ''}`}
              >
                Líneas
              </button>
            </div>
          </div>

          <div className="vv-chart-container">
            {chartType === 'bar' ? (
              <Bar
                data={{
                  labels: chartDataFormatted.map(d => d.name),
                  datasets: [
                    {
                      label: 'Ventas (MXN)',
                      data: chartDataFormatted.map(d => d.ventas),
                      backgroundColor: COLORS.slice(0, chartDataFormatted.length),
                      borderColor: COLORS.slice(0, chartDataFormatted.length).map(c => c),
                      borderWidth: 1,
                      borderRadius: 8,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        font: { size: 12 },
                        color: '#374151',
                        padding: 15,
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#6b7280',
                        callback: (value) => formatCurrency(value)
                      },
                      grid: { color: '#e5e7eb', drawBorder: false }
                    },
                    x: {
                      ticks: { color: '#6b7280' },
                      grid: { display: false }
                    }
                  }
                }}
              />
            ) : (
              <Line
                data={{
                  labels: chartDataFormatted.map(d => d.name),
                  datasets: [
                    {
                      label: 'Ventas (MXN)',
                      data: chartDataFormatted.map(d => d.ventas),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 2,
                      fill: true,
                      pointBackgroundColor: '#3b82f6',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      tension: 0.4,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        font: { size: 12 },
                        color: '#374151',
                        padding: 15,
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#6b7280',
                        callback: (value) => formatCurrency(value)
                      },
                      grid: { color: '#e5e7eb', drawBorder: false }
                    },
                    x: {
                      ticks: { color: '#6b7280' },
                      grid: { display: false }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="vv-table-card">
        <h3>Detalle por Vendedor</h3>
        {vendedorStats.length > 0 ? (
          <div className="vv-table-wrapper">
            <table className="vv-table">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Total Ventas</th>
                  <th>Transacciones</th>
                  <th>Venta Promedio</th>
                  <th>Completas</th>
                  <th>Tasa de Conversión</th>
                </tr>
              </thead>
              <tbody>
                {vendedorStats.map((vendedor, idx) => (
                  <tr key={idx} className="vv-table-row">
                    <td className="vv-table-cell-name">
                      <span className="vv-color-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      {vendedor.vendedor || 'Sin asignar'}
                    </td>
                    <td className="vv-table-cell-numeric">
                      <strong>{formatCurrency(vendedor.totalSales)}</strong>
                    </td>
                    <td className="vv-table-cell-numeric">{vendedor.count}</td>
                    <td className="vv-table-cell-numeric">{formatCurrency(vendedor.averageSale)}</td>
                    <td className="vv-table-cell-numeric">{vendedor.completedCount}</td>
                    <td className="vv-table-cell-numeric">
                      <span className="vv-conversion-badge">{vendedor.conversionRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="vv-no-data">No hay datos disponibles para el período seleccionado</p>
        )}
      </div>
    </div>
  );
};

export default VentasPorVendedor;
