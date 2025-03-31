import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavbarWriter({ onLogout }) {
    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/">Logo</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/ordenes">Órdenes</Nav.Link>
                        <Nav.Link as={Link} to="/quotes">Cotizaciones</Nav.Link>
                        <Nav.Link as={Link} to="/pedidos">Pedidos Asignados</Nav.Link>
                    </Nav>
                    <Button variant="outline-secondary" onClick={onLogout}>Cerrar Sesión</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarWriter;