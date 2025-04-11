import { Navbar, Nav, Container, Button, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../../features/auth/authSlice';
import { FaUser, FaCog, FaSignOutAlt, FaUsers, FaFileAlt, FaMoneyBillWave, FaChartLine, FaBell, FaEnvelope, FaUserTie, FaUserEdit, FaCogs, FaTachometerAlt } from 'react-icons/fa';
import './NavbarAdmin.css';

function NavbarAdmin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top" className="tesipedia-admin-navbar">
            <Container fluid>
                <Navbar.Brand as={Link} to="/admin" className="tesipedia-admin-brand">
                    <img
                        src={TesipediaLogo}
                        alt="Tesipedia"
                        className="tesipedia-admin-logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="tesipedia-admin-toggler" />
                <Navbar.Collapse id="basic-navbar-nav" className="tesipedia-admin-collapse">
                    <Nav className="tesipedia-admin-nav me-auto">
                        <Nav.Link as={NavLink} to="/admin/dashboard" className={({ isActive }) => isActive ? 'tesipedia-admin-link active' : 'tesipedia-admin-link'}>
                            <FaTachometerAlt className="me-1" />
                            Dashboard
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/admin/panel" className={({ isActive }) => isActive ? 'tesipedia-admin-link active' : 'tesipedia-admin-link'}>
                            <FaCogs className="me-1" />
                            Panel de Administración
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/admin/mensajes" className={({ isActive }) => isActive ? 'tesipedia-admin-link active' : 'tesipedia-admin-link'}>
                            <FaEnvelope className="me-1" />
                            Mensajes
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/admin/proyectos-urgentes" className={({ isActive }) => isActive ? 'tesipedia-admin-link active' : 'tesipedia-admin-link'}>
                            <FaFileAlt className="me-1" />
                            Proyectos Urgentes
                        </Nav.Link>
                    </Nav>
                    <Nav className="tesipedia-admin-nav">
                        <Nav.Link as={NavLink} to="/admin/notificaciones" className="tesipedia-admin-link position-relative">
                            <FaBell className="me-1" />
                            <Badge bg="danger" className="tesipedia-admin-notification">
                                3
                            </Badge>
                        </Nav.Link>
                        <NavDropdown
                            title={
                                <span className="tesipedia-admin-user-dropdown">
                                    <FaUser className="me-1" />
                                    {user?.name || 'Usuario'}
                                </span>
                            }
                            id="user-dropdown"
                            align="end"
                            className="tesipedia-admin-dropdown"
                        >
                            <NavDropdown.Item as={NavLink} to="/admin/administradores" className="tesipedia-admin-dropdown-item">
                                <FaUserTie className="me-2" />
                                Administradores
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/redactores" className="tesipedia-admin-dropdown-item">
                                <FaUserEdit className="me-2" />
                                Redactores
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/configuraciones" className="tesipedia-admin-dropdown-item">
                                <FaCog className="me-2" />
                                Configuraciones
                            </NavDropdown.Item>
                            <NavDropdown.Divider className="tesipedia-admin-divider" />
                            <NavDropdown.Item onClick={handleLogout} className="tesipedia-admin-dropdown-item">
                                <FaSignOutAlt className="me-2" />
                                Salir
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarAdmin;
