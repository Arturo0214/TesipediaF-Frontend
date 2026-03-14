import React, { useState, useEffect, useMemo } from 'react';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
    FaDollarSign, FaChartLine, FaUsers, FaCalendarAlt,
    FaSearch, FaChevronDown, FaChevronUp, FaSync,
    FaCreditCard, FaMoneyBillWave, FaPercentage,
    FaExclamationTriangle, FaCheckCircle, FaClock, FaFileInvoiceDollar,
    FaChartBar, FaChartArea, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import './ManagePayments.css';

function ManagePayments() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEsquema, setFilterEsquema] = useState('all');
    const [filterSource, setFilterSource] = useState('all');
    const [expandedPayment, setExpandedPayment] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('monthly'); // daily, weekly, monthly
    const [chartType, setChartType] = useState('ingresos'); // ingresos, comisiones

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth.get('/payments/dashboard');
            setDashboardData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar datos de pagos');
        }
        setLoading(false);
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getSourceLabel = (source) => {
        const labels = { stripe: 'Stripe', sofia: 'Sofia', guest: 'Invitado' };
        return labels[source] || source;
    };

    const getSourceIcon = (source) => {
        if (source === 'stripe') return <FaCreditCard />;
        if (source === 'sofia') return <FaFileInvoiceDollar />;
        return <FaUsers />;
    };

    const getEsquemaLabel = (esquema) => {
        const labels = {
            'unico': 'Pago único',
            '50-50': '50% - 50%',
            '33-33-34': '33% - 33% - 34%',
            '6-quincenas': '6 Quincenas',
            '6-msi': '6 MSI'
        };
        return labels[esquema] || esquema;
    };

    const getStatusBadge = (status) => {
        const map = {
            completed: { label: 'Completado', cls: 'mp-pay-badge-success' },
            paid: { label: 'Pagado', cls: 'mp-pay-badge-success' },
            pendiente: { label: 'Pendiente', cls: 'mp-pay-badge-warning' },
            pending: { label: 'Pendiente', cls: 'mp-pay-badge-warning' },
            failed: { label: 'Fallido', cls: 'mp-pay-badge-danger' },
            cancelled: { label: 'Cancelado', cls: 'mp-pay-badge-danger' },
            refunded: { label: 'Reembolsado', cls: 'mp-pay-badge-info' },
        };
        const info = map[status] || { label: status, cls: 'mp-pay-badge-default' };
        return <span className={`mp-pay-badge ${info.cls}`}>{info.label}</span>;
    };

    // Get chart data based on selected period
    const chartData = useMemo(() => {
        if (!dashboardData) return [];
        let data = [];
        if (chartPeriod === 'daily') {
            data = (dashboardData.daily || []).slice(-30);
        } else if (chartPeriod === 'weekly') {
            data = (dashboardData.weekly || []).slice(-12);
        } else {
            data = (dashboardData.monthly || []).slice(-12);
        }
        return data;
    }, [dashboardData, chartPeriod]);

    // Format chart label based on period
    const formatChartLabel = (item) => {
        if (chartPeriod === 'daily') {
            return new Date(item.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        } else if (chartPeriod === 'weekly') {
            const d = new Date(item.week + 'T12:00:00');
            return `Sem ${d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
        } else {
            return new Date(item.month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        }
    };

    const getChartKey = (item) => {
        return item.date || item.week || item.month;
    };

    const getChartValue = (item) => {
        return chartType === 'comisiones' ? item.comisiones : item.ingresos;
    };

    // Compute max for bar scaling
    const chartMax = useMemo(() => {
        if (chartData.length === 0) return 1;
        return Math.max(...chartData.map(d => getChartValue(d)), 1);
    }, [chartData, chartType]);

    // Compute period-over-period change
    const periodChange = useMemo(() => {
        if (chartData.length < 2) return null;
        const current = getChartValue(chartData[chartData.length - 1]);
        const prev = getChartValue(chartData[chartData.length - 2]);
        if (prev === 0) return null;
        return ((current - prev) / prev * 100).toFixed(1);
    }, [chartData, chartType]);

    if (loading) {
        return (
            <div className="mp-pay">
                <div className="mp-pay-loading">
                    <FaSync className="spinning" />
                    <p>Cargando datos de pagos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mp-pay">
                <div className="mp-pay-error">
                    <FaExclamationTriangle />
                    <p>{error}</p>
                    <button onClick={fetchDashboard}>Reintentar</button>
                </div>
            </div>
        );
    }

    const { payments = [], summary = {} } = dashboardData || {};

    // Filters
    const filtered = payments.filter((p) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term ||
            p.clientName?.toLowerCase().includes(term) ||
            p.clientEmail?.toLowerCase().includes(term) ||
            p.title?.toLowerCase().includes(term);
        const matchesEsquema = filterEsquema === 'all' || p.esquema === filterEsquema;
        const matchesSource = filterSource === 'all' || p.source === filterSource;
        return matchesSearch && matchesEsquema && matchesSource;
    });

    // Upcoming installments from all filtered payments (next 30 days)
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const allInstallments = [];
    for (const p of filtered) {
        if (p.schedule) {
            for (const inst of p.schedule) {
                allInstallments.push({
                    ...inst,
                    clientName: p.clientName,
                    title: p.title,
                    esquema: p.esquema,
                });
            }
        }
    }
    allInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const upcoming = allInstallments.filter(inst => {
        const d = new Date(inst.dueDate);
        return d >= now && d <= in30Days;
    });

    // Compute source breakdown for mini summary
    const sourceBreakdown = payments.reduce((acc, p) => {
        if (!acc[p.source]) acc[p.source] = { count: 0, amount: 0 };
        acc[p.source].count += 1;
        acc[p.source].amount += p.amount;
        return acc;
    }, {});

    return (
        <div className="mp-pay">
            {/* Header */}
            <div className="mp-pay-header">
                <div>
                    <h1 className="mp-pay-title">Pagos e Ingresos</h1>
                    <span className="mp-pay-subtitle">Dashboard financiero — {filtered.length} pagos registrados</span>
                </div>
                <button className="mp-pay-refresh" onClick={fetchDashboard}>
                    <FaSync /> Actualizar
                </button>
            </div>

            {/* Summary Cards */}
            <div className="mp-pay-summary">
                <div className="mp-pay-card mp-pay-card-green">
                    <div className="mp-pay-card-icon"><FaDollarSign /></div>
                    <div>
                        <p className="mp-pay-card-label">Ingresos Totales</p>
                        <h2 className="mp-pay-card-value">{formatMoney(summary.totalIngresos)}</h2>
                    </div>
                </div>
                <div className="mp-pay-card mp-pay-card-orange">
                    <div className="mp-pay-card-icon"><FaPercentage /></div>
                    <div>
                        <p className="mp-pay-card-label">Comisión Ventas (15%)</p>
                        <h2 className="mp-pay-card-value">{formatMoney(summary.totalComisiones)}</h2>
                    </div>
                </div>
                <div className="mp-pay-card mp-pay-card-blue">
                    <div className="mp-pay-card-icon"><FaChartLine /></div>
                    <div>
                        <p className="mp-pay-card-label">Neto Empresa</p>
                        <h2 className="mp-pay-card-value">{formatMoney(summary.netoEmpresa)}</h2>
                    </div>
                </div>
                <div className="mp-pay-card mp-pay-card-purple">
                    <div className="mp-pay-card-icon"><FaUsers /></div>
                    <div>
                        <p className="mp-pay-card-label">Total Ventas</p>
                        <h2 className="mp-pay-card-value">{summary.totalPagos}</h2>
                    </div>
                </div>
            </div>

            {/* ===== CHARTS SECTION ===== */}
            <div className="mp-pay-charts-section">
                {/* Revenue Chart — with period selector */}
                <div className="mp-pay-chart-card mp-pay-chart-main">
                    <div className="mp-pay-chart-header">
                        <div className="mp-pay-chart-title-group">
                            <h3><FaChartBar /> {chartType === 'comisiones' ? 'Comisiones por Ventas' : 'Ingresos Totales'}</h3>
                            {periodChange !== null && (
                                <span className={`mp-pay-trend ${parseFloat(periodChange) >= 0 ? 'up' : 'down'}`}>
                                    {parseFloat(periodChange) >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                                    {Math.abs(parseFloat(periodChange))}%
                                </span>
                            )}
                        </div>
                        <div className="mp-pay-chart-controls">
                            <div className="mp-pay-toggle-group">
                                <button
                                    className={chartType === 'ingresos' ? 'active' : ''}
                                    onClick={() => setChartType('ingresos')}
                                >
                                    Ingresos
                                </button>
                                <button
                                    className={chartType === 'comisiones' ? 'active' : ''}
                                    onClick={() => setChartType('comisiones')}
                                >
                                    Comisiones
                                </button>
                            </div>
                            <div className="mp-pay-toggle-group">
                                <button
                                    className={chartPeriod === 'daily' ? 'active' : ''}
                                    onClick={() => setChartPeriod('daily')}
                                >
                                    Diario
                                </button>
                                <button
                                    className={chartPeriod === 'weekly' ? 'active' : ''}
                                    onClick={() => setChartPeriod('weekly')}
                                >
                                    Semanal
                                </button>
                                <button
                                    className={chartPeriod === 'monthly' ? 'active' : ''}
                                    onClick={() => setChartPeriod('monthly')}
                                >
                                    Mensual
                                </button>
                            </div>
                        </div>
                    </div>

                    {chartData.length > 0 ? (
                        <div className="mp-pay-chart-area">
                            {/* Y-axis labels */}
                            <div className="mp-pay-chart-yaxis">
                                <span>{formatMoney(chartMax)}</span>
                                <span>{formatMoney(chartMax * 0.5)}</span>
                                <span>$0</span>
                            </div>
                            <div className="mp-pay-chart-bars-area">
                                {/* Grid lines */}
                                <div className="mp-pay-chart-gridlines">
                                    <div className="mp-pay-gridline" />
                                    <div className="mp-pay-gridline" />
                                    <div className="mp-pay-gridline" />
                                </div>
                                {/* Bars */}
                                <div className="mp-pay-chart-bars">
                                    {chartData.map((item) => {
                                        const value = getChartValue(item);
                                        const pct = chartMax > 0 ? (value / chartMax) * 100 : 0;
                                        const isComisiones = chartType === 'comisiones';
                                        return (
                                            <div key={getChartKey(item)} className="mp-pay-chart-bar-col">
                                                <div className="mp-pay-chart-bar-wrapper">
                                                    <div
                                                        className={`mp-pay-chart-bar ${isComisiones ? 'comision' : 'ingreso'}`}
                                                        style={{ height: `${Math.max(pct, 3)}%` }}
                                                    >
                                                        <span className="mp-pay-chart-bar-tooltip">
                                                            {formatMoney(value)}
                                                            <br />{item.count} venta{item.count !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="mp-pay-chart-bar-label">{formatChartLabel(item)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mp-pay-chart-empty">
                            <FaChartArea />
                            <p>No hay datos para este periodo</p>
                        </div>
                    )}
                </div>

                {/* Source breakdown mini chart */}
                <div className="mp-pay-chart-card mp-pay-chart-side">
                    <h3><FaFileInvoiceDollar /> Desglose por Fuente</h3>
                    <div className="mp-pay-source-breakdown">
                        {Object.entries(sourceBreakdown).map(([source, data]) => {
                            const pct = summary.totalIngresos > 0 ? (data.amount / summary.totalIngresos * 100) : 0;
                            return (
                                <div key={source} className="mp-pay-source-row">
                                    <div className="mp-pay-source-label">
                                        {getSourceIcon(source)}
                                        <span>{getSourceLabel(source)}</span>
                                    </div>
                                    <div className="mp-pay-source-bar-track">
                                        <div
                                            className={`mp-pay-source-bar-fill source-${source}`}
                                            style={{ width: `${Math.max(pct, 2)}%` }}
                                        />
                                    </div>
                                    <div className="mp-pay-source-values">
                                        <strong>{formatMoney(data.amount)}</strong>
                                        <span>{data.count} venta{data.count !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(sourceBreakdown).length === 0 && (
                            <p className="mp-pay-no-data">Sin datos aún</p>
                        )}
                    </div>

                    {/* Comisión vs Neto donut-style visual */}
                    <div className="mp-pay-split-visual">
                        <h4>Distribución de Ingresos</h4>
                        <div className="mp-pay-split-bars">
                            <div className="mp-pay-split-item">
                                <div className="mp-pay-split-color neto" />
                                <div>
                                    <span className="mp-pay-split-label">Neto Empresa (85%)</span>
                                    <strong>{formatMoney(summary.netoEmpresa)}</strong>
                                </div>
                            </div>
                            <div className="mp-pay-split-item">
                                <div className="mp-pay-split-color comision" />
                                <div>
                                    <span className="mp-pay-split-label">Comisión Ventas (15%)</span>
                                    <strong>{formatMoney(summary.totalComisiones)}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="mp-pay-split-bar-track">
                            <div className="mp-pay-split-bar-neto" style={{
                                width: summary.totalIngresos > 0 ? `${(summary.netoEmpresa / summary.totalIngresos * 100)}%` : '85%'
                            }} />
                            <div className="mp-pay-split-bar-comision" style={{
                                width: summary.totalIngresos > 0 ? `${(summary.totalComisiones / summary.totalIngresos * 100)}%` : '15%'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== UPCOMING INSTALLMENTS ===== */}
            {upcoming.length > 0 && (
                <div className="mp-pay-upcoming">
                    <h3><FaClock /> Próximos pagos (30 días)</h3>
                    <div className="mp-pay-upcoming-list">
                        {upcoming.slice(0, 5).map((inst, idx) => (
                            <div key={idx} className="mp-pay-upcoming-item">
                                <div className="mp-pay-upcoming-date">{formatDate(inst.dueDate)}</div>
                                <div className="mp-pay-upcoming-info">
                                    <strong>{inst.clientName}</strong>
                                    <span>{inst.label} — {inst.title}</span>
                                </div>
                                <div className="mp-pay-upcoming-amount">{formatMoney(inst.amount)}</div>
                            </div>
                        ))}
                        {upcoming.length > 5 && (
                            <p className="mp-pay-upcoming-more">+{upcoming.length - 5} pagos más</p>
                        )}
                    </div>
                </div>
            )}

            {/* ===== PAYMENTS TABLE ===== */}
            <div className="mp-pay-table-section">
                <div className="mp-pay-table-header">
                    <h3><FaMoneyBillWave /> Registro de Pagos</h3>
                </div>
                <div className="mp-pay-filters">
                    <div className="mp-pay-search">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select value={filterEsquema} onChange={(e) => setFilterEsquema(e.target.value)}>
                        <option value="all">Todos los esquemas</option>
                        <option value="unico">Pago único</option>
                        <option value="50-50">50% - 50%</option>
                        <option value="33-33-34">33% - 33% - 34%</option>
                        <option value="6-quincenas">6 Quincenas</option>
                        <option value="6-msi">6 MSI</option>
                    </select>
                    <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                        <option value="all">Todas las fuentes</option>
                        <option value="stripe">Stripe/PayPal</option>
                        <option value="sofia">Cotizaciones Sofia</option>
                        <option value="guest">Pagos Invitados</option>
                    </select>
                </div>

                <div className="mp-pay-table-container">
                    <table className="mp-pay-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Proyecto</th>
                                <th>Monto Total</th>
                                <th>Esquema</th>
                                <th>Comisión (15%)</th>
                                <th>Fuente</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((payment) => (
                                <React.Fragment key={payment._id}>
                                    <tr
                                        className={`mp-pay-row ${expandedPayment === payment._id ? 'expanded' : ''}`}
                                        onClick={() => setExpandedPayment(expandedPayment === payment._id ? null : payment._id)}
                                    >
                                        <td>
                                            <div className="mp-pay-client">
                                                <strong>{payment.clientName}</strong>
                                                {payment.clientEmail && <small>{payment.clientEmail}</small>}
                                            </div>
                                        </td>
                                        <td className="mp-pay-title-cell">{payment.title}</td>
                                        <td className="mp-pay-amount">{formatMoney(payment.amount)}</td>
                                        <td><span className="mp-pay-esquema-badge">{getEsquemaLabel(payment.esquema)}</span></td>
                                        <td className="mp-pay-commission">{formatMoney(payment.commission)}</td>
                                        <td>
                                            <span className="mp-pay-source-badge">
                                                {getSourceIcon(payment.source)} {getSourceLabel(payment.source)}
                                            </span>
                                        </td>
                                        <td>{getStatusBadge(payment.status)}</td>
                                        <td>{formatDate(payment.date)}</td>
                                        <td>
                                            {payment.schedule?.length > 1 && (
                                                expandedPayment === payment._id
                                                    ? <FaChevronUp className="mp-pay-expand-icon" />
                                                    : <FaChevronDown className="mp-pay-expand-icon" />
                                            )}
                                        </td>
                                    </tr>
                                    {expandedPayment === payment._id && payment.schedule?.length > 1 && (
                                        <tr className="mp-pay-schedule-row">
                                            <td colSpan="9">
                                                <div className="mp-pay-schedule">
                                                    <h4>Calendario de Pagos — {getEsquemaLabel(payment.esquema)}</h4>
                                                    <div className="mp-pay-schedule-grid">
                                                        {payment.schedule.map((inst, idx) => {
                                                            const isPast = new Date(inst.dueDate) < now;
                                                            return (
                                                                <div key={idx} className={`mp-pay-installment ${isPast ? 'past' : 'upcoming'}`}>
                                                                    <div className="mp-pay-inst-icon">
                                                                        {isPast ? <FaCheckCircle /> : <FaClock />}
                                                                    </div>
                                                                    <div className="mp-pay-inst-info">
                                                                        <strong>{inst.label}</strong>
                                                                        <span>{formatDate(inst.dueDate)}</span>
                                                                    </div>
                                                                    <div className="mp-pay-inst-amount">{formatMoney(inst.amount)}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {payment.esquemaRaw && (
                                                        <p className="mp-pay-esquema-raw">Esquema original: {payment.esquemaRaw}</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="mp-pay-empty">
                                        No se encontraron pagos con los filtros aplicados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ManagePayments;
