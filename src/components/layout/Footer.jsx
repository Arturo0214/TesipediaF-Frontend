import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

export function Footer() {
    return (
        <footer className="bg-dark text-light py-5">
            <Container>
                <Row className="g-4">
                    <Col md={4}>
                        <h5 className="mb-3">Tesipedia</h5>
                        <p className="mb-3">
                            Desarrollamos tesis profesionales con metodología y asesoría personalizada.
                            Más de 3,000 estudiantes titulados confían en nosotros.
                        </p>
                        <div className="social-links" role="navigation" aria-label="Redes sociales">
                            <a href="https://www.facebook.com/tesipedia" target="_blank" rel="noopener noreferrer" className="me-3 text-light" aria-label="Síguenos en Facebook">
                                <FaFacebookF aria-hidden="true" />
                            </a>
                            <a href="https://www.instagram.com/tesipedia" target="_blank" rel="noopener noreferrer" className="me-3 text-light" aria-label="Síguenos en Instagram">
                                <FaInstagram aria-hidden="true" />
                            </a>
                            <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer" className="text-light" aria-label="Contáctanos por WhatsApp">
                                <FaWhatsapp aria-hidden="true" />
                            </a>
                        </div>
                    </Col>
                    <Col md={3}>
                        <h5 className="mb-3">Enlaces</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link to="/" className="text-light text-decoration-none">Inicio</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/sobre-nosotros" className="text-light text-decoration-none">Sobre Nosotros</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/preguntas-frecuentes" className="text-light text-decoration-none">Preguntas Frecuentes</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/blog" className="text-light text-decoration-none">Blog</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/contacto" className="text-light text-decoration-none">Contacto</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/politica-de-privacidad" className="text-light text-decoration-none">Política de Privacidad</Link>
                            </li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h5 className="mb-3">Artículos Populares</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link to="/blog/cuanto-cuesta-hacer-una-tesis-en-mexico-2026-precios-reales" className="text-light text-decoration-none">¿Cuánto Cuesta una Tesis?</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/blog/formato-apa-7-edicion-tesis-guia-completa-ejemplos" className="text-light text-decoration-none">Formato APA 7a Edición</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/blog/como-hacer-marco-teorico-tesis-guia-paso-a-paso" className="text-light text-decoration-none">Cómo Hacer un Marco Teórico</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/blog/como-hacer-una-tesis-rapido-10-pasos-titularte-2026" className="text-light text-decoration-none">Cómo Hacer una Tesis Rápido</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/blog/tesis-unam-2026-requisitos-formatos-como-titularte" className="text-light text-decoration-none">Tesis UNAM 2026</Link>
                            </li>
                        </ul>
                    </Col>
                </Row>
                <Row className="g-4 mt-2">
                    <Col md={3}>
                        <h5 className="mb-3">Contacto</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <FaEnvelope className="me-2" aria-hidden="true" />
                                <a href="mailto:tesipediaoficial@gmail.com" className="text-light text-decoration-none">tesipediaoficial@gmail.com</a>
                            </li>
                            <li className="mb-2">
                                <FaWhatsapp className="me-2" aria-hidden="true" />
                                <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer" className="text-light text-decoration-none">
                                    +52 56 7007 1517
                                </a>
                            </li>
                            <li className="mb-2">
                                <strong>Horario:</strong><br />
                                Lun-Sáb: 9:00 - 20:00
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
