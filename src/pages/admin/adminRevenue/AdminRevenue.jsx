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
  fetchCashflow,
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
import axiosWithAuth from '../../../utils/axioswithAuth';
import { toast } from 'react-toastify';
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
  // Muestra centavos sólo cuando el monto NO es entero (no redondea montos exactos).
  const num = Number(n);
  const hasCents = Math.abs(num - Math.round(num)) > 0.005;
  return '$' + num.toLocaleString('es-MX', { minimumFractionDigits: hasCents ? 2 : 0, maximumFractionDigits: 2 });
};

const AdminRevenue = () => {
  const dispatch = useDispatch();
  const { dashboard, cashflow, cashflowLoading, expenses, loading, expensesLoading, costPerSale, categories, syncing, syncResult, syncError, syncStatus, syncStatusLoading, campaigns, campaignsLoading, campaignsError, usage, usageLoading, cleanupResult, cleanupLoading } = useSelector(state => state.revenue);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [activeView, setActiveView] = useState('overview'); // overview | cashflow | expenses | cost-per-sale | sync
  const [cfExpanded, setCfExpanded] = useState(null); // id de proyecto expandido en la matriz
  const [cfSaving, setCfSaving] = useState(null); // `${quoteId}-${idx}` del cobro que se está guardando
  // ── Filtros/periodo propios del Flujo de caja ('all' = todo por defecto) ──
  const [cfMonth, setCfMonth] = useState('all');     // 'all' | 0..11
  const [cfYear, setCfYear] = useState('all');       // 'all' | 2026 | 2027 ...
  const [cfVendedor, setCfVendedor] = useState('');  // '' = todos
  const [cfEstado, setCfEstado] = useState('');      // '' | porCobrar | vencido | pagado | perdido
  const [cfCliente, setCfCliente] = useState('');    // búsqueda por nombre
  const [cfEsquema, setCfEsquema] = useState('');    // '' | tipo de esquema
  const [cfEditId, setCfEditId] = useState(null); // quoteId cuyo contacto se está editando
  const [cfContact, setCfContact] = useState({ phone: '', email: '' });
  const [cfContactSaving, setCfContactSaving] = useState(false);
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
    // El endpoint devuelve TODO el horizonte en `monthly`/`projects`; el año solo afecta yearTotals,
    // que no usamos en la vista filtrada. Con cfYear='all' pedimos el año actual y computamos client-side.
    if (activeView === 'cashflow') dispatch(fetchCashflow({ year: cfYear === 'all' ? now.getFullYear() : cfYear }));
  }, [dispatch, activeView, cfYear]);

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

  // Marcar/desmarcar un cobro (parcialidad) como pagado desde la matriz de cobranza.
  // Usa el MISMO endpoint que la sección de Pagos (source=sofia → installmentStatuses),
  // así el cambio se refleja en ambos lados.
  const handleToggleInstallment = async (quoteId, idx, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const key = `${quoteId}-${idx}`;
    setCfSaving(key);
    try {
      await axiosWithAuth.patch(
        `/payments/dashboard/${quoteId}/installment?source=sofia`,
        { installmentIndex: idx, status: newStatus }
      );
      toast.success(newStatus === 'paid' ? 'Cobro marcado como pagado ✅' : 'Cobro marcado como pendiente');
      // Recargar flujo de caja para recomputar cobrado/por cobrar/vencido
      await dispatch(fetchCashflow({ year: cfYear === 'all' ? now.getFullYear() : cfYear }));
      // Refrescar también el resumen de revenue (usa los mismos pagos)
      dispatch(fetchRevenueDashboard({ year: selectedYear, month: selectedMonth }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar el cobro');
    } finally {
      setCfSaving(null);
    }
  };

  // Marcar/desmarcar una parcialidad como CARTERA PERDIDA (ya no se cobrará). Reversible → 'pending'.
  const handleMarkLost = async (quoteId, idx, currentStatus) => {
    const newStatus = currentStatus === 'lost' ? 'pending' : 'lost';
    if (newStatus === 'lost' && !window.confirm('¿Marcar este cobro como cartera perdida? Saldrá de "Por cobrar" y contará como pérdida.')) return;
    const key = `${quoteId}-${idx}`;
    setCfSaving(key);
    try {
      await axiosWithAuth.patch(
        `/payments/dashboard/${quoteId}/installment?source=sofia`,
        { installmentIndex: idx, status: newStatus }
      );
      toast.success(newStatus === 'lost' ? 'Marcado como cartera perdida 🚫' : 'Restaurado a por cobrar');
      await dispatch(fetchCashflow({ year: cfYear === 'all' ? now.getFullYear() : cfYear }));
      dispatch(fetchRevenueDashboard({ year: selectedYear, month: selectedMonth }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setCfSaving(null);
    }
  };

  // Editar/guardar contacto del cliente directamente en la cotización (PUT /quotes/:id).
  // Solo manda clientPhone/clientEmail → no cambia status ni dispara auto-creación.
  const openContactEdit = (p) => {
    setCfEditId(p.id);
    setCfContact({ phone: p.phone || '', email: p.email || '' });
  };
  const handleSaveContact = async (quoteId) => {
    setCfContactSaving(true);
    try {
      await axiosWithAuth.put(`/quotes/generated/${quoteId}`, {
        clientPhone: cfContact.phone.trim(),
        clientEmail: cfContact.email.trim(),
      });
      toast.success('Contacto guardado ✅');
      setCfEditId(null);
      await dispatch(fetchCashflow({ year: selectedYear }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar el contacto');
    } finally {
      setCfContactSaving(false);
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

        <div className="rev-kpi">
          <div className="rev-kpi-icon" style={{ background: '#E0E7FF', color: '#3730a3' }}>
            <FaDollarSign />
          </div>
          <div className="rev-kpi-body">
            <span className="rev-kpi-label">Total histórico</span>
            <span className="rev-kpi-value positive">{fmt(income?.allTime?.total)}</span>
            <span className="rev-kpi-sub">{income?.allTime?.count || 0} pagos totales</span>
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
                    {new Date(p.paymentDate || p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {p.currency && p.currency !== 'MXN' && ` · ${p.currency}`}
                  </span>
                </div>
                <span className="rev-method-badge">{METHOD_LABELS[p.method] || p.method || '—'}</span>
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

  // ── Flujo de caja: Vendido / Cobrado / Por cobrar por mes + matriz por proyecto ──
  const renderCashflow = () => {
    if (cashflowLoading && !cashflow) {
      return <div className="rev-section" style={{ textAlign: 'center', padding: 40 }}><Spinner animation="border" size="sm" /> Cargando flujo de caja…</div>;
    }
    if (!cashflow) return null;

    const monthly = cashflow.monthly || [];
    const projects = cashflow.projects || [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const norm = (s) => String(s || '').toLowerCase().trim();
    const mAbbr = (i) => (MONTHS[i] || '').slice(0, 3);

    // Opciones de filtro derivadas de los datos
    const vendedores = [...new Set(projects.map(p => p.vendedor).filter(Boolean))].sort();
    const esquemas = [...new Set(projects.map(p => p.esquema).filter(Boolean))].sort();

    // Enriquecer cada proyecto: cobrado/porCobrar/perdido/vencido + celdas por mes.
    const enrich = (p) => {
      let cobrado = 0, porCobrar = 0, perdido = 0, vencido = 0;
      const cells = {};
      for (const it of (p.installments || [])) {
        const overdue = it.status === 'pending' && new Date(it.fecha) < today;
        if (it.status === 'paid') cobrado += it.amount;
        else if (it.status === 'lost') perdido += it.amount;
        else { porCobrar += it.amount; if (overdue) vencido += it.amount; }
        const c = (cells[it.mes] = cells[it.mes] || { paid: 0, pending: 0, lost: 0, overdue: false });
        if (it.status === 'paid') c.paid += it.amount;
        else if (it.status === 'lost') c.lost += it.amount;
        else { c.pending += it.amount; if (overdue) c.overdue = true; }
      }
      const total = p.total || (cobrado + porCobrar + perdido);
      const pendientes = (p.installments || [])
        .filter(it => it.status === 'pending' && (it.amount || 0) > 0.005 && it.fecha)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      const next = pendientes[0] || null;
      return { ...p, cells, cobrado, porCobrar, perdido, vencido, total,
        nextDue: next ? next.fecha : null, nextOverdue: next ? new Date(next.fecha) < today : false,
        pct: total > 0 ? Math.round((cobrado / total) * 100) : 0 };
    };
    const allRows = projects.map(enrich).filter(p => (p.installments || []).length > 0);

    // Filtros de proyecto (vendedor / cliente / esquema / estado)
    const matchEstado = (p) => {
      if (!cfEstado) return true;
      if (cfEstado === 'porCobrar') return p.porCobrar > 0.5;
      if (cfEstado === 'vencido') return p.vencido > 0.5;
      if (cfEstado === 'pagado') return p.porCobrar < 0.5 && p.perdido < 0.5;
      if (cfEstado === 'perdido') return p.perdido > 0.5;
      return true;
    };
    const filteredRows = allRows.filter(p =>
      (!cfVendedor || p.vendedor === cfVendedor) &&
      (!cfEsquema || p.esquema === cfEsquema) &&
      (!cfCliente || norm(p.client).includes(norm(cfCliente))) &&
      matchEstado(p)
    );

    // Serie mensual recomputada desde los proyectos filtrados (respeta filtros y multi-año)
    const gastosByKey = {}; monthly.forEach(m => { gastosByKey[m.key] = m.gastos || 0; });
    const magg = {};
    const touchM = (k) => (magg[k] = magg[k] || { key: k, vendido: 0, cobrado: 0, porCobrar: 0, perdido: 0 });
    for (const p of filteredRows) {
      if (p.closeMonth) touchM(p.closeMonth).vendido += p.total || 0;
      for (const it of (p.installments || [])) {
        const m = touchM(it.mes);
        if (it.status === 'paid') m.cobrado += it.amount;
        else if (it.status === 'lost') m.perdido += it.amount;
        else m.porCobrar += it.amount;
      }
    }
    // Con filtro de entidad (vendedor/cliente/esquema), gastos/ganancia son de empresa → no se atribuyen.
    const entityFilter = !!(cfVendedor || cfEsquema || cfCliente);
    const monthlyRows = Object.values(magg).map(m => {
      const gastos = entityFilter ? 0 : (gastosByKey[m.key] || 0);
      const [yy, mm] = m.key.split('-').map(Number);
      const label = new Date(yy, mm - 1, 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
      return { ...m, gastos, ganancia: m.cobrado - gastos, label };
    }).sort((a, b) => a.key.localeCompare(b.key));

    // Periodo (año/mes) elegido
    const inYear = (k) => cfYear === 'all' || k.slice(0, 4) === String(cfYear);
    const inMonth = (k) => cfMonth === 'all' || Number(k.slice(5, 7)) - 1 === cfMonth;
    const periodRows = monthlyRows.filter(m => inYear(m.key));
    const yt = periodRows.reduce((a, m) => ({
      vendido: a.vendido + m.vendido, cobrado: a.cobrado + m.cobrado, porCobrar: a.porCobrar + m.porCobrar,
      perdido: a.perdido + m.perdido, gastos: a.gastos + m.gastos, ganancia: a.ganancia + m.ganancia,
    }), { vendido: 0, cobrado: 0, porCobrar: 0, perdido: 0, gastos: 0, ganancia: 0 });

    // Tarjetas del periodo: mes específico si se eligió, si no el total del periodo.
    const selKey = (cfMonth !== 'all' && cfYear !== 'all') ? `${cfYear}-${String(cfMonth + 1).padStart(2, '0')}` : null;
    const sel = selKey ? (monthlyRows.find(m => m.key === selKey) || { vendido: 0, cobrado: 0, porCobrar: 0, perdido: 0 }) : null;
    const periodLabel = cfMonth === 'all'
      ? (cfYear === 'all' ? 'Todo' : String(cfYear))
      : `${MONTHS[cfMonth]}${cfYear === 'all' ? '' : ' ' + cfYear}`;
    const selData = sel || yt;

    // Hero: totales del horizonte filtrado (acotado al periodo elegido)
    const heroRows = monthlyRows.filter(m => inYear(m.key) && inMonth(m.key));
    const totalPorCobrar = heroRows.reduce((s, m) => s + m.porCobrar, 0);
    const totalCobrado = heroRows.reduce((s, m) => s + m.cobrado, 0);
    const totalVendido = heroRows.reduce((s, m) => s + m.vendido, 0);
    const totalPerdido = heroRows.reduce((s, m) => s + m.perdido, 0);
    const totalVencido = filteredRows.reduce((s, p) => s + p.vencido, 0);

    // Próximas cobranzas: desde hoy (o el mes elegido) con saldo — a través de todos los años (muestra 2027).
    const floorKey = selKey || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const upcoming = monthlyRows.filter(m => m.key >= floorKey && m.porCobrar > 0);
    const maxUpcoming = Math.max(1, ...upcoming.map(m => m.porCobrar));

    // Matriz: columnas de meses (12 del año elegido, o todos los meses con actividad si 'all')
    const projRows = filteredRows.slice().sort((a, b) => b.vencido - a.vencido || b.porCobrar - a.porCobrar || b.total - a.total);
    const monthCols = cfYear === 'all'
      ? [...new Set(projRows.flatMap(p => Object.keys(p.cells)))].sort()
      : Array.from({ length: 12 }, (_, i) => `${cfYear}-${String(i + 1).padStart(2, '0')}`);
    const colLabel = (mk) => {
      const i = Number(mk.slice(5, 7)) - 1;
      return cfYear === 'all' ? `${mAbbr(i)} ${mk.slice(2, 4)}` : mAbbr(i);
    };
    const colTotal = {};
    monthCols.forEach(mk => { colTotal[mk] = projRows.reduce((s, p) => s + ((p.cells[mk]?.paid || 0) + (p.cells[mk]?.pending || 0) + (p.cells[mk]?.lost || 0)), 0); });
    const sumCol = (key) => projRows.reduce((s, p) => s + p[key], 0);
    const nCols = monthCols.length;

    const card = (label, value, color, sub, big) => (
      <div style={{ flex: 1, minWidth: 200, background: big ? 'linear-gradient(135deg,#1a2230,#11161d)' : '#11161d', border: `1px solid ${big ? '#3a2a12' : '#232a35'}`, borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ fontSize: 12, color: '#8b97a7', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: big ? 32 : 26, fontWeight: 700, color, marginTop: 4 }}>{fmt(value)}</div>
        {sub && <div style={{ fontSize: 11, color: '#6b7685', marginTop: 2 }}>{sub}</div>}
      </div>
    );

    const selStyle = { fontSize: 13, background: '#0d1117', border: '1px solid #2a323d', borderRadius: 8, padding: '6px 10px', color: '#e6edf5' };
    const anyFilter = cfMonth !== 'all' || cfYear !== 'all' || cfVendedor || cfEstado || cfCliente || cfEsquema;

    return (
      <>
        {/* Barra de filtros / periodo (propia del Flujo de caja) */}
        <div className="rev-section" style={{ padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#8b97a7', textTransform: 'uppercase', letterSpacing: 0.4 }}>🔎 Filtros</span>
            <select value={cfYear} onChange={(e) => setCfYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={selStyle} title="Año">
              <option value="all">Todos los años</option>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={cfMonth} onChange={(e) => setCfMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={selStyle} title="Mes">
              <option value="all">Todos los meses</option>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={cfVendedor} onChange={(e) => setCfVendedor(e.target.value)} style={selStyle} title="Vendedor">
              <option value="">Todos los vendedores</option>
              {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={cfEstado} onChange={(e) => setCfEstado(e.target.value)} style={selStyle} title="Estado">
              <option value="">Todos los estados</option>
              <option value="porCobrar">Por cobrar</option>
              <option value="vencido">Vencido</option>
              <option value="pagado">Pagado</option>
              <option value="perdido">Cartera perdida</option>
            </select>
            <select value={cfEsquema} onChange={(e) => setCfEsquema(e.target.value)} style={selStyle} title="Esquema de pago">
              <option value="">Todos los esquemas</option>
              {esquemas.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <input value={cfCliente} onChange={(e) => setCfCliente(e.target.value)} placeholder="Buscar cliente…" style={{ ...selStyle, minWidth: 160, flex: 1 }} />
            {anyFilter && (
              <button onClick={() => { setCfMonth('all'); setCfYear('all'); setCfVendedor(''); setCfEstado(''); setCfCliente(''); setCfEsquema(''); }}
                style={{ fontSize: 12, color: '#8b97a7', background: 'transparent', border: '1px solid #2a323d', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
                ✕ Limpiar
              </button>
            )}
            <span style={{ fontSize: 12, color: '#5a6675', marginLeft: 'auto' }}>{projRows.length} proyecto(s) · periodo: {periodLabel}</span>
          </div>
        </div>

        {/* Hero: cuánto voy a cobrar en total + barras de próximas cobranzas */}
        <div className="rev-section" style={{ background: 'linear-gradient(135deg,#1c1505,#12161d)', border: '1px solid #3a2a12' }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ minWidth: 240 }}>
              <div style={{ fontSize: 12, color: '#c79a4e', textTransform: 'uppercase', letterSpacing: 0.6 }}>💰 Por cobrar (total pendiente)</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#f59e0b', lineHeight: 1.1 }}>{fmt(totalPorCobrar)}</div>
              <div style={{ fontSize: 12, color: '#8b97a7', marginTop: 4 }}>
                de {fmt(totalVendido)} vendido · {fmt(totalCobrado)} ya cobrado ({totalVendido > 0 ? Math.round(totalCobrado / totalVendido * 100) : 0}%)
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {totalVencido > 0.5 && (
                  <div style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#fca5a5', background: '#2a1010', border: '1px solid #4a1c1c', borderRadius: 8, padding: '4px 10px' }}>
                    🔴 Cartera vencida: {fmt(totalVencido)} <span style={{ fontWeight: 400, color: '#b9747a' }}>(pagos pendientes con fecha pasada)</span>
                  </div>
                )}
                {totalPerdido > 0.5 && (
                  <div style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#9ca3af', background: '#1a1d22', border: '1px solid #383d45', borderRadius: 8, padding: '4px 10px' }}>
                    🚫 Cartera perdida: {fmt(totalPerdido)} <span style={{ fontWeight: 400, color: '#6b7280' }}>(pagos que ya no se cobrarán)</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 12, color: '#8b97a7', marginBottom: 8 }}>Próximas cobranzas</div>
              {upcoming.length === 0 && <div style={{ fontSize: 13, color: '#6b7685' }}>Sin pagos pendientes futuros 🎉</div>}
              {upcoming.slice(0, 8).map(m => (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 70, fontSize: 12, color: '#cdd6e0', textTransform: 'capitalize' }}>{m.label}</div>
                  <div style={{ flex: 1, height: 14, background: '#1c232d', borderRadius: 7, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(4, (m.porCobrar / maxUpcoming) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 7 }} />
                  </div>
                  <div style={{ width: 80, textAlign: 'right', fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>{fmt(m.porCobrar)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjetas del periodo seleccionado */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
          {card(`Vendido · ${periodLabel}`, selData.vendido, '#e6edf5', sel ? 'Ventas cerradas este mes' : 'Ventas cerradas en el periodo')}
          {card(`Cobrado · ${periodLabel}`, selData.cobrado, '#10b981', sel ? 'Parcialidades pagadas en el mes' : 'Parcialidades pagadas en el periodo')}
          {card(`Por cobrar · ${periodLabel}`, selData.porCobrar, '#f59e0b', sel ? 'Parcialidades pendientes en el mes' : 'Parcialidades pendientes en el periodo')}
          {(selData.perdido || 0) > 0.5 && card(`Cartera perdida · ${periodLabel}`, selData.perdido, '#9ca3af', 'Pagos que ya no se cobrarán')}
        </div>

        {/* Análisis mensual: vendido / cobrado / por cobrar / gastos / ganancia */}
        <div className="rev-section">
          <h3 className="rev-section-title"><FaChartLine /> Análisis mensual {cfYear === 'all' ? '(todos los años)' : cfYear} — cuánto se gana por mes</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ color: '#8b97a7', textAlign: 'right' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Mes</th>
                  <th style={{ padding: '8px 10px' }}>Vendido</th>
                  <th style={{ padding: '8px 10px', color: '#10b981' }}>Cobrado</th>
                  <th style={{ padding: '8px 10px', color: '#f59e0b' }}>Por cobrar</th>
                  <th style={{ padding: '8px 10px', color: '#9ca3af' }}>Perdido</th>
                  <th style={{ padding: '8px 10px', color: '#f87171' }}>Gastos</th>
                  <th style={{ padding: '8px 10px', color: '#38bdf8' }}>Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {periodRows.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#6b7685' }}>Sin actividad para los filtros seleccionados.</td></tr>
                )}
                {periodRows.map(m => {
                  const gan = m.ganancia;
                  const isSel = selKey && m.key === selKey;
                  return (
                    <tr key={m.key} style={{ borderTop: '1px solid #1c232d', textAlign: 'right', background: isSel ? '#161d27' : 'transparent', cursor: 'pointer' }}
                      onClick={() => setCfMonth(cfMonth === (Number(m.key.slice(5, 7)) - 1) ? 'all' : Number(m.key.slice(5, 7)) - 1)}>
                      <td style={{ textAlign: 'left', padding: '8px 10px', textTransform: 'capitalize', color: '#cdd6e0' }}>{m.label}</td>
                      <td style={{ padding: '8px 10px', color: '#e6edf5' }}>{fmt(m.vendido)}</td>
                      <td style={{ padding: '8px 10px', color: '#10b981' }}>{fmt(m.cobrado)}</td>
                      <td style={{ padding: '8px 10px', color: '#f59e0b' }}>{fmt(m.porCobrar)}</td>
                      <td style={{ padding: '8px 10px', color: '#9ca3af' }}>{m.perdido > 0.5 ? fmt(m.perdido) : '—'}</td>
                      <td style={{ padding: '8px 10px', color: '#f87171' }}>{m.gastos ? '-' + fmt(m.gastos) : '—'}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: gan >= 0 ? '#38bdf8' : '#ef4444' }}>{fmt(gan)}</td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: '2px solid #2a323d', textAlign: 'right', fontWeight: 700 }}>
                  <td style={{ textAlign: 'left', padding: '10px', color: '#fff' }}>TOTAL {cfYear === 'all' ? '' : cfYear}</td>
                  <td style={{ padding: '10px', color: '#e6edf5' }}>{fmt(yt.vendido)}</td>
                  <td style={{ padding: '10px', color: '#10b981' }}>{fmt(yt.cobrado)}</td>
                  <td style={{ padding: '10px', color: '#f59e0b' }}>{fmt(yt.porCobrar)}</td>
                  <td style={{ padding: '10px', color: '#9ca3af' }}>{yt.perdido > 0.5 ? fmt(yt.perdido) : '—'}</td>
                  <td style={{ padding: '10px', color: '#f87171' }}>{yt.gastos ? '-' + fmt(yt.gastos) : '—'}</td>
                  <td style={{ padding: '10px', color: (yt.ganancia ?? 0) >= 0 ? '#38bdf8' : '#ef4444' }}>{fmt(yt.ganancia)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: '#6b7685', marginTop: 8 }}>Ganancia = Cobrado − Gastos del mes. "Perdido" = cartera dada por incobrable (sale de Por cobrar).{entityFilter ? ' Con filtro de vendedor/cliente/esquema, Gastos y Ganancia no se muestran (son de empresa).' : ' Las parcialidades en "Por cobrar" suman a la ganancia cuando se cobran en su mes.'}</p>
        </div>

        {/* Matriz por proyecto x mes */}
        <div className="rev-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <h3 className="rev-section-title" style={{ margin: 0 }}><FaFileInvoiceDollar /> Matriz de cobranza por proyecto · {cfYear === 'all' ? 'todos los años' : cfYear}</h3>
            <span style={{ fontSize: 13, color: '#8b97a7' }}>{projRows.length} proyecto(s)</span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7685', margin: '4px 0 10px' }}>
            <span style={{ color: '#10b981' }}>● cobrado</span> &nbsp; <span style={{ color: '#f59e0b' }}>● por cobrar</span> &nbsp; <span style={{ color: '#ef4444' }}>● vencido ⚠</span> &nbsp; <span style={{ color: '#9ca3af' }}>● perdido 🚫</span> &nbsp;·&nbsp; click en un proyecto para ver el desglose y marcar pagos · ordenado por vencido y saldo
          </p>
          <div style={{ overflowX: 'auto', maxHeight: 560, overflowY: 'auto', border: '1px solid #1c232d', borderRadius: 10 }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: 12, minWidth: 1100 }}>
              <thead>
                <tr style={{ color: '#8b97a7' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', position: 'sticky', left: 0, top: 0, zIndex: 3, background: '#0d1117' }}>Proyecto</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', position: 'sticky', top: 0, background: '#0d1117' }}>Total</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', position: 'sticky', top: 0, background: '#0d1117', color: '#10b981' }}>Cobrado</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', position: 'sticky', top: 0, background: '#0d1117', color: '#f59e0b' }}>Por cobrar</th>
                  <th style={{ textAlign: 'center', padding: '8px 8px', position: 'sticky', top: 0, background: '#0d1117', minWidth: 104 }}>Próx. cobro</th>
                  <th style={{ textAlign: 'center', padding: '8px 8px', position: 'sticky', top: 0, background: '#0d1117', minWidth: 90 }}>%</th>
                  {monthCols.map((mk) => <th key={mk} style={{ textAlign: 'right', padding: '8px 8px', position: 'sticky', top: 0, background: '#0d1117', opacity: colTotal[mk] ? 1 : 0.4, minWidth: 78 }}>{colLabel(mk)}</th>)}
                </tr>
              </thead>
              <tbody>
                {projRows.map((p, idx) => {
                  const open = cfExpanded === p.id;
                  const rowBg = idx % 2 ? '#0f141b' : 'transparent';
                  const stickyBg = idx % 2 ? '#0f141b' : '#0d1117';
                  return (
                  <React.Fragment key={p.id}>
                  <tr style={{ background: rowBg }}>
                    <td onClick={() => setCfExpanded(open ? null : p.id)} style={{ padding: '7px 10px', position: 'sticky', left: 0, background: stickyBg, whiteSpace: 'nowrap', borderTop: '1px solid #161d27', cursor: 'pointer' }} title={`${p.client} — ${p.title} (click para desglose)`}>
                      <span style={{ color: '#5a6675', marginRight: 4 }}>{open ? '▾' : '▸'}</span>
                      <span style={{ color: '#e6edf5' }}>{p.client}</span>
                      <span style={{ color: '#5a6675', fontSize: 11 }}> · {p.vendedor || '—'}</span>
                      {p.concluido
                        ? <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#0e2a1c', color: '#34d399', border: '1px solid #1b4d33' }}>🏁 Concluido</span>
                        : p.pagado
                          ? <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#0d2230', color: '#38bdf8', border: '1px solid #18415a' }}>✅ Pagado</span>
                          : p.vencido > 0.5
                            ? <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#2a1010', color: '#fca5a5', border: '1px solid #4a1c1c' }}>🔴 Vencido {fmt(p.vencido)}</span>
                            : <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#251a08', color: '#f59e0b', border: '1px solid #4a3514' }}>⏳ {p.pct}%</span>}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', color: '#9aa6b4', borderTop: '1px solid #161d27' }}>{fmt(p.total)}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', color: '#10b981', borderTop: '1px solid #161d27' }}>{fmt(p.cobrado)}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', color: '#f59e0b', fontWeight: 700, borderTop: '1px solid #161d27' }}>{p.porCobrar > 0.5 ? fmt(p.porCobrar) : '—'}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'center', borderTop: '1px solid #161d27', whiteSpace: 'nowrap' }}>
                      {p.nextDue ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8, display: 'inline-block',
                          background: p.nextOverdue ? '#2a1010' : '#251a08',
                          color: p.nextOverdue ? '#fca5a5' : '#f59e0b',
                          border: `1px solid ${p.nextOverdue ? '#4a1c1c' : '#4a3514'}`,
                        }} title={p.nextOverdue ? 'Cobro vencido' : 'Próximo cobro'}>
                          {p.nextOverdue ? '🔴 ' : '📅 '}
                          {new Date(p.nextDue).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </span>
                      ) : <span style={{ color: '#3a4250' }}>—</span>}
                    </td>
                    <td style={{ padding: '7px 8px', borderTop: '1px solid #161d27' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ flex: 1, height: 6, background: '#1c232d', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${p.pct}%`, height: '100%', background: p.pct >= 100 ? '#10b981' : '#f59e0b' }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#7d8896', width: 26, textAlign: 'right' }}>{p.pct}%</span>
                      </div>
                    </td>
                    {monthCols.map(mk => {
                      const c = p.cells[mk];
                      const empty = !c || (!c.paid && !c.pending && !c.lost);
                      return (
                        <td key={mk} style={{ padding: '7px 8px', textAlign: 'right', borderTop: '1px solid #161d27', whiteSpace: 'nowrap', lineHeight: 1.25, minWidth: 78, fontVariantNumeric: 'tabular-nums' }}>
                          {empty && <span style={{ color: '#2c333d' }}>·</span>}
                          {c && c.paid > 0 && <div style={{ color: '#10b981' }}>{fmt(c.paid)}</div>}
                          {c && c.pending > 0 && (
                            <div style={{ color: c.overdue ? '#ef4444' : '#f59e0b', fontWeight: c.overdue ? 700 : 400 }}>
                              {fmt(c.pending)}{c.overdue ? <span style={{ fontSize: 9, marginLeft: 1, verticalAlign: 'top' }}>⚠</span> : ''}
                            </div>
                          )}
                          {c && c.lost > 0 && <div style={{ color: '#9ca3af' }}>{fmt(c.lost)} 🚫</div>}
                        </td>
                      );
                    })}
                  </tr>
                  {open && (() => {
                    const tel = (p.phone || '').replace(/[^\d]/g, '');
                    const estatusMap = { pending: '🟡 Pendiente', in_progress: '🔵 En proceso', review: '🟣 En revisión', completed: '🏁 Concluido', cancelled: '⚫ Cancelado' };
                    const due = p.dueDate ? new Date(p.dueDate) : null;
                    return (
                    <tr>
                      <td colSpan={6 + nCols} style={{ padding: '12px 16px', background: '#0a0e14', borderTop: '1px solid #161d27' }}>
                        {/* Contacto + estatus del proyecto */}
                        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #161d27' }}>
                          <div style={{ fontSize: 13, color: '#e6edf5', fontWeight: 600 }}>{p.client}</div>
                          {p.phone && (
                            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                              <a href={`https://wa.me/${tel.length === 10 ? '52' + tel : tel}`} target="_blank" rel="noreferrer" style={{ color: '#25d366', textDecoration: 'none' }}>💬 WhatsApp</a>
                              <a href={`tel:${tel}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>📞 {p.phone}</a>
                            </span>
                          )}
                          {p.email && <a href={`mailto:${p.email}`} style={{ color: '#cdd6e0', textDecoration: 'none', fontSize: 12 }}>✉️ {p.email}</a>}
                          {!p.phone && !p.email && <span style={{ fontSize: 12, color: '#6b7685' }}>Sin datos de contacto</span>}
                          {cfEditId !== p.id && (
                            <button onClick={() => openContactEdit(p)} style={{ fontSize: 11, color: '#8b97a7', background: 'transparent', border: '1px solid #2a323d', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>
                              ✏️ {p.phone || p.email ? 'Editar' : 'Agregar'} contacto
                            </button>
                          )}
                          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 10, alignItems: 'center', fontSize: 12, color: '#8b97a7' }}>
                            {p.projectStatus && <span style={{ color: '#cdd6e0' }}>{estatusMap[p.projectStatus] || p.projectStatus}</span>}
                            {p.progress != null && <span>· {p.progress}% avance</span>}
                            {due && <span>· entrega {due.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                          </span>
                        </div>
                        {cfEditId === p.id && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, padding: '10px 12px', background: '#11161d', border: '1px solid #1c232d', borderRadius: 8 }}>
                            <input
                              value={cfContact.phone}
                              onChange={(e) => setCfContact(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Teléfono (ej. 5215512345678)"
                              style={{ flex: 1, minWidth: 200, fontSize: 12, background: '#0d1117', border: '1px solid #2a323d', borderRadius: 6, padding: '6px 10px', color: '#e6edf5' }}
                            />
                            <input
                              value={cfContact.email}
                              onChange={(e) => setCfContact(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Email (opcional)"
                              style={{ flex: 1, minWidth: 200, fontSize: 12, background: '#0d1117', border: '1px solid #2a323d', borderRadius: 6, padding: '6px 10px', color: '#e6edf5' }}
                            />
                            <button onClick={() => handleSaveContact(p.id)} disabled={cfContactSaving} style={{ fontSize: 12, fontWeight: 600, color: '#0a0e14', background: '#10b981', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: cfContactSaving ? 'wait' : 'pointer', opacity: cfContactSaving ? 0.6 : 1 }}>
                              {cfContactSaving ? 'Guardando…' : 'Guardar'}
                            </button>
                            <button onClick={() => setCfEditId(null)} style={{ fontSize: 12, color: '#8b97a7', background: 'transparent', border: '1px solid #2a323d', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
                              Cancelar
                            </button>
                          </div>
                        )}
                        {p.nota && (
                          <div style={{ fontSize: 12, color: '#cdd6e0', background: '#11161d', border: '1px solid #1c232d', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                            <span style={{ color: '#8b97a7' }}>📝 Última nota:</span> {p.nota}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: '#8b97a7', marginBottom: 8 }}>{p.title} · esquema {p.esquema} — desglose de pagos <span style={{ color: '#5a6675' }}>· click en un cobro para marcarlo pagado/pendiente · 🚫 para cartera perdida</span></div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {[...(p.installments || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((it, i) => {
                            const overdue = it.status === 'pending' && new Date(it.fecha) < today;
                            const isLost = it.status === 'lost';
                            const color = it.status === 'paid' ? '#10b981' : isLost ? '#9ca3af' : overdue ? '#ef4444' : '#f59e0b';
                            const label = it.status === 'paid' ? '✅ Cobrado' : isLost ? '🚫 Perdido' : overdue ? '🔴 Vencido' : '⏳ Por cobrar';
                            const saving = cfSaving === `${p.id}-${it.idx}`;
                            return (
                              <div key={i} style={{ textAlign: 'left', border: `1px solid ${color}55`, background: '#0d1117', borderRadius: 8, padding: '6px 12px', minWidth: 148, opacity: saving ? 0.5 : 1 }}>
                                <div style={{ fontSize: 10, color: '#8b97a7' }}>Pago {i + 1} · {new Date(it.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color }}>{fmt(it.amount)}</div>
                                <div style={{ fontSize: 10, color, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                                  <button onClick={() => handleToggleInstallment(p.id, it.idx, it.status)} disabled={saving || isLost}
                                    title={isLost ? 'Restaura a por cobrar con 🚫 primero' : it.status === 'paid' ? 'Marcar como pendiente' : 'Marcar como pagado'}
                                    style={{ background: 'transparent', border: 'none', color, cursor: saving || isLost ? 'default' : 'pointer', padding: 0, fontSize: 10 }}>
                                    {label} {!isLost && <span style={{ color: '#5a6675', fontSize: 9 }}>{saving ? '…' : it.status === 'paid' ? '↺' : '✓'}</span>}
                                  </button>
                                  <button onClick={() => handleMarkLost(p.id, it.idx, it.status)} disabled={saving || it.status === 'paid'}
                                    title={isLost ? 'Restaurar a por cobrar' : 'Marcar como cartera perdida'}
                                    style={{ background: 'transparent', border: 'none', color: isLost ? '#f59e0b' : '#6b7280', cursor: saving || it.status === 'paid' ? 'default' : 'pointer', padding: 0, fontSize: 11 }}>
                                    {isLost ? '↩︎' : '🚫'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                    );
                  })()}
                  </React.Fragment>
                  );
                })}
                {projRows.length === 0 && (
                  <tr><td colSpan={6 + nCols} style={{ padding: 20, textAlign: 'center', color: '#6b7685' }}>Sin proyectos para mostrar.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, color: '#fff' }}>
                  <td style={{ padding: '9px 10px', position: 'sticky', left: 0, background: '#11161d', borderTop: '2px solid #2a323d' }}>TOTAL ({projRows.length})</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', background: '#11161d', borderTop: '2px solid #2a323d' }}>{fmt(sumCol('total'))}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', color: '#10b981', background: '#11161d', borderTop: '2px solid #2a323d' }}>{fmt(sumCol('cobrado'))}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', color: '#f59e0b', background: '#11161d', borderTop: '2px solid #2a323d' }}>{fmt(sumCol('porCobrar'))}</td>
                  <td style={{ background: '#11161d', borderTop: '2px solid #2a323d' }} />
                  <td style={{ background: '#11161d', borderTop: '2px solid #2a323d' }} />
                  {monthCols.map(mk => (
                    <td key={mk} style={{ padding: '9px 8px', textAlign: 'right', color: colTotal[mk] ? '#cdd6e0' : '#2c333d', background: '#11161d', borderTop: '2px solid #2a323d' }}>{colTotal[mk] ? fmt(colTotal[mk]) : '·'}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </>
    );
  };

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
        <button className={`rev-tab ${activeView === 'cashflow' ? 'active' : ''}`} onClick={() => setActiveView('cashflow')}>
          <FaBalanceScale style={{ marginRight: 4 }} /> Flujo de caja
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

      {activeView === 'cashflow' && renderCashflow()}
      {activeView === 'expenses' && renderExpensesTab()}
      {activeView === 'cost-per-sale' && renderCostPerSale()}
      {activeView === 'campaigns' && renderCampaignsTab()}
      {activeView === 'sync' && renderSyncTab()}
    </div>
  );
};

export default AdminRevenue;
