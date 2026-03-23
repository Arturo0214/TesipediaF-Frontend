import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
    FaDollarSign, FaChartLine, FaUsers, FaCalendarAlt,
    FaSearch, FaChevronDown, FaChevronUp, FaSync, FaPlus, FaTimes,
    FaCreditCard, FaMoneyBillWave, FaPercentage, FaTrash,
    FaExclamationTriangle, FaCheckCircle, FaClock, FaFileInvoiceDollar,
    FaChartBar, FaArrowUp, FaArrowDown, FaChevronLeft, FaChevronRight,
    FaProjectDiagram
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ManagePayments.css';

const ITEMS_PER_PAGE = 10;

function ManagePayments() {
    const { isSuperAdmin, user } = useSelector((state) => state.auth || {});
    const currentUserName = (user?.name || '').toLowerCase().trim();
    const [view, setView] = useState('dashboard');
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
        clientName: '', clientEmail: '', clientPhone: '', title: '',
        amount: '', method: 'transferencia', esquemaPago: 'Pago único',
        paymentDate: new Date().toISOString().slice(0, 10), notes: '',
        dueDate: '', taskType: '', vendedor: currentUserName || 'arturo',
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
            const res = await axiosWithAuth.post('/payments/manual', newPayment);
            const msgs = ['Pago registrado'];
            if (res.data?.project) msgs.push('+ proyecto creado');
            if (res.data?.clientCreated) msgs.push('+ cuenta de cliente creada');
            toast.success(msgs.join(' '));
            setShowAddModal(false);
            setNewPayment({ clientName: '', clientEmail: '', clientPhone: '', title: '', amount: '', method: 'transferencia', esquemaPago: 'Pago único', paymentDate: new Date().toISOString().slice(0, 10), notes: '', dueDate: '', taskType: '' });
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al registrar pago');
        }
        setAddingPayment(false);
    };

    const [confirmDelete, setConfirmDelete] = useState(null); // { _id, source, clientName }
    const [deleting, setDeleting] = useState(false);
    const [editingVendedor, setEditingVendedor] = useState(null); // payment _id being edited
    const [savingVendedor, setSavingVendedor] = useState(false);
    const [creatingProject, setCreatingProject] = useState(null); // payment _id being processed

    const handleAssignVendedor = async (payment, newVendedor) => {
        setSavingVendedor(true);
        try {
            await axiosWithAuth.put(`/payments/dashboard/${payment._id}/vendedor?source=${payment.source}`, { vendedor: newVendedor });
            toast.success(`Vendedor asignado: ${newVendedor || 'Sin asignar'}`);
            setEditingVendedor(null);
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al asignar vendedor');
        }
        setSavingVendedor(false);
    };

    const handleCreateProject = async (payment) => {
        setCreatingProject(payment._id);
        try {
            const res = await axiosWithAuth.post(
                `/payments/dashboard/${payment._id}/create-project?source=${payment.source}`,
                { taskType: 'Tesis' }
            );
            toast.success(res.data?.message || 'Proyecto creado');
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al crear proyecto');
        }
        setCreatingProject(null);
    };

    const handleDeletePayment = async (payment) => {
        setDeleting(true);
        try {
            await axiosWithAuth.delete(`/payments/dashboard/${payment._id}?source=${payment.source}`);
            toast.success('Pago eliminado');
            setConfirmDelete(null);
            setExpandedPayment(null);
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar pago');
        }
        setDeleting(false);
    };

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getSourceLabel = (source) => ({ stripe: 'Stripe', sofia: 'Sofia', guest: 'Invitado', manual: 'Manual', mercadolibre: 'Mercado Libre' }[source] || source);
    const getSourceIcon = (source) => {
        if (source === 'stripe') return <FaCreditCard />;
        if (source === 'sofia') return <FaFileInvoiceDollar />;
        if (source === 'manual') return <FaMoneyBillWave />;
        if (source === 'mercadolibre') return <FaCreditCard />;
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

            {/* Summary Cards — owner sees everything, others see only their own */}
            {(() => {
                const isOwner = isSuperAdmin || currentUserName === 'arturo';
                if (isOwner) {
                    return (
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
                    );
                }
                // Non-owner: show only their own sales stats
                const myPayments = payments.filter(p => (p.vendedor || p.atendidoPor || '').toLowerCase() === currentUserName);
                const myTotal = myPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const myCommission = myPayments.reduce((sum, p) => sum + (p.commission || 0), 0);
                return (
                    <div className="mp-pay-summary">
                        <div className="mp-pay-card mp-pay-card-green">
                            <div className="mp-pay-card-icon"><FaDollarSign /></div>
                            <div><p className="mp-pay-card-label">Mis Ventas Totales</p><h2 className="mp-pay-card-value">{formatMoney(myTotal)}</h2></div>
                        </div>
                        <div className="mp-pay-card mp-pay-card-orange">
                            <div className="mp-pay-card-icon"><FaPercentage /></div>
                            <div><p className="mp-pay-card-label">Mi Comisión (15%)</p><h2 className="mp-pay-card-value">{formatMoney(myCommission)}</h2></div>
                        </div>
                        <div className="mp-pay-card mp-pay-card-purple">
                            <div className="mp-pay-card-icon"><FaUsers /></div>
                            <div><p className="mp-pay-card-label">Mis Ventas</p><h2 className="mp-pay-card-value">{myPayments.length}</h2></div>
                        </div>
                    </div>
                );
            })()}

            {/* ===== GANANCIAS POR VENDEDOR ===== */}
            {(() => {
                const salesByVendor = {};
                for (const p of payments) {
                    const vendedor = (p.vendedor || p.atendidoPor || 'sin_asignar').toLowerCase().trim();
                    if (!salesByVendor[vendedor]) salesByVendor[vendedor] = { count: 0, total: 0, commission: 0, payments: [] };
                    salesByVendor[vendedor].count++;
                    salesByVendor[vendedor].total += (p.amount || 0);
                    salesByVendor[vendedor].commission += (p.commission || 0);
                    salesByVendor[vendedor].payments.push(p);
                }

                const vendorNames = { arturo: 'Arturo Suárez', sandy: 'Sandy Alvarado', hugo: 'Hugo Serrano' };
                const vendorColors = { arturo: '#2563eb', sandy: '#d946ef', hugo: '#f59e0b', sin_asignar: '#6b7280' };
                const vendorEmojis = { arturo: '👔', sandy: '💜', hugo: '🧡', sin_asignar: '❓' };
                const isOwner = isSuperAdmin || currentUserName === 'arturo';
                const totalGlobal = payments.reduce((s, p) => s + (p.amount || 0), 0);

                const handleBulkAssign = async (vendorPayments, newVendedor) => {
                    setSavingVendedor(true);
                    let ok = 0, fail = 0;
                    for (const p of vendorPayments) {
                        try {
                            await axiosWithAuth.put(`/payments/dashboard/${p._id}/vendedor?source=${p.source}`, { vendedor: newVendedor });
                            ok++;
                        } catch { fail++; }
                    }
                    if (ok > 0) toast.success(`${ok} pago${ok > 1 ? 's' : ''} asignado${ok > 1 ? 's' : ''} a ${vendorNames[newVendedor] || newVendedor}`);
                    if (fail > 0) toast.error(`${fail} fallaron`);
                    setSavingVendedor(false);
                    fetchDashboard();
                };

                const entries = Object.entries(salesByVendor)
                    .filter(([v]) => isOwner ? true : v === currentUserName)
                    .sort((a, b) => b[1].total - a[1].total);

                return (
                    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FaUsers style={{ color: '#6366f1' }} />
                            {isOwner ? 'Ganancias por Vendedor' : 'Mis Ganancias'}
                        </h3>

                        {entries.length === 0 && (
                            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Sin ventas registradas</p>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {entries.map(([vendor, data]) => {
                                const pct = totalGlobal > 0 ? Math.round((data.total / totalGlobal) * 100) : 0;
                                const color = vendorColors[vendor] || '#6b7280';

                                return (
                                    <div key={vendor} style={{
                                        border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px',
                                        borderLeft: `5px solid ${color}`, background: '#fafbfc',
                                    }}>
                                        {/* Row 1: Name + assign */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: '1.1rem' }}>{vendorEmojis[vendor] || '👤'}</span>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>
                                                    {vendorNames[vendor] || vendor}
                                                </span>
                                                <span style={{
                                                    background: color + '18', color: color, fontSize: '0.65rem',
                                                    fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                                                }}>
                                                    {data.count} venta{data.count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {vendor === 'sin_asignar' && isOwner && (
                                                <select
                                                    style={{
                                                        fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6,
                                                        border: '1px solid #d1d5db', cursor: 'pointer', background: '#fff',
                                                        fontWeight: 600, color: '#6366f1',
                                                    }}
                                                    defaultValue=""
                                                    disabled={savingVendedor}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleBulkAssign(data.payments, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                >
                                                    <option value="" disabled>Asignar a...</option>
                                                    <option value="arturo">Arturo</option>
                                                    <option value="sandy">Sandy</option>
                                                    <option value="hugo">Hugo</option>
                                                </select>
                                            )}
                                        </div>

                                        {/* Row 2: Progress bar */}
                                        <div style={{ background: '#e5e7eb', borderRadius: 6, height: 8, marginBottom: 10, overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.5s ease' }} />
                                        </div>

                                        {/* Row 3: Stats */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: 20 }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendido</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>{formatMoney(data.total)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comisión (15%)</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>{formatMoney(data.commission)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Neto Empresa</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{formatMoney(data.total - data.commission)}</div>
                                                </div>
                                            </div>
                                            <div style={{
                                                background: color + '15', color: color, fontWeight: 800,
                                                fontSize: '0.85rem', padding: '4px 12px', borderRadius: 8,
                                            }}>
                                                {pct}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* ===== VIEW TOGGLE ===== */}
            <div className="mp-pay-view-toggle">
                <button className={`mp-pay-view-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                    <FaChartBar /> Dashboard
                </button>
                <button className={`mp-pay-view-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
                    <FaCalendarAlt /> Calendario
                </button>
                <button className={`mp-pay-view-btn ${view === 'register' ? 'active' : ''}`} onClick={() => setView('register')}>
                    <FaMoneyBillWave /> Registro
                </button>
            </div>

            {/* ===== DASHBOARD VIEW — Charts ===== */}
            {view === 'dashboard' && (
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
            )}

            {/* ===== CALENDAR VIEW ===== */}
            {view === 'calendar' && (
                <>
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

                    {/* Upcoming installments — shown below calendar */}
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
                </>
            )}

            {/* ===== REGISTER VIEW — Table ===== */}
            {view === 'register' && (
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
                                    <th>Vendedor</th>
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
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {editingVendedor === payment._id ? (
                                                    <select
                                                        className="mp-pay-vendedor-select"
                                                        defaultValue={payment.vendedor || payment.atendidoPor || ''}
                                                        autoFocus
                                                        disabled={savingVendedor}
                                                        onChange={(e) => handleAssignVendedor(payment, e.target.value)}
                                                        onBlur={() => setTimeout(() => setEditingVendedor(null), 250)}
                                                    >
                                                        <option value="">Sin asignar</option>
                                                        <option value="arturo">Arturo</option>
                                                        <option value="sandy">Sandy</option>
                                                        <option value="hugo">Hugo</option>
                                                    </select>
                                                ) : (
                                                    <span
                                                        className={`mp-pay-vendedor-badge ${!(payment.vendedor || payment.atendidoPor) ? 'mp-pay-vendedor-empty' : ''}`}
                                                        onClick={() => isSuperAdmin && setEditingVendedor(payment._id)}
                                                        title={isSuperAdmin ? 'Clic para asignar vendedor' : ''}
                                                        style={isSuperAdmin ? { cursor: 'pointer' } : {}}
                                                    >
                                                        {payment.vendedor || payment.atendidoPor || 'Sin asignar'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="mp-pay-commission">{formatMoney(payment.commission)}</td>
                                            <td><span className="mp-pay-source-badge">{getSourceIcon(payment.source)} {getSourceLabel(payment.source)}</span></td>
                                            <td>{getStatusBadge(payment.status)}</td>
                                            <td>{formatDate(payment.date)}</td>
                                            <td className="mp-pay-actions-cell">
                                                {!payment.hasProject && (
                                                    <button
                                                        className="mp-pay-create-project-btn"
                                                        title="Crear proyecto vinculado"
                                                        disabled={creatingProject === payment._id}
                                                        onClick={(e) => { e.stopPropagation(); handleCreateProject(payment); }}
                                                    >
                                                        <FaProjectDiagram />
                                                    </button>
                                                )}
                                                {isSuperAdmin && (
                                                    <button
                                                        className="mp-pay-delete-btn"
                                                        title="Eliminar pago"
                                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(payment); }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                                {payment.schedule?.length > 1 && (
                                                    expandedPayment === payment._id ? <FaChevronUp className="mp-pay-expand-icon" /> : <FaChevronDown className="mp-pay-expand-icon" />
                                                )}
                                            </td>
                                        </tr>
                                        {expandedPayment === payment._id && payment.schedule?.length > 1 && (
                                            <tr className="mp-pay-schedule-row">
                                                <td colSpan="10">
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
                                    <tr><td colSpan="10" className="mp-pay-empty">No se encontraron pagos</td></tr>
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
            )}

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
                                    {/* --- Datos del Cliente --- */}
                                    <div className="mp-pay-form-group mp-pay-form-full">
                                        <label style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem', marginBottom: 8, display: 'block' }}>Datos del Cliente</label>
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Nombre del Cliente *</label>
                                        <input type="text" value={newPayment.clientName} onChange={(e) => setNewPayment({ ...newPayment, clientName: e.target.value })} required />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Email del Cliente</label>
                                        <input type="email" value={newPayment.clientEmail} onChange={(e) => setNewPayment({ ...newPayment, clientEmail: e.target.value })} placeholder="Se creará cuenta automática" />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Teléfono (WhatsApp)</label>
                                        <input type="tel" value={newPayment.clientPhone} onChange={(e) => setNewPayment({ ...newPayment, clientPhone: e.target.value })} placeholder="55 1234 5678" />
                                    </div>

                                    {/* --- Datos del Proyecto --- */}
                                    <div className="mp-pay-form-group mp-pay-form-full">
                                        <label style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem', marginBottom: 8, display: 'block', marginTop: 8 }}>Datos del Proyecto</label>
                                    </div>
                                    <div className="mp-pay-form-group mp-pay-form-full">
                                        <label>Título del Proyecto *</label>
                                        <input type="text" value={newPayment.title} onChange={(e) => setNewPayment({ ...newPayment, title: e.target.value })} required />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Tipo de Trabajo</label>
                                        <select value={newPayment.taskType} onChange={(e) => setNewPayment({ ...newPayment, taskType: e.target.value })}>
                                            <option value="">Seleccionar...</option>
                                            <option value="Tesis">Tesis</option>
                                            <option value="Tesina">Tesina</option>
                                            <option value="Ensayo">Ensayo</option>
                                            <option value="Protocolo">Protocolo</option>
                                            <option value="Artículo">Artículo</option>
                                            <option value="Presentación">Presentación</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Fecha de Entrega</label>
                                        <input type="date" value={newPayment.dueDate} onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })} />
                                    </div>

                                    {/* --- Datos del Pago --- */}
                                    <div className="mp-pay-form-group mp-pay-form-full">
                                        <label style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem', marginBottom: 8, display: 'block', marginTop: 8 }}>Datos del Pago</label>
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Monto (MXN) *</label>
                                        <input type="number" min="0" step="0.01" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} required />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Fecha del Pago *</label>
                                        <input type="date" value={newPayment.paymentDate} onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })} required />
                                    </div>
                                    <div className="mp-pay-form-group">
                                        <label>Método de Pago</label>
                                        <select value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}>
                                            <option value="transferencia">Transferencia</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="mercadolibre">Mercado Libre</option>
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
                                    <div className="mp-pay-form-group">
                                        <label>Vendedor (Atribución) *</label>
                                        <select value={newPayment.vendedor} onChange={(e) => setNewPayment({ ...newPayment, vendedor: e.target.value })}>
                                            <option value="arturo">Arturo</option>
                                            <option value="sandy">Sandy</option>
                                            <option value="hugo">Hugo</option>
                                        </select>
                                    </div>
                                    <div className="mp-pay-form-group mp-pay-form-full">
                                        <label>Notas</label>
                                        <textarea rows="2" value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} placeholder="Notas adicionales..." />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 8 }}>
                                    Al registrar el pago se creará automáticamente el proyecto y la cuenta del cliente.
                                    Si proporcionas teléfono, las credenciales se enviarán por WhatsApp.
                                </p>
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
            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {confirmDelete && (
                <div className="mp-pay-modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="mp-pay-modal mp-pay-modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="mp-pay-modal-header mp-pay-modal-header-danger">
                            <h2><FaTrash /> Eliminar Pago</h2>
                            <button className="mp-pay-modal-close" onClick={() => setConfirmDelete(null)}><FaTimes /></button>
                        </div>
                        <div className="mp-pay-modal-body" style={{ textAlign: 'center', padding: '24px' }}>
                            <FaExclamationTriangle style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: 12 }} />
                            <p style={{ fontSize: '1rem', marginBottom: 8 }}>
                                ¿Estás seguro de eliminar este pago?
                            </p>
                            <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                                {confirmDelete.clientName} — {formatMoney(confirmDelete.amount)}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>
                                Fuente: {getSourceLabel(confirmDelete.source)} · {confirmDelete.title}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: 12 }}>
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="mp-pay-modal-footer">
                            <button type="button" className="mp-pay-btn-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                            <button
                                type="button"
                                className="mp-pay-btn-danger"
                                disabled={deleting}
                                onClick={() => handleDeletePayment(confirmDelete)}
                            >
                                {deleting ? <><FaSync className="spinning" /> Eliminando...</> : <><FaTrash /> Eliminar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManagePayments;
