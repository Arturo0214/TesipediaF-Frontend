import { Container, Table, Spinner, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisits, clearVisits, clearError } from '../../../features/visits/visitsSlice';
import { Bar } from 'react-chartjs-2';

function ManageVisits() {
    const dispatch = useDispatch();
    const { visits, loading, error } = useSelector((state) => state.visits);
    const [showModal, setShowModal] = useState(false);
    const [currentVisit, setCurrentVisit] = useState(null);
    const [visitData, setVisitData] = useState({
        ip: '',
        userAgent: '',
        path: '',
        geoLocation: {
            city: '',
            region: '',
            country: '',
            org: '',
            coordinates: ''
        }
    });
    const [filters, setFilters] = useState({
        city: '',
        country: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        dispatch(getVisits());
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleShow = (visit) => {
        setCurrentVisit(visit);
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
                    coordinates: ''
                }
            });
        } else {
            setVisitData({
                ip: '',
                userAgent: '',
                path: '',
                geoLocation: {
                    city: '',
                    region: '',
                    country: '',
                    org: '',
                    coordinates: ''
                }
            });
        }
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setCurrentVisit(null);
        setVisitData({
            ip: '',
            userAgent: '',
            path: '',
            geoLocation: {
                city: '',
                region: '',
                country: '',
                org: '',
                coordinates: ''
            }
        });
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

    // Prepare data for the chart
    const chartData = {
        labels: [...new Set(filteredVisits.map(visit => visit.geoLocation?.country))],
        datasets: [{
            label: 'Visitas por País',
            data: filteredVisits.reduce((acc, visit) => {
                const country = visit.geoLocation?.country || 'Desconocido';
                acc[country] = (acc[country] || 0) + 1;
                return acc;
            }, {}),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };

    return (
        <Container className="py-4">
            <h2 className="mb-3">Gestión de Visitas</h2>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Filtros */}
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Filtrar por Ciudad"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
                <Form.Control
                    placeholder="Filtrar por País"
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                />
                <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
            </InputGroup>

            {/* Gráfico de Visitas */}
            <div style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '20px' }}>
                <Bar
                    data={chartData}
                    options={{
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            </div>

            <Table striped bordered hover responsive className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>IP</th>
                        <th>Usuario</th>
                        <th>Ruta</th>
                        <th>Ciudad</th>
                        <th>Región</th>
                        <th>País</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVisits.map(visit => (
                        <tr key={visit._id}>
                            <td>{visit._id}</td>
                            <td>{visit.ip}</td>
                            <td>{visit.userAgent}</td>
                            <td>{visit.path}</td>
                            <td>{visit.geoLocation?.city || 'N/A'}</td>
                            <td>{visit.geoLocation?.region || 'N/A'}</td>
                            <td>{visit.geoLocation?.country || 'N/A'}</td>
                            <td>{new Date(visit.createdAt).toLocaleString()}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleShow(visit)}>Ver Detalles</Button>
                                <Button variant="danger" onClick={() => handleDelete(visit._id)}>Eliminar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para ver detalles de visita */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Visita</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formIP">
                            <Form.Label>IP</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.ip}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formUserAgent">
                            <Form.Label>Usuario</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.userAgent}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formPath">
                            <Form.Label>Ruta</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.path}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formCity">
                            <Form.Label>Ciudad</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.geoLocation.city}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formRegion">
                            <Form.Label>Región</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.geoLocation.region}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formCountry">
                            <Form.Label>País</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.geoLocation.country}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formOrg">
                            <Form.Label>Organización</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.geoLocation.org}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formCoordinates">
                            <Form.Label>Coordenadas</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.geoLocation.coordinates}
                                readOnly
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ManageVisits;