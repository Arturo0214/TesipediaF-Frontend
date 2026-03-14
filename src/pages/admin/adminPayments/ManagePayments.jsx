import React, { useState, useEffect, useMemo } from 'react';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
    FaDollarSign, FaChartLine, FaUsers, FaCalendarAlt,
    FaSearch, FaChevronDown, FaChevronUp, FaSync, FaPlus, FaTimes,
    FaCreditCard, FaMoneyBillWave, FaPercentage,
    FaExclamationTriangle, FaCheckCircle, FaClock, FaFileInvoiceDollar,
    FaChartBar, FaArrowUp, FaArrowDown, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ManagePayments.css';

const ITEMS_PER_PAGE = 10;

function ManagePayments() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEsquema, setFilterEsquema] = useState('all');
    const [filterSource, setFilterSource] = useState('all');
    const [expandedPayment, setExpandedPayment] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('monthly');
    const [currentPage, setCurrentPage] = useState(1);
    const [calMonth, setCalMonth] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingPayment, setAddingPayment] = useState(false);
    const [newPayment, setNewPayment] = useState({
        clientName: '', clientEmail: '', title: '',
        amount: '', method: 'transferencia', esquemaPago: 'Pago único', notes: ''
    });

    useEffect(() => { fetchDashboard(); }, []);

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

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!newPayment.clientName || !newPayment.amount || !newPayment.title) {
            toast.error('Completa los campos obligatorios');
            return;
        }
        setAddingPayment(true);
        try {
            await axiosWithAuth.post('/payments/manual', newPayment);
            toast.success('Pago registrado correctamente');
            setShowAddModal(false);
            setNewPayment({ clientName: '', clientEmail: '', title: '', amount: '', method: 'transferencia', esquemaPago: 'Pago único', notes: '' });
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al registrar pago');
        }
        setAddingPayment(false);
    };

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getSourceLabel = (source) => ({ stripe: 'Stripe', sofia: 'Sofia', guest: 'Invitado', manual: 'Manual' }[source] || source);
    const getSourceIcon = (source) => {
        if (source === 'stripe') return <FaCreditCard />;
        if (source === 'sofia') return <FaFileInvoiceDollar />;
        if (source === 'manual') return <FaMoneyBillWave />;
        return <FaUsers />;
    };
    const getEsquemaLabel = (esquema) => ({
        'unico': 'Pago único', '50-50': '50% - 50%', '33-33-34': '33-33-34%',
        '6-quincenas': '6 Quincenas', '6-msi': '6 MSI'
    }[esquema] || esquema);

    const getStatusBadge = (status) => {
        const map = {
            completed: { label: 'Completado', cls: 'success' },
            paid: { label: 'Pagado', cls: 'success' },
            pending: { label: 'Pendiente', cls: 'warning' },
            failed: { label: 'Fallido', cls: 'danger' },
            cancelled: { label: 'Cancelado', cls: 'danger' },
            refunded: { label: 'Reembolsado', cls: 'info' },
        };
        const info = map[status] || { label: status, cls: 'default' };
        return <span className={`mp-pay-badge mp-pay-badge-${info.cls}`}>{info.label}</span>;
    };

    // Chart data
    const chartData = useMemo(() => {
        if (!dashboardData) return [];
        if (chartPeriod === 'daily') return (dashboardData.daily || []).slice(-30);
        if (chartPeriod === 'weekly') return (dashboardData.weekly || []).slice(-12);
        return (dashboardData.monthly || []).slice(-12);
    }, [dashboardData, chartPeriod]);

    const formatChartLabel = (item) => {
        if (chartPeriod === 'daily') return new Date(item.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        if (chartPeriod === 'weekly') return `Sem ${new Date(item.week + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
        return new Date(item.month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    };

    const getChartKey = (item) => item.date || item.week || item.month;
    const ingresosMax = useMemo(() => Math.max(...chartData.map(d => d.ingresos || 0), 1), [chartData]);
    const comisionesMax = useMemo(() => Math.max(...chartData.map(d => d.comisiones || 0), 1), [chartData]);

    if (loading) {
        return (
            <div className="mp-pay">
                <div className="mp-pay-loading"><FaSync className="spinning" /><p>Cargando datos de pagos...</p></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="mp-pay">
                <div className="mp-pay-error"><FaExclamationTriangle /><p>{error}</p><button onClick={fetchDashboard}>Reintentar</button></div>
            </div>
        );
    }

    const { payments = [], summary = {} } = dashboardData || {};

    // Filters
    const filtered = payments.filter((p) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term || p.clientName?.toLowerCase().includes(term) || p.clientEmail?.toLowerCase().includes(term) || p.title?.toLowerCase().includes(term);
        const matchesEsquema = filterEsquema === 'all' || p.esquema === filterEsquema;
        const matchesSource = filterSource === 'all' || p.source === filterSource;
        return matchesSearch && matchesEsquema && matchesSource;
    });

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedPayments = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Upcoming installments
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const allInstallments = [];
    for (const p of filtered) {
        if (p.schedule) {
            for (const inst of p.schedule) {
                allInstallments.push({ ...inst, clientName: p.clientName, title: p.title, esquema: p.esquema });
            }
        }
    }
    allInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
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
                <div className="mp-pay-header-actions">
                    <button className="mp-pay-add-btn" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> Registrar Pago
                    </button>
                    <button className="mp-pay-refresh" onClick={fetchDashboard}>
                        <FaSync /> Actualizar
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mp-pay-summary">
                <div className="mp-pay-card mp-pay-card-green">
                    <div className="mp-pay-card-icon"><FaDollarSign /></div>
                    <div><p className="mp-pay-card-label">Ingresos Totales</p><h2 className="mp-pay-card-value">{formatMoney(summary.totalIngresos)}</h2></div>
                </div>
                <div className="mp-pay-card mp-pay-card-orange">
                    <div className="mp-pay-card-icon"><FaPercentage /></div>
                    <div><p className="mp-pay-card-label">Comisión Ventas (15%)</p><h2 className="mp-pay-card-value">{formatMoney(summary.totalComisiones)}</h2></div>
                </div>
                <div className="mp-pay-card mp-pay-card-blue">
                    <div className="mp-pay-card-icon"><FaChartLine /></div>
                    <div><p className="mp-pay-card-label">Neto Empresa</p><h2 className="mp-pay-card-value">{formatMoney(summary.netoEmpresa)}</h2></div>
                </div>
                <div className="mp-pay-card mp-pay-card-purple">
                    <div className="mp-pay-card-icon"><FaUsers /></div>
                    <div><p className="mp-pay-card-label">Total Ventas</p><h2 className="mp-pay-card-value">{summary.totalPagos}</h2></div>
                </div>
            </div>

            {/* ===== CHARTS — Two side by side ===== */}
            <div className="mp-pay-charts-row">
                {/* Ingresos Chart */}
                <div className="mp-pay-chart-card">
                    <div className="mp-pay-chart-header">
                        <h3><FaChartBar /> Ingresos Totales</h3>
                        <div className="mp-pay-toggle-group">
                            {['daily', 'weekly', 'monthly'].map(p => (
                                <button key={p} className={chartPeriod === p ? 'active' : ''} onClick={() => setChartPeriod(p)}>
                                    {p === 'daily' ? 'Diario' : p === 'weekly' ? 'Semanal' : 'Mensual'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {chartData.length > 0 ? (
                        <div className="mp-pay-chart-bars">
                            {chartData.map((item) => {
                                const pct = ingresosMax > 0 ? (item.ingresos / ingresosMax) * 100 : 0;
                                return (
                                    <div key={getChartKey(item)} className="mp-pay-bar-col">
                                        <div className="mp-pay-bar-wrapper">
                                            <div className="mp-pay-bar ingreso" style={{ height: `${Math.max(pct, 4)}%` }}>
                                                <span className="mp-pay-bar-tooltip">{formatMoney(item.ingresos)}<br />{item.count} venta{item.count !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <span className="mp-pay-bar-label">{formatChartLabel(item)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mp-pay-chart-empty"><p>Sin datos</p></div>
                    )}
                </div>

                {/* Comisiones Chart */}
                <div className="mp-pay-chart-card">
                    <div className="mp-pay-chart-header">
                        <h3><FaPercentage /> Comisiones por Ventas</h3>
                    </div>
                    {chartData.length > 0 ? (
                        <div className="mp-pay-chart-bars">
                            {chartData.map((item) => {
                                const pct = comisionesMax > 0 ? (item.comisiones / comisionesMax) * 100 : 0;
                                return (
                                    <div key={getChartKey(item)} className="mp-pay-bar-col">
                                        <div className="mp-pay-bar-wrapper">
                                            <div className="mp-pay-bar comision" style={{ height: `${Math.max(pct, 4)}%` }}>
                                                <span className="mp-pay-bar-tooltip">{formatMoney(item.comisiones)}<br />{item.count} venta{item.count !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <span className="mp-pay-bar-label">{formatChartLabel(item)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mp-pay-chart-empty"><p>Sin datos</p></div>
                    )}
                </div>
            </div>

            {/* ===== PAYMENT CALENDAR ===== */}
            {(() => {
                const year = calMonth.getFullYear();
                const month = calMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startingDow = firstDay.getDay();

                const calDays = [];
                for (let i = 0; i < startingDow; i++) calDays.push(null);
                for (let i = 1; i <= daysInMonth; i++) calDays.push(new Date(year, month, i));

                const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

                return (
                    <div className="mp-pay-calendar-section">
                        <div className="mp-pay-cal-header">
                            <h3><FaCalendarAlt /> Calendario de Pagos</h3>
                            <div className="mp-pay-cal-nav">
                                <button onClick={() => setCalMonth(new Date(year, month - 1))}><FaChevronLeft /></button>
                                <span className="mp-pay-cal-month">
                                    {calMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                </span>
                                <button onClick={() => setCalMonth(new Date(year, month + 1))}><FaChevronRight /></button>
                            </div>
                        </div>
                        <div className="mp-pay-cal-grid">
                            {dayLabels.map(d => (
                                <div key={d} className="mp-pay-cal-day-header">{d}</div>
                            ))}
                            {calDays.map((day, idx) => {
                                const isToday = day && day.toDateString() === new Date().toDateString();
                                const installmentsOnDay = day ? allInstallments.filter(inst =>
                                    inst.dueDate && new Date(inst.dueDate).toDateString() === day.toDateString()
                                ) : [];
                                const paymentsOnDay = day ? payments.filter(p =>
                                    p.date && new Date(p.date).toDateString() === day.toDateString()
                                ) : [];
                                const dayTotal = [...installmentsOnDay.map(i => i.amount), ...paymentsOnDay.filter(p => !installmentsOnDay.length).map(p => p.amount)]
                                    .reduce((s, a) => s + (a || 0), 0);

                                return (
                                    <div key={idx} className={`mp-pay-cal-day ${isToday ? 'today' : ''} ${!day ? 'empty' : ''}`}>
                                        {day && <span className="mp-pay-cal-day-num">{day.getDate()}</span>}
                                        <div className="mp-pay-cal-events">
                                            {installmentsOnDay.slice(0, 3).map((inst, i) => (
                                                <div key={i} className="mp-pay-cal-chip installment">
                                                    <strong>{inst.clientName?.split(' ')[0]}</strong>
                                                    <span>{formatMoney(inst.amount)}</span>
                                                </div>
                                            ))}
                                            {paymentsOnDay.length > 0 && installmentsOnDay.length === 0 && paymentsOnDay.slice(0, 3).map((p, i) => (
                                                <div key={i} className={`mp-pay-cal-chip source-${p.source}`}>
                                                    <strong>{p.clientName?.split(' ')[0]}</strong>
                                                    <span>{formatMoney(p.amount)}</span>
                                                </div>
                                            ))}
                                            {(installmentsOnDay.length > 3 || (installmentsOnDay.length === 0 && paymentsOnDay.length > 3)) && (
                                                <div className="mp-pay-cal-more">
                                                    +{Math.max(installmentsOnDay.length, paymentsOnDay.length) - 3} más
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

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
                        {upcoming.length > 5 && <p className="mp-pay-upcoming-more">+{upcoming.length - 5} pagos más</p>}
                    </div>
                </div>
            )}

            {/* ===== PAYMENTS TABLE ===== */}
            <div className="mp-pay-table-section">
                <div className="mp-pay-table-top">
                    <h3><FaMoneyBillWave /> Registro de Pagos</h3>
                </div>
                <div className="mp-pay-filters">
                    <div className="mp-pay-search">
                        <FaSearch />
                        <input type="text" placeholder="Buscar por cliente o título..." value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <select value={filterEsquema} onChange={(e) => { setFilterEsquema(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Todos los esquemas</option>
                        <option value="unico">Pago único</option>
                        <option value="50-50">50% - 50%</option>
                        <option value="33-33-34">33-33-34%</option>
                        <option value="6-quincenas">6 Quincenas</option>
                        <option value="6-msi">6 MSI</option>
                    </select>
                    <select value={filterSource} onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1); }}>
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
                                <th>Monto</th>
                                <th>Esquema</th>
                                <th>Comisión</th>
                                <th>Fuente</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayments.map((payment) => (
                                <React.Fragment key={payment._id}>
                                    <tr className={`mp-pay-row ${expandedPayment === payment._id ? 'expanded' : ''}`}
                                        onClick={() => setExpandedPayment(expandedPayment === payment._id ? null : payment._id)}>
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
                                        <td><span className="mp-pay-source-badge">{getSourceIcon(payment.source)} {getSourceLabel(payment.source)}</span></td>
                                        <td>{getStatusBadge(payment.status)}</td>
                                        <td>{formatDate(payment.date)}</td>
                                        <td>
                                            {payment.schedule?.length > 1 && (
                                                expandedPayment === payment._id ? <FaChevronUp className="mp-pay-expand-icon" /> : <FaChevronDown className="mp-pay-expand-icon" />
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
                                                                    <div className="mp-pay-inst-icon">{isPast ? <FaCheckCircle /> : <FaClock />}</div>
                                                                    <div className="mp-pay-inst-info">
                                                                        <strong>{inst.label}</strong>
                                                                        <span>{formatDate(inst.dueDate)}</span>
                                                                    </div>
                                                                    <div className="mp-pay-inst-amount">{formatMoney(inst.amount)}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan="9" className="mp-pay-empty">No se encontraron pagos</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mp-pay-pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft /></button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight /></button>
                    </div>
                )}
            </div>

            {/* ===== ADD PAYMENT MODAL ===== */}
            {showAddModal && (
                <div className="mp-pay-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="mp-pay-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mp-pay-modal-header">
                            <h2>Registrar Pago Manual</h2>
                            <button className="mp-pay-modal-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddPayment}>
                            <div className="mp-pay-modal-body">
                                <div className="mp-pay-form-grid">
                                    <div className="mp-pay-form-group">
                                        <label>Nombre del Cliente *</label>
                                        <input type="text" value={newPayment.clientName} onChange={(e) => setNewPayment({ ...newPayment, clientName: e.target.value })} required />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Email del Cliente</label>
                                        <input type="email" value={newPayment.clientEmail} onChange={(e) => setNewPayment({ ...newPayment, clientEmail: e.target.value })} />
                                    </div>
                                    <div className="mp-pay-form-group mp-pay-form-full">
                                        <label>Título del Proyecto *</label>
                                        <input type="text" value={newPayment.title} onChange={(e) => setNewPayment({ ...newPayment, title: e.target.value })} required />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Monto (MXN) *</label>
                                        <input type="number" min="0" step="0.01" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} required />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Método de Pago</label>
                                        <select value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}>
                                            <option value="transferencia">Transferencia</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="stripe">Stripe</option>
                                            <option value="paypal">PayPal</option>
                                        </select>
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Esquema de Pago</label>
                                        <select value={newPayment.esquemaPago} onChange={(e) => setNewPayment({ ...newPayment, esquemaPago: e.target.value })}>
                                            <option value="Pago único">Pago único</option>
                                            <option value="50-50">50% - 50%</option>
                                            <option value="33-33-34">33% - 33% - 34%</option>
                                            <option value="6 quincenas">6 Quincenas</option>
                                            <option value="6 MSI">6 MSI</option>
                                        </select>
                                    </div>
                                    <div className="mp-pay-form-group mp-pay-form-full">
                                        <label>Notas</label>
                                        <textarea rows="2" value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} placeholder="Notas adicionales..." />
                                    </div>
                                </div>
                            </div>
                            <div className="mp-pay-modal-footer">
                                <button type="button" className="mp-pay-btn-cancel" onClick={() => setShowAddModal(false)}>Cancelar</button>
                                <button type="submit" className="mp-pay-btn-save" disabled={addingPayment}>
                                    {addingPayment ? <><FaSync className="spinning" /> Guardando...</> : 'Guardar Pago'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManagePayments;
