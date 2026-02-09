import React from 'react';
import { motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import { FaShieldAlt, FaKey, FaHandHoldingHeart, FaUserLock, FaEnvelopeOpenText } from 'react-icons/fa';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="privacy-page-wrapper"
        >
            <Container className="privacy-card">
                <div className="text-center mb-4">
                    <FaShieldAlt className="display-6 text-primary mb-2" />
                    <h1 className="privacy-title">Privacidad y Confidencialidad</h1>
                    <p className="privacy-subtitle mb-3">Protegemos tu información con los estándares más altos.</p>
                </div>

                <div className="row g-3 justify-content-center">
                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaKey className="privacy-section-icon" /> Datos que Recopilamos</h4>
                        <p className="privacy-text">
                            Solo datos de contacto y académicos. <strong>Nunca almacenamos datos bancarios.</strong>
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaUserLock className="privacy-section-icon" /> Uso Académico</h4>
                        <p className="privacy-text">
                            Uso exclusivo para el desarrollo de tu tesis. Garantizamos <strong>confidencialidad total</strong>.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaHandHoldingHeart className="privacy-section-icon" /> Sin Terceros</h4>
                        <p className="privacy-text">
                            <strong>No vendemos tus datos.</strong> Información estrictamente confidencial y disponible únicamente para ti.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h4 className="privacy-section-title"><FaEnvelopeOpenText className="privacy-section-icon" /> Tus Derechos</h4>
                        <p className="privacy-text">
                            Acceso, corrección o eliminación de tus datos en cualquier momento.
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
    );
};

export default PrivacyPolicy;
