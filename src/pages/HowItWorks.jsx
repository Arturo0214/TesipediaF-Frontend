import { Container, Row, Col } from 'react-bootstrap';
import { FaClipboardList, FaCreditCard, FaUserGraduate, FaCheckCircle } from 'react-icons/fa';

function HowItWorks() {
  const steps = [
    {
      icon: <FaClipboardList />,
      title: 'Cotiza tu Tesis',
      description: 'Llena el formulario con los detalles de tu proyecto y recibe una cotización personalizada.'
    },
    {
      icon: <FaCreditCard />,
      title: 'Realiza el Pago',
      description: 'Elige el método de pago que prefieras y asegura tu proyecto.'
    },
    {
      icon: <FaUserGraduate />,
      title: 'Seguimiento',
      description: 'Mantente en contacto con tu asesor y recibe actualizaciones periódicas.'
    },
    {
      icon: <FaCheckCircle />,
      title: 'Recibe tu Tesis',
      description: 'Obtén tu trabajo completo y listo para presentar.'
    }
  ];

  return (
    <div className="page-container">
      <Container className="section-padding">
        <h1 className="text-center mb-5">¿Cómo Funciona?</h1>
        <Row className="g-4">
          {steps.map((step, index) => (
            <Col key={index} md={6} lg={3}>
              <div className="text-center process-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon mb-3">
                  {step.icon}
                </div>
                <h3 className="h5">{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default HowItWorks;
