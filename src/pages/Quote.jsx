import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaFileAlt, FaCalendarAlt, FaInfoCircle, FaArrowRight } from 'react-icons/fa';
import './Quote.css';

function Quote() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tipoTesis: '',
        nivelAcademico: '',
        tema: '',
        areaEstudio: '',
        numPaginas: '',
        fechaEntrega: '',
        descripcion: '',
        archivos: [],
        nombre: '',
        email: '',
        telefono: ''
    });

    const tiposTesis = [
        'Tesis de Licenciatura',
        'Tesis de Maestría',
        'Tesis Doctoral',
        'Tesina',
        'Proyecto de Investigación'
    ];

    const nivelesAcademicos = [
        'Licenciatura',
        'Maestría',
        'Doctorado'
    ];

    const areasEstudio = [
        'Administración y Negocios',
        'Ingeniería',
        'Ciencias Sociales',
        'Medicina y Salud',
        'Derecho',
        'Educación',
        'Psicología',
        'Tecnología',
        'Otro'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para enviar la cotización
        console.log(formData);
        navigate('/cotizacion-enviada');
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            archivos: Array.from(e.target.files)
        });
    };

    return (
        <Container fluid className="py-3 px-3 px-md-4">
            <Row className="justify-content-center">
                <Col lg={10} md={12}>
                    <Card className="quote-card border-0">
                        <Card.Body className="p-3">
                            <div className="text-center mb-3">
                                <h4 className="quote-title mb-1">Solicitar Cotización</h4>
                                <p className="text-muted small mb-0">Complete el formulario para recibir una cotización personalizada</p>
                            </div>

                            <Form onSubmit={handleSubmit} className="modern-form">
                                {/* Info Académica y Proyecto en la misma línea */}
                                <Row className="g-3">
                                    {/* Info Académica */}
                                    <Col lg={6}>
                                        <div className="form-section">
                                            <div className="section-header mb-2">
                                                <FaGraduationCap className="section-icon" />
                                                <span>Información Académica</span>
                                            </div>
                                            <Row className="g-2">
                                                <Col sm={4}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Tipo de Tesis</Form.Label>
                                                        <Form.Select className="custom-select-md" value={formData.tipoTesis} onChange={(e) => setFormData({ ...formData, tipoTesis: e.target.value })} required>
                                                            <option value="">Seleccionar...</option>
                                                            {tiposTesis.map((tipo) => (
                                                                <option key={tipo} value={tipo}>{tipo}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={4}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Nivel</Form.Label>
                                                        <Form.Select className="custom-select-md" value={formData.nivelAcademico} onChange={(e) => setFormData({ ...formData, nivelAcademico: e.target.value })} required>
                                                            <option value="">Seleccionar...</option>
                                                            {nivelesAcademicos.map((nivel) => (
                                                                <option key={nivel} value={nivel}>{nivel}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={4}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Área</Form.Label>
                                                        <Form.Select className="custom-select-md" value={formData.areaEstudio} onChange={(e) => setFormData({ ...formData, areaEstudio: e.target.value })} required>
                                                            <option value="">Seleccionar...</option>
                                                            {areasEstudio.map((area) => (
                                                                <option key={area} value={area}>{area}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>

                                    {/* Detalles Proyecto */}
                                    <Col lg={6}>
                                        <div className="form-section">
                                            <div className="section-header mb-2">
                                                <FaFileAlt className="section-icon" />
                                                <span>Detalles del Proyecto</span>
                                            </div>
                                            <Row className="g-2">
                                                <Col sm={8}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Tema</Form.Label>
                                                        <Form.Control className="custom-input-md" type="text" placeholder="Título de tu tesis" value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} required />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={4}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Páginas</Form.Label>
                                                        <Form.Control className="custom-input-md" type="number" placeholder="100" value={formData.numPaginas} onChange={(e) => setFormData({ ...formData, numPaginas: e.target.value })} required />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Descripción y Contacto */}
                                <Row className="g-3 mt-2">
                                    <Col lg={7}>
                                        <div className="form-section">
                                            <Form.Group>
                                                <Form.Label className="form-label-sm">Descripción del Proyecto</Form.Label>
                                                <Form.Control className="custom-textarea" as="textarea" rows={2} placeholder="Describe los detalles específicos..." value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} required />
                                            </Form.Group>
                                        </div>
                                    </Col>
                                    <Col lg={5}>
                                        <div className="form-section">
                                            <Row className="g-2">
                                                <Col sm={12}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Nombre</Form.Label>
                                                        <Form.Control className="custom-input-md" type="text" placeholder="Tu nombre completo" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Email</Form.Label>
                                                        <Form.Control className="custom-input-md" type="email" placeholder="tu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Teléfono</Form.Label>
                                                        <Form.Control className="custom-input-md" type="tel" placeholder="Tu teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} required />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Archivos y Botón */}
                                <Row className="g-3 mt-2">
                                    <Col sm={8}>
                                        <div className="form-section d-flex align-items-center h-100">
                                            <Form.Group className="w-100 mb-0">
                                                <Form.Label className="form-label-sm">Documentos de Apoyo</Form.Label>
                                                <Form.Control className="custom-input-md" type="file" multiple onChange={handleFileChange} />
                                            </Form.Group>
                                        </div>
                                    </Col>
                                    <Col sm={4} className="d-flex align-items-end">
                                        <Button type="submit" className="custom-button w-100">
                                            Solicitar Cotización <FaArrowRight className="ms-2" />
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Quote;
