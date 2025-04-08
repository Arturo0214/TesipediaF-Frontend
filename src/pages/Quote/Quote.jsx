import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaGraduationCap, FaFileAlt, FaArrowRight, FaCheckCircle, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaRobot, FaUserGraduate, FaEdit, FaCalculator, FaLock, FaStore, FaRocket, FaStar, FaCcVisa, FaCcMastercard, FaCcAmex, FaUniversity, FaClock, FaUserShield } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { createQuote, resetQuoteState } from '../../features/quotes/quoteSlice';
import { parsePhoneNumber } from 'libphonenumber-js';
import './Quote.css';

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX').format(price);
};

function Quote() {
    const dispatch = useDispatch();
    const { loading, success, error, quote } = useSelector((state) => state.quotes);

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

    const [estimatedPrice, setEstimatedPrice] = useState(0);

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
            'Ingeniería Química', 'Ingeniería en Energías Renovables', 'Ingeniería en Sistemas Computacionales',
            'Ingeniería Biomédica', 'Ingeniería Aeroespacial', 'Ingeniería Robótica', 'Ciencias de la Computación',
            'Ciencias de la Tierra', 'Ingeniería Ambiental', 'Ingeniería en Inteligencia Artificial'
        ],
        'Área 2: Ciencias Biológicas, Químicas y de la Salud': [
            'Biología', 'Química', 'Medicina', 'Medicina Veterinaria y Zootecnia', 'Odontología', 'Enfermería',
            'Nutrición', 'Enfermería y Obstetricia', 'Psicología Clínica', 'Bioquímica Diagnóstica', 'Fisioterapia',
            'Biotecnología', 'Ciencias Genómicas', 'Ingeniería Biomédica'
        ],
        'Área 3: Ciencias Sociales': [
            'Ciencias Políticas y Administración Pública', 'Relaciones Internacionales', 'Derecho', 'Economía',
            'Contaduría', 'Administración', 'Trabajo Social', 'Comunicación', 'Sociología', 'Geografía', 'Pedagogía',
            'Turismo', 'Ciencias Forenses', 'Mercadotecnia', 'Negocios Internacionales', 'Finanzas'
        ],
        'Área 4: Humanidades y Artes': [
            'Filosofía', 'Historia', 'Letras Hispánicas', 'Lenguas Modernas', 'Traducción', 'Teatro y Actuación',
            'Música', 'Artes Visuales', 'Diseño y Comunicación Visual', 'Letras Clásicas', 'Lingüística', 'Enseñanza del Inglés',
            'Arte Digital', 'Diseño Gráfico', 'Arquitectura'
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
        const threeWeeksFromNow = new Date();
        threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21); // 3 weeks

        if (selectedDate <= currentDate) {
            alert('La fecha de entrega debe ser futura');
            return;
        }

        // Validar teléfono
        if (formData.telefono && !validatePhone(formData.telefono, formData.codigoPais)) {
            alert('Por favor ingrese un número de teléfono válido de 10 dígitos');
            return;
        }

        // Crear FormData para manejar la subida de archivos
        const formDataToSend = new FormData();
        formDataToSend.append('taskType', formData.tipoTesis);
        formDataToSend.append('studyArea', formData.areaEstudio);
        formDataToSend.append('educationLevel', formData.nivelAcademico);
        formDataToSend.append('taskTitle', formData.tema);
        formDataToSend.append('pages', Number(formData.numPaginas));
        formDataToSend.append('dueDate', formData.fechaEntrega);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('name', formData.nombre);
        formDataToSend.append('phone', formData.telefono ? `${formData.codigoPais}${formData.telefono}` : '');
        formDataToSend.append('career', finalCarrera);
        formDataToSend.append('descripcion', formData.descripcion);

        // Agregar el archivo solo si existe
        if (formData.archivos && formData.archivos.length > 0) {
            formDataToSend.append('file', formData.archivos[0]);
        }

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
            .filter(([key]) => !formDataToSend.get(key))
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            alert(`Por favor complete los siguientes campos obligatorios: ${missingFields.join(', ')}`);
            return;
        }

        // Validaciones adicionales según el modelo
        if (formDataToSend.get('taskTitle').length < 5) {
            alert('El título debe tener al menos 5 caracteres');
            return;
        }

        if (formDataToSend.get('descripcion').length < 10) {
            alert('La descripción debe tener al menos 10 caracteres');
            return;
        }

        if (formDataToSend.get('name').length < 3) {
            alert('El nombre debe tener al menos 3 caracteres');
            return;
        }

        // Validar formato de email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(formDataToSend.get('email'))) {
            alert('Por favor ingrese un email válido');
            return;
        }

        dispatch(createQuote(formDataToSend));

        // Scroll suave a la sección de pago
        setTimeout(() => {
            const paymentSection = document.getElementById('payment-section');
            if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, archivos: Array.from(e.target.files) });
    };

    useEffect(() => {
        if (error) {
            dispatch(resetQuoteState());
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (success && quote?.quote?.estimatedPrice) {
            setEstimatedPrice(quote.quote.estimatedPrice);
        }
    }, [success, quote]);

    // Add function to get standard delivery date
    const getStandardDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 21);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    // Add function to get urgency message and surcharge
    const getUrgencyInfo = () => {
        if (!formData.fechaEntrega) return null;

        const selectedDate = new Date(formData.fechaEntrega + 'T00:00:00');
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const threeWeeksFromNow = getStandardDeliveryDate();
        const twoWeeksFromNow = new Date(currentDate);
        twoWeeksFromNow.setDate(currentDate.getDate() + 14);
        const oneWeekFromNow = new Date(currentDate);
        oneWeekFromNow.setDate(currentDate.getDate() + 7);

        if (selectedDate.getTime() < threeWeeksFromNow.getTime()) {
            if (selectedDate.getTime() <= oneWeekFromNow.getTime()) {
                return {
                    message: "Entrega ultra rápida (1 semana o menos)",
                    surcharge: "+40%",
                    multiplier: 1.4
                };
            } else if (selectedDate.getTime() <= twoWeeksFromNow.getTime()) {
                return {
                    message: "Entrega express (2 semanas)",
                    surcharge: "+30%",
                    multiplier: 1.3
                };
            } else {
                return {
                    message: "Entrega prioritaria (menos de 3 semanas)",
                    surcharge: "+20%",
                    multiplier: 1.2
                };
            }
        }
        return null;
    };

    const handleNewQuote = () => {
        setFormData({
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
        dispatch(resetQuoteState());
    };

    const visaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/visa-svgrepo-com_lpwqqd.svg';
    const mastercardLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/mc_symbol_zpes4d.svg';
    const amexLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/amex-svgrepo-com_m3vtdk.svg';

    return (
        <Container fluid className="quote-container-tesipedia">
            <div className="quote-wrapper-tesipedia">
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="quote-card-tesipedia">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <h4 className="quote-title-tesipedia">Solicitar Cotización</h4>
                                    <p className="text-muted small mb-0">Complete el formulario para recibir una cotización personalizada</p>
                                </div>

                                {error && <Alert variant="danger" className="py-2 mb-4">{error}</Alert>}
                                {success && (
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <Alert variant="success" className="py-2 mb-0 flex-grow-1 me-3">¡Cotización enviada con éxito!</Alert>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={handleNewQuote}
                                            className="px-3"
                                        >
                                            Nueva Cotización
                                        </Button>
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit} className="quote-form-tesipedia">
                                    <Row className="g-2">
                                        <Col lg={6}>
                                            <div className="form-section-tesipedia">
                                                <div className="section-header-tesipedia">
                                                    <FaGraduationCap className="section-icon-tesipedia" />
                                                    <span>Información Académica</span>
                                                </div>
                                                <Row className="g-2">
                                                    <Col sm={6}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia">Tipo de Tesis</Form.Label>
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
                                                            <Form.Label className="form-label-sm-tesipedia">Nivel</Form.Label>
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
                                                            <Form.Label className="form-label-sm-tesipedia">Área</Form.Label>
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
                                                                    <Form.Label className="form-label-sm-tesipedia">Carrera</Form.Label>
                                                                    <Form.Select value={formData.carrera} onChange={(e) => setFormData({ ...formData, carrera: e.target.value, otraCarrera: '' })} required className="select-scroll-tesipedia">
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
                                                                        <Form.Label className="form-label-sm-tesipedia">Especifique otra carrera</Form.Label>
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
                                            <div className="form-section-tesipedia">
                                                <div className="section-header-tesipedia">
                                                    <FaFileAlt className="section-icon-tesipedia" />
                                                    <span>Detalles del Proyecto</span>
                                                </div>
                                                <Row className="g-2">
                                                    <Col sm={8}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia">Tema</Form.Label>
                                                            <Form.Control type="text" placeholder="Título de tu tesis" value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} required />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia">Páginas</Form.Label>
                                                            <Form.Control type="number" placeholder="Núm. de páginas" value={formData.numPaginas} onChange={(e) => setFormData({ ...formData, numPaginas: e.target.value })} required />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col sm={12}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia">
                                                                Fecha de Entrega
                                                                {formData.fechaEntrega && (
                                                                    <span className="ms-2 standard-date-info-tesipedia">
                                                                        <small className="text-primary">
                                                                            Fecha de entrega sin cargo extra: {getStandardDeliveryDate().toLocaleDateString('es-MX')} o posterior
                                                                        </small>
                                                                    </span>
                                                                )}
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                value={formData.fechaEntrega}
                                                                onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                required
                                                            />
                                                            {formData.fechaEntrega && (
                                                                <>
                                                                    {new Date(formData.fechaEntrega + 'T00:00:00').getTime() < getStandardDeliveryDate().getTime() ? (
                                                                        <div className="mt-1 urgency-message-tesipedia">
                                                                            <small className="text-warning d-block">
                                                                                Has seleccionado una fecha de entrega urgente que implica un cargo adicional:
                                                                            </small>
                                                                            {getUrgencyInfo() && (
                                                                                <div className="mt-1 urgency-details-tesipedia">
                                                                                    <small className="text-danger d-block">
                                                                                        • {getUrgencyInfo().message}
                                                                                    </small>
                                                                                    <small className="text-danger d-block">
                                                                                        • {getUrgencyInfo().surcharge} sobre el precio base
                                                                                    </small>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="mt-1">
                                                                            <small className="text-success">
                                                                                ✓ Has seleccionado la fecha de entrega estándar (sin cargo adicional)
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row className="g-2 mt-1">
                                        <Col lg={6}>
                                            <div className="form-section-tesipedia">
                                                <div className="section-header-tesipedia">
                                                    <FaFileAlt className="section-icon-tesipedia" />
                                                    <span>Descripción del Proyecto</span>
                                                </div>
                                                <Row className="g-2">
                                                    <Col sm={12}>
                                                        <Form.Group>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={1}
                                                                placeholder="Describe los detalles de tu proyecto..."
                                                                value={formData.descripcion}
                                                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col sm={12}>
                                                        <Form.Group className="mb-0">
                                                            <Form.Label className="form-label-sm-tesipedia mb-0">Documentos de Apoyo</Form.Label>
                                                            <Form.Control type="file" multiple onChange={handleFileChange} className="mt-0" />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>

                                        <Col lg={6}>
                                            <div className="form-section-tesipedia">
                                                <div className="section-header-tesipedia">
                                                    <FaFileAlt className="section-icon-tesipedia" />
                                                    <span>Información de Contacto</span>
                                                </div>
                                                <Row className="g-2">
                                                    <Col sm={6}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia mb-0">Nombre</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Nombre completo"
                                                                value={formData.nombre}
                                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col sm={6}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia mb-0">Email</Form.Label>
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
                                                            <Form.Label className="form-label-sm-tesipedia mb-0">Teléfono</Form.Label>
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
                                    <Row className="mt-1">
                                        <Col className="d-flex justify-content-center">
                                            <Button
                                                type="submit"
                                                className="custom-button-tesipedia"
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

                        {success && (
                            <Row className="justify-content-center">
                                <Col lg={10}>
                                    <Card className="payment-options-card-tesipedia" id="payment-section">
                                        <Card.Body>
                                            <Row>
                                                <Col md={7}>
                                                    <div className="payment-summary-section-tesipedia">
                                                        <h4 className="section-title-tesipedia">
                                                            <FaCalculator className="section-icon-tesipedia" />
                                                            Resumen de tu Inversión
                                                        </h4>

                                                        <div className="price-breakdown-tesipedia">
                                                            <div className="price-item-tesipedia base">
                                                                <div className="item-info-tesipedia">
                                                                    <h5>Inversión Base</h5>
                                                                    <p>Precio estándar del servicio</p>
                                                                </div>
                                                                <div className="price-tesipedia">${formatPrice(Math.round(estimatedPrice))}</div>
                                                            </div>

                                                            {getUrgencyInfo() && (
                                                                <div className="price-item-tesipedia urgency">
                                                                    <div className="item-info-tesipedia">
                                                                        <h5>Servicio Premium de Entrega Prioritaria</h5>
                                                                        <p>{getUrgencyInfo().message}</p>
                                                                    </div>
                                                                    <div className="price-tesipedia">+${formatPrice(Math.round(estimatedPrice - estimatedPrice / (getUrgencyInfo().multiplier || 1)))}</div>
                                                                </div>
                                                            )}

                                                            <div className="price-item-tesipedia savings">
                                                                <div className="item-info-tesipedia">
                                                                    <h5>Descuento en Efectivo</h5>
                                                                    <p>10% de descuento en pago con efectivo</p>
                                                                </div>
                                                                <div className="price-tesipedia savings">-${formatPrice(Math.round(estimatedPrice * 0.1))}</div>
                                                            </div>

                                                            <div className="total-section-tesipedia">
                                                                <div className="total-header-tesipedia">
                                                                    <h4>Total Final</h4>
                                                                    <div className="savings-badge-tesipedia">
                                                                        <FaStar className="star-icon-tesipedia" />
                                                                        ¡Ahorra ${formatPrice(Math.round(estimatedPrice * 0.1))} hoy!
                                                                    </div>
                                                                </div>
                                                                <div className="total-amount-tesipedia">
                                                                    <div className="original-price-tesipedia">${formatPrice(estimatedPrice)}</div>
                                                                    <div className="final-price-tesipedia">${formatPrice(Math.round(estimatedPrice * 0.9))}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col md={5}>
                                                    <div className="payment-methods-section-tesipedia">
                                                        <h4 className="section-title-tesipedia">
                                                            <FaCreditCard className="section-icon-tesipedia" />
                                                            Métodos de Pago
                                                        </h4>

                                                        <div className="payment-methods-list-tesipedia">
                                                            <div className="payment-method-item-tesipedia card">
                                                                <h5>Tarjeta de Crédito/Débito</h5>
                                                                <p>Pago seguro procesado por Stripe</p>
                                                                <div className="card-logos-tesipedia">
                                                                    <img src={visaLogo} alt="Visa" className="card-logo-tesipedia" />
                                                                    <img src={mastercardLogo} alt="Mastercard" className="card-logo-tesipedia" />
                                                                    <img src={amexLogo} alt="American Express" className="card-logo-tesipedia" />
                                                                </div>
                                                            </div>

                                                            <div className="payment-method-item-tesipedia transfer">
                                                                <div className="discount-badge-tesipedia">10% OFF</div>
                                                                <h5>Transferencia Bancaria</h5>
                                                                <p>Transferencia directa con descuento especial</p>
                                                                <div className="savings-info-tesipedia">
                                                                    <FaMoneyBillWave className="savings-icon-tesipedia" />
                                                                    <span>Ahorra ${formatPrice(Math.round(estimatedPrice * 0.1))}</span>
                                                                </div>
                                                            </div>

                                                            <div className="payment-method-item-tesipedia cash">
                                                                <div className="discount-badge-tesipedia">10% OFF</div>
                                                                <h5>Retiro sin Tarjeta</h5>
                                                                <p>Pago en efectivo con descuento especial</p>
                                                                <div className="savings-info-tesipedia">
                                                                    <FaMoneyBillWave className="savings-icon-tesipedia" />
                                                                    <span>Ahorra ${formatPrice(Math.round(estimatedPrice * 0.1))}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button className="proceed-payment-button-tesipedia">
                                                            <span>Proceder al Pago</span>
                                                            <FaLock className="lock-icon-tesipedia" />
                                                        </button>

                                                        <div className="security-badge-tesipedia">
                                                            <FaShieldAlt className="shield-icon-tesipedia" />
                                                            <span>Pagos 100% Seguros y Verificados</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

export default Quote;

