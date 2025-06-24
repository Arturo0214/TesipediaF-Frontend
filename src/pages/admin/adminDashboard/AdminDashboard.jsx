import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Tooltip, Accordion } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaMoneyBillWave, FaChartLine, FaComments, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import './AdminDashboard.css';
import { addNotification } from '../../../features/notifications/notificationSlice';
import { connectSocket, onSocketEvent } from '../../../services/socket/socketService';

const AdminDashboard = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Selectores de la store
  const users = useSelector(state => state.users.users || []);
  const usersLoading = useSelector(state => state.users.loading);
  const visits = useSelector(state => state.visits.visits || []);
  const visitsLoading = useSelector(state => state.visits.loading);
  const quotes = useSelector(state => state.quotes.quotes || []);
  const quotesLoading = useSelector(state => state.quotes.loading);
  const messages = useSelector(state => state.chat.messages || []);
  const messagesLoading = useSelector(state => state.chat.loading);
  const payments = useSelector(state => state.payments.payments || state.payments.paymentHistory || []);
  const authUser = useSelector(state => state.auth.user);

  const dispatch = useDispatch();

  // Función para obtener datos de la última semana
  const getLastWeekData = (data) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return data.filter(item => {
      const itemDate = new Date(item.createdAt || item.date || Date.now());
      return itemDate >= oneWeekAgo;
    });
  };

  // Cálculos
  const activeUsers = users.filter(u => u.isActive).length;
  const visitsCount = visits.length;
  const quotesCount = quotes.length;
  const messagesCount = messages.length;
  const paymentsCount = payments.length;

  // Datos de la última semana
  const lastWeekUsers = getLastWeekData(users);
  const lastWeekVisits = getLastWeekData(visits);
  const lastWeekQuotes = getLastWeekData(quotes);
  const lastWeekMessages = getLastWeekData(messages);
  const lastWeekPayments = getLastWeekData(payments);

  // Cards principales con colores únicos
  const cards = [
    {
      id: 'users',
      title: 'Usuarios activos',
      value: usersLoading ? <Spinner size="sm" /> : activeUsers,
      icon: <FaUsers />,
      iconClass: 'icon-users',
      color: '#4CAF50',
      legend: 'Usuarios con acceso a la plataforma',
      lastWeekData: lastWeekUsers,
      lastWeekCount: lastWeekUsers.length,
    },
    {
      id: 'visits',
      title: 'Visitas',
      value: visitsLoading ? <Spinner size="sm" /> : visitsCount,
      icon: <FaChartLine />,
      iconClass: 'icon-visits',
      color: '#2196F3',
      legend: 'Visitas registradas en la plataforma',
      lastWeekData: lastWeekVisits,
      lastWeekCount: lastWeekVisits.length,
    },
    {
      id: 'quotes',
      title: 'Cotizaciones',
      value: quotesLoading ? <Spinner size="sm" /> : quotesCount,
      icon: <FaFileAlt />,
      iconClass: 'icon-quotes',
      color: '#FF9800',
      legend: 'Solicitudes de cotización recibidas',
      lastWeekData: lastWeekQuotes,
      lastWeekCount: lastWeekQuotes.length,
    },
    {
      id: 'messages',
      title: 'Mensajes',
      value: messagesLoading ? <Spinner size="sm" /> : messagesCount,
      icon: <FaComments />,
      iconClass: 'icon-messages',
      color: '#9C27B0',
      legend: 'Mensajes internos y de clientes',
      lastWeekData: lastWeekMessages,
      lastWeekCount: lastWeekMessages.length,
    },
    {
      id: 'payments',
      title: 'Pagos',
      value: <Spinner size="sm" />,
      icon: <FaMoneyBillWave />,
      iconClass: 'icon-payments',
      color: '#F44336',
      legend: 'Pagos procesados en la plataforma',
      lastWeekData: lastWeekPayments,
      lastWeekCount: lastWeekPayments.length,
    }
  ];

  const handleCardClick = (cardId) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  const renderAccordionList = (items, getTitle, getDetails, color) => (
    <Accordion className="dashboard-detail-accordion" activeKey={expandedRow} alwaysOpen>
      {items.map((item, idx) => (
        <Accordion.Item eventKey={String(idx)} key={idx} style={{ '--accordion-color': color }}>
          <Accordion.Header
            onClick={() => setExpandedRow(expandedRow === String(idx) ? null : String(idx))}
          >
            {getTitle(item)}
          </Accordion.Header>
          <Accordion.Body>
            {getDetails(item)}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );

  const renderDetailData = (card) => {
    if (!card) return null;
    // Usuarios
    if (card.id === 'users') {
      const usersToShow = card.lastWeekData.length > 0 ? card.lastWeekData.slice(0, 10) : users.slice(0, 10);
      return (
        <section className="dashboard-detail-section-users" style={{ borderTop: `4px solid ${card.color}` }}>
          <h2 className="dashboard-detail-title">Usuarios activos y nuevos</h2>
          <div className="dashboard-detail-metrics">
            <div><strong>Total activos:</strong> {card.value}</div>
            <div><strong>Nuevos esta semana:</strong> {card.lastWeekCount}</div>
          </div>
          <h4 className="dashboard-detail-subtitle">{card.lastWeekData.length > 0 ? 'Nuevos usuarios de la semana' : 'Primeros usuarios'}</h4>
          {renderAccordionList(
            usersToShow,
            (user) => (
              <>
                {user.name || user.email} <span className={user.isActive ? 'active' : 'inactive'}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
              </>
            ),
            (user) => (
              <>
                <div><b>Email:</b> {user.email}</div>
                <div><b>Rol:</b> {user.role}</div>
                <div><b>Estado:</b> {user.isActive ? 'Activo' : 'Inactivo'}</div>
                <div><b>Fecha de registro:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</div>
              </>
            ),
            card.color
          )}
        </section>
      );
    }
    // Visitas
    if (card.id === 'visits') {
      const visitsToShow = card.lastWeekData.length > 0 ? card.lastWeekData.slice(0, 10) : visits.slice(0, 10);
      return (
        <section className="dashboard-detail-section-visits" style={{ borderTop: `4px solid ${card.color}` }}>
          <h2 className="dashboard-detail-title">Visitas recientes</h2>
          <div className="dashboard-detail-metrics">
            <div><strong>Total visitas:</strong> {card.value}</div>
            <div><strong>Esta semana:</strong> {card.lastWeekCount}</div>
          </div>
          <h4 className="dashboard-detail-subtitle">{card.lastWeekData.length > 0 ? 'Visitas de la semana' : 'Primeras visitas'}</h4>
          {renderAccordionList(
            visitsToShow,
            (visit) => (
              <>
                {visit.ip || visit.location || 'Visita'} <span>{new Date(visit.createdAt || visit.date).toLocaleString()}</span>
              </>
            ),
            (visit) => (
              <>
                <div><b>IP:</b> {visit.ip}</div>
                <div><b>Ubicación:</b> {visit.location || '-'}</div>
                <div><b>Fecha:</b> {visit.createdAt ? new Date(visit.createdAt).toLocaleString() : '-'}</div>
              </>
            ),
            card.color
          )}
        </section>
      );
    }
    // Cotizaciones
    if (card.id === 'quotes') {
      const quotesToShow = card.lastWeekData.length > 0 ? card.lastWeekData.slice(0, 10) : quotes.slice(0, 10);
      return (
        <section className="dashboard-detail-section-quotes" style={{ borderTop: `4px solid ${card.color}` }}>
          <h2 className="dashboard-detail-title">Cotizaciones</h2>
          <div className="dashboard-detail-metrics">
            <div><strong>Total cotizaciones:</strong> {card.value}</div>
            <div><strong>Esta semana:</strong> {card.lastWeekCount}</div>
          </div>
          <h4 className="dashboard-detail-subtitle">{card.lastWeekData.length > 0 ? 'Cotizaciones de la semana' : 'Primeras cotizaciones'}</h4>
          {renderAccordionList(
            quotesToShow,
            (quote) => (
              <>
                {quote.title || quote.description || 'Cotización'} <span>{quote.status}</span>
              </>
            ),
            (quote) => (
              <>
                <div><b>Descripción:</b> {quote.description}</div>
                <div><b>Estado:</b> {quote.status}</div>
                <div><b>Fecha:</b> {quote.createdAt ? new Date(quote.createdAt).toLocaleString() : '-'}</div>
              </>
            ),
            card.color
          )}
        </section>
      );
    }
    // Mensajes
    if (card.id === 'messages') {
      const messagesToShow = card.lastWeekData.length > 0 ? card.lastWeekData.slice(0, 10) : messages.slice(0, 10);
      return (
        <section className="dashboard-detail-section-messages" style={{ borderTop: `4px solid ${card.color}` }}>
          <h2 className="dashboard-detail-title">Mensajes</h2>
          <div className="dashboard-detail-metrics">
            <div><strong>Total mensajes:</strong> {card.value}</div>
            <div><strong>Esta semana:</strong> {card.lastWeekCount}</div>
          </div>
          <h4 className="dashboard-detail-subtitle">{card.lastWeekData.length > 0 ? 'Mensajes de la semana' : 'Primeros mensajes'}</h4>
          {renderAccordionList(
            messagesToShow,
            (msg) => (
              <>
                {msg.content?.substring(0, 60) || 'Mensaje'} <span>{msg.user?.name || msg.user?.email || ''}</span>
              </>
            ),
            (msg) => (
              <>
                <div><b>Contenido:</b> {msg.content}</div>
                <div><b>Usuario:</b> {msg.user?.name || msg.user?.email || '-'}</div>
                <div><b>Fecha:</b> {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '-'}</div>
              </>
            ),
            card.color
          )}
        </section>
      );
    }
    // Pagos
    if (card.id === 'payments') {
      const paymentsToShow = card.lastWeekData.length > 0 ? card.lastWeekData.slice(0, 10) : payments.slice(0, 10);
      return (
        <section className="dashboard-detail-section-payments" style={{ borderTop: `4px solid ${card.color}` }}>
          <h2 className="dashboard-detail-title">Pagos</h2>
          <div className="dashboard-detail-metrics">
            <div><strong>Total pagos:</strong> {card.value}</div>
            <div><strong>Esta semana:</strong> {card.lastWeekCount}</div>
          </div>
          <h4 className="dashboard-detail-subtitle">{card.lastWeekData.length > 0 ? 'Pagos de la semana' : 'Primeros pagos'}</h4>
          {renderAccordionList(
            paymentsToShow,
            (pay) => (
              <>
                ${pay.amount || pay.total || '0'} <span>{pay.status}</span>
              </>
            ),
            (pay) => (
              <>
                <div><b>Monto:</b> ${pay.amount || pay.total || '0'}</div>
                <div><b>Estado:</b> {pay.status}</div>
                <div><b>Fecha:</b> {pay.createdAt ? new Date(pay.createdAt).toLocaleString() : '-'}</div>
              </>
            ),
            card.color
          )}
        </section>
      );
    }
  };

  // Tooltip de ayuda para métricas
  const renderHelp = (
    <Tooltip id="dashboard-help-tooltip">
      <div style={{ fontSize: '0.98rem' }}>
        <b>¿Qué significa cada métrica?</b><br />
        <b>Usuarios activos:</b> Usuarios con acceso habilitado.<br />
        <b>Visitas:</b> Número de visitas registradas.<br />
        <b>Cotizaciones:</b> Solicitudes de cotización recibidas.<br />
        <b>Mensajes:</b> Mensajes internos y de clientes.<br />
        <b>Pagos:</b> Pagos procesados exitosamente.
      </div>
    </Tooltip>
  );

  return (
    <Container fluid className="admin-dashboard-container py-4" style={{ position: 'relative' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="dashboard-title mb-0">Admin Dashboard</h2>
      </div>

      <Row className="g-3 dashboard-row mb-4 justify-content-center">
        {cards.map((card) => (
          <Col key={card.id} xs={12} sm={6} md={4} lg={2} xl={2} className="dashboard-col">
            <Card
              className={`dashboard-card shadow-sm ${selectedCard === card.id ? 'selected' : ''}`}
              style={{ borderColor: card.color }}
              onClick={() => handleCardClick(card.id)}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center h-100 p-0">
                <div
                  className={`dashboard-icon ${card.iconClass}`}
                  style={{ color: card.color }}
                >
                  {card.icon}
                </div>
                <div className="dashboard-value">{card.value}</div>
                <div className="dashboard-label">{card.title}</div>
                <div className="dashboard-card-legend">{card.legend}</div>
                <div className="dashboard-last-week">
                  <FaCalendarAlt className="me-1" />
                  Última semana: {card.lastWeekCount}
                </div>
              </Card.Body>
              <div className="dashboard-card-colorbar" style={{ background: card.color }}></div>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedCard && (
        renderDetailData({
          ...cards.find(card => card.id === selectedCard),
          detailColor: cards.find(card => card.id === selectedCard)?.color
        })
      )}

      <div className="dashboard-help-block mt-4 text-center">
        <FaInfoCircle className="me-2 text-info" />
        Haz clic en cualquier tarjeta para ver los datos de la última semana. Las métricas se actualizan en tiempo real.
      </div>
    </Container>
  );
};

export default AdminDashboard;
