import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';

function NavbarAdmin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/">Logo</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/admin">Panel de Administración</Nav.Link>
                        <Nav.Link as={Link} to="/admin/visitas">Gestión de Visitas</Nav.Link>
                    </Nav>
                    <Button variant="outline-secondary" onClick={handleLogout}>Cerrar Sesión</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarAdmin;
