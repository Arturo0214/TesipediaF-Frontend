import { Container, Table, Spinner, Alert, Button, Form, Card, Row, Col, Tabs, Tab, Pagination } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisits, clearVisits, clearError } from '../../../features/visits/visitsSlice';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { FaMapMarkerAlt, FaGlobe, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import './ManageVisits.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

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
    const visitsPerPage = 20;

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

    // Prepare data for charts
    const visitsByCountry = filteredVisits.reduce((acc, visit) => {
        const country = visit.geoLocation?.country || 'Desconocido';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {});

    const visitsByCity = filteredVisits.reduce((acc, visit) => {
        const city = visit.geoLocation?.city || 'Desconocido';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    const visitsByDate = filteredVisits.reduce((acc, visit) => {
        const date = new Date(visit.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const chartData = {
        country: {
            labels: Object.keys(visitsByCountry),
            datasets: [{
                label: 'Visitas por País',
                data: Object.values(visitsByCountry),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        city: {
            labels: Object.keys(visitsByCity),
            datasets: [{
                label: 'Visitas por Ciudad',
                data: Object.values(visitsByCity),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        timeline: {
            labels: Object.keys(visitsByDate),
            datasets: [{
                label: 'Visitas por Fecha',
                data: Object.values(visitsByDate),
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }]
        }
    };

    const totalVisits = filteredVisits.length;
    const uniqueCountries = new Set(filteredVisits.map(v => v.geoLocation?.country)).size;
    const uniqueCities = new Set(filteredVisits.map(v => v.geoLocation?.city)).size;

    // Calculate pagination
    const indexOfLastVisit = currentPage * visitsPerPage;
    const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
    const currentVisits = filteredVisits.slice(indexOfFirstVisit, indexOfLastVisit);
    const totalPages = Math.ceil(filteredVisits.length / visitsPerPage);

    const paginationItems = [];
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

    return (
        <Container fluid className="visits-container">
            <div className="visits-header mb-3">
                <h2>Panel de Análisis de Visitas</h2>
                {loading && <Spinner animation="border" size="sm" />}
                {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
            </div>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} id="visits-tabs" className="mb-3">
                <Tab eventKey="resumen" title="Resumen">
                    {/* Estadísticas */}
                    <Row className="g-3 mb-2 flex-nowrap stats-row">
                        <Col xs={12} sm={4} className="d-flex">
                            <Card className="stat-card flex-fill">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                                    <h3><FaGlobe /> Total Visitas</h3>
                                    <h2>{totalVisits}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={4} className="d-flex">
                            <Card className="stat-card flex-fill">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                                    <h3><FaMapMarkerAlt /> Países Únicos</h3>
                                    <h2>{uniqueCountries}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={4} className="d-flex">
                            <Card className="stat-card flex-fill">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                                    <h3><FaMapMarkerAlt /> Ciudades Únicas</h3>
                                    <h2>{uniqueCities}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* Filtros */}
                    <Row className="g-2 mb-2">
                        <Col xs={12}>
                            <Card className="filter-container">
                                <Card.Body className="p-2">
                                    <Row className="g-2 align-items-center">
                                        <Col xs={6} md={3}>
                                            <Form.Control
                                                placeholder="Filtrar por Ciudad"
                                                value={filters.city}
                                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Control
                                                placeholder="Filtrar por País"
                                                value={filters.country}
                                                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Control
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                            />
                                        </Col>
                                        <Col xs={6} md={3}>
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
                    {/* Gráficas */}
                    <Row className="g-3 mb-3">
                        <Col xs={12} md={6}>
                            <Card className="chart-card chart-large h-100">
                                <Card.Body>
                                    <h4>Visitas por País</h4>
                                    <div style={{ height: '340px' }}>
                                        <Bar
                                            data={chartData.country}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'top' }
                                                }
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6}>
                            <Card className="chart-card chart-large h-100">
                                <Card.Body>
                                    <h4>Visitas por Ciudad</h4>
                                    <div style={{ height: '340px' }}>
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
                    <Row className="g-3 mb-3">
                        <Col xs={12}>
                            <Card className="chart-card chart-large">
                                <Card.Body>
                                    <h4>Evolución de Visitas</h4>
                                    <div style={{ height: '340px' }}>
                                        <Line
                                            data={chartData.timeline}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'top' }
                                                }
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="registro" title="Registro de Visitas" tabClassName="position-relative">
                    {/* Tabla de visitas */}
                    <Row className="g-3">
                        <Col xs={12}>
                            <Card className="table-card table-pro">
                                <Card.Body>
                                    <h4>Registro de Visitas</h4>
                                    <div className="table-responsive">
                                        <Table striped bordered hover className="visits-table pro-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>IP</th>
                                                    <th>Usuario</th>
                                                    <th>Ruta</th>
                                                    <th>Ciudad</th>
                                                    <th>País</th>
                                                    <th>Fecha</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentVisits.map(visit => (
                                                    <React.Fragment key={visit._id}>
                                                        <tr>
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