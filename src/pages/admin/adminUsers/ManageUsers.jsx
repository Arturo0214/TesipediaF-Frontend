import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  clearError,
  clearSuccess
} from '../../../features/auth/userSlice';
import './ManageUsers.css';

function ManageUsers() {
  const dispatch = useDispatch();
  const { users = [], loading = false, error = null, success = false } = useSelector((state) => state.users || {});

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDropdown, setShowEditDropdown] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true
  });

  // Filtros
  const [filters, setFilters] = useState({
    name: '',
    role: '',
    status: ''
  });

  // Usuarios filtrados
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  // Aplicar filtros cuando cambian o cuando se cargan los usuarios
  useEffect(() => {
    if (users.length > 0) {
      let result = [...users];

      // Filtrar por nombre
      if (filters.name) {
        const searchTerm = filters.name.toLowerCase();
        result = result.filter(user =>
          user.name && user.name.toLowerCase().includes(searchTerm)
        );
      }

      // Filtrar por rol
      if (filters.role) {
        result = result.filter(user => user.role === filters.role);
      }

      // Filtrar por estado
      if (filters.status) {
        const isActive = filters.status === 'active';
        result = result.filter(user => user.isActive === isActive);
      }

      setFilteredUsers(result);
    } else {
      setFilteredUsers([]);
    }
  }, [filters, users]);

  const handleEditClick = (user) => {
    if (showEditDropdown === user._id) {
      setShowEditDropdown(null);
      return;
    }

    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      isActive: user.isActive || false
    });
    setShowEditDropdown(user._id);
    setShowDeleteConfirm(null);
  };

  const handleDeleteClick = (user) => {
    if (showDeleteConfirm === user._id) {
      setShowDeleteConfirm(null);
      return;
    }

    setSelectedUser(user);
    setShowDeleteConfirm(user._id);
    setShowEditDropdown(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser?._id) {
      await dispatch(updateUserRole({ id: selectedUser._id, role: formData.role }));
      await dispatch(updateUserStatus({ id: selectedUser._id, isActive: formData.isActive }));
      setShowEditDropdown(null);
      dispatch(fetchUsers());
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser?._id) {
      await dispatch(deleteUser(selectedUser._id));
      setShowDeleteConfirm(null);
      dispatch(fetchUsers());
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cerrar dropdowns cuando se hace clic fuera de ellos
  const handleClickOutside = (e) => {
    if (!e.target.closest('.mu-action-dropdown') && !e.target.closest('.mu-action-button')) {
      setShowEditDropdown(null);
      setShowDeleteConfirm(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container fluid className="mu-manage-users-container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="mu-manage-users-container">
      <h2 className="mu-manage-users-title">Gestión de Usuarios</h2>

      {error && typeof error === 'string' && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible className="admin-alert">
          {error}
        </Alert>
      )}

      {/* Filtros de búsqueda */}
      <div className="mu-filters-container">
        <div className="mu-filter-item">
          <label className="mu-filter-label">Buscar por nombre</label>
          <Form.Control
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Buscar..."
            size="sm"
          />
        </div>
        <div className="mu-filter-item">
          <label className="mu-filter-label">Filtrar por rol</label>
          <Form.Select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            size="sm"
          >
            <option value="">Todos</option>
            <option value="admin">Administrador</option>
            <option value="redactor">Redactor</option>
            <option value="cliente">Cliente</option>
          </Form.Select>
        </div>
        <div className="mu-filter-item">
          <label className="mu-filter-label">Estado</label>
          <Form.Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            size="sm"
          >
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </Form.Select>
        </div>
      </div>

      <div className="mu-table-responsive">
        <Table className="mu-manage-users-table admin-table">
          <thead>
            <tr>
              <th className="mu-col-id">ID</th>
              <th className="mu-col-name">Nombre</th>
              <th className="mu-col-email">Email</th>
              <th className="mu-col-role">Rol</th>
              <th className="mu-col-status">Estado</th>
              <th className="mu-col-date">Fecha registro</th>
              <th className="mu-col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody style={{ position: 'relative' }}>
            {Array.isArray(filteredUsers) && filteredUsers.map(user => (
              <tr key={user._id}>
                <td className="mu-col-id">{user._id || 'N/A'}</td>
                <td className="mu-col-name">{user.name || 'N/A'}</td>
                <td className="mu-col-email">{user.email || 'N/A'}</td>
                <td className="mu-col-role">{user.role || 'N/A'}</td>
                <td className="mu-col-status">
                  <span className={`mu-user-status ${user.isActive ? 'mu-status-active' : 'mu-status-inactive'}`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="mu-col-date">
                  <span className="mu-join-date">{formatDate(user.createdAt)}</span>
                </td>
                <td className="mu-col-actions" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="mu-action-buttons">
                    <Button
                      className="mu-action-button mu-edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(user);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      className="mu-action-button mu-delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(user);
                      }}
                    >
                      Eliminar
                    </Button>

                    {/* Edit Dropdown */}
                    {showEditDropdown === user._id && (
                      <div
                        className="mu-action-dropdown mu-edit-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mu-dropdown-header">
                          <h6>Editar Usuario</h6>
                          <Button
                            variant="link"
                            className="mu-close-dropdown"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEditDropdown(null);
                            }}
                          >
                            &times;
                          </Button>
                        </div>
                        <Form onSubmit={handleEditSubmit}>
                          <div className="mu-dropdown-body">
                            <Form.Group className="mb-2">
                              <Form.Label>Nombre</Form.Label>
                              <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                disabled
                                size="sm"
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                size="sm"
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <Form.Label>Rol</Form.Label>
                              <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                size="sm"
                              >
                                <option value="admin">Administrador</option>
                                <option value="redactor">Redactor</option>
                                <option value="cliente">Cliente</option>
                              </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <Form.Check
                                type="checkbox"
                                name="isActive"
                                label="Usuario Activo"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                              />
                            </Form.Group>
                          </div>
                          <div className="mu-dropdown-footer">
                            <Button variant="secondary" size="sm" onClick={() => setShowEditDropdown(null)}>
                              Cancelar
                            </Button>
                            <Button variant="primary" type="submit" size="sm">
                              Guardar
                            </Button>
                          </div>
                        </Form>
                      </div>
                    )}

                    {/* Delete Confirmation Dropdown */}
                    {showDeleteConfirm === user._id && (
                      <div
                        className="mu-action-dropdown mu-delete-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mu-dropdown-header">
                          <h6>Confirmar Eliminación</h6>
                          <Button
                            variant="link"
                            className="mu-close-dropdown"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(null);
                            }}
                          >
                            &times;
                          </Button>
                        </div>
                        <div className="mu-dropdown-body">
                          <p>¿Estás seguro de que deseas eliminar al usuario {user.name || ''}?</p>
                        </div>
                        <div className="mu-dropdown-footer">
                          <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(null)}>
                            Cancelar
                          </Button>
                          <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}

export default ManageUsers;
