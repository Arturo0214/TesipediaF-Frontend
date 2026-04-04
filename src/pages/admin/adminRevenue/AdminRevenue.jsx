import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import {
  FaDollarSign, FaChartLine, FaReceipt, FaBalanceScale,
  FaPlus, FaTrash, FaPen, FaFileInvoiceDollar, FaArrowUp,
  FaArrowDown, FaPercentage, FaCalculator, FaTimes, FaSync,
  FaCheckCircle, FaTimesCircle, FaCog, FaBullhorn, FaServer,
  FaGoogle, FaFacebookF, FaEye, FaMousePointer
} from 'react-icons/fa';
import {
  fetchRevenueDashboard,
  fetchExpenses,
  createExpense,
  deleteExpense,
  fetchCostPerSale,
  fetchCategories,
  syncProviders,
  fetchSyncStatus,
  fetchCampaigns,
  fetchUsage,
  cleanupDuplicates,
} from '../../../features/revenue/revenueSlice';
import './AdminRevenue.css';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CATEGORY_COLORS = {
  claude_api: '#8B5CF6',
  meta_ads: '#1877F2',
  google_ads: '#EA4335',
  netlify: '#00C7B7',
  railway: '#0B0D0E',
  comision_vendedor: '#F59E0B',
  turnitin: '#2563EB',
  antiplagio_ia: '#DC2626',
  dominio: '#059669',
  cloudinary: '#3448C5',
  stripe_fees: '#635BFF',
  paypal_fees: '#003087',
  otro: '#6B7280',
};

const CATEGORY_LABELS = {
  claude_api: 'Claude AI',
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  netlify: 'Netlify',
  railway: 'Railway',
  comision_vendedor: 'Comisión Vendedor',
  turnitin: 'Turnitin',
  antiplagio_ia: 'Anti-IA',
  dominio: 'Dominio',
  cloudinary: 'Cloudinary',
  stripe_fees: 'Comisiones Stripe',
  paypal_fees: 'Comisiones PayPal',
  otro: 'Otro',
};

