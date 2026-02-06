import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Collapse } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { FaFilePdf, FaUser, FaListAlt, FaMoneyBillWave, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { generateSalesQuotePDF } from '../../utils/generateSalesQuotePDF';
import { calculateSalesQuotePrice } from '../../features/quotes/quoteSlice';
import './SalesQuote.css';

const SalesQuote = () => {
    const dispatch = useDispatch();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDiscountEditable, setIsDiscountEditable] = useState(false);
    const [isAlcanceOpen, setIsAlcanceOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        tipoTrabajo: '',
        customTipoTrabajo: '',
        tipoServicio: 'completo',
        nivelAcademico: '',
        tituloTrabajo: '',
        area: '',
        carrera: '',
        extensionEstimada: '',
        descripcionServicio: 'El servicio contempla la elaboración integral de la tesina conforme a los lineamientos institucionales aplicables, con acompañamiento académico durante todo el proceso hasta contar con una versión lista para entrega y revisión final.',
        fechaEntrega: (() => {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + 21);
            return fecha.toISOString().split('T')[0];
        })(),
        precioRegular: '',
        descuentoEfectivo: 10,
        esquemaPago: '50% al iniciar el proyecto y 50% al finalizar, previo a la entrega de la versión final del documento.',
        serviciosIncluidos: [
            '1 Escáner antiplagio.',
            '1 Escáner anti-IA.',
            '1 Correcciones de fondo y estilo del asesor y sinodales.',
            '1 Asesoría 1:1 en cuanto se entregue versión preliminar.'
        ],
        beneficiosAdicionales: [],
        ajustesIlimitados: 'Ajustes ilimitados conforme a observaciones del asesor.',
        acompañamientoContinuo: 'Acompañamiento continuo hasta versión final aprobable.',
        asesoria: 'Asesoría 1:1 al realizar la entrega de la versión preliminar.',
        notaAcompañamiento: 'el acompañamiento se da hasta dar por concluida la versión final'
    });

    const areas = [
        'Área 1: Ciencias Físico-Matemáticas y de las Ingenierías',
        'Área 2: Ciencias Biológicas, Químicas y de la Salud',
        'Área 3: Ciencias Sociales',
        'Área 4: Humanidades y Artes'
    ];

    const tiposConRecargo = ['Tesis', 'Tesina', 'Protocolo de Investigación', 'Proyecto de Investigación', 'Monografía', 'Reporte de Investigación'];

    const tiposTrabajo = [
        'Tesis',
        'Tesina',
        'Artículo Científico',
        'Ensayo Académico',
        'Protocolo de Investigación',
        'Proyecto de Investigación',
        'Caso de Estudio',
        'Monografía',
        'Reporte de Investigación',
        'Otro'
    ];

    const nivelesAcademicos = ['Licenciatura', 'Maestría', 'Especialidad', 'Doctorado'];

    const calcularDiasEntrega = () => {
        if (!formData.fechaEntrega) return 21;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaEntrega = new Date(formData.fechaEntrega);
        const diffTime = fechaEntrega - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const obtenerRecargoUrgencia = () => {
        const aplicaRecargo = tiposConRecargo.includes(formData.tipoTrabajo) || formData.tipoTrabajo === 'Otro';
        if (!aplicaRecargo) return { porcentaje: 0, texto: '' };
        const dias = calcularDiasEntrega();
        if (dias < 14) return { porcentaje: 30, texto: 'Recargo por urgencia (menos de 2 semanas): +30%' };
        if (dias < 21) return { porcentaje: 20, texto: 'Recargo por urgencia (menos de 3 semanas): +20%' };
        return { porcentaje: 0, texto: '' };
    };

    const obtenerTextoTiempoEntrega = () => {
        const dias = calcularDiasEntrega();
        if (dias <= 0) return 'Inmediato';
        if (dias === 1) return '1 día';
        if (dias < 7) return `${dias} días`;
        const semanas = Math.ceil(dias / 7);
        return semanas === 1 ? '1 semana' : `${semanas} semanas`;
    };

    const generarDescripcionGeneral = () => {
        const tipoTrabajo = formData.tipoTrabajo === 'Otro' ? formData.customTipoTrabajo : formData.tipoTrabajo;
        if (!tipoTrabajo) return '';
        const tipoTrabajoLower = tipoTrabajo.toLowerCase();
        let descripcion = formData.tipoServicio === 'correccion' ? `Corrección de ${tipoTrabajoLower}` : `Elaboración de ${tipoTrabajoLower}`;
        if (formData.tituloTrabajo && formData.tituloTrabajo.trim()) descripcion += ` titulada "${formData.tituloTrabajo}"`;
        if (formData.extensionEstimada && parseFloat(formData.extensionEstimada) > 0) descripcion += ` de ${formData.extensionEstimada} páginas (aproximadamente)`;
        if (formData.area) descripcion += ` del ${formData.area}`;
        if (formData.carrera && formData.carrera.trim()) descripcion += ` para la carrera de ${formData.carrera}`;
        descripcion += '.';

        // Agregar descripción detallada del servicio
        if (formData.tipoServicio === 'correccion') {
            descripcion += ' Incluye revisión de fondo y forma, atención a observaciones del asesor y ajustes necesarios para aprobación final.';
        } else {
            // Para todos los tipos de trabajo en modo completo
            descripcion += ' El servicio contempla la elaboración integral conforme a los lineamientos institucionales aplicables, con acompañamiento académico durante todo el proceso hasta contar con una versión lista para entrega y revisión final.';
        }
        return descripcion;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleServicioChange = (index, value) => {
        const newServicios = [...formData.serviciosIncluidos];
        newServicios[index] = value;
        setFormData(prev => ({ ...prev, serviciosIncluidos: newServicios }));
    };

    const addServicio = () => {
        setFormData(prev => ({ ...prev, serviciosIncluidos: [...prev.serviciosIncluidos, ''] }));
    };

    const removeServicio = (index) => {
        const newServicios = formData.serviciosIncluidos.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, serviciosIncluidos: newServicios }));
    };

    const handleBeneficioChange = (index, value) => {
        const newBeneficios = [...formData.beneficiosAdicionales];
        newBeneficios[index] = value;
        setFormData(prev => ({ ...prev, beneficiosAdicionales: newBeneficios }));
    };

    const addBeneficio = () => {
        setFormData(prev => ({ ...prev, beneficiosAdicionales: [...prev.beneficiosAdicionales, ''] }));
    };

    const removeBeneficio = (index) => {
        const newBeneficios = formData.beneficiosAdicionales.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, beneficiosAdicionales: newBeneficios }));
    };

    useEffect(() => {
        const nuevaDescripcion = generarDescripcionGeneral();
        if (nuevaDescripcion && nuevaDescripcion !== formData.descripcionServicio) {
            setFormData(prev => ({ ...prev, descripcionServicio: nuevaDescripcion }));
        }
    }, [formData.tipoTrabajo, formData.customTipoTrabajo, formData.tipoServicio, formData.tituloTrabajo, formData.extensionEstimada, formData.area, formData.carrera]);

    const calculatePriceFromBackend = async () => {
        if (!formData.nivelAcademico || !formData.area || !formData.extensionEstimada || parseFloat(formData.extensionEstimada) <= 0) return;
        try {
            const tipoTrabajoFinal = formData.tipoTrabajo === 'Otro' ? formData.customTipoTrabajo : formData.tipoTrabajo;
            // console.log('Calculando precio para:', { tipo: tipoTrabajoFinal, area: formData.area, nivel: formData.nivelAcademico });
            const result = await dispatch(calculateSalesQuotePrice({
                educationLevel: formData.nivelAcademico,
                studyArea: formData.area,
                pages: formData.extensionEstimada,
                serviceType: formData.tipoServicio,
                taskType: tipoTrabajoFinal
            })).unwrap();
            if (result.success && result.pricing) {
                setFormData(prev => ({ ...prev, precioRegular: result.pricing.totalPrice.toString() }));
            }
        } catch (error) {
            console.error('Error al calcular precio:', error);
        }
    };

    useEffect(() => {
        calculatePriceFromBackend();
    }, [formData.nivelAcademico, formData.area, formData.extensionEstimada, formData.tipoServicio, formData.tipoTrabajo, formData.customTipoTrabajo]);

    const calculatePrices = () => {
        const precioBase = parseFloat(formData.precioRegular) || 0;
        const recargo = obtenerRecargoUrgencia();
        const recargoMonto = precioBase * (recargo.porcentaje / 100);
        const precioConRecargo = precioBase + recargoMonto;
        const descuentoPorcentaje = parseFloat(formData.descuentoEfectivo) || 10;
        const descuentoMonto = precioConRecargo * (descuentoPorcentaje / 100);
        const precioConDescuento = precioConRecargo - descuentoMonto;
        return { precioBase, recargoMonto, recargoPorcentaje: recargo.porcentaje, recargoTexto: recargo.texto, precioConRecargo, descuentoMonto, precioConDescuento };
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
    };

    const handleGeneratePDF = async () => {
        if (!formData.clientName.trim()) {
            Swal.fire({ title: 'Campo requerido', text: 'Por favor ingresa el nombre del cliente', icon: 'warning' });
            return;
        }
        if (!formData.tipoTrabajo) {
            Swal.fire({ title: 'Campo requerido', text: 'Por favor selecciona el tipo de trabajo', icon: 'warning' });
            return;
        }
        if (formData.tipoTrabajo === 'Otro' && !formData.customTipoTrabajo.trim()) {
            Swal.fire({ title: 'Campo requerido', text: 'Por favor especifica el tipo de trabajo', icon: 'warning' });
            return;
        }
        if (!formData.extensionEstimada || parseFloat(formData.extensionEstimada) <= 0) {
            Swal.fire({ title: 'Campo requerido', text: 'Por favor ingresa un número válido de páginas', icon: 'warning' });
            return;
        }
        if (!formData.nivelAcademico) {
            Swal.fire({ title: 'Campo requerido', text: 'Por favor selecciona el nivel académico', icon: 'warning' });
            return;
        }
        if (!formData.carrera || !formData.carrera.trim()) {
            Swal.fire({ title: 'Campo requerido', text: 'Por favor ingresa la carrera', icon: 'warning' });
            return;
        }
        if (!formData.precioRegular || parseFloat(formData.precioRegular) <= 0) {
            Swal.fire({ title: 'Campo requerido', text: 'Por favor ingresa el precio del servicio', icon: 'warning' });
            return;
        }

        setIsGenerating(true);
        try {
            const tipoTrabajoFinal = formData.tipoTrabajo === 'Otro' ? formData.customTipoTrabajo : formData.tipoTrabajo;
            const tipoTrabajoParaPDF = formData.tipoServicio === 'correccion' ? `Corrección de ${tipoTrabajoFinal.toLowerCase()}` : tipoTrabajoFinal;
            const prices = calculatePrices();
            const quoteData = {
                clientName: formData.clientName,
                tipoTrabajo: tipoTrabajoParaPDF,
                tipoServicio: formData.tipoServicio,
                tituloTrabajo: formData.tituloTrabajo,
                area: formData.area,
                carrera: formData.carrera,
                extensionEstimada: formData.extensionEstimada,
                descripcionServicio: formData.descripcionServicio,
                tiempoEntrega: obtenerTextoTiempoEntrega(),
                fechaEntrega: formData.fechaEntrega ? new Date(formData.fechaEntrega).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : '',
                precioBase: prices.precioBase,
                recargoMonto: prices.recargoMonto,
                recargoPorcentaje: prices.recargoPorcentaje,
                recargoTexto: prices.recargoTexto,
                precioConRecargo: prices.precioConRecargo,
                descuentoEfectivo: formData.descuentoEfectivo,
                descuentoMonto: prices.descuentoMonto,
                precioConDescuento: prices.precioConDescuento,
                esquemaPago: formData.esquemaPago,
                serviciosIncluidos: formData.serviciosIncluidos.filter(s => s.trim() !== ''),
                beneficiosAdicionales: formData.beneficiosAdicionales.filter(b => b.trim() !== ''),
                ajustesIlimitados: formData.ajustesIlimitados,
                acompañamientoContinuo: formData.acompañamientoContinuo,
                asesoria: formData.asesoria,
                notaAcompañamiento: formData.notaAcompañamiento
            };
            await generateSalesQuotePDF(quoteData);
            Swal.fire({ title: '¡PDF Generado!', text: 'La cotización ha sido descargada exitosamente.', icon: 'success', timer: 3000, timerProgressBar: true });
        } catch (error) {
            console.error('Error al generar PDF:', error);
            Swal.fire({ title: 'Error', text: 'Hubo un error al generar el PDF. Por favor, intente de nuevo.', icon: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    const prices = calculatePrices();

    return (
        <Container fluid className="sales-quote-container">
            <Row className="justify-content-center h-100">
                <Col lg={11} xl={10}>
                    <Card className="sales-quote-card">
                        <Card.Body className="p-3">
                            <div className="text-center mb-2">
                                <h5 className="mb-1 fw-bold text-primary">
                                    <FaFilePdf className="me-2" />Generador de Cotizaciones
                                </h5>
                            </div>

                            <Form>
                                <Row className="g-3">
                                    {/* COLUMNA IZQUIERDA */}
                                    <Col md={6}>
                                        {/* Cliente y Proyecto */}
                                        <div className="form-section">
                                            <div className="section-title"><FaUser className="me-1" /> Cliente y Proyecto</div>
                                            <Row className="g-2">
                                                <Col xs={12}>
                                                    <Form.Control size="sm" type="text" placeholder="Cliente *" value={formData.clientName} onChange={(e) => handleInputChange('clientName', e.target.value)} />
                                                </Col>
                                                <Col xs={6}>
                                                    <Form.Select size="sm" value={formData.tipoTrabajo} onChange={(e) => handleInputChange('tipoTrabajo', e.target.value)}>
                                                        <option value="">Tipo *</option>
                                                        {tiposTrabajo.map((tipo) => (<option key={tipo} value={tipo}>{tipo}</option>))}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={6}>
                                                    <Form.Select size="sm" value={formData.nivelAcademico} onChange={(e) => handleInputChange('nivelAcademico', e.target.value)}>
                                                        <option value="">Nivel *</option>
                                                        {nivelesAcademicos.map((nivel) => (<option key={nivel} value={nivel}>{nivel}</option>))}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={12}>
                                                    <Form.Select size="sm" value={formData.area} onChange={(e) => handleInputChange('area', e.target.value)}>
                                                        <option value="">Área</option>
                                                        {areas.map((area) => (<option key={area} value={area}>{area}</option>))}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={8}>
                                                    <Form.Control size="sm" type="text" placeholder="Carrera *" value={formData.carrera} onChange={(e) => handleInputChange('carrera', e.target.value)} />
                                                </Col>
                                                <Col xs={4}>
                                                    <Form.Control size="sm" type="number" placeholder="Págs *" value={formData.extensionEstimada} onChange={(e) => handleInputChange('extensionEstimada', e.target.value)} min="1" />
                                                </Col>
                                                {(formData.tipoTrabajo === 'Tesis' || formData.tipoTrabajo === 'Tesina') && (
                                                    <Col xs={6}>
                                                        <Form.Select size="sm" value={formData.tipoServicio} onChange={(e) => {
                                                            const valor = e.target.value;
                                                            if (valor === 'correccion') {
                                                                setFormData(prev => ({ ...prev, tipoServicio: valor, serviciosIncluidos: ['1 Escáner antiplagio.', '1 Escáner anti-IA.'], beneficiosAdicionales: [] }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, tipoServicio: valor, serviciosIncluidos: ['1 Escáner antiplagio.', '1 Escáner anti-IA.', '1 Correcciones de fondo y estilo del asesor y sinodales.', '1 Asesoría 1:1 en cuanto se entregue versión preliminar.'], beneficiosAdicionales: [] }));
                                                            }
                                                        }}>
                                                            <option value="completo">Completo</option>
                                                            <option value="correccion">Corrección</option>
                                                        </Form.Select>
                                                    </Col>
                                                )}
                                                {formData.tipoTrabajo === 'Otro' && (
                                                    <Col xs={6}>
                                                        <Form.Control size="sm" type="text" placeholder="Especificar..." value={formData.customTipoTrabajo} onChange={(e) => handleInputChange('customTipoTrabajo', e.target.value)} />
                                                    </Col>
                                                )}
                                                <Col xs={12}>
                                                    <Form.Control size="sm" type="text" placeholder="Título del Trabajo" value={formData.tituloTrabajo} onChange={(e) => handleInputChange('tituloTrabajo', e.target.value)} />
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Alcance (Colapsable) */}
                                        <div className="form-section flex-shrink-0">
                                            <div
                                                className="section-title d-flex justify-content-between align-items-center mb-0"
                                                onClick={() => setIsAlcanceOpen(!isAlcanceOpen)}
                                                style={{ cursor: 'pointer', borderBottom: isAlcanceOpen ? '1px solid #e2e8f0' : 'none' }}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <FaListAlt className="me-2" /> Alcance
                                                </div>
                                                <div className="text-muted d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                                                    {!isAlcanceOpen && <span className="me-2 fw-normal opacity-75">Click para editar</span>}
                                                    {isAlcanceOpen ? <FaChevronUp /> : <FaChevronDown />}
                                                </div>
                                            </div>

                                            {!isAlcanceOpen && (
                                                <div className="mt-2 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {formData.descripcionServicio}
                                                </div>
                                            )}

                                            <Collapse in={isAlcanceOpen}>
                                                <div className="mt-3">
                                                    <div className="mb-2">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <div className="micro-label">Descripción</div>
                                                        </div>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            className="form-control-sm bg-light"
                                                            style={{ fontSize: '0.75rem' }}
                                                            value={formData.descripcionServicio}
                                                            readOnly
                                                        />
                                                    </div>

                                                    <div className="mb-2">
                                                        <div className="micro-label">Servicios Incluidos</div>
                                                        <div className="services-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                            {formData.serviciosIncluidos.map((servicio, index) => (
                                                                <div key={index} className="d-flex mb-1 gap-1">
                                                                    <Form.Control
                                                                        type="text"
                                                                        size="sm"
                                                                        value={servicio}
                                                                        onChange={(e) => handleServicioChange(index, e.target.value)}
                                                                        className="flex-grow-1"
                                                                    />
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        className="btn-micro"
                                                                        onClick={() => removeServicio(index)}
                                                                        tabIndex="-1"
                                                                    >
                                                                        &times;
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <a href="#" className="micro-btn mt-1 d-inline-block" onClick={(e) => { e.preventDefault(); addServicio(); }}>
                                                            + Servicio
                                                        </a>
                                                    </div>

                                                    <div>
                                                        <div className="micro-label">Beneficios</div>
                                                        <div className="services-list" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                                            {formData.beneficiosAdicionales.map((beneficio, index) => (
                                                                <div key={index} className="d-flex mb-1 gap-1">
                                                                    <Form.Control
                                                                        type="text"
                                                                        size="sm"
                                                                        value={beneficio}
                                                                        onChange={(e) => handleBeneficioChange(index, e.target.value)}
                                                                        className="flex-grow-1"
                                                                    />
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        className="btn-micro"
                                                                        onClick={() => removeBeneficio(index)}
                                                                        tabIndex="-1"
                                                                    >
                                                                        &times;
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <a href="#" className="micro-btn mt-1 d-inline-block" onClick={(e) => { e.preventDefault(); addBeneficio(); }}>
                                                            + Beneficio
                                                        </a>
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>
                                    </Col>

                                    {/* COLUMNA DERECHA */}
                                    <Col md={6}>
                                        {/* Inversión y Entrega */}
                                        <div className="form-section">
                                            <div className="section-title"><FaMoneyBillWave className="me-1" /> Inversión y Entrega</div>
                                            <Row className="g-2">
                                                <Col xs={6}>
                                                    <div className="micro-label">Precio Base (auto)</div>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text">$</span>
                                                        <Form.Control type="number" value={formData.precioRegular} disabled className="bg-light" />
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="micro-label">Descuento (%)</div>
                                                    <div className="d-flex gap-1">
                                                        <div className="input-group input-group-sm flex-grow-1">
                                                            <Form.Control type="number" value={formData.descuentoEfectivo} onChange={(e) => handleInputChange('descuentoEfectivo', e.target.value)} min="0" max="100" disabled={!isDiscountEditable} className={!isDiscountEditable ? 'bg-light' : ''} />
                                                            <span className="input-group-text">%</span>
                                                        </div>
                                                        <Button variant={isDiscountEditable ? "success" : "outline-secondary"} size="sm" onClick={() => setIsDiscountEditable(!isDiscountEditable)} style={{ padding: '0 0.4rem' }}>
                                                            {isDiscountEditable ? '✓' : '✏️'}
                                                        </Button>
                                                    </div>
                                                </Col>
                                                <Col xs={8}>
                                                    <div className="micro-label">Fecha Entrega</div>
                                                    <Form.Control size="sm" type="date" value={formData.fechaEntrega} onChange={(e) => handleInputChange('fechaEntrega', e.target.value)} />
                                                    <div style={{ fontSize: '0.65rem' }} className="text-muted mt-1">
                                                        {obtenerTextoTiempoEntrega()} ({calcularDiasEntrega()}d)
                                                        {obtenerRecargoUrgencia().porcentaje > 0 && <span className="text-warning"> ⚠️+{obtenerRecargoUrgencia().porcentaje}%</span>}
                                                    </div>
                                                </Col>
                                                <Col xs={12}>
                                                    <div className="micro-label">Esquema de Pago</div>
                                                    <Form.Control size="sm" as="textarea" rows={2} value={formData.esquemaPago} onChange={(e) => handleInputChange('esquemaPago', e.target.value)} style={{ fontSize: '0.75rem' }} />
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Resumen de Precios */}
                                        {formData.precioRegular && (
                                            <div className="price-summary mt-2">
                                                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                                                    <span>Base:</span>
                                                    <strong>${formatPrice(prices.precioBase)}</strong>
                                                </div>
                                                {prices.recargoPorcentaje > 0 && (
                                                    <div className="d-flex justify-content-between mb-1 text-warning" style={{ fontSize: '0.75rem' }}>
                                                        <span>Urgencia (+{prices.recargoPorcentaje}%):</span>
                                                        <strong>+${formatPrice(prices.recargoMonto)}</strong>
                                                    </div>
                                                )}
                                                <div className="d-flex justify-content-between mb-1 text-success" style={{ fontSize: '0.75rem' }}>
                                                    <span>Desc ({formData.descuentoEfectivo}%):</span>
                                                    <strong>-${formatPrice(prices.descuentoMonto)}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between pt-2 border-top" style={{ fontSize: '0.9rem' }}>
                                                    <strong>Total:</strong>
                                                    <strong className="text-primary fs-5">${formatPrice(prices.precioConDescuento)} MXN</strong>
                                                </div>
                                            </div>
                                        )}

                                        {/* Botón Generar */}
                                        <div className="mt-3">
                                            <Button className="w-100 generate-pdf-btn" onClick={handleGeneratePDF} disabled={isGenerating}>
                                                {isGenerating ? (<><Spinner size="sm" className="me-2" />Generando...</>) : (<><FaFilePdf className="me-2" />Generar PDF</>)}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SalesQuote;
