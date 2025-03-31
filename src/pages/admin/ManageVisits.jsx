import { Container, Table, Spinner, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVisits, deleteVisit, createVisit, updateVisit } from '../../features/visits/visitSlice';
import { Bar } from 'react-chartjs-2';

function ManageVisits() {
    const dispatch = useDispatch();
    const { visits, loading, error } = useSelector((state) => state.visits);
    const [showModal, setShowModal] = useState(false);
    const [currentVisit, setCurrentVisit] = useState(null);
    const [visitData, setVisitData] = useState({ ip: '', userAgent: '', path: '', city: '', region: '', country: '' });
    const [filters, setFilters] = useState({ city: '', country: '', startDate: '', endDate: '' });

    useEffect(() => {
        dispatch(fetchVisits());
    }, [dispatch]);

    const handleShow = (visit) => {
        setCurrentVisit(visit);
        setVisitData(visit ? { ...visit } : { ip: '', userAgent: '', path: '', city: '', region: '', country: '' });
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setCurrentVisit(null);
    };

    const handleDelete = (id) => {
        dispatch(deleteVisit(id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentVisit) {
            dispatch(updateVisit({ id: currentVisit._id, visitData }));
        } else {
            dispatch(createVisit(visitData));
        }
        handleClose();
    };

    const filteredVisits = visits.filter(visit => {
        const matchesCity = filters.city ? visit.city.toLowerCase().includes(filters.city.toLowerCase()) : true;
        const matchesCountry = filters.country ? visit.country.toLowerCase().includes(filters.country.toLowerCase()) : true;
        const visitDate = new Date(visit.createdAt);
        const matchesStartDate = filters.startDate ? visitDate >= new Date(filters.startDate) : true;
        const matchesEndDate = filters.endDate ? visitDate <= new Date(filters.endDate) : true;
        return matchesCity && matchesCountry && matchesStartDate && matchesEndDate;
    });

    // Prepare data for the chart
    const chartData = {
        labels: [...new Set(filteredVisits.map(visit => visit.country))],
        datasets: [{
            label: 'Visitas por País',
            data: filteredVisits.reduce((acc, visit) => {
                acc[visit.country] = (acc[visit.country] || 0) + 1;
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
            <Button variant="primary" onClick={() => handleShow(null)} className="mb-3">Agregar Visita</Button>

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
                            <td>{visit.city}</td>
                            <td>{visit.region}</td>
                            <td>{visit.country}</td>
                            <td>{new Date(visit.createdAt).toLocaleString()}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleShow(visit)}>Editar</Button>
                                <Button variant="danger" onClick={() => handleDelete(visit._id)}>Eliminar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para agregar/editar visita */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentVisit ? 'Editar Visita' : 'Agregar Visita'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formIP">
                            <Form.Label>IP</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.ip}
                                onChange={(e) => setVisitData({ ...visitData, ip: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formUserAgent">
                            <Form.Label>Usuario</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.userAgent}
                                onChange={(e) => setVisitData({ ...visitData, userAgent: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPath">
                            <Form.Label>Ruta</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.path}
                                onChange={(e) => setVisitData({ ...visitData, path: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCity">
                            <Form.Label>Ciudad</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.city}
                                onChange={(e) => setVisitData({ ...visitData, city: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formRegion">
                            <Form.Label>Región</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.region}
                                onChange={(e) => setVisitData({ ...visitData, region: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCountry">
                            <Form.Label>País</Form.Label>
                            <Form.Control
                                type="text"
                                value={visitData.country}
                                onChange={(e) => setVisitData({ ...visitData, country: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {currentVisit ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ManageVisits;