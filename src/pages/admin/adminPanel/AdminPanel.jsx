import React, { useState, Suspense } from 'react';
import { Container, Row, Col, Nav, Card, Alert, Spinner } from 'react-bootstrap';
import {
    FaFileAlt,
    FaProjectDiagram,
    FaMoneyBillWave,
    FaChartLine,
    FaUsers,
    FaCogs,
    FaPencilAlt,
    FaShoppingCart
} from 'react-icons/fa';
import './AdminPanel.css';

// Import components
import ManageQuotes from '../adminQuotes/ManageQuotes.jsx';
import ManageProjects from '../adminProjects/ManageProjects.jsx';
import ManagePayments from '../adminPayments/ManagePayments.jsx';
import ManageVisits from '../adminVisits/ManageVisits.jsx';
import ManageUsers from '../adminUsers/ManageUsers.jsx';
import ManageServices from '../adminServices/ManageServices.jsx';
import ManageWriters from '../ManageWriters.jsx';
import ManageOrders from '../ManageOrders.jsx';

// Error boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Component Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Alert variant="danger">
                    <Alert.Heading>Error al cargar el componente</Alert.Heading>
                    <p>Hubo un problema al cargar esta sección. Detalles: {this.state.error?.message || 'Error desconocido'}</p>
                    {this.state.errorInfo && (
                        <details style={{ whiteSpace: 'pre-wrap' }}>
                            <summary>Ver detalles del error</summary>
                            {this.state.errorInfo.componentStack}
                        </details>
                    )}
                </Alert>
            );
        }

        return this.props.children;
    }
}

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('cotizaciones');

    const handleTabSelect = (key) => {
        console.log('Tab selected:', key);
        setActiveTab(key);
    };

    const renderTabContent = () => {
        try {
            switch (activeTab) {
                case 'cotizaciones':
                    return <ErrorBoundary><ManageQuotes /></ErrorBoundary>;
                case 'proyectos':
                    return <ErrorBoundary><ManageProjects /></ErrorBoundary>;
                case 'pagos':
                    return <ErrorBoundary><ManagePayments /></ErrorBoundary>;
                case 'visitas':
                    return <ErrorBoundary><ManageVisits /></ErrorBoundary>;
                case 'usuarios':
                    return <ErrorBoundary><ManageUsers /></ErrorBoundary>;
                case 'servicios':
                    return <ErrorBoundary><ManageServices /></ErrorBoundary>;
                case 'escritores':
                    return <ErrorBoundary><ManageWriters /></ErrorBoundary>;
                case 'pedidos':
                    return <ErrorBoundary><ManageOrders /></ErrorBoundary>;
                default:
                    return <ErrorBoundary><ManageQuotes /></ErrorBoundary>;
            }
        } catch (error) {
            console.error("Error rendering tab content:", error);
            return (
                <Alert variant="danger">
                    <Alert.Heading>Error al cargar el componente</Alert.Heading>
                    <p>No se pudo cargar el componente. Error: {error.message}</p>
                </Alert>
            );
        }
    };

    return (
        <Container className="admin-panel-container">
            <Row className="justify-content-center mb-4">
                <Col xs="auto">
                    <h2 className="admin-panel-title">Panel de Administración</h2>
                </Col>
            </Row>
            <Row>
                <Col md={3} lg={2} className="mb-4">
                    <Card className="shadow-sm admin-sidebar">
                        <Card.Body className="p-0">
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'cotizaciones'}
                                        onClick={() => handleTabSelect('cotizaciones')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaFileAlt className="me-2" />
                                        Cotizaciones
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'proyectos'}
                                        onClick={() => handleTabSelect('proyectos')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaProjectDiagram className="me-2" />
                                        Proyectos
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'pagos'}
                                        onClick={() => handleTabSelect('pagos')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaMoneyBillWave className="me-2" />
                                        Pagos
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'visitas'}
                                        onClick={() => handleTabSelect('visitas')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaChartLine className="me-2" />
                                        Visitas
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'usuarios'}
                                        onClick={() => handleTabSelect('usuarios')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaUsers className="me-2" />
                                        Usuarios
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'servicios'}
                                        onClick={() => handleTabSelect('servicios')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaCogs className="me-2" />
                                        Servicios
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'escritores'}
                                        onClick={() => handleTabSelect('escritores')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaPencilAlt className="me-2" />
                                        Escritores
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'pedidos'}
                                        onClick={() => handleTabSelect('pedidos')}
                                        className="d-flex align-items-center p-3"
                                    >
                                        <FaShoppingCart className="me-2" />
                                        Pedidos
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={9} lg={10}>
                    <Card className="shadow-sm admin-content">
                        <Card.Body>
                            {renderTabContent()}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPanel;
