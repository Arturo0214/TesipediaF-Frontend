import React, { useEffect, useState, useMemo } from 'react';
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
import { toast } from 'react-hot-toast';
import {
  FaUsers, FaUserShield, FaPen, FaUserGraduate, FaUserCheck,
  FaSearch, FaEdit, FaTrash, FaTimes, FaSync, FaChevronLeft, FaChevronRight,
  FaUserTie, FaBan, FaCheckCircle, FaCrown
} from 'react-icons/fa';

const ITEMS_PER_PAGE = 15;

function ManageUsers() {
  const dispatch = useDispatch();
  const { users = [], loading = false, error = null, success = false } = useSelector((state) => state.users || {});
  const { isSuperAdmin } = useSelector((state) => state.auth || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', isActive: true });
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  useEffect(() => {
    if (success) { dispatch(clearSuccess()); }
  }, [success, dispatch]);

  // Summary stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const superadmins = users.filter(u => u.role === 'superadmin').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const redactores = users.filter(u => u.role === 'redactor').length;
    const clientes = users.filter(u => u.role === 'cliente').length;
    return { total, active, superadmins, admins, redactores, clientes };
  }, [users]);

  // Filtered users
  const filtered = useMemo(() => {
    let result = [...users];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
      );
    }
    if (filterRole !== 'all') result = result.filter(u => u.role === filterRole);
    if (filterStatus !== 'all') result = result.filter(u => u.isActive === (filterStatus === 'active'));
    return result;
  }, [users, searchTerm, filterRole, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleEditOpen = (user) => {
    setEditingUser(user);
    setEditForm({ role: user.role, isActive: user.isActive });
    setDeletingUser(null);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      await dispatch(updateUserRole({ id: editingUser._id, role: editForm.role })).unwrap();
      await dispatch(updateUserStatus({ id: editingUser._id, isActive: editForm.isActive })).unwrap();
      toast.success('Usuario actualizado');
      setEditingUser(null);
      dispatch(fetchUsers());
    } catch (err) {
      toast.error(err?.message || 'Error al actualizar');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await dispatch(deleteUser(deletingUser._id)).unwrap();
      toast.success('Usuario eliminado');
      setDeletingUser(null);
      dispatch(fetchUsers());
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar');
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      superadmin: { label: 'Super Admin', cls: 'superadmin', icon: <FaCrown /> },
      admin: { label: 'Admin', cls: 'admin', icon: <FaUserShield /> },
      redactor: { label: 'Redactor', cls: 'redactor', icon: <FaPen /> },
      cliente: { label: 'Cliente', cls: 'cliente', icon: <FaUserGraduate /> },
    };
    const info = map[role] || { label: role, cls: 'cliente', icon: <FaUsers /> };
    return <span className={`mu-badge mu-badge-${info.cls}`}>{info.icon} {info.label}</span>;
  };

  // Check if current user can edit/delete a given user
  const canEditUser = (user) => {
    if (user.role === 'superadmin' && !isSuperAdmin) return false;
    return true;
  };

  const canDeleteUser = (user) => {
    if (user.role === 'superadmin') return false;
    if (user.role === 'admin' && !isSuperAdmin) return false;
    return true;
  };

  if (loading && users.length === 0) {
    return (
      <div className="mu-page">
        <div className="mu-loading"><FaSync className="mu-spinning" /><p>Cargando usuarios...</p></div>
      </div>
    );
  }

  return (
    <div className="mu-page">
      {/* Header */}
      <div className="mu-header">
        <div>
          <h1 className="mu-title">Gestión de Usuarios</h1>
          <span className="mu-subtitle">{filtered.length} usuarios</span>
        </div>
        <button className="mu-refresh-btn" onClick={() => dispatch(fetchUsers())}>
          <FaSync /> Actualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mu-summary">
        <div className="mu-card mu-card-blue">
          <div className="mu-card-icon"><FaUsers /></div>
          <div><p className="mu-card-label">Total Usuarios</p><h2 className="mu-card-value">{stats.total}</h2></div>
        </div>
        <div className="mu-card mu-card-green">
          <div className="mu-card-icon"><FaUserCheck /></div>
          <div><p className="mu-card-label">Activos</p><h2 className="mu-card-value">{stats.active}</h2></div>
        </div>
        <div className="mu-card mu-card-purple">
          <div className="mu-card-icon"><FaUserShield /></div>
          <div><p className="mu-card-label">Admins</p><h2 className="mu-card-value">{stats.admins}</h2></div>
        </div>
        <div className="mu-card mu-card-orange">
          <div className="mu-card-icon"><FaPen /></div>
          <div><p className="mu-card-label">Redactores</p><h2 className="mu-card-value">{stats.redactores}</h2></div>
        </div>
        <div className="mu-card mu-card-teal">
          <div className="mu-card-icon"><FaUserGraduate /></div>
          <div><p className="mu-card-label">Clientes</p><h2 className="mu-card-value">{stats.clientes}</h2></div>
        </div>
      </div>

      {/* Filters */}
      <div className="mu-table-section">
        <div className="mu-filters">
          <div className="mu-search">
            <FaSearch />
            <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}>
            <option value="all">Todos los roles</option>
            {isSuperAdmin && <option value="superadmin">Super Admin</option>}
            <option value="admin">Administradores</option>
            <option value="redactor">Redactores</option>
            <option value="cliente">Clientes</option>
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {/* Table */}
        <div className="mu-table-container">
          <table className="mu-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="mu-user-cell">
                      <div className="mu-user-avatar">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="mu-user-info">
                        <strong>{user.name || 'Sin nombre'}</strong>
                        <small>{user.email || '-'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <span className={`mu-status ${user.isActive ? 'mu-status-active' : 'mu-status-inactive'}`}>
                      {user.isActive ? <><FaCheckCircle /> Activo</> : <><FaBan /> Inactivo</>}
                    </span>
                  </td>
                  <td className="mu-date-cell">{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="mu-actions">
                      {canEditUser(user) && (
                        <button className="mu-action-edit" onClick={() => handleEditOpen(user)} title="Editar">
                          <FaEdit />
                        </button>
                      )}
                      {canDeleteUser(user) && (
                        <button className="mu-action-delete" onClick={() => { setDeletingUser(user); setEditingUser(null); }} title="Eliminar">
                          <FaTrash />
                        </button>
                      )}
                      {!canEditUser(user) && !canDeleteUser(user) && (
                        <span className="mu-badge mu-badge-superadmin" style={{ fontSize: '0.7rem' }}><FaCrown /> Protegido</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="mu-empty">No se encontraron usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mu-pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft /></button>
            <span>Página {currentPage} de {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="mu-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="mu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mu-modal-header">
              <h2>Editar Usuario</h2>
              <button className="mu-modal-close" onClick={() => setEditingUser(null)}><FaTimes /></button>
            </div>
            <div className="mu-modal-body">
              <div className="mu-modal-user-preview">
                <div className="mu-user-avatar lg">{(editingUser.name || 'U').charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{editingUser.name}</strong>
                  <small>{editingUser.email}</small>
                </div>
              </div>
              <div className="mu-form-group">
                <label>Rol</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                  {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                  <option value="admin">Administrador</option>
                  <option value="redactor">Redactor</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
              <div className="mu-form-group">
                <label className="mu-checkbox-label">
                  <input type="checkbox" checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
                  <span>Usuario Activo</span>
                </label>
              </div>
            </div>
            <div className="mu-modal-footer">
              <button className="mu-btn-cancel" onClick={() => setEditingUser(null)}>Cancelar</button>
              <button className="mu-btn-save" onClick={handleEditSave}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <div className="mu-modal-overlay" onClick={() => setDeletingUser(null)}>
          <div className="mu-modal mu-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mu-modal-header mu-modal-header-danger">
              <h2>Confirmar Eliminación</h2>
              <button className="mu-modal-close" onClick={() => setDeletingUser(null)}><FaTimes /></button>
            </div>
            <div className="mu-modal-body">
              <p className="mu-delete-msg">
                ¿Estás seguro de que deseas eliminar al usuario <strong>{deletingUser.name}</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="mu-modal-footer">
              <button className="mu-btn-cancel" onClick={() => setDeletingUser(null)}>Cancelar</button>
              <button className="mu-btn-danger" onClick={handleDeleteConfirm}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {error && typeof error === 'string' && (
        <div className="mu-toast-error" onClick={() => dispatch(clearError())}>{error}</div>
      )}
    </div>
  );
}

export default ManageUsers;
