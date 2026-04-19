import React from 'react';
import { motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import { FaFileContract, FaCheckCircle, FaBan, FaExclamationTriangle, FaHandshake } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import '../PrivacyPolicy/PrivacyPolicy.css';

const TermsOfService = () => {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com" },
            { "@type": "ListItem", "position": 2, "name": "Términos de Servicio", "item": "https://tesipedia.com/terms" }
        ]
    };

    return (
        <>
        <Helmet>
            <title>Términos y Condiciones de Servicio — Tesipedia</title>
            <meta name="description" content="Conoce los términos y condiciones de servicio de Tesipedia. Asesoría académica profesional con garantía de calidad, confidencialidad y soporte continuo." />
            <meta name="keywords" content="términos de servicio Tesipedia, condiciones asesoría tesis, garantía servicio académico" />
            <meta property="og:title" content="Términos de Servicio — Tesipedia" />
            <meta property="og:description" content="Consulta nuestros términos y condiciones de servicio para asesoría académica profesional." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://tesipedia.com/terms" />
            <meta property="og:locale" content="es_MX" />
            <link rel="canonical" href="https://tesipedia.com/terms" />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        </Helmet>
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="privacy-page-wrapper"
        >
            <Container className="privacy-card">
                <div className="text-center mb-4">
                    <FaFileContract className="display-6 text-primary mb-2" />
                    <h1 className="privacy-title">Términos y Condiciones</h1>
                    <p className="privacy-subtitle mb-3">Condiciones generales de nuestros servicios de asesoría académica.</p>
                </div>

                <div className="row g-3 justify-content-center">
                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaHandshake className="privacy-section-icon" /> Naturaleza del Servicio</h4>
                        <p className="privacy-text">
                            Tesipedia ofrece <strong>asesoría y acompañamiento académico profesional</strong>. Nuestros servicios incluyen orientación metodológica, revisión de estructura, redacción guiada y correcciones conforme a los lineamientos de tu institución. El material entregado es un documento de referencia y apoyo para tu proceso académico.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaCheckCircle className="privacy-section-icon" /> Garantía de Calidad</h4>
                        <p className="privacy-text">
                            Incluimos <strong>correcciones ilimitadas</strong> conforme a observaciones de asesores y sinodales. El acompañamiento se mantiene hasta la aprobación de la versión final. Cada proyecto incluye escáner antiplagio y escáner anti-IA como estándar.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaBan className="privacy-section-icon" /> Pagos y Cancelaciones</h4>
                        <p className="privacy-text">
                            Los pagos se realizan conforme al esquema acordado en la cotización. En caso de cancelación, se retendrá el porcentaje correspondiente al avance realizado. <strong>La cotización tiene vigencia de 24 horas</strong> y está sujeta a disponibilidad de especialistas.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaExclamationTriangle className="privacy-section-icon" /> Responsabilidad del Cliente</h4>
                        <p className="privacy-text">
                            El cliente se compromete a proporcionar información veraz sobre los requisitos de su proyecto. El uso que se dé al material entregado es <strong>responsabilidad exclusiva del cliente</strong>. Tesipedia no se hace responsable del uso indebido del material.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-3 pt-3 border-top">
                    <p className="text-muted small mb-0">
                        Actualizado: {new Date().toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}. Dudas a: <a href="mailto:tesipediaoficial@gmail.com" className="text-decoration-none fw-bold">tesipediaoficial@gmail.com</a>
                    </p>
                </div>
            </Container>
        </motion.div>
        </>
    );
};

export default TermsOfService;
