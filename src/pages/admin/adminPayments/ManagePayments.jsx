import React, { useState, useEffect } from 'react';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
    FaDollarSign, FaChartLine, FaUsers, FaCalendarAlt,
    FaSearch, FaChevronDown, FaChevronUp, FaSync,
    FaGoogle, FaCreditCard, FaMoneyBillWave, FaPercentage,
    FaExclamationTriangle, FaCheckCircle, FaClock, FaFileInvoiceDollar
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
    const [view, setView] = useState('table'); // table, calendar

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

    const { payments = [], summary = {}, monthly = [] } = dashboardData || {};

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

    // Calendar data: build all upcoming installments from all payments
    const allInstallments = [];
    for (const p of filtered) {
        if (p.schedule) {
            for (const inst of p.schedule) {
                allInstallments.push({
                    ...inst,
                    clientName: p.clientName,
                    title: p.title,
                    paymentId: p._id,
                    totalAmount: p.amount,
                    esquema: p.esquema,
                });
            }
        }
    }
    allInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Upcoming installments (next 30 days)
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcoming = allInstallments.filter(inst => {
        const d = new Date(inst.dueDate);
        return d >= now && d <= in30Days;
    });

    return (
        <div className="mp-pay">
            {/* Header */}
            <div className="mp-pay-header">
                <div>
                    <h1 className="mp-pay-title">Pagos e Ingresos</h1>
                    <span className="mp-pay-subtitle">{filtered.length} pagos registrados</span>
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

            {/* Upcoming Installments */}
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

            {/* Filters */}
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

            {/* Payments Table */}
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
                                {/* Expanded: Installment Schedule */}
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

            {/* Monthly Revenue Chart (simple bars) */}
            {monthly.length > 0 && (
                <div className="mp-pay-monthly">
                    <h3><FaChartLine /> Ingresos Mensuales</h3>
                    <div className="mp-pay-bars">
                        {monthly.slice(-6).map((m) => {
                            const maxVal = Math.max(...monthly.slice(-6).map(x => x.ingresos));
                            const pct = maxVal > 0 ? (m.ingresos / maxVal) * 100 : 0;
                            const monthLabel = new Date(m.month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
                            return (
                                <div key={m.month} className="mp-pay-bar-col">
                                    <div className="mp-pay-bar-wrapper">
                                        <div className="mp-pay-bar" style={{ height: `${Math.max(pct, 5)}%` }}>
                                            <span className="mp-pay-bar-val">{formatMoney(m.ingresos)}</span>
                                        </div>
                                    </div>
                                    <span className="mp-pay-bar-label">{monthLabel}</span>
                                    <span className="mp-pay-bar-count">{m.count} ventas</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManagePayments;