const fmt = (n) => {
  if (n === null || n === undefined) return '$0';
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const AdminRevenue = () => {
  const dispatch = useDispatch();
  const { dashboard, expenses, loading, expensesLoading, costPerSale, categories, syncing, syncResult, syncError, syncStatus, syncStatusLoading, campaigns, campaignsLoading, campaignsError, usage, usageLoading, cleanupResult, cleanupLoading } = useSelector(state => state.revenue);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [activeView, setActiveView] = useState('overview'); // overview | expenses | cost-per-sale | sync
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'claude_api',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // ── Fetch data ──
  useEffect(() => {
    dispatch(fetchRevenueDashboard({ year: selectedYear, month: selectedMonth }));
    dispatch(fetchCategories());
    dispatch(fetchSyncStatus());
  }, [dispatch, selectedYear, selectedMonth]);

  useEffect(() => {
    if (activeView === 'expenses') {
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString();
      dispatch(fetchExpenses({ startDate, endDate }));
    }
    if (activeView === 'cost-per-sale') {
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString();
      dispatch(fetchCostPerSale({ startDate, endDate }));
    }
    if (activeView === 'campaigns') {
      dispatch(fetchCampaigns({ year: selectedYear, month: selectedMonth }));
      dispatch(fetchUsage());
    }
  }, [dispatch, activeView, selectedYear, selectedMonth]);

  // ── Form handlers ──
  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;
    await dispatch(createExpense({
      ...formData,
      amount: parseFloat(formData.amount),
    }));
    setFormData({ category: 'claude_api', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    dispatch(fetchRevenueDashboard({ year: selectedYear, month: selectedMonth }));
  };

  const handleCleanup = async () => {
    const result = await dispatch(cleanupDuplicates({ year: selectedYear, month: selectedMonth }));
    // Refresh dashboard after cleanup
    dispatch(fetchRevenueDashboard({ year: selectedYear, month: selectedMonth }));
    if (activeView === 'expenses') {
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString();
      dispatch(fetchExpenses({ startDate, endDate }));
    }
  };

  const handleSync = async () => {
    const result = await dispatch(syncProviders({ year: selectedYear, month: selectedMonth }));
    // Refresh dashboard and sync status regardless of result
    dispatch(fetchRevenueDashboard({ year: selectedYear, month: selectedMonth }));
    dispatch(fetchSyncStatus());
    if (activeView === 'expenses' || result?.payload?.created > 0) {
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString();
      dispatch(fetchExpenses({ startDate, endDate }));
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    await dispatch(deleteExpense(id));
    dispatch(fetchRevenueDashboard({ year: selectedYear, month: selectedMonth }));
  };

  // ── Chart data (income vs expenses by month) ──
  const chartData = useMemo(() => {
    if (!dashboard) return [];
    const incomeMap = {};
    const expenseMap = {};

    (dashboard.income?.byMonth || []).forEach(item => {
      incomeMap[item._id] = item.total;
    });

    (dashboard.expenses?.byMonth || []).forEach(item => {
      const m = item._id?.month || item._id;
      expenseMap[m] = (expenseMap[m] || 0) + item.total;
    });

    const maxVal = Math.max(
      ...Object.values(incomeMap),
      ...Object.values(expenseMap),
      1
    );

    return MONTHS.map((label, i) => ({
      label: label.substring(0, 3),
      income: incomeMap[i + 1] || 0,
      expense: expenseMap[i + 1] || 0,
      incomeHeight: maxVal > 0 ? ((incomeMap[i + 1] || 0) / maxVal * 100) : 0,
      expenseHeight: maxVal > 0 ? ((expenseMap[i + 1] || 0) / maxVal * 100) : 0,
    }));
  }, [dashboard]);

  // ── Render helpers ──
  const renderKPIs = () => {
    if (!dashboard) return null;
    const { income, expenses: exp, profit, costPerThesis, salesCount } = dashboard;

    return (
      <div className="rev-kpis">
        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#D1FAE5', color: '#065F46' }}>
            <FaArrowUp />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Ingresos del Mes</span>
            <span className="rev-kpi-value positive">{fmt(income?.monthly?.total)}</span>
            <span className="rev-kpi-sub">{income?.monthly?.count || 0} ventas</span>
          </div>
        </div>

        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            <FaArrowDown />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Gastos del Mes</span>
            <span className="rev-kpi-value negative">{fmt(exp?.monthly?.total)}</span>
            <span className="rev-kpi-sub">{exp?.monthly?.byCategory?.length || 0} categorías</span>
          </div>
        </div>

        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: profit?.monthly >= 0 ? '#DBEAFE' : '#FEE2E2', color: profit?.monthly >= 0 ? '#1E40AF' : '#991B1B' }}>
            <FaBalanceScale />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Profit del Mes</span>
            <span className={`rev-kpi-value ${profit?.monthly >= 0 ? 'positive' : 'negative'}`}>
              {fmt(profit?.monthly)}
            </span>
            <span className="rev-kpi-sub">
              {income?.monthly?.total > 0
                ? `Margen: ${((profit?.monthly / income?.monthly?.total) * 100).toFixed(1)}%`
                : 'Sin ventas'}
            </span>
          </div>
        </div>

        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#EDE9FE', color: '#5B21B6' }}>
            <FaCalculator />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Costo por Tesis</span>
            <span className="rev-kpi-value">{fmt(costPerThesis)}</span>
            <span className="rev-kpi-sub">{salesCount} tesis vendidas este mes</span>
          </div>
        </div>
      </div>
    );
  };

  const renderYearlyKPIs = () => {
    if (!dashboard) return null;
    const { income, expenses: exp, profit } = dashboard;

    return (
      <div className="rev-kpis" style={{ marginBottom: 20 }}>
        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#D1FAE5', color: '#065F46' }}>
            <FaDollarSign />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Ingresos Anuales</span>
            <span className="rev-kpi-value positive">{fmt(income?.yearly?.total)}</span>
            <span className="rev-kpi-sub">{income?.yearly?.count || 0} ventas en {selectedYear}</span>
          </div>
        </div>

        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            <FaReceipt />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Gastos Anuales</span>
            <span className="rev-kpi-value negative">{fmt(exp?.yearly?.total)}</span>
          </div>
        </div>

        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
            <FaChartLine />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Profit Anual</span>
            <span className={`rev-kpi-value ${profit?.yearly >= 0 ? 'positive' : 'negative'}`}>
              {fmt(profit?.yearly)}
            </span>
          </div>
        </div>

        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#FEF3C7', color: '#92400E' }}>
            <FaPercentage />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Margen Anual</span>
            <span className="rev-kpi-value">
              {income?.yearly?.total > 0
                ? `${((profit?.yearly / income?.yearly?.total) * 100).toFixed(1)}%`
                : '—'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => (
    <div className="rev-section">
      <h3 className="rev-section-title"><FaChartLine /> Ingresos vs Gastos — {selectedYear}</h3>
      <div className="rev-chart">
        {chartData.map((d, i) => (
          <div key={i} className="rev-chart-bar-group">
            <div className="rev-chart-bars">
              <div
                className="rev-chart-bar income"
                style={{ height: `${Math.max(d.incomeHeight, 1)}%` }}
                title={`Ingresos: ${fmt(d.income)}`}
              />
              <div
                className="rev-chart-bar expense"
                style={{ height: `${Math.max(d.expenseHeight, 1)}%` }}
                title={`Gastos: ${fmt(d.expense)}`}
              />
            </div>
            <span className="rev-chart-label">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="rev-chart-legend">
        <span className="rev-chart-legend-item">
          <span className="rev-chart-legend-dot" style={{ background: '#059669' }} /> Ingresos
        </span>
        <span className="rev-chart-legend-item">
          <span className="rev-chart-legend-dot" style={{ background: '#DC2626' }} /> Gastos
        </span>
      </div>
    </div>
  );

  const renderBreakdown = () => {
    if (!dashboard) return null;
    const cats = dashboard.expenses?.monthly?.byCategory || [];
    if (cats.length === 0) {
      return (
        <div className="rev-section">
          <h3 className="rev-section-title"><FaReceipt /> Desglose por Categoría</h3>
          <div className="rev-empty">No hay gastos registrados este mes</div>
        </div>
      );
    }

    return (
      <div className="rev-section">
        <h3 className="rev-section-title"><FaReceipt /> Desglose por Categoría — {MONTHS[selectedMonth]}</h3>
        <div className="rev-breakdown">
          {cats.map(cat => (
            <div key={cat._id} className="rev-cat-card">
              <span className="rev-cat-dot" style={{ background: CATEGORY_COLORS[cat._id] || '#6B7280' }} />
              <div className="rev-cat-info">
                <div className="rev-cat-name">{CATEGORY_LABELS[cat._id] || cat._id}</div>
                <div className="rev-cat-amount">{fmt(cat.total)}</div>
                <div className="rev-cat-count">{cat.count} registro{cat.count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVendedores = () => {
    if (!dashboard?.income?.byVendedor?.length) return null;
    return (
      <div className="rev-section">
        <h3 className="rev-section-title"><FaDollarSign /> Ingresos por Vendedor — {MONTHS[selectedMonth]}</h3>
        <div className="rev-breakdown">
          {dashboard.income.byVendedor.map(v => (
            <div key={v._id} className="rev-cat-card">
              <span className="rev-cat-dot" style={{ background: '#4F46E5' }} />
              <div className="rev-cat-info">
                <div className="rev-cat-name">{v._id}</div>
                <div className="rev-cat-amount">{fmt(v.total)}</div>
                <div className="rev-cat-count">{v.count} venta{v.count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContrast = () => {
    if (!dashboard) return null;
    const payments = dashboard.recentPayments || [];
    const cats = dashboard.expenses?.monthly?.byCategory || [];
    const totalIncome = dashboard.income?.monthly?.total || 0;
    const totalExpenses = dashboard.expenses?.monthly?.total || 0;

    const METHOD_LABELS = {
      stripe: 'Stripe',
      paypal: 'PayPal',
      transferencia: 'Transferencia',
      efectivo: 'Efectivo',
      mercadolibre: 'MercadoLibre',
      manual: 'Manual',
    };

    return (
      <div className="rev-contrast-grid">
        {/* INGRESOS — pagos individuales */}
        <div className="rev-contrast-col income-col">
          <div className="rev-contrast-header">
            <span className="rev-contrast-title">
              <FaArrowUp style={{ color: '#059669' }} /> Ingresos ({payments.length})
            </span>
            <span className="rev-contrast-total positive">{fmt(totalIncome)}</span>
          </div>
          {payments.length === 0 ? (
            <div className="rev-empty" style={{ padding: '20px 0' }}>
              <FaDollarSign />
              <div>Sin pagos completados este mes</div>
            </div>
          ) : (
            payments.map((p, i) => (
              <div key={p._id || i} className="rev-payment-row">
                <div className="rev-payment-info">
                  <span className="rev-payment-client">{p.clientName || p.title || 'Venta sin nombre'}</span>
                  <span className="rev-payment-meta">
                    {p.vendedor && `${p.vendedor} · `}
                    {new Date(p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <span className="rev-method-badge">{METHOD_LABELS[p.method] || p.method}</span>
                <span className="rev-payment-amount positive">{fmt(p.amount)}</span>
              </div>
            ))
          )}
        </div>

        {/* GASTOS — por categoría */}
        <div className="rev-contrast-col expense-col">
          <div className="rev-contrast-header">
            <span className="rev-contrast-title">
              <FaArrowDown style={{ color: '#DC2626' }} /> Gastos ({cats.length} categorías)
            </span>
            <span className="rev-contrast-total negative">{fmt(totalExpenses)}</span>
          </div>
          {cats.length === 0 ? (
            <div className="rev-empty" style={{ padding: '20px 0' }}>
              <FaReceipt />
              <div>Sin gastos registrados este mes</div>
            </div>
          ) : (
            cats.map((cat, i) => (
              <div key={cat._id || i} className="rev-expense-row">
                <div className="rev-payment-info">
                  <span className="rev-payment-client">
                    <span className="rev-cat-badge-dot" style={{ background: CATEGORY_COLORS[cat._id] || '#6B7280', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 6 }} />
                    {CATEGORY_LABELS[cat._id] || cat._id}
                  </span>
                  <span className="rev-payment-meta">{cat.count} registro{cat.count !== 1 ? 's' : ''}</span>
                </div>
                <span className="rev-payment-amount negative">{fmt(cat.total)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderExpensesTab = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 className="rev-section-title" style={{ margin: 0 }}><FaReceipt /> Gastos — {MONTHS[selectedMonth]} {selectedYear}</h3>
        <button className="rev-form-submit" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><FaTimes /> Cerrar</> : <><FaPlus /> Agregar Gasto</>}
        </button>
      </div>

      {showForm && (
        <form className="rev-form" onSubmit={handleCreateExpense}>
          <div className="rev-form-group">
            <label className="rev-form-label">Categoría</label>
            <select name="category" value={formData.category} onChange={handleFormChange} className="rev-form-select">
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="rev-form-group">
            <label className="rev-form-label">Monto (MXN)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleFormChange}
              placeholder="0.00"
              className="rev-form-input"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="rev-form-group">
            <label className="rev-form-label">Fecha</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleFormChange}
              className="rev-form-input"
            />
          </div>
          <button type="submit" className="rev-form-submit">Guardar</button>
          <div className="rev-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="rev-form-label">Descripción (opcional)</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Ej: Factura mensual de Railway..."
              className="rev-form-input"
            />
          </div>
        </form>
      )}

      <div className="rev-section">
        {expensesLoading ? (
          <div className="rev-loading"><Spinner animation="border" size="sm" /></div>
        ) : expenses.length === 0 ? (
          <div className="rev-empty">
            <FaReceipt />
            <div>No hay gastos registrados en este período</div>
          </div>
        ) : (
          <div className="rev-table-wrap">
            <table className="rev-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Origen</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp._id}>
                    <td>{new Date(exp.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</td>
                    <td>
                      <span className="rev-cat-badge">
                        <span className="rev-cat-badge-dot" style={{ background: CATEGORY_COLORS[exp.category] || '#6B7280' }} />
                        {CATEGORY_LABELS[exp.category] || exp.category}
                      </span>
                    </td>
                    <td>{exp.description || '—'}</td>
                    <td className="rev-amount-cell">{fmt(exp.amount)}</td>
                    <td style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                      {exp.source === 'calculated' ? 'Auto' : exp.source === 'api' ? 'API' : 'Manual'}
                    </td>
                    <td>
                      <div className="rev-actions-cell">
                        <button className="rev-action-btn delete" onClick={() => handleDeleteExpense(exp._id)} title="Eliminar">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderCostPerSale = () => {
    if (!costPerSale) return <div className="rev-loading"><Spinner animation="border" size="sm" /></div>;

    const { sales, summary } = costPerSale;

    return (
      <>
        {/* Summary KPIs */}
        <div className="rev-kpis" style={{ marginBottom: 20 }}>
          <div className="rev-kpi">
            <div className="rev-kpi-icon" style={{ background: '#D1FAE5', color: '#065F46' }}>
              <FaDollarSign />
            </div>
            <div className="rev-kpi-body">
              <span className="rev-kpi-label">Revenue Total</span>
              <span className="rev-kpi-value positive">{fmt(summary?.totalRevenue)}</span>
              <span className="rev-kpi-sub">{summary?.totalSales} ventas</span>
            </div>
          </div>
          <div className="rev-kpi">
            <div className="rev-kpi-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
              <FaReceipt />
            </div>
            <div className="rev-kpi-body">
              <span className="rev-kpi-label">Costos Totales</span>
              <span className="rev-kpi-value negative">{fmt(summary?.totalCosts)}</span>
            </div>
          </div>
          <div className="rev-kpi">
            <div className="rev-kpi-icon" style={{ background: '#EDE9FE', color: '#5B21B6' }}>
              <FaCalculator />
            </div>
            <div className="rev-kpi-body">
              <span className="rev-kpi-label">Costo Promedio/Venta</span>
              <span className="rev-kpi-value">{fmt(summary?.avgCostPerSale)}</span>
            </div>
          </div>
          <div className="rev-kpi">
            <div className="rev-kpi-icon" style={{ background: '#FEF3C7', color: '#92400E' }}>
              <FaPercentage />
            </div>
            <div className="rev-kpi-body">
              <span className="rev-kpi-label">Margen Promedio</span>
              <span className="rev-kpi-value">{summary?.avgMargin}%</span>
            </div>
          </div>
        </div>

        <div className="rev-section">
          <h3 className="rev-section-title"><FaFileInvoiceDollar /> Detalle por Venta — {MONTHS[selectedMonth]} {selectedYear}</h3>
          {sales.length === 0 ? (
            <div className="rev-empty">
              <FaFileInvoiceDollar />
              <div>No hay ventas con costos asociados en este período</div>
            </div>
          ) : (
            <div className="rev-sale-cards">
              {sales.map((sale, idx) => {
                const marginNum = parseFloat(sale.margin);
                const marginClass = marginNum >= 60 ? 'good' : marginNum >= 30 ? 'mid' : 'bad';
                return (
                  <div key={idx} className="rev-sale-card">
                    <div className="rev-sale-info">
                      <span className="rev-sale-client">{sale.payment.clientName || sale.payment.title || 'Venta sin nombre'}</span>
                      <span className="rev-sale-meta">
                        {sale.payment.vendedor && `Vendedor: ${sale.payment.vendedor} · `}
                        {sale.payment.method} · {new Date(sale.payment.date).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <div className="rev-sale-numbers">
                      <div className="rev-sale-num">
                        <div className="rev-sale-num-label">Ingreso</div>
                        <div className="rev-sale-num-value income">{fmt(sale.payment.amount)}</div>
                      </div>
                      <div className="rev-sale-num">
                        <div className="rev-sale-num-label">Costo</div>
                        <div className="rev-sale-num-value cost">{fmt(sale.totalCost)}</div>
                      </div>
                      <div className="rev-sale-num">
                        <div className="rev-sale-num-label">Profit</div>
                        <div className="rev-sale-num-value profit">{fmt(sale.profit)}</div>
                      </div>
                      <span className={`rev-margin-badge ${marginClass}`}>{sale.margin}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderSyncTab = () => (
    <>
      <div className="rev-section">
        <h3 className="rev-section-title"><FaSync /> Sincronización con APIs Externas</h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>
          Conecta automáticamente con Anthropic, Meta Ads, Google Ads, Netlify y Railway para importar los gastos del mes seleccionado.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            className="rev-form-submit"
            onClick={handleSync}
            disabled={syncing}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <FaSync style={syncing ? { animation: 'spin 1s linear infinite' } : {}} />
            {syncing ? 'Sincronizando...' : `Sincronizar ${MONTHS[selectedMonth]} ${selectedYear}`}
          </button>

          <button
            className="rev-form-submit"
            onClick={handleCleanup}
            disabled={cleanupLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F59E0B' }}
          >
            <FaTrash />
            {cleanupLoading ? 'Limpiando...' : 'Limpiar Duplicados'}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

        {cleanupResult && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: cleanupResult.duplicatesDeleted > 0 || cleanupResult.amountFixes?.length > 0 ? '#D1FAE5' : '#F3F4F6',
            border: `1px solid ${cleanupResult.duplicatesDeleted > 0 ? '#059669' : '#D1D5DB'}`,
          }}>
            <strong style={{ fontSize: '0.88rem' }}>{cleanupResult.message}</strong>
            <div style={{ fontSize: '0.8rem', marginTop: 6, color: '#374151' }}>
              {cleanupResult.duplicatesDeleted} duplicados eliminados
              {cleanupResult.amountFixes?.length > 0 && ` · ${cleanupResult.amountFixes.length} montos corregidos`}
            </div>
            {cleanupResult.amountFixes?.map((fix, i) => (
              <div key={i} style={{ fontSize: '0.75rem', color: '#065F46', marginTop: 4 }}>
                <FaCheckCircle style={{ marginRight: 4 }} />
                {fix.category}: ${fix.oldAmount} → ${fix.newAmount} MXN
              </div>
            ))}
            {cleanupResult.deletedExpenses?.map((del, i) => (
              <div key={`del-${i}`} style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: 4 }}>
                <FaTrash style={{ marginRight: 4 }} />
                Eliminado: {del.description} (${del.amount} MXN)
              </div>
            ))}
          </div>
        )}

        {syncError && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: '#FEE2E2', border: '1px solid #DC2626',
          }}>
            <strong style={{ fontSize: '0.88rem', color: '#991B1B' }}>
              <FaTimesCircle style={{ marginRight: 6 }} /> Error al sincronizar
            </strong>
            <div style={{ fontSize: '0.8rem', marginTop: 6, color: '#991B1B' }}>
              {typeof syncError === 'string' ? syncError : 'Error de conexión con el servidor'}
            </div>
          </div>
        )}

        {syncResult && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: syncResult.errors?.length ? '#FEF3C7' : '#D1FAE5',
            border: `1px solid ${syncResult.errors?.length ? '#F59E0B' : '#059669'}`,
          }}>
            <strong style={{ fontSize: '0.88rem' }}>{syncResult.message}</strong>
            <div style={{ fontSize: '0.8rem', marginTop: 6, color: '#374151' }}>
              {syncResult.created} gastos creados/actualizados · {syncResult.skipped} ya existían
              {syncResult.errors?.length > 0 && ` · ${syncResult.errors.length} errores`}
            </div>
            {syncResult.errors?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {syncResult.errors.map((e, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: '#92400E' }}>
                    <FaTimesCircle style={{ marginRight: 4 }} /> {e.provider}: {e.error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rev-section">
        <h3 className="rev-section-title"><FaCog /> Estado de Proveedores</h3>
        {syncStatusLoading && (
          <div className="rev-loading" style={{ padding: '20px 0' }}><Spinner animation="border" size="sm" /> Cargando proveedores...</div>
        )}
        {!syncStatusLoading && !syncStatus?.providers?.length && (
          <div className="rev-empty" style={{ padding: '20px 0' }}>
            <FaCog />
            <div>No se pudo cargar el estado de proveedores</div>
            <button className="rev-form-submit" style={{ marginTop: 10, fontSize: '0.8rem' }} onClick={() => dispatch(fetchSyncStatus())}>
              Reintentar
            </button>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {syncStatus?.providers?.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 10, border: '1px solid #f0f0f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="rev-cat-dot" style={{ background: CATEGORY_COLORS[p.category] || '#6B7280' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                    Variables: {p.envVars.join(', ')}
                  </div>
                </div>
              </div>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 600,
                background: p.configured ? '#D1FAE5' : '#FEE2E2',
                color: p.configured ? '#065F46' : '#991B1B',
              }}>
                {p.configured ? <FaCheckCircle /> : <FaTimesCircle />}
                {p.configured ? 'Configurado' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
        {syncStatus?.exchangeRate && (
          <div style={{ marginTop: 14, fontSize: '0.78rem', color: '#9ca3af' }}>
            Tipo de cambio actual: 1 USD = ${syncStatus.exchangeRate} MXN
            <span style={{ fontSize: '0.7rem', marginLeft: 8 }}>
              (configurable via USD_TO_MXN_RATE en .env)
            </span>
          </div>
        )}
      </div>
    </>
  );

  const renderCampaignsTab = () => {
    const campaignList = campaigns?.campaigns || [];
    const summary = campaigns?.summary || {};
    const errors = campaigns?.errors || [];

    return (
      <>
        {/* Usage / Billing Section */}
        <div className="rev-section">
          <h3 className="rev-section-title"><FaServer /> Uso de Servicios</h3>
          {usageLoading ? (
            <div className="rev-loading" style={{ padding: '20px 0' }}><Spinner animation="border" size="sm" /></div>
          ) : !usage ? (
            <div className="rev-empty" style={{ padding: '20px 0' }}>
              <FaServer />
              <div>No se pudo cargar información de uso</div>
            </div>
          ) : (
            <div className="rev-usage-grid">
              {/* Anthropic */}
              <div className="rev-usage-card">
                <div className="rev-usage-header">
                  <span className="rev-usage-icon" style={{ background: '#EDE9FE', color: '#5B21B6' }}>AI</span>
                  <span className="rev-usage-name">Anthropic</span>
                </div>
                {usage.anthropic?.error ? (
                  <div className="rev-usage-error">{usage.anthropic.error}</div>
                ) : (
                  <>
                    <div className="rev-usage-value">
                      ${usage.anthropic?.data?.subscriptionCostUSD || usage.anthropic?.data?.credit_balance?.toFixed(2) || '0'} USD
                    </div>
                    <div className="rev-usage-label">
                      {usage.anthropic?.status === 'ok' && usage.anthropic?.data?.credit_balance !== undefined
                        ? `Crédito restante · Suscripción $${usage.anthropic.data.subscriptionCostUSD}/mo`
                        : `Suscripción mensual (${fmt(usage.anthropic?.data?.subscriptionCostMXN || 0)} MXN)`
                      }
                    </div>
                  </>
                )}
              </div>

              {/* Railway */}
              <div className="rev-usage-card">
                <div className="rev-usage-header">
                  <span className="rev-usage-icon" style={{ background: '#F3F4F6', color: '#0B0D0E' }}>RW</span>
                  <span className="rev-usage-name">Railway</span>
                </div>
                {usage.railway?.data?.error ? (
                  <div className="rev-usage-error">{usage.railway.data.error}</div>
                ) : usage.railway?.status === 'estimated' ? (
                  <>
                    <div className="rev-usage-value">${usage.railway?.data?.estimatedMonthlyCostUSD || 20} USD</div>
                    <div className="rev-usage-label">Costo estimado mensual ({fmt(usage.railway?.data?.estimatedMonthlyCostMXN || 0)} MXN)</div>
                  </>
                ) : (
                  <>
                    <div className="rev-usage-value">${usage.railway?.data?.currentUsageUSD?.toFixed(2) || '0.00'} USD</div>
                    <div className="rev-usage-label">
                      Uso actual · Plan {usage.railway?.data?.planName || 'Pro'} (${usage.railway?.data?.planPriceUSD || 20}/mo)
                    </div>
                    {usage.railway?.data?.billEstimateUSD > 0 && (
                      <div className="rev-usage-sub">Estimado ciclo: ${usage.railway.data.billEstimateUSD.toFixed(2)} USD</div>
                    )}
                  </>
                )}
              </div>

              {/* Netlify */}
              <div className="rev-usage-card">
                <div className="rev-usage-header">
                  <span className="rev-usage-icon" style={{ background: '#D1FAE5', color: '#00C7B7' }}>NF</span>
                  <span className="rev-usage-name">Netlify</span>
                </div>
                {usage.netlify?.data?.error ? (
                  <div className="rev-usage-error">{usage.netlify.data.error}</div>
                ) : (
                  <>
                    <div className="rev-usage-value">${usage.netlify?.data?.planCostUSD || 9} USD</div>
                    <div className="rev-usage-label">
                      Plan {usage.netlify?.data?.planType || 'Personal'} ({fmt(usage.netlify?.data?.planCostMXN || 0)} MXN/mo)
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Campaigns Section */}
        <div className="rev-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="rev-section-title" style={{ margin: 0 }}>
              <FaBullhorn /> Campañas — {MONTHS[selectedMonth]} {selectedYear}
            </h3>
            <button
              className="rev-form-submit"
              onClick={() => dispatch(fetchCampaigns({ year: selectedYear, month: selectedMonth }))}
              disabled={campaignsLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
            >
              <FaSync style={campaignsLoading ? { animation: 'spin 1s linear infinite' } : {}} />
              {campaignsLoading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {/* Platform summary KPIs */}
          {(summary.meta || summary.google) && (
            <div className="rev-campaign-summary">
              {summary.meta && (
                <div className="rev-campaign-platform">
                  <FaFacebookF style={{ color: '#1877F2' }} />
                  <span className="rev-campaign-platform-name">Meta Ads</span>
                  <span className="rev-campaign-platform-count">{summary.meta.count} campañas</span>
                  <span className="rev-campaign-platform-spend">{fmt(summary.meta.spend)}</span>
                </div>
              )}
              {summary.google && (
                <div className="rev-campaign-platform">
                  <FaGoogle style={{ color: '#EA4335' }} />
                  <span className="rev-campaign-platform-name">Google Ads</span>
                  <span className="rev-campaign-platform-count">{summary.google.count} campañas</span>
                  <span className="rev-campaign-platform-spend">{fmt(summary.google.spend)}</span>
                </div>
              )}
              {campaigns?.totalSpend !== undefined && (
                <div className="rev-campaign-platform total">
                  <FaDollarSign style={{ color: '#DC2626' }} />
                  <span className="rev-campaign-platform-name">Total Ads</span>
                  <span className="rev-campaign-platform-spend negative">{fmt(campaigns.totalSpend)}</span>
                </div>
              )}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {errors.map((e, i) => {
                const isTokenExpired = e.error?.toLowerCase().includes('session has expired') || e.error?.toLowerCase().includes('access token');
                const isNotConfigured = e.error?.toLowerCase().includes('no configurad');
                const friendlyMsg = isTokenExpired
                  ? 'Token expirado. Genera uno nuevo en Meta Business → Usuarios del sistema → Generar token.'
                  : isNotConfigured
                  ? 'Credenciales no configuradas en el archivo .env del backend.'
                  : e.error;
                return (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                    background: isTokenExpired ? '#FEE2E2' : '#FEF3C7',
                    border: `1px solid ${isTokenExpired ? '#EF4444' : '#F59E0B'}`,
                    fontSize: '0.8rem',
                  }}>
                    <FaTimesCircle style={{ marginRight: 6, color: isTokenExpired ? '#DC2626' : '#92400E' }} />
                    <strong>{e.provider}:</strong> {friendlyMsg}
                  </div>
                );
              })}
            </div>
          )}

          {campaignsLoading ? (
            <div className="rev-loading" style={{ padding: '30px 0' }}><Spinner animation="border" size="sm" /></div>
          ) : campaignList.length === 0 ? (
            <div className="rev-empty">
              <FaBullhorn />
              <div>No hay campañas activas para este período</div>
              <div style={{ fontSize: '0.78rem', marginTop: 6, color: '#9ca3af' }}>
                Verifica que los tokens de Meta y Google Ads estén configurados en el backend
              </div>
            </div>
          ) : (
            <div className="rev-campaigns-grid">
              {campaignList.map((c, i) => (
                <div key={c.id || i} className="rev-campaign-card">
                  <div className="rev-campaign-card-header">
                    <span className="rev-campaign-badge" style={{
                      background: c.platform === 'meta' ? '#E7F0FF' : '#FEE2E2',
                      color: c.platform === 'meta' ? '#1877F2' : '#EA4335',
                    }}>
                      {c.platform === 'meta' ? <FaFacebookF /> : <FaGoogle />}
                      {c.platform === 'meta' ? 'Meta' : 'Google'}
                    </span>
                    <span className="rev-campaign-spend">{fmt(c.spend)}</span>
                  </div>
                  <div className="rev-campaign-name">{c.name}</div>
                  {c.objective && <div className="rev-campaign-objective">{c.objective}</div>}
                  <div className="rev-campaign-metrics">
                    <div className="rev-campaign-metric">
                      <FaEye style={{ fontSize: '0.65rem' }} />
                      <span className="rev-campaign-metric-value">{(c.impressions || 0).toLocaleString('es-MX')}</span>
                      <span className="rev-campaign-metric-label">Impresiones</span>
                    </div>
                    <div className="rev-campaign-metric">
                      <FaMousePointer style={{ fontSize: '0.65rem' }} />
                      <span className="rev-campaign-metric-value">{(c.clicks || 0).toLocaleString('es-MX')}</span>
                      <span className="rev-campaign-metric-label">Clics</span>
                    </div>
                    <div className="rev-campaign-metric">
                      <span className="rev-campaign-metric-value">{c.ctr ? `${parseFloat(c.ctr).toFixed(2)}%` : '—'}</span>
                      <span className="rev-campaign-metric-label">CTR</span>
                    </div>
                    <div className="rev-campaign-metric">
                      <span className="rev-campaign-metric-value">{c.cpc ? fmt(c.cpc) : '—'}</span>
                      <span className="rev-campaign-metric-label">CPC</span>
                    </div>
                    {c.conversions > 0 && (
                      <div className="rev-campaign-metric">
                        <span className="rev-campaign-metric-value">{c.conversions}</span>
                        <span className="rev-campaign-metric-label">Leads</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  if (loading && !dashboard) {
    return (
      <div className="rev-dash">
        <div className="rev-loading"><Spinner animation="border" /></div>
      </div>
    );
  }

  return (
    <div className="rev-dash">
      {/* Header */}
      <div className="rev-header">
        <div>
          <h1 className="rev-title">Revenue & Costos</h1>
          <p className="rev-subtitle">Control financiero de Tesipedia — ingresos, gastos y costo por tesis</p>
        </div>
        <div className="rev-controls">
          <select
            className="rev-month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            className="rev-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="rev-tabs">
        <button className={`rev-tab ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>
          Resumen
        </button>
        <button className={`rev-tab ${activeView === 'expenses' ? 'active' : ''}`} onClick={() => setActiveView('expenses')}>
          Gastos
        </button>
        <button className={`rev-tab ${activeView === 'cost-per-sale' ? 'active' : ''}`} onClick={() => setActiveView('cost-per-sale')}>
          Costo por Venta
        </button>
        <button className={`rev-tab ${activeView === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveView('campaigns')}>
          <FaBullhorn style={{ marginRight: 4 }} /> Campañas
        </button>
        <button className={`rev-tab ${activeView === 'sync' ? 'active' : ''}`} onClick={() => setActiveView('sync')}>
          <FaSync style={{ marginRight: 4 }} /> APIs
        </button>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <>
          {renderKPIs()}
          {renderYearlyKPIs()}
          {renderContrast()}
          {renderChart()}
          {renderBreakdown()}
          {renderVendedores()}
        </>
      )}

      {activeView === 'expenses' && renderExpensesTab()}
      {activeView === 'cost-per-sale' && renderCostPerSale()}
      {activeView === 'campaigns' && renderCampaignsTab()}
      {activeView === 'sync' && renderSyncTab()}
    </div>
  );
};

export default AdminRevenue;
