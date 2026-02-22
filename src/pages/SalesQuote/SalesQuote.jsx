import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Collapse } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { FaFilePdf, FaUser, FaListAlt, FaMoneyBillWave, FaCreditCard, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { generateSalesQuotePDF } from '../../utils/generateSalesQuotePDF';
import { calculateSalesQuotePrice, saveGeneratedQuote } from '../../features/quotes/quoteSlice';
import './SalesQuote.css';

const SalesQuote = () => {
    const dispatch = useDispatch();
    const [isGenerating, setIsGenerating] = useState(false);
    const priceRequestId = useRef(0);
    const [isDiscountEditable, setIsDiscountEditable] = useState(false);
    const [isPriceEditable, setIsPriceEditable] = useState(false);
    const manualPriceLocked = useRef(false);
    const manualDiscountLocked = useRef(false);
    const [isAlcanceOpen, setIsAlcanceOpen] = useState(false);
    const [metodoPago, setMetodoPago] = useState('efectivo'); // 'efectivo' o 'tarjeta'
    const [formData, setFormData] = useState({
        clientName: '',
        tipoTrabajo: '',
        customTipoTrabajo: '',
        tipoServicio: 'modalidad1', // modalidad1 (100%), modalidad2 (75%), correccion (50%)
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
        esquemaTipo: '50-50', // '50-50' o '33-33-34'
        fechaPago1: new Date().toISOString().split('T')[0],
        fechaAvance: (() => {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + 14);
            return fecha.toISOString().split('T')[0];
        })(),
        serviciosIncluidos: [
            '1 Escáner antiplagio.',
            '1 Escáner anti-IA.',
            '1 Correcciones de fondo y estilo del asesor y sinodales.',
            '1 Asesoría 1:1 en cuanto se entregue versión preliminar.'
        ],
        beneficiosAdicionales: [], // Array de objetos: { descripcion: string, costo: number }
        ajustesIlimitados: 'Ajustes ilimitados conforme a observaciones del asesor.',
        acompañamientoContinuo: 'Acompañamiento continuo hasta versión final aprobable.',
        asesoria: 'Asesoría 1:1 al realizar la entrega de la versión preliminar.',
        notaAcompañamiento: 'el acompañamiento se da hasta dar por concluida la versión final',
        fechasPagos: []
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
        // Determinar el nombre profesional del servicio
        let nombreServicio = '';
        let preposicion = 'de';
        if (formData.tipoServicio === 'correccion') {
            nombreServicio = 'Servicio de Corrección y Revisión';
        } else if (formData.tipoServicio === 'modalidad2') {
            nombreServicio = 'Servicio de Acompañamiento Académico';
            preposicion = 'para';
        } else {
            nombreServicio = 'Servicio Integral de Elaboración';
        }

        let descripcion = `${nombreServicio} ${preposicion} ${tipoTrabajoLower}`;
        if (formData.tituloTrabajo && formData.tituloTrabajo.trim()) descripcion += ` titulada "${formData.tituloTrabajo}"`;
        if (formData.extensionEstimada && parseFloat(formData.extensionEstimada) > 0) descripcion += ` de ${formData.extensionEstimada} páginas (aproximadamente)`;
        if (formData.area) descripcion += ` del ${formData.area}`;
        if (formData.carrera && formData.carrera.trim()) descripcion += ` para la carrera de ${formData.carrera}`;
        descripcion += '.';

        // Agregar descripción detallada del servicio según modalidad
        if (formData.tipoServicio === 'correccion') {
            descripcion += ' Incluye revisión de fondo y forma, atención a observaciones del asesor y ajustes necesarios para aprobación final.';
        } else if (formData.tipoServicio === 'modalidad2') {
            descripcion += ' El servicio incluye acompañamiento académico continuo, revisión de avances, retroalimentación especializada y apoyo en el desarrollo del trabajo conforme a lineamientos institucionales.';
        } else {
            // Modalidad 1 - Servicio Integral
            descripcion += ' El servicio contempla la elaboración integral conforme a los lineamientos institucionales aplicables, con acompañamiento académico durante todo el proceso hasta contar con una versión lista para entrega y revisión final.';
        }
        return descripcion;
    };

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const generarTextoEsquemaPago = () => {
        const prices = calculatePrices();
        const total = prices.precioConDescuento;
        const fmt = (v) => '$' + new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

        if (formData.esquemaTipo === '33-33-34') {
            const pago1 = Math.round(total * 0.33 * 100) / 100;
            const pago2 = Math.round(total * 0.33 * 100) / 100;
            const pago3 = Math.round((total - pago1 - pago2) * 100) / 100;
            return `33% (${fmt(pago1)}) al iniciar el proyecto (${formatDateForDisplay(formData.fechaPago1)}), 33% (${fmt(pago2)}) al entregar avance (${formatDateForDisplay(formData.fechaAvance)}) y 34% (${fmt(pago3)}) al finalizar (${formatDateForDisplay(formData.fechaEntrega)}), previo a la entrega de la versión final del documento.`;
        } else if (formData.esquemaTipo === '6-quincenales' || formData.esquemaTipo === '6-mensuales') {
            const numPagos = 6;
            const montoPago = Math.round((total / numPagos) * 100) / 100;
            // Ajustar el último pago para que cuadre el centavo
            const ultimoPago = Math.round((total - (montoPago * (numPagos - 1))) * 100) / 100;

            let texto = `Esquema de ${numPagos} pagos ${formData.esquemaTipo === '6-quincenales' ? 'quincenales' : 'mensuales'}: `;

            const fechas = formData.fechasPagos.length === 6 ? formData.fechasPagos : Array(6).fill(new Date().toISOString().split('T')[0]);

            const pagosTexto = fechas.map((fecha, index) => {
                const monto = index === 5 ? ultimoPago : montoPago;
                return `Pago ${index + 1}: ${fmt(monto)} (${formatDateForDisplay(fecha)})`;
            }).join(', ');

            return texto + pagosTexto + '.';
        }

        const mitad = Math.round(total * 0.50 * 100) / 100;
        const mitad2 = Math.round((total - mitad) * 100) / 100;
        return `50% (${fmt(mitad)}) al iniciar el proyecto (${formatDateForDisplay(formData.fechaPago1)}) y 50% (${fmt(mitad2)}) al finalizar (${formatDateForDisplay(formData.fechaEntrega)}), previo a la entrega de la versión final del documento.`;
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

    const handleBeneficioChange = (index, field, value) => {
        const newBeneficios = [...formData.beneficiosAdicionales];
        if (typeof newBeneficios[index] === 'string') {
            // Migrar de string a objeto si es necesario
            newBeneficios[index] = { descripcion: newBeneficios[index], costo: 0 };
        }
        newBeneficios[index] = { ...newBeneficios[index], [field]: value };
        setFormData(prev => ({ ...prev, beneficiosAdicionales: newBeneficios }));
    };

    const addBeneficio = () => {
        setFormData(prev => ({ ...prev, beneficiosAdicionales: [...prev.beneficiosAdicionales, { descripcion: '', costo: 0 }] }));
    };

    const removeBeneficio = (index) => {
        const newBeneficios = formData.beneficiosAdicionales.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, beneficiosAdicionales: newBeneficios }));
    };

    const handleEsquemaChange = (e) => {
        const tipo = e.target.value;
        let updates = { esquemaTipo: tipo };

        if (tipo === '6-quincenales' || tipo === '6-mensuales') {
            const start = new Date(formData.fechaPago1 || new Date());
            const dates = [];
            for (let i = 0; i < 6; i++) {
                const d = new Date(start);
                // Si es la primera fecha, usamos la fecha de inicio tal cual
                // Para las siguientes, sumamos 15 días o 1 mes respectivamente
                if (i > 0) {
                    if (tipo === '6-quincenales') {
                        d.setDate(d.getDate() + (i * 15));
                    } else {
                        d.setMonth(d.getMonth() + i);
                    }
                }
                dates.push(d.toISOString().split('T')[0]);
            }
            updates.fechasPagos = dates;
        }

        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleFechaPagoChange = (index, value) => {
        const newFechas = [...formData.fechasPagos];
        newFechas[index] = value;
        setFormData(prev => ({ ...prev, fechasPagos: newFechas }));
    };

    useEffect(() => {
        const nuevaDescripcion = generarDescripcionGeneral();
        if (nuevaDescripcion && nuevaDescripcion !== formData.descripcionServicio) {
            setFormData(prev => ({ ...prev, descripcionServicio: nuevaDescripcion }));
        }
    }, [formData.tipoTrabajo, formData.customTipoTrabajo, formData.tipoServicio, formData.tituloTrabajo, formData.extensionEstimada, formData.area, formData.carrera]);

    useEffect(() => {
        if (isPriceEditable || manualPriceLocked.current) return; // No auto-calcular si el precio está en modo edición manual o fue confirmado manualmente
        if (!formData.nivelAcademico || !formData.area || !formData.extensionEstimada || parseFloat(formData.extensionEstimada) <= 0) return;

        // Incrementar ID para invalidar llamadas anteriores
        priceRequestId.current += 1;
        const currentRequestId = priceRequestId.current;

        const timer = setTimeout(async () => {
            try {
                const tipoTrabajoFinal = formData.tipoTrabajo === 'Otro' ? formData.customTipoTrabajo : formData.tipoTrabajo;
                const result = await dispatch(calculateSalesQuotePrice({
                    educationLevel: formData.nivelAcademico,
                    studyArea: formData.area,
                    pages: formData.extensionEstimada,
                    serviceType: formData.tipoServicio,
                    taskType: tipoTrabajoFinal
                })).unwrap();
                // Solo actualizar si esta es la petición más reciente
                if (currentRequestId === priceRequestId.current && result.success && result.pricing) {
                    setFormData(prev => ({ ...prev, precioRegular: result.pricing.totalPrice.toString() }));
                }
            } catch (error) {
                console.error('Error al calcular precio:', error);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [formData.nivelAcademico, formData.area, formData.extensionEstimada, formData.tipoServicio, formData.tipoTrabajo, formData.customTipoTrabajo, isPriceEditable]);

    const calculatePrices = () => {
        const precioBase = parseFloat(formData.precioRegular) || 0;
        const recargo = obtenerRecargoUrgencia();
        const recargoMonto = precioBase * (recargo.porcentaje / 100);
        // Sumar costos de beneficios adicionales
        const costoBeneficios = formData.beneficiosAdicionales.reduce((total, beneficio) => {
            const costo = typeof beneficio === 'object' ? (parseFloat(beneficio.costo) || 0) : 0;
            return total + costo;
        }, 0);
        const precioConRecargo = precioBase + recargoMonto + costoBeneficios;
        // Permitir descuento de 0% - usar isNaN en lugar de || para evitar que 0 sea tratado como falsy
        const descuentoValue = parseFloat(formData.descuentoEfectivo);
        const descuentoPorcentaje = isNaN(descuentoValue) ? 10 : descuentoValue;
        const descuentoMonto = precioConRecargo * (descuentoPorcentaje / 100);
        const precioConDescuento = precioConRecargo - descuentoMonto;
        return { precioBase, recargoMonto, recargoPorcentaje: recargo.porcentaje, recargoTexto: recargo.texto, costoBeneficios, precioConRecargo, descuentoMonto, precioConDescuento };
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
                esquemaPago: generarTextoEsquemaPago(),
                serviciosIncluidos: formData.serviciosIncluidos.filter(s => s.trim() !== ''),
                beneficiosAdicionales: formData.beneficiosAdicionales.filter(b => {
                    if (typeof b === 'object') {
                        return b.descripcion && b.descripcion.trim() !== '';
                    }
                    return b.trim() !== '';
                }),
                ajustesIlimitados: formData.ajustesIlimitados,
                acompañamientoContinuo: formData.acompañamientoContinuo,
                asesoria: formData.asesoria,
                notaAcompañamiento: formData.notaAcompañamiento,
                metodoPago: metodoPago
            };
            // 💾 Guardar datos en el backend (sin bloquear la generación del PDF)
            dispatch(saveGeneratedQuote(quoteData))
                .unwrap()
                .then((res) => console.log('Cotización guardada:', res))
                .catch((err) => {
                    console.error('Error al guardar cotización:', err);
                    Swal.fire({
                        title: 'Advertencia',
                        text: 'La cotización se generó pero no se pudo guardar en el sistema. Por favor contacte al administrador si el problema persiste.',
                        icon: 'warning'
                    });
                });

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
                                {/* Toggle Método de Pago */}
                                <div className="payment-method-toggle mt-2">
                                    <button
                                        type="button"
                                        className={`pmt-btn ${metodoPago === 'efectivo' ? 'pmt-btn-active pmt-btn-efectivo' : ''}`}
                                        onClick={() => {
                                            setMetodoPago('efectivo');
                                            if (!manualDiscountLocked.current) {
                                                setFormData(prev => ({ ...prev, descuentoEfectivo: 10 }));
                                                setIsDiscountEditable(false);
                                            }
                                        }}
                                    >
                                        <FaMoneyBillWave className="me-1" /> Efectivo
                                    </button>
                                    <button
                                        type="button"
                                        className={`pmt-btn ${metodoPago === 'tarjeta-nu' ? 'pmt-btn-active pmt-btn-tarjeta' : ''}`}
                                        onClick={() => {
                                            setMetodoPago('tarjeta-nu');
                                            if (!manualDiscountLocked.current) {
                                                setFormData(prev => ({ ...prev, descuentoEfectivo: 0 }));
                                                setIsDiscountEditable(false);
                                            }
                                        }}
                                    >
                                        <FaCreditCard className="me-1" /> Tarjeta NU
                                    </button>
                                    <button
                                        type="button"
                                        className={`pmt-btn ${metodoPago === 'tarjeta-bbva' ? 'pmt-btn-active pmt-btn-bbva' : ''}`}
                                        onClick={() => {
                                            setMetodoPago('tarjeta-bbva');
                                            if (!manualDiscountLocked.current) {
                                                setFormData(prev => ({ ...prev, descuentoEfectivo: 0 }));
                                                setIsDiscountEditable(false);
                                            }
                                        }}
                                    >
                                        <FaCreditCard className="me-1" /> Tarjeta BBVA
                                    </button>
                                </div>
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
                                                    <div className="micro-label">Cliente *</div>
                                                    <Form.Control size="sm" type="text" placeholder="Nombre del cliente" value={formData.clientName} onChange={(e) => handleInputChange('clientName', e.target.value)} />
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="micro-label">Tipo de Trabajo *</div>
                                                    <Form.Select size="sm" value={formData.tipoTrabajo} onChange={(e) => handleInputChange('tipoTrabajo', e.target.value)}>
                                                        <option value="">Seleccionar...</option>
                                                        {tiposTrabajo.map((tipo) => (<option key={tipo} value={tipo}>{tipo}</option>))}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="micro-label">Nivel Académico *</div>
                                                    <Form.Select size="sm" value={formData.nivelAcademico} onChange={(e) => handleInputChange('nivelAcademico', e.target.value)}>
                                                        <option value="">Seleccionar...</option>
                                                        {nivelesAcademicos.map((nivel) => (<option key={nivel} value={nivel}>{nivel}</option>))}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={12}>
                                                    <div className="micro-label">Área de Estudio</div>
                                                    <Form.Select size="sm" value={formData.area} onChange={(e) => handleInputChange('area', e.target.value)}>
                                                        <option value="">Seleccionar...</option>
                                                        {areas.map((area) => (<option key={area} value={area}>{area}</option>))}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={8}>
                                                    <div className="micro-label">Carrera *</div>
                                                    <Form.Control size="sm" type="text" placeholder="Nombre de la carrera" value={formData.carrera} onChange={(e) => handleInputChange('carrera', e.target.value)} />
                                                </Col>
                                                <Col xs={4}>
                                                    <div className="micro-label">Páginas *</div>
                                                    <Form.Control size="sm" type="number" placeholder="Cant." value={formData.extensionEstimada} onChange={(e) => handleInputChange('extensionEstimada', e.target.value)} min="1" />
                                                </Col>
                                                {/* Selector de Tipo de Servicio - 3 Modalidades */}
                                                <Col xs={6}>
                                                    <div className="micro-label">Tipo de Servicio</div>
                                                    <Form.Select size="sm" value={formData.tipoServicio} onChange={(e) => {
                                                        const valor = e.target.value;
                                                        if (valor === 'correccion') {
                                                            setFormData(prev => ({ ...prev, tipoServicio: valor, serviciosIncluidos: ['1 Escáner antiplagio.', '1 Escáner anti-IA.'], beneficiosAdicionales: [] }));
                                                        } else if (valor === 'modalidad2') {
                                                            setFormData(prev => ({ ...prev, tipoServicio: valor, serviciosIncluidos: ['1 Escáner antiplagio.', '1 Escáner anti-IA.', '1 Acompañamiento continuo.'], beneficiosAdicionales: [] }));
                                                        } else {
                                                            // modalidad1
                                                            setFormData(prev => ({ ...prev, tipoServicio: valor, serviciosIncluidos: ['1 Escáner antiplagio.', '1 Escáner anti-IA.', '1 Correcciones de fondo y estilo del asesor y sinodales.', '1 Asesoría 1:1 en cuanto se entregue versión preliminar.'], beneficiosAdicionales: [] }));
                                                        }
                                                    }}>
                                                        <option value="modalidad1">Modalidad 1 - Hacemos todo (100%)</option>
                                                        <option value="modalidad2">Modalidad 2 - Acompañamiento (75%)</option>
                                                        <option value="correccion">Solo Corrección (50%)</option>
                                                    </Form.Select>
                                                </Col>
                                                {formData.tipoTrabajo === 'Otro' && (
                                                    <Col xs={6}>
                                                        <Form.Control size="sm" type="text" placeholder="Especificar..." value={formData.customTipoTrabajo} onChange={(e) => handleInputChange('customTipoTrabajo', e.target.value)} />
                                                    </Col>
                                                )}
                                                <Col xs={12}>
                                                    <div className="micro-label">Título del Trabajo</div>
                                                    <Form.Control size="sm" type="text" placeholder="Nombre del trabajo" value={formData.tituloTrabajo} onChange={(e) => handleInputChange('tituloTrabajo', e.target.value)} />
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
                                                            {formData.beneficiosAdicionales.map((beneficio, index) => {
                                                                const desc = typeof beneficio === 'object' ? beneficio.descripcion : beneficio;
                                                                const costo = typeof beneficio === 'object' ? beneficio.costo : 0;
                                                                return (
                                                                    <div key={index} className="d-flex mb-1 gap-1">
                                                                        <Form.Control
                                                                            type="text"
                                                                            size="sm"
                                                                            placeholder="Descripción"
                                                                            value={desc}
                                                                            onChange={(e) => handleBeneficioChange(index, 'descripcion', e.target.value)}
                                                                            className="flex-grow-1"
                                                                            style={{ minWidth: '0' }}
                                                                        />
                                                                        <div className="input-group input-group-sm" style={{ width: '90px', flexShrink: 0 }}>
                                                                            <span className="input-group-text" style={{ padding: '0 0.25rem', fontSize: '0.7rem' }}>$</span>
                                                                            <Form.Control
                                                                                type="number"
                                                                                size="sm"
                                                                                placeholder="0"
                                                                                value={costo}
                                                                                onChange={(e) => handleBeneficioChange(index, 'costo', e.target.value)}
                                                                                style={{ fontSize: '0.7rem', padding: '0.25rem' }}
                                                                                min="0"
                                                                            />
                                                                        </div>
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
                                                                );
                                                            })}
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
                                                    <div className="micro-label">{isPriceEditable ? 'Precio (manual)' : 'Precio Base (auto)'}</div>
                                                    <div className="d-flex gap-1">
                                                        <div className="input-group input-group-sm flex-grow-1">
                                                            <span className="input-group-text">$</span>
                                                            <Form.Control
                                                                type="number"
                                                                value={formData.precioRegular}
                                                                onChange={(e) => handleInputChange('precioRegular', e.target.value)}
                                                                disabled={!isPriceEditable}
                                                                className={!isPriceEditable ? 'bg-light' : ''}
                                                                min="0"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant={isPriceEditable ? 'success' : (manualPriceLocked.current ? 'warning' : 'outline-secondary')}
                                                            size="sm"
                                                            onClick={() => {
                                                                if (isPriceEditable) {
                                                                    // Confirmando precio manual: bloquear auto-cálculo
                                                                    manualPriceLocked.current = true;
                                                                    setIsPriceEditable(false);
                                                                } else if (manualPriceLocked.current) {
                                                                    // Desbloquear: volver a auto-cálculo
                                                                    manualPriceLocked.current = false;
                                                                    setIsPriceEditable(false);
                                                                    // Forzar re-cálculo disparando el useEffect
                                                                    setFormData(prev => ({ ...prev }));
                                                                } else {
                                                                    // Entrar a modo edición
                                                                    setIsPriceEditable(true);
                                                                }
                                                            }}
                                                            style={{ padding: '0 0.4rem' }}
                                                            title={isPriceEditable ? 'Confirmar precio manual' : (manualPriceLocked.current ? 'Desbloquear y volver a auto-cálculo' : 'Editar precio manualmente')}
                                                        >
                                                            {isPriceEditable ? '✓' : (manualPriceLocked.current ? '🔒' : '✏️')}
                                                        </Button>
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="micro-label">Descuento (%)</div>
                                                    <div className="d-flex gap-1">
                                                        <div className="input-group input-group-sm flex-grow-1">
                                                            <Form.Control type="number" value={formData.descuentoEfectivo} onChange={(e) => handleInputChange('descuentoEfectivo', e.target.value)} min="0" max="100" disabled={!isDiscountEditable} className={!isDiscountEditable ? 'bg-light' : ''} />
                                                            <span className="input-group-text">%</span>
                                                        </div>
                                                        <Button variant={isDiscountEditable ? "success" : (manualDiscountLocked.current ? 'warning' : 'outline-secondary')} size="sm" onClick={() => {
                                                            if (isDiscountEditable) {
                                                                manualDiscountLocked.current = true;
                                                                setIsDiscountEditable(false);
                                                            } else if (manualDiscountLocked.current) {
                                                                manualDiscountLocked.current = false;
                                                                setIsDiscountEditable(false);
                                                                // Restaurar descuento según método de pago
                                                                const defaultDiscount = metodoPago === 'efectivo' ? 10 : 0;
                                                                setFormData(prev => ({ ...prev, descuentoEfectivo: defaultDiscount }));
                                                            } else {
                                                                setIsDiscountEditable(true);
                                                            }
                                                        }} style={{ padding: '0 0.4rem' }}>
                                                            {isDiscountEditable ? '✓' : (manualDiscountLocked.current ? '🔒' : '✏️')}
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
                                                    <Form.Select size="sm" value={formData.esquemaTipo} onChange={handleEsquemaChange}>
                                                        <option value="50-50">50% inicio / 50% final</option>
                                                        <option value="33-33-34">33% inicio / 33% avance / 34% final</option>
                                                        <option value="6-quincenales">6 Pagos Quincenales</option>
                                                        <option value="6-mensuales">6 Pagos Mensuales</option>
                                                    </Form.Select>
                                                </Col>
                                                {/* Fechas de pago */}
                                                {(formData.esquemaTipo === '6-quincenales' || formData.esquemaTipo === '6-mensuales') ? (
                                                    // Renderizar los 6 inputs
                                                    <>
                                                        {formData.fechasPagos.map((fecha, index) => (
                                                            <Col xs={4} key={index}>
                                                                <div className="micro-label">Pago {index + 1}</div>
                                                                <Form.Control
                                                                    size="sm"
                                                                    type="date"
                                                                    value={fecha}
                                                                    onChange={(e) => handleFechaPagoChange(index, e.target.value)}
                                                                />
                                                            </Col>
                                                        ))}
                                                    </>
                                                ) : (
                                                    // Renderizar esquema original
                                                    <>
                                                        <Col xs={formData.esquemaTipo === '33-33-34' ? 4 : 6}>
                                                            <div className="micro-label">Pago Inicio</div>
                                                            <Form.Control size="sm" type="date" value={formData.fechaPago1} disabled className="bg-light" />
                                                        </Col>
                                                        {formData.esquemaTipo === '33-33-34' && (
                                                            <Col xs={4}>
                                                                <div className="micro-label">Pago Avance</div>
                                                                <Form.Control size="sm" type="date" value={formData.fechaAvance} onChange={(e) => handleInputChange('fechaAvance', e.target.value)} />
                                                            </Col>
                                                        )}
                                                        <Col xs={formData.esquemaTipo === '33-33-34' ? 4 : 6}>
                                                            <div className="micro-label">Pago Final</div>
                                                            <Form.Control size="sm" type="date" value={formData.fechaEntrega} disabled className="bg-light" />
                                                        </Col>
                                                    </>
                                                )}
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
                                                {prices.costoBeneficios > 0 && (
                                                    <div className="d-flex justify-content-between mb-1 text-info" style={{ fontSize: '0.75rem' }}>
                                                        <span>Beneficios adicionales:</span>
                                                        <strong>+${formatPrice(prices.costoBeneficios)}</strong>
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
