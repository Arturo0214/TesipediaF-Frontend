import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import {
    FaGraduationCap,
    FaFileAlt,
    FaArrowRight,
    FaCreditCard,
    FaMoneyBillWave,
    FaShieldAlt,
    FaCalculator,
    FaLock,
    FaStar,
    FaComments,
    FaWhatsapp,
    FaExclamationTriangle
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { createQuote, resetQuoteState, updateQuote, updatePublicQuote } from '../../features/quotes/quoteSlice';
import { parsePhoneNumber } from 'libphonenumber-js';
import './Quote.css';
import ChatPanel from '../../components/chat/ChatPanel';
import QuotePublicPaymentModal from '../../components/modals/QuotePublicPaymentModal';
import GuestPaymentModal from '../../components/modals/GuestPaymentModal';
import Swal from 'sweetalert2';

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
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);

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

        // Validar que tenga entre 8 y 15 dígitos (estándar internacional)
        if (cleanPhone.length < 8 || cleanPhone.length > 15) {
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

    const handleFormChange = (field, value) => {
        setFormData({ ...formData, [field]: value });

        // Marcar que hay cambios pendientes si estamos en modo edición
        if (isEditing) {
            setPendingChanges(true);

            // Mostrar notificación con SweetAlert2 solo una vez
            if (!window.pendingChangesNotified) {
                window.pendingChangesNotified = true;

                Swal.fire({
                    title: 'Cambios pendientes',
                    text: 'Has realizado cambios en la cotización. Presiona "Modificar Cotización" para aplicar los cambios y actualizar el precio.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#3085d6',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 5000,
                    timerProgressBar: true
                });
            }
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo permitir números
        if (value.length <= 10) { // Limitar a 10 dígitos
            handleFormChange('telefono', value);
        }
    };

    const handleAreaChange = (e) => {
        const newArea = e.target.value;
        // Actualizar el área de estudio y limpiar los campos relacionados
        setFormData({
            ...formData,
            areaEstudio: newArea,
            carrera: '',
            otraCarrera: ''
        });

        // Marcar que hay cambios pendientes si estamos en modo edición
        if (isEditing) {
            setPendingChanges(true);
        }
    };

    const handleCarreraChange = (e) => {
        const newCarrera = e.target.value;
        // Actualizar la carrera y limpiar el campo de otra carrera
        setFormData({
            ...formData,
            carrera: newCarrera,
            otraCarrera: ''
        });

        // Marcar que hay cambios pendientes si estamos en modo edición
        if (isEditing) {
            setPendingChanges(true);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, archivos: Array.from(e.target.files) });
        if (isEditing) {
            setPendingChanges(true);
        }
    };

    // Load quote from Redux state on initial mount
    useEffect(() => {
        if (quote) {
            setFormData({
                tipoTesis: quote.taskType || '',
                nivelAcademico: quote.educationLevel || '',
                tema: quote.taskTitle || '',
                areaEstudio: quote.studyArea || '',
                carrera: quote.career || '',
                otraCarrera: '', // Assuming 'otraCarrera' is not saved in the quote object
                numPaginas: quote.pages || '',
                fechaEntrega: quote.dueDate ? quote.dueDate.split('T')[0] : '',
                descripcion: quote.requirements?.text || '', // Adjusted to match potential structure
                archivos: [], // Files are generally not persisted
                nombre: quote.name || '',
                email: quote.email || '',
                codigoPais: quote.phone ? (quote.phone.startsWith('+') ? quote.phone.match(/^\+\d{1,3}/)?.[0] : '+52') : '+52', // More robust parsing
                telefono: quote.phone
                    ? quote.phone.replace(/^\+\d{1,3}/, '').replace(/\D/g, '').slice(0, 10)
                    : ''
            });
            setEstimatedPrice(quote.estimatedPrice || 0);
            setIsEditing(true); // If a quote exists, we are in editing mode
        }
        // Do not reset form if quote is null, allowing initial state
    }, [quote]); // Re-run whenever the quote object changes

    // Manejo de modales
    const handleShowPaymentModal = () => {
        // Ensure quote and its ID exist before showing the modal
        const currentQuote = quote;
        if (!currentQuote) {
            console.error("Error: Intento de mostrar modal de pago sin cotización válida.", quote);
            alert("No se puede proceder al pago. Falta información de la cotización.");
            return;
        }
        setShowPaymentModal(true);
    };

    const handleGuestPaymentOption = () => {
        const currentQuote = quote;

        if (!currentQuote || (!currentQuote.estimatedPrice && !currentQuote.taskTitle)) {
            console.error("Error: Intento de mostrar modal de invitado sin cotización válida.", quote);
            alert("No se puede proceder al pago como invitado. Falta información de la cotización.");
            setShowPaymentModal(false);
            return;
        }

        setShowPaymentModal(false);
        setShowGuestModal(true); // ✅ Aquí ahora sí se abre
    };

    // Helper function for smooth scrolling to an element by ID
    const scrollToElement = (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 10,
                behavior: 'smooth'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Determine if we are updating or creating
        const currentQuoteId = isEditing ? quote?._id : null;
        const currentPublicId = isEditing ? quote?.publicId : null;

        if (isEditing && !currentQuoteId && !currentPublicId) {
            alert("Error: No se encontró el ID de la cotización para modificar. Intenta de nuevo.");
            console.error("Attempted to update quote but quote ID is missing", quote);
            return;
        }

        try {
            if (isEditing) {
                // --- UPDATE LOGIC --- 
                const updatedData = {
                    taskType: formData.tipoTesis,
                    educationLevel: formData.nivelAcademico,
                    taskTitle: formData.tema,
                    studyArea: formData.areaEstudio,
                    career: formData.carrera === 'Otro' ? formData.otraCarrera : formData.carrera,
                    pages: formData.numPaginas,
                    dueDate: formData.fechaEntrega,
                    requirements: { // Assuming requirements is an object with text
                        text: formData.descripcion,
                        // Note: Handling file updates might need separate logic if required
                    },
                    name: formData.nombre,
                    email: formData.email,
                    phone: formData.codigoPais + formData.telefono,
                    // status is likely handled by backend or admin actions, not user update
                };

                let actionResult;

                // Si tenemos publicId, usamos la ruta pública
                if (currentPublicId) {
                    actionResult = await dispatch(updatePublicQuote({ publicId: currentPublicId, updatedData }));
                } else {
                    // Si no, usamos la ruta protegida
                    actionResult = await dispatch(updateQuote({ quoteId: currentQuoteId, updatedData }));
                }

                if ((updateQuote.fulfilled.match(actionResult) || updatePublicQuote.fulfilled.match(actionResult)) && actionResult.payload?._id) {
                    const updatedQuoteData = actionResult.payload;
                    setEstimatedPrice(updatedQuoteData.estimatedPrice || 0); // Update price from response
                    alert("¡Cotización modificada con éxito!");
                    setIsEditing(true); // Remain in editing mode
                    // Optionally scroll or provide other feedback
                    setTimeout(() => {
                        scrollToElement('payment-section');
                    }, 300);
                } else {
                    const errorMessage = actionResult.payload || 'Hubo un problema al modificar la cotización.';
                    console.error('Error al modificar la cotización:', errorMessage, actionResult);
                    alert(typeof errorMessage === 'string' ? errorMessage : "Hubo un problema al modificar la cotización. Por favor, intenta de nuevo.");
                }

            } else {
                // --- CREATE LOGIC --- (Existing logic)
                const formDataToSend = new FormData();
                formDataToSend.append('taskType', formData.tipoTesis);
                formDataToSend.append('educationLevel', formData.nivelAcademico);
                formDataToSend.append('taskTitle', formData.tema);
                formDataToSend.append('studyArea', formData.areaEstudio);
                formDataToSend.append('career', formData.carrera === 'Otro' ? formData.otraCarrera : formData.carrera);
                formDataToSend.append('pages', formData.numPaginas);
                formDataToSend.append('dueDate', formData.fechaEntrega);
                formDataToSend.append('descripcion', formData.descripcion);
                formDataToSend.append('name', formData.nombre);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('phone', formData.codigoPais + formData.telefono);

                if (formData.archivos && formData.archivos.length > 0) {
                    formDataToSend.append('file', formData.archivos[0]);
                }

                const actionResult = await dispatch(createQuote({ formDataToSend, formData }));

                if (createQuote.fulfilled.match(actionResult) && actionResult.payload?.quote?.estimatedPrice !== undefined) {
                    const returnedQuote = actionResult.payload.quote;
                    setEstimatedPrice(returnedQuote.estimatedPrice);
                    setIsEditing(true); // Set to editing mode after creation
                    setTimeout(() => {
                        scrollToElement('payment-section');
                    }, 300);
                } else {
                    const errorMessage = actionResult.payload?.message || actionResult.payload || 'Hubo un problema al crear la cotización.';
                    console.error('Error al crear la cotización o falta estimatedPrice:', errorMessage, actionResult);
                    alert(typeof errorMessage === 'string' ? errorMessage : "Hubo un problema al crear la cotización. Por favor, intenta de nuevo.");
                }
            }
        } catch (error) {
            console.error(`Error en handleSubmit (${isEditing ? 'update' : 'create'}):`, error);
            alert("Hubo un error inesperado al procesar la solicitud. Por favor, verifica los datos e intenta de nuevo.");
        }

        // Al final del manejo exitoso, resetear los cambios pendientes y la bandera de notificación
        setPendingChanges(false);
        window.pendingChangesNotified = false;
    };

    useEffect(() => {
        if (error) {
            dispatch(resetQuoteState());
        }
    }, [error, dispatch]);

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
        if (window.confirm('¿Estás seguro de que deseas crear una nueva cotización? Se perderán los datos actuales.')) {
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
            setIsEditing(false);
            setEstimatedPrice(0);
            setShowPaymentModal(false);
            setShowGuestModal(false);
            setPendingChanges(false);
            window.pendingChangesNotified = false;
            dispatch(resetQuoteState());
        }
    };

    const visaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/visa-svgrepo-com_lpwqqd.svg';
    const mastercardLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/mc_symbol_zpes4d.svg';
    const amexLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/amex-svgrepo-com_m3vtdk.svg';

    const handleChatOpen = () => {
        setIsChatOpen(true);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
    };

    const handleProceedToPayment = () => {
        // First scroll to payment section
        scrollToElement('payment-section');

        // Log data to see what's available
        console.log("Datos disponibles para pago:", {
            quote,
            quoteData: quote?.quote,
            estimatedPrice,
            formData
        });

        // Check for quote data *before* attempting to show modal
        const currentQuote = quote;

        if (!currentQuote) {
            console.error("Error: No hay una cotización válida para proceder al pago", quote);
            alert("Error al cargar los datos de la cotización para el pago. Intenta recargar o crea una nueva cotización.");
            return;
        }

        // Always show payment modal if quote is valid
        handleShowPaymentModal();
    };

    // Agregar este useEffect al inicio del componente
    useEffect(() => {
        // Función para manejar el viewport en dispositivos móviles
        const handleViewport = () => {
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
            } else {
                const meta = document.createElement('meta');
                meta.name = 'viewport';
                meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
                document.head.appendChild(meta);
            }
        };

        handleViewport();

        // Manejar el scroll suavemente sin romper el layout
        const handleScroll = () => {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
                                                            <Form.Select value={formData.nivelAcademico} onChange={(e) => handleFormChange('nivelAcademico', e.target.value)} required>
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
                                                            <Form.Select value={formData.areaEstudio} onChange={handleAreaChange} required>
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
                                                                    <Form.Select value={formData.carrera} onChange={handleCarreraChange} required className="select-scroll-tesipedia">
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
                                                                        <Form.Control type="text" placeholder="Ingresa tu carrera" value={formData.otraCarrera} onChange={(e) => handleFormChange('otraCarrera', e.target.value)} required />
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
                                                            <Form.Control type="text" placeholder="Título de tu tesis" value={formData.tema} onChange={(e) => handleFormChange('tema', e.target.value)} required />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia">Páginas</Form.Label>
                                                            <Form.Control type="number" placeholder="Núm. de páginas" value={formData.numPaginas} onChange={(e) => handleFormChange('numPaginas', e.target.value)} required />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col sm={12}>
                                                        <Form.Group>
                                                            <Form.Label className="form-label-sm-tesipedia">
                                                                Fecha de Entrega
                                                                <span className="ms-2 standard-date-info-tesipedia">
                                                                    <small className="text-primary">
                                                                        Fecha de entrega sin cargo extra: {getStandardDeliveryDate().toLocaleDateString('es-MX')} o posterior
                                                                    </small>
                                                                </span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                value={formData.fechaEntrega}
                                                                onChange={(e) => handleFormChange('fechaEntrega', e.target.value)}
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
                                                                onChange={(e) => handleFormChange('descripcion', e.target.value)}
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
                                                                onChange={(e) => handleFormChange('nombre', e.target.value)}
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
                                                                onChange={(e) => handleFormChange('email', e.target.value)}
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
                                                                    onChange={(e) => handleFormChange('codigoPais', e.target.value)}
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
                                                    backgroundColor: isEditing ? '#2ecc71' : '#3498db',
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
                                                        {isEditing ? 'Modificar Cotización' : 'Cotizar Ahora'}
                                                        <FaArrowRight className="ms-2" />
                                                    </>
                                                )}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Payment section - Always render this, but conditionally show content */}
                        <Row className="justify-content-center mt-4">
                            <Col lg={10}>
                                <Card className="payment-options-card-tesipedia" id="payment-section">
                                    <Card.Body className="p-3">
                                        {success || estimatedPrice > 0 ? (
                                            <Row>
                                                <Col md={6}>
                                                    <div className="payment-summary-section-tesipedia">
                                                        <h4 className="section-title-tesipedia text-center">
                                                            <FaCalculator className="section-icon-tesipedia" />
                                                            Resumen de tu Inversión
                                                        </h4>

                                                        <div className="price-breakdown-tesipedia">
                                                            <div className="price-item-tesipedia base">
                                                                <div className="item-info-tesipedia">
                                                                    <h5>Inversión Base</h5>
                                                                    <p>Precio estándar del servicio</p>
                                                                </div>
                                                                <div className="price-tesipedia">${formatPrice(Math.round(estimatedPrice / (getUrgencyInfo()?.multiplier || 1)))}</div>
                                                            </div>

                                                            {getUrgencyInfo() && (
                                                                <div className="price-item-tesipedia urgency">
                                                                    <div className="item-info-tesipedia">
                                                                        <h5>Servicio Premium de Entrega Prioritaria</h5>
                                                                        <p>{getUrgencyInfo().message}</p>
                                                                    </div>
                                                                    <div className="price-tesipedia">+${formatPrice(Math.round(estimatedPrice - (estimatedPrice / getUrgencyInfo().multiplier)))}</div>
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

                                                        <div className="contact-advisor-section-tesipedia">
                                                            <h4 className="text-center">¿Necesitas ayuda?</h4>
                                                            <p className="text-center">Nuestros asesores están listos para ayudarte</p>
                                                            <div className="contact-buttons-tesipedia">
                                                                <button
                                                                    className="contact-btn-tesipedia contact-btn-chat-tesipedia"
                                                                    onClick={handleChatOpen}
                                                                >
                                                                    <div className="contact-btn-icon-wrapper-tesipedia">
                                                                        <div className="contact-btn-ripple"></div>
                                                                        <FaComments className="contact-btn-icon-tesipedia" />
                                                                    </div>
                                                                    <div className="contact-btn-content-tesipedia">
                                                                        <span className="contact-btn-text-tesipedia">Chat en línea</span>
                                                                        <span className="contact-btn-subtext-tesipedia">Respuesta inmediata</span>
                                                                    </div>
                                                                </button>
                                                                <a
                                                                    href="https://wa.me/525583352096"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="contact-btn-tesipedia contact-btn-whatsapp-tesipedia"
                                                                >
                                                                    <div className="contact-btn-icon-wrapper-tesipedia">
                                                                        <div className="contact-btn-ripple"></div>
                                                                        <FaWhatsapp className="contact-btn-icon-tesipedia" />
                                                                    </div>
                                                                    <div className="contact-btn-content-tesipedia">
                                                                        <span className="contact-btn-text-tesipedia">WhatsApp</span>
                                                                        <span className="contact-btn-subtext-tesipedia">Chat directo</span>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col md={6}>
                                                    <div className="payment-methods-section-tesipedia">
                                                        <h4 className="section-title-tesipedia text-center">
                                                            <FaCreditCard className="section-icon-tesipedia" />
                                                            Métodos de Pago
                                                        </h4>

                                                        <div className="payment-methods-list-tesipedia text-center">
                                                            <div className="payment-method-item-tesipedia card text-center">
                                                                <div className="msi-badge-tesipedia">3-6 MSI</div>
                                                                <div className="payment-method-content-tesipedia text-center">
                                                                    <h5>Tarjeta de Crédito/Débito</h5>
                                                                    <p>Pago seguro procesado por Stripe</p>
                                                                    <div className="card-logos-tesipedia">
                                                                        <img src={visaLogo} alt="Visa" className="card-logo-tesipedia" />
                                                                        <img src={mastercardLogo} alt="Mastercard" className="card-logo-tesipedia" />
                                                                        <img src={amexLogo} alt="American Express" className="card-logo-tesipedia" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="payment-method-item-tesipedia transfer">
                                                                <div className="discount-badge-tesipedia">10% OFF</div>
                                                                <div className="payment-method-content-tesipedia text-center">
                                                                    <h5>Transferencia Bancaria</h5>
                                                                    <p>Transferencia directa con descuento</p>
                                                                    <div className="savings-info-tesipedia">
                                                                        <FaMoneyBillWave className="savings-icon-tesipedia" />
                                                                        <span>Ahorra ${formatPrice(Math.round(estimatedPrice * 0.1))}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="payment-method-item-tesipedia cash">
                                                                <div className="discount-badge-tesipedia">10% OFF</div>
                                                                <div className="payment-method-content-tesipedia text-center">
                                                                    <h5>Retiro sin Tarjeta</h5>
                                                                    <p>Pago en efectivo con descuento</p>
                                                                    <div className="savings-info-tesipedia">
                                                                        <FaMoneyBillWave className="savings-icon-tesipedia" />
                                                                        <span>Ahorra ${formatPrice(Math.round(estimatedPrice * 0.1))}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            className={`proceed-payment-button-tesipedia ${(!quote?._id && !quote?.publicId) ? 'disabled' : ''}`}
                                                            onClick={handleProceedToPayment}
                                                            disabled={!quote?._id && !quote?.publicId}
                                                            title={(!quote?._id && !quote?.publicId) ? "Esperando datos de cotización..." : "Proceder al pago seguro"}
                                                        >
                                                            <div className="proceed-button-shine"></div>
                                                            <div className="proceed-button-content">
                                                                <FaLock />
                                                                <span>Proceder al Pago</span>
                                                            </div>
                                                        </button>

                                                        <div className="security-badge-tesipedia">
                                                            <FaShieldAlt className="shield-icon-tesipedia" />
                                                            <span>Pagos 100% Seguros y Verificados</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        ) : (
                                            <div className="text-center py-4">
                                                <h5>Complete el formulario para recibir una cotización</h5>
                                                <p className="text-muted">Una vez que envíe el formulario, podrá ver las opciones de pago aquí.</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            {isChatOpen && (
                <ChatPanel
                    isOpen={isChatOpen}
                    onClose={handleChatClose}
                    isPublic={true}
                    userId={null}
                    userName="Usuario Anónimo"
                />
            )}

            {/* Modal de pago público */}
            <QuotePublicPaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                quoteData={quote}
                onGuestPayment={handleGuestPaymentOption}
            />

            {/* Only render GuestPaymentModal if showGuestModal is true AND quote.quote exists */}
            {showGuestModal && quote && (
                <GuestPaymentModal
                    show={showGuestModal}
                    onHide={() => setShowGuestModal(false)}
                    quoteData={quote}
                />
            )}
        </Container>
    );
}

export default Quote;

