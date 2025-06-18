import { Container, Table, Spinner, Alert, Button, Form, Card, Row, Col, Tabs, Tab, Pagination } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisits, clearVisits, clearError } from '../../../features/visits/visitsSlice';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { FaMapMarkerAlt, FaGlobe, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import './ManageVisits.css';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import VisitsMap from './VisitsMap';
import { ComposableMap, Geographies } from 'react-simple-maps';
import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
countries.registerLocale(esLocale);

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartDataLabels);

function ManageVisits() {
    const dispatch = useDispatch();
    const { visits, loading, error } = useSelector((state) => state.visits);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [visitData, setVisitData] = useState({
        ip: '',
        userAgent: '',
        path: '',
        geoLocation: {
            city: '',
            region: '',
            country: '',
            org: '',
            location: ''
        }
    });
    const [filters, setFilters] = useState({
        city: '',
        country: '',
        startDate: '',
        endDate: ''
    });
    const [activeTab, setActiveTab] = useState('resumen');
    const [currentPage, setCurrentPage] = useState(1);
    const visitsPerPage = 10;

    // Filtros para la gráfica de evolución
    const [evoFilters, setEvoFilters] = useState({
        city: '',
        country: '',
        startDate: '',
        endDate: ''
    });

    // Filtros para la tabla de registro
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        dispatch(getVisits());
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Close popup when changing tab
    useEffect(() => {
        if (activeTab !== 'registro' && selectedVisit) {
            setSelectedVisit(null);
        }
    }, [activeTab, selectedVisit]);

    const handleShow = (visit) => {
        setSelectedVisit(visit);
        if (visit) {
            setVisitData({
                ip: visit.ip,
                userAgent: visit.userAgent,
                path: visit.path,
                geoLocation: visit.geoLocation || {
                    city: '',
                    region: '',
                    country: '',
                    org: '',
                    location: ''
                }
            });
        }
    };

    const handleClose = () => {
        setSelectedVisit(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta visita?')) {
            dispatch(clearVisits());
        }
    };

    const filteredVisits = visits.filter(visit => {
        const matchesCity = filters.city ?
            visit.geoLocation?.city?.toLowerCase().includes(filters.city.toLowerCase()) : true;
        const matchesCountry = filters.country ?
            visit.geoLocation?.country?.toLowerCase().includes(filters.country.toLowerCase()) : true;
        const visitDate = new Date(visit.createdAt);
        const matchesStartDate = filters.startDate ? visitDate >= new Date(filters.startDate) : true;
        const matchesEndDate = filters.endDate ? visitDate <= new Date(filters.endDate) : true;
        return matchesCity && matchesCountry && matchesStartDate && matchesEndDate;
    });

    // Filtrar visitas de las últimas 24 horas
    const now = new Date();
    const last24hVisits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.createdAt);
        return (now - visitDate) <= 24 * 60 * 60 * 1000;
    });

    // Procesar datos solo de las últimas 24 horas
    const visitsByCountry = last24hVisits.reduce((acc, visit) => {
        const country = visit.geoLocation?.country || 'Desconocido';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {});

    const visitsByCity = last24hVisits.reduce((acc, visit) => {
        const city = visit.geoLocation?.city || 'Desconocido';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    const visitsByDate = last24hVisits.reduce((acc, visit) => {
        const date = new Date(visit.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Para la gráfica de evolución de visitas, usar los últimos 30 días naturales
    const getLastNDates = (n) => {
        const dates = [];
        const today = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            dates.push(d.toLocaleDateString());
        }
        return dates;
    };
    const last30Days = getLastNDates(30);
    const last30dVisitsFiltered = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.createdAt);
        const visitDateStr = visitDate.toLocaleDateString();
        const inRange = last30Days.includes(visitDateStr);
        const matchesCity = evoFilters.city ? (visit.geoLocation?.city?.toLowerCase().includes(evoFilters.city.toLowerCase())) : true;
        const matchesCountry = evoFilters.country ? (visit.geoLocation?.country?.toLowerCase().includes(evoFilters.country.toLowerCase())) : true;
        const matchesStartDate = evoFilters.startDate ? (visitDate >= new Date(evoFilters.startDate)) : true;
        const matchesEndDate = evoFilters.endDate ? (visitDate <= new Date(evoFilters.endDate)) : true;
        return inRange && matchesCity && matchesCountry && matchesStartDate && matchesEndDate;
    });
    const visitsByDate30d = last30Days.reduce((acc, date) => {
        acc[date] = 0;
        return acc;
    }, {});
    last30dVisitsFiltered.forEach(visit => {
        const date = new Date(visit.createdAt).toLocaleDateString();
        visitsByDate30d[date] = (visitsByDate30d[date] || 0) + 1;
    });
    const timelineLabels = Object.keys(visitsByDate30d);
    const timelineData = Object.values(visitsByDate30d);

    // Generar colores distintos para cada dato
    function generateColors(count, alpha = 0.7) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = Math.round((360 * i) / count);
            colors.push(`hsla(${hue}, 70%, 60%, ${alpha})`);
        }
        return colors;
    }

    const countryColors = generateColors(Object.keys(visitsByCountry).length, 0.7);
    const cityColors = generateColors(Object.keys(visitsByCity).length, 0.7);

    const chartData = {
        country: {
            labels: Object.keys(visitsByCountry),
            datasets: [{
                label: 'Visitas por País',
                data: Object.values(visitsByCountry),
                backgroundColor: countryColors,
                borderColor: countryColors,
                borderWidth: 1,
                datalabels: {
                    color: '#222',
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold', size: 13 },
                    formatter: function (value) { return value; }
                }
            }]
        },
        city: {
            labels: Object.keys(visitsByCity),
            datasets: [{
                label: 'Visitas por Ciudad',
                data: Object.values(visitsByCity),
                backgroundColor: cityColors,
                borderColor: cityColors,
                borderWidth: 1
            }]
        },
        timeline: {
            labels: timelineLabels,
            datasets: [{
                label: 'Visitas por Fecha',
                data: timelineData,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }]
        }
    };

    const totalVisits = filteredVisits.length;
    const uniqueCountries = new Set(filteredVisits.map(v => v.geoLocation?.country)).size;
    const uniqueCities = new Set(filteredVisits.map(v => v.geoLocation?.city)).size;

    // Colores únicos por país
    const allCountries = Array.from(new Set(visits.map(v => v.geoLocation?.country || 'Desconocido')));
    const countryColorMap = {};
    allCountries.forEach((country, idx) => {
        // Genera un color pastel único por país
        const hue = (idx * 47) % 360;
        countryColorMap[country] = `hsla(${hue}, 70%, 92%, 1)`;
    });

    // Filtrado de visitas para la tabla
    const filteredVisitsTable = filteredVisits.filter(visit => {
        const matchesSearch = searchTerm ? (
            visit.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.userAgent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.geoLocation?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.geoLocation?.country?.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;
        const matchesCity = cityFilter ? (visit.geoLocation?.city?.toLowerCase().includes(cityFilter.toLowerCase())) : true;
        const matchesCountry = countryFilter ? (visit.geoLocation?.country?.toLowerCase().includes(countryFilter.toLowerCase())) : true;
        const matchesDate = dateFilter ? (new Date(visit.createdAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()) : true;
        return matchesSearch && matchesCity && matchesCountry && matchesDate;
    });

    // Paginación para la tabla filtrada
    const indexOfLastVisit = currentPage * visitsPerPage;
    const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
    const currentVisits = filteredVisitsTable.slice(indexOfFirstVisit, indexOfLastVisit);
    const totalPages = Math.ceil(filteredVisitsTable.length / visitsPerPage);

    // Paginación mejorada
    let paginationItems = [];
    if (totalPages <= 11) {
        for (let number = 1; number <= totalPages; number++) {
            paginationItems.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
    } else {
        if (currentPage <= 7) {
            for (let number = 1; number <= 10; number++) {
                paginationItems.push(
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }
            paginationItems.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
            paginationItems.push(
                <Pagination.Item
                    key={totalPages}
                    active={totalPages === currentPage}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        } else if (currentPage > totalPages - 7) {
            paginationItems.push(
                <Pagination.Item
                    key={1}
                    active={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                >
                    1
                </Pagination.Item>
            );
            paginationItems.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
            for (let number = totalPages - 9; number <= totalPages; number++) {
                paginationItems.push(
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }
        } else {
            paginationItems.push(
                <Pagination.Item
                    key={1}
                    active={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                >
                    1
                </Pagination.Item>
            );
            paginationItems.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
            for (let number = currentPage - 4; number <= currentPage + 4; number++) {
                paginationItems.push(
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }
            paginationItems.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
            paginationItems.push(
                <Pagination.Item
                    key={totalPages}
                    active={totalPages === currentPage}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }
    }

    // Colores únicos para las cards
    const statCardColors = [
        'linear-gradient(135deg, #6c5ce7, #a8a4e6)', // morado
        'linear-gradient(135deg, #00b894, #55efc4)', // verde
        'linear-gradient(135deg, #fdcb6e, #e17055)'  // naranja
    ];

    // Opciones únicas para los selects de ciudad y país (últimos 30 días)
    const evoCities = Array.from(new Set(last30dVisitsFiltered.map(v => v.geoLocation?.city).filter(Boolean)));
    const evoCountries = Array.from(new Set(last30dVisitsFiltered.map(v => v.geoLocation?.country).filter(Boolean)));

    // Función para construir un mapeo dinámico de nombre de país a ISO Alpha-2
    function buildCountryNameToISOMap(geographies) {
        const map = {};
        geographies.forEach(geo => {
            const name = geo.properties.NAME;
            const iso2 = geo.properties.ISO_A2;
            if (name && iso2) {
                map[name.toLowerCase()] = iso2;
            }
        });
        return map;
    }

    // Generar visitsByCountry para el mapa usando ISO Alpha-3
    function getCountryISO3(name) {
        if (!name) return 'N/A';
        // Intenta español
        let code = countries.getAlpha3Code(name, 'es');
        if (!code) code = countries.getAlpha3Code(name, 'en');
        if (!code && name.length === 3) code = name.toUpperCase();
        if (!code && name.length === 2) code = countries.alpha2ToAlpha3(name.toUpperCase());
        return code || 'N/A';
    }
    const visitsByCountryMap = {};
    filteredVisits.forEach(visit => {
        const countryName = visit.geoLocation?.country || '';
        const iso3 = getCountryISO3(countryName);
        if (!visitsByCountryMap[iso3]) visitsByCountryMap[iso3] = 0;
        visitsByCountryMap[iso3]++;
    });

    return (
        <Container fluid className="visits-container h-100 p-0 m-0">
            <div className="visits-header mb-3">
                <h2>Panel de Análisis de Visitas</h2>
                {loading && <Spinner animation="border" size="sm" />}
                {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
            </div>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} id="visits-tabs" className="mb-3">
                <Tab eventKey="resumen" title="Resumen">
                    {/* Estadísticas */}
                    <Row className="g-3 mb-3 stats-row">
                        <Col xs={12} md={4} className="d-flex">
                            <Card className="stat-card flex-fill" style={{ background: statCardColors[0] }}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                                    <h3><FaGlobe /> Total Visitas</h3>
                                    <h2>{totalVisits}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={4} className="d-flex">
                            <Card className="stat-card flex-fill" style={{ background: statCardColors[1] }}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                                    <h3><FaMapMarkerAlt /> Países Únicos</h3>
                                    <h2>{uniqueCountries}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={4} className="d-flex">
                            <Card className="stat-card flex-fill" style={{ background: statCardColors[2] }}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                                    <h3><FaMapMarkerAlt /> Ciudades Únicas</h3>
                                    <h2>{uniqueCities}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* Filtros */}
                    <Row className="g-3 mb-3">
                        <Col xs={12}>
                            <Card className="filter-container">
                                <Card.Body className="p-3">
                                    <Row className="g-3 align-items-center">
                                        <Col xs={12} md={3}>
                                            <Form.Control
                                                placeholder="Filtrar por Ciudad"
                                                value={filters.city}
                                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={12} md={3}>
                                            <Form.Control
                                                placeholder="Filtrar por País"
                                                value={filters.country}
                                                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={12} md={3}>
                                            <Form.Control
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={12} md={3}>
                                            <Form.Control
                                                type="date"
                                                value={filters.endDate}
                                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                            />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* Gráficas de país y ciudad */}
                    <Row className="g-3 mb-3">
                        <Col xs={12} md={6} className="mb-3">
                            <Card className="chart-card chart-large h-100">
                                <Card.Body className="p-3">
                                    <h4>Visitas por País</h4>
                                    <div style={{ height: '300px' }}>
                                        <Bar
                                            data={chartData.country}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'top' },
                                                    datalabels: {
                                                        display: true,
                                                        color: '#222',
                                                        anchor: 'end',
                                                        align: 'end',
                                                        font: { weight: 'bold', size: 13 },
                                                        formatter: function (value) { return value; }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                            <Card className="chart-card chart-large h-100">
                                <Card.Body className="p-3">
                                    <h4>Visitas por Ciudad</h4>
                                    <div style={{ height: '300px' }}>
                                        <Doughnut
                                            data={chartData.city}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'right' }
                                                }
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="evolucion" title="Evolución">
                    <Row className="g-3 mb-3">
                        <Col xs={12}>
                            <Card className="chart-card chart-large">
                                <Card.Body className="p-3">
                                    <h4>Evolución de Visitas</h4>
                                    {/* Filtros de la gráfica de evolución */}
                                    <Row className="g-3 mb-3 align-items-center">
                                        <Col xs={12} md={3}>
                                            <Form.Select
                                                value={evoFilters.city}
                                                onChange={e => setEvoFilters({ ...evoFilters, city: e.target.value })}
                                            >
                                                <option value="">Filtrar por Ciudad</option>
                                                {evoCities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col xs={12} md={3}>
                                            <Form.Select
                                                value={evoFilters.country}
                                                onChange={e => setEvoFilters({ ...evoFilters, country: e.target.value })}
                                            >
                                                <option value="">Filtrar por País</option>
                                                {evoCountries.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col xs={12} md={2}>
                                            <Form.Control
                                                type="date"
                                                value={evoFilters.startDate}
                                                onChange={e => setEvoFilters({ ...evoFilters, startDate: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={12} md={2}>
                                            <Form.Control
                                                type="date"
                                                value={evoFilters.endDate}
                                                onChange={e => setEvoFilters({ ...evoFilters, endDate: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={12} md={2} className="d-flex align-items-center">
                                            <Button variant="outline-secondary" onClick={() => setEvoFilters({ city: '', country: '', startDate: '', endDate: '' })} className="w-100">
                                                Borrar filtros
                                            </Button>
                                        </Col>
                                    </Row>
                                    <div className="chart-responsive" style={{ width: '100%', height: '500px' }}>
                                        <Line
                                            data={{
                                                labels: timelineLabels,
                                                datasets: [{
                                                    label: 'Visitas por Fecha',
                                                    data: timelineData,
                                                    fill: false,
                                                    borderColor: 'rgba(255, 99, 132, 1)',
                                                    tension: 0.1
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                layout: {
                                                    padding: { left: 10, right: 10, top: 10, bottom: 10 }
                                                },
                                                plugins: {
                                                    legend: { position: 'top', labels: { font: { size: 14 } } }
                                                },
                                                scales: {
                                                    x: {
                                                        ticks: { font: { size: 12 }, maxRotation: 45, minRotation: 0, autoSkip: true, maxTicksLimit: 12 }
                                                    },
                                                    y: {
                                                        ticks: { font: { size: 12 } }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="mapa" title="Mapa">
                    <Row className="mb-3">
                        <Col xs={12}>
                            <Card className="h-100">
                                <Card.Body className="p-3">
                                    <VisitsMap visitsByCountry={visitsByCountryMap} />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="registro" title="Registro de Visitas">
                    <Row className="g-3">
                        <Col xs={12}>
                            <Card className="table-card table-pro">
                                <Card.Body className="p-3">
                                    <h4>Registro de Visitas</h4>
                                    <div className="table-responsive">
                                        <Table striped bordered hover className="visits-table pro-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>IP</th>
                                                    <th>Usuario</th>
                                                    <th>Ruta</th>
                                                    <th>
                                                        Ciudad
                                                        <Form.Control
                                                            size="sm"
                                                            className="mt-1"
                                                            placeholder="Filtrar ciudad"
                                                            value={cityFilter}
                                                            onChange={e => setCityFilter(e.target.value)}
                                                        />
                                                    </th>
                                                    <th>
                                                        País
                                                        <Form.Control
                                                            size="sm"
                                                            className="mt-1"
                                                            placeholder="Filtrar país"
                                                            value={countryFilter}
                                                            onChange={e => setCountryFilter(e.target.value)}
                                                        />
                                                    </th>
                                                    <th>
                                                        Fecha
                                                        <Form.Control
                                                            size="sm"
                                                            className="mt-1"
                                                            type="date"
                                                            value={dateFilter}
                                                            onChange={e => setDateFilter(e.target.value)}
                                                        />
                                                    </th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentVisits.map(visit => (
                                                    <React.Fragment key={visit._id}>
                                                        <tr style={{ background: countryColorMap[visit.geoLocation?.country || 'Desconocido'] }}>
                                                            <td>{visit._id}</td>
                                                            <td>{visit.ip}</td>
                                                            <td>{visit.userAgent}</td>
                                                            <td>{visit.path}</td>
                                                            <td>{visit.geoLocation?.city || 'N/A'}</td>
                                                            <td>{visit.geoLocation?.country || 'N/A'}</td>
                                                            <td>{new Date(visit.createdAt).toLocaleString()}</td>
                                                            <td>
                                                                <div className="btn-action-group">
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        className="btn-action"
                                                                        onClick={() => handleShow(visit)}
                                                                        title="Ver detalles"
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        className="btn-action"
                                                                        onClick={() => handleDelete(visit._id)}
                                                                        title="Eliminar"
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {selectedVisit && selectedVisit._id === visit._id && (
                                                            <tr className="details-popup-row">
                                                                <td colSpan="8">
                                                                    <div className="details-popup">
                                                                        <div className="details-popup-content">
                                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                                <h5 className="mb-0">Detalles de la Visita</h5>
                                                                                <Button variant="link" className="close-button" onClick={handleClose}>
                                                                                    <FaTimes />
                                                                                </Button>
                                                                            </div>
                                                                            <Row className="g-3">
                                                                                <Col md={6}>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>IP</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.ip} readOnly />
                                                                                    </Form.Group>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>Usuario</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.userAgent} readOnly />
                                                                                    </Form.Group>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>Ruta</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.path} readOnly />
                                                                                    </Form.Group>
                                                                                </Col>
                                                                                <Col md={6}>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>Ciudad</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.geoLocation.city} readOnly />
                                                                                    </Form.Group>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>Región</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.geoLocation.region} readOnly />
                                                                                    </Form.Group>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>País</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.geoLocation.country} readOnly />
                                                                                    </Form.Group>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>Organización</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.geoLocation.org} readOnly />
                                                                                    </Form.Group>
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label>Coordenadas</Form.Label>
                                                                                        <Form.Control type="text" value={visitData.geoLocation.location} readOnly />
                                                                                    </Form.Group>
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-3">
                                            <Pagination>
                                                <Pagination.Prev
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                />
                                                {paginationItems}
                                                <Pagination.Next
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                />
                                            </Pagination>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
}

export default ManageVisits;