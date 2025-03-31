import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaUsers, FaFileAlt, FaMoneyBillWave, FaChartLine, FaQuoteRight } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axios from 'axios';
// Importa tu componente de gráfica aquí
// import IncomeChart from './IncomeChart';

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalWriters, setTotalWriters] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalThesis, setTotalThesis] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`);
        setUsers(usersResponse.data);
        setTotalUsers(usersResponse.data.length);
        setTotalWriters(usersResponse.data.filter(user => user.role === 'writer').length);
        // Aquí puedes agregar lógica para contar nuevos usuarios, cotizaciones, etc.
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container className="py-5">
      <h1 className="mb-4">Panel de Administración</h1>
      <Row className="g-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsers className="display-4 text-primary mb-3" />
              <Card.Title>Usuarios</Card.Title>
              <h3>{totalUsers}</h3>
              <p>{newUsers} Nuevos</p>
              <p>{totalWriters} Escritores</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaFileAlt className="display-4 text-success mb-3" />
              <Card.Title>Tesis</Card.Title>
              <h3>{totalThesis}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaMoneyBillWave className="display-4 text-warning mb-3" />
              <Card.Title>Ingresos</Card.Title>
              <h3>${totalIncome}</h3>
              {/* Aquí puedes incluir el componente de gráfica */}
              {/* <IncomeChart /> */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaChartLine className="display-4 text-info mb-3" />
              <Card.Title>Cotizaciones</Card.Title>
              <h3>{totalQuotes}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaQuoteRight className="display-4 text-secondary mb-3" />
              <Card.Title>Quotes</Card.Title>
              <h3>{totalQuotes}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaChartLine className="display-4 text-info mb-3" />
              <Card.Title>Tipos de Proyectos</Card.Title>
              <h3>{totalProjects}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="mt-5">Lista de Usuarios</h2>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AdminDashboard;
