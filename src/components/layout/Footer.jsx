import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export function Footer() {
    return (
        <footer className="bg-dark text-light py-5">
            <Container>
                <Row className="g-4">
                    <Col md={4}>
                        <h5 className="mb-3">Tesipedia</h5>
                        <p className="mb-3">
                            Desarrollamos tesis profesionales con metodología y asesoría personalizada.
                            Garantizamos calidad y originalidad en cada trabajo.
                        </p>
                        <div className="social-links">
                            <a href="#" className="me-3 text-light">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="me-3 text-light">
                                <FaTwitter />
                            </a>
                            <a href="#" className="me-3 text-light">
                                <FaInstagram />
                            </a>
                            <a href="#" className="text-light">
                                <FaWhatsapp />
                            </a>
                        </div>
                    </Col>
                    <Col md={2}>
                        <h5 className="mb-3">Enlaces</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link to="/" className="text-light text-decoration-none">Inicio</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/servicios" className="text-light text-decoration-none">Servicios</Link>
                            </li>
                            <li className="mb-2 text-light">¿Cómo Funciona?</li>

                            <li className="mb-2">
                                <Link to="/politica-de-privacidad" className="text-light text-decoration-none">Política de Privacidad</Link>
                            </li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h5 className="mb-3">Servicios</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2 text-light">Desarrollo de Tesis</li>
                            <li className="mb-2 text-light">Asesoría Personalizada</li>
                            <li className="mb-2 text-light">Revisión y Corrección</li>
                            <li className="mb-2 text-light">Metodología</li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h5 className="mb-3">Contacto</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <strong>Email:</strong><br />
                                tesipediaoficial@gmail.com
                            </li>
                            <li className="mb-2">
                                <strong>WhatsApp:</strong><br />
                                <a href="https://wa.me/525541004180" target="_blank" rel="noopener noreferrer" className="text-light text-decoration-none">
                                    +52 55 4100 4180
                                </a>
                            </li>
                            <li className="mb-2">
                                <strong>Horario:</strong><br />
                                Lun-Vie: 9:00 - 18:00
                            </li>
                        </ul>
                    </Col>
                </Row>
                <hr className="my-4" />
                <Row>
                    <Col className="text-center">
                        <p className="mb-0">
                            © {new Date().getFullYear()} Tesipedia - Todos los derechos reservados
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
} 