import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
    return (
        <section className="cta-section py-5">
            <Container className="text-center">
                <h2 className="mb-4">¿Listo para Comenzar tu Tesis?</h2>
                <p className="lead mb-4">
                    No esperes más para dar el siguiente paso en tu carrera académica
                </p>
                <Button
                    as={Link}
                    to="/cotizar"
                    size="lg"
                    className="cta-button"
                >
                    Cotizar Ahora
                </Button>
            </Container>
        </section>
    );
};

export default CTASection;
