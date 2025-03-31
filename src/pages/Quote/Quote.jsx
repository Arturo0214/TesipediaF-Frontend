import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaFileAlt, FaArrowRight } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { createQuote, resetQuoteState } from '../../features/quotes/quoteSlice';
import { parsePhoneNumber } from 'libphonenumber-js';
import './Quote.css';

function Quote() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loading, success, error } = useSelector((state) => state.quotes);

    const [formData, setFormData] = useState({
        tipoTesis: '',
        nivelAcademico: '',
        tema: '',
        areaEstudio: '',
        carrera: '',
        otraCarrera: '',
        numPaginas: '',
        fechaEntrega: '',
        descripcion: '',
        archivos: [],
        nombre: '',
        email: '',
        codigoPais: '+52',
        telefono: ''
    });

    const tiposTesis = ['Tesis', 'Tesina', 'Artículo', 'Ensayo', 'Proyecto de Investigación', 'Otros'];
    const nivelesAcademicos = ['Licenciatura', 'Maestría', 'Doctorado'];
    const areasEstudio = [
        'Área 1: Ciencias Físico-Matemáticas y de las Ingenierías',
        'Área 2: Ciencias Biológicas, Químicas y de la Salud',
        'Área 3: Ciencias Sociales',
        'Área 4: Humanidades y Artes'
    ];

    const carrerasPorArea = {
        'Área 1: Ciencias Físico-Matemáticas y de las Ingenierías': [
            'Actuaría', 'Física', 'Matemáticas', 'Ingeniería Civil', 'Ingeniería Eléctrica Electrónica',
            'Ingeniería en Computación', 'Ingeniería Geofísica', 'Ingeniería Industrial', 'Ingeniería Mecánica',
            'Ingeniería Química', 'Ingeniería en Energías Renovables', 'Ciencias de la Computación', 'Ciencias de la Tierra'
        ],
        'Área 2: Ciencias Biológicas, Químicas y de la Salud': [
            'Biología', 'Química', 'Medicina', 'Medicina Veterinaria y Zootecnia', 'Odontología', 'Enfermería',
            'Nutriología', 'Enfermería y Obstetricia', 'Psicología Clínica', 'Bioquímica Diagnóstica', 'Fisioterapia'
        ],
        'Área 3: Ciencias Sociales': [
            'Ciencias Políticas y Administración Pública', 'Relaciones Internacionales', 'Derecho', 'Economía',
            'Contaduría', 'Administración', 'Trabajo Social', 'Comunicación', 'Sociología', 'Geografía', 'Pedagogía',
            'Turismo', 'Ciencias Forenses'
        ],
        'Área 4: Humanidades y Artes': [
            'Filosofía', 'Historia', 'Letras Hispánicas', 'Lenguas Modernas', 'Traducción', 'Teatro y Actuación',
            'Música', 'Artes Visuales', 'Diseño y Comunicación Visual', 'Letras Clásicas', 'Lingüística', 'Enseñanza del Inglés'
        ]
    };

    const carrerasDisponibles = formData.areaEstudio ? [...carrerasPorArea[formData.areaEstudio], 'Otro'] : [];

    // Lista de países con sus códigos
    const countryCodes = [
        { code: '+52', country: 'México 🇲🇽' },
        { code: '+1', country: 'Estados Unidos 🇺🇸' },
        { code: '+34', country: 'España 🇪🇸' },
        { code: '+54', country: 'Argentina 🇦🇷' },
        { code: '+57', country: 'Colombia 🇨🇴' },
        { code: '+56', country: 'Chile 🇨🇱' },
        { code: '+51', country: 'Perú 🇵🇪' },
        { code: '+58', country: 'Venezuela 🇻🇪' },
        { code: '+593', country: 'Ecuador 🇪🇨' },
        { code: '+502', country: 'Guatemala 🇬🇹' },
        { code: '+503', country: 'El Salvador 🇸🇻' },
        { code: '+504', country: 'Honduras 🇭🇳' },
        { code: '+505', country: 'Nicaragua 🇳🇮' },
        { code: '+506', country: 'Costa Rica 🇨🇷' },
        { code: '+507', country: 'Panamá 🇵🇦' },
        { code: '+591', country: 'Bolivia 🇧🇴' },
        { code: '+595', country: 'Paraguay 🇵🇾' },
        { code: '+598', country: 'Uruguay 🇺🇾' },
    ];

    // Validación de teléfono
    const validatePhone = (phone, countryCode) => {
        if (!phone) return true; // Permitir teléfono vacío si no es requerido

        // Remover cualquier caracter que no sea número
        const cleanPhone = phone.replace(/\D/g, '');

        // Validar que tenga 10 dígitos
        if (cleanPhone.length !== 10) {
            return false;
        }

        try {
            // Validar formato usando libphonenumber-js
            const phoneNumber = parsePhoneNumber(countryCode + cleanPhone);
            return phoneNumber.isValid();
        } catch (error) {
            return false;
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo permitir números
        if (value.length <= 10) { // Limitar a 10 dígitos
            setFormData({ ...formData, telefono: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalCarrera = formData.carrera === 'Otro' ? formData.otraCarrera : formData.carrera;

        // Asegurarse de que la fecha sea futura
        const currentDate = new Date();
        const selectedDate = new Date(formData.fechaEntrega);

        if (selectedDate <= currentDate) {
            alert('La fecha de entrega debe ser futura');
            return;
        }

        // Validar teléfono
        if (formData.telefono && !validatePhone(formData.telefono, formData.codigoPais)) {
            alert('Por favor ingrese un número de teléfono válido de 10 dígitos');
            return;
        }

        const payload = {
            taskType: formData.tipoTesis,
            studyArea: formData.areaEstudio,
            educationLevel: formData.nivelAcademico,
            taskTitle: formData.tema,
            pages: Number(formData.numPaginas),
            dueDate: formData.fechaEntrega,
            email: formData.email,
            name: formData.nombre,
            phone: formData.telefono ? `${formData.codigoPais}${formData.telefono}` : '',
            career: finalCarrera,
            requirements: {
                text: formData.descripcion,
                file: formData.archivos?.[0] || null,
            },
        };

        // Validar campos obligatorios según el modelo
        const requiredFields = {
            taskType: 'Tipo de tesis',
            studyArea: 'Área de estudio',
            career: 'Carrera',
            educationLevel: 'Nivel académico',
            taskTitle: 'Tema',
            pages: 'Número de páginas',
            dueDate: 'Fecha de entrega',
            email: 'Email',
            name: 'Nombre'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key]) => !payload[key])
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            alert(`Por favor complete los siguientes campos obligatorios: ${missingFields.join(', ')}`);
            return;
        }

        // Validaciones adicionales según el modelo
        if (payload.taskTitle.length < 5) {
            alert('El título debe tener al menos 5 caracteres');
            return;
        }

        if (payload.requirements.text.length < 10) {
            alert('La descripción debe tener al menos 10 caracteres');
            return;
        }

        if (payload.name.length < 3) {
            alert('El nombre debe tener al menos 3 caracteres');
            return;
        }

        // Validar formato de email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(payload.email)) {
            alert('Por favor ingrese un email válido');
            return;
        }

        dispatch(createQuote(payload));
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, archivos: Array.from(e.target.files) });
    };

    useEffect(() => {
        if (success) {
            navigate('/cotizacion-enviada');
            dispatch(resetQuoteState());
        }
    }, [success, navigate, dispatch]);

    useEffect(() => {
        if (error) {
            dispatch(resetQuoteState());
        }
    }, [error, dispatch]);

    return (
        <Container fluid className="py-1 px-3 px-md-4">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card className="quote-card border-0">
                        <Card.Body className="p-2">
                            <div className="text-center mb-2">
                                <h4 className="quote-title mb-0">Solicitar Cotización</h4>
                                <p className="text-muted small mb-0">Complete el formulario para recibir una cotización personalizada</p>
                            </div>

                            {error && <Alert variant="danger" className="py-1 mb-2">{error}</Alert>}
                            {success && <Alert variant="success" className="py-1 mb-2">Cotización enviada con éxito!</Alert>}

                            <Form onSubmit={handleSubmit} className="modern-form">
                                <Row className="g-2">
                                    <Col lg={6}>
                                        <div className="form-section">
                                            <div className="section-header mb-2">
                                                <FaGraduationCap className="section-icon" />
                                                <span>Información Académica</span>
                                            </div>
                                            <Row className="g-2">
                                                <Col sm={6}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Tipo de Tesis</Form.Label>
                                                        <Form.Select value={formData.tipoTesis} onChange={(e) => setFormData({ ...formData, tipoTesis: e.target.value })} required>
                                                            <option value="">Seleccionar...</option>
                                                            {tiposTesis.map((tipo) => (
                                                                <option key={tipo} value={tipo}>{tipo}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Nivel</Form.Label>
                                                        <Form.Select value={formData.nivelAcademico} onChange={(e) => setFormData({ ...formData, nivelAcademico: e.target.value })} required>
                                                            <option value="">Seleccionar...</option>
                                                            {nivelesAcademicos.map((nivel) => (
                                                                <option key={nivel} value={nivel}>{nivel}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={12}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Área</Form.Label>
                                                        <Form.Select value={formData.areaEstudio} onChange={(e) => setFormData({ ...formData, areaEstudio: e.target.value, carrera: '', otraCarrera: '' })} required>
                                                            <option value="">Seleccionar...</option>
                                                            {areasEstudio.map((area) => (
                                                                <option key={area} value={area}>{area}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                {formData.areaEstudio && (
                                                    <>
                                                        <Col sm={12}>
                                                            <Form.Group>
                                                                <Form.Label className="form-label-sm">Carrera</Form.Label>
                                                                <Form.Select value={formData.carrera} onChange={(e) => setFormData({ ...formData, carrera: e.target.value, otraCarrera: '' })} required>
                                                                    <option value="">Seleccionar...</option>
                                                                    {carrerasDisponibles.map((carrera) => (
                                                                        <option key={carrera} value={carrera}>{carrera}</option>
                                                                    ))}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Col>
                                                        {formData.carrera === 'Otro' && (
                                                            <Col sm={12}>
                                                                <Form.Group>
                                                                    <Form.Label className="form-label-sm">Especifique otra carrera</Form.Label>
                                                                    <Form.Control type="text" placeholder="Ingresa tu carrera" value={formData.otraCarrera} onChange={(e) => setFormData({ ...formData, otraCarrera: e.target.value })} required />
                                                                </Form.Group>
                                                            </Col>
                                                        )}
                                                    </>
                                                )}
                                            </Row>
                                        </div>
                                    </Col>

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
                                                        <Form.Control type="text" placeholder="Título de tu tesis" value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} required />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={4}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Páginas</Form.Label>
                                                        <Form.Control type="number" placeholder="100" value={formData.numPaginas} onChange={(e) => setFormData({ ...formData, numPaginas: e.target.value })} required />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={12}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Fecha de Entrega</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={formData.fechaEntrega}
                                                            onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Descripción y Contacto */}
                                <Row className="g-2 mt-2">
                                    <Col lg={6}>
                                        <div className="form-section">
                                            <div className="section-header mb-2">
                                                <FaFileAlt className="section-icon" />
                                                <span>Descripción del Proyecto</span>
                                            </div>
                                            <Row className="g-2">
                                                <Col sm={12}>
                                                    <Form.Group>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            placeholder="Describe los detalles de tu proyecto..."
                                                            value={formData.descripcion}
                                                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={12}>
                                                    <Form.Group className="mb-0">
                                                        <Form.Label className="form-label-sm">Documentos de Apoyo</Form.Label>
                                                        <Form.Control type="file" multiple onChange={handleFileChange} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="form-section">
                                            <div className="section-header mb-2">
                                                <FaFileAlt className="section-icon" />
                                                <span>Información de Contacto</span>
                                            </div>
                                            <Row className="g-2">
                                                <Col sm={12}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Nombre</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Nombre completo"
                                                            value={formData.nombre}
                                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={12}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Email</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            placeholder="Correo electrónico"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={12}>
                                                    <Form.Group>
                                                        <Form.Label className="form-label-sm">Teléfono</Form.Label>
                                                        <div className="d-flex">
                                                            <Form.Select
                                                                className="me-2"
                                                                style={{ width: '180px' }}
                                                                value={formData.codigoPais}
                                                                onChange={(e) => setFormData({ ...formData, codigoPais: e.target.value })}
                                                            >
                                                                {countryCodes.map(({ code, country }) => (
                                                                    <option key={code} value={code}>
                                                                        {country} ({code})
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                            <Form.Control
                                                                type="tel"
                                                                placeholder="Número de 10 dígitos"
                                                                value={formData.telefono}
                                                                onChange={handlePhoneChange}
                                                                isInvalid={formData.telefono && !validatePhone(formData.telefono, formData.codigoPais)}
                                                                required
                                                            />
                                                        </div>
                                                        <Form.Control.Feedback type="invalid">
                                                            Ingrese un número válido de 10 dígitos
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Botón de envío */}
                                <Row className="mt-2">
                                    <Col className="d-flex justify-content-center">
                                        <Button
                                            type="submit"
                                            className="custom-button"
                                            style={{
                                                minWidth: '200px',
                                                padding: '0.4rem 1rem',
                                                backgroundColor: '#3498db',
                                                border: 'none',
                                                borderRadius: '5px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <Spinner size="sm" animation="border" />
                                            ) : (
                                                <>
                                                    Cotizar Ahora
                                                    <FaArrowRight className="ms-2" />
                                                </>
                                            )}
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

