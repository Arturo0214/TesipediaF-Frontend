import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
        resetErrorBoundary();
    };

    return (
        <Container className="py-5">
            <div className="text-center mb-4">
                <FaExclamationTriangle size={50} className="text-danger mb-3" />
                <h2>¡Ups! Algo salió mal</h2>
            </div>

            <Alert variant="danger" className="mb-4">
                <Alert.Heading>Error:</Alert.Heading>
                <p>{error.message}</p>
            </Alert>

            <div className="d-flex justify-content-center gap-3">
                <Button
                    variant="primary"
                    onClick={resetErrorBoundary}
                    className="d-flex align-items-center gap-2"
                >
                    <FaRedo /> Intentar de nuevo
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleGoHome}
                    className="d-flex align-items-center gap-2"
                >
                    <FaHome /> Ir al inicio
                </Button>
            </div>
        </Container>
    );
};

export default ErrorFallback; 