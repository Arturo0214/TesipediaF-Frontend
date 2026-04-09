import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProjects, updateProjectStatus, updateProgress, addComment } from '../../../features/projects/projectSlice';
import axiosWithAuth from '../../../utils/axioswithAuth';
import projectService from '../../../services/projectService';
import { FaGoogle, FaSearch, FaChevronLeft, FaChevronRight, FaCalendar, FaClock, FaFlag, FaTimes, FaUser, FaFileAlt, FaSync, FaCheckCircle, FaExternalLinkAlt, FaPlus, FaUserPlus, FaUpload, FaTrash, FaDownload, FaCloudUploadAlt, FaHistory, FaComment, FaPaperPlane, FaEdit, FaEye, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ManageProjects.css';

function ManageProjects() {
    const dispatch = useDispatch();
    const { projects } = useSelector((state) => state.projects);

    const [view, setView] = useState('kanban'); // kanban, calendar, list
    const [searchTerm, setSearchTerm] = useState('');
    const [googleConnected, setGoogleConnected] = useState(false);
    const [googleEmail, setGoogleEmail] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [googleEvents, setGoogleEvents] = useState([]);
    const [draggedCard, setDraggedCard] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncingProject, setSyncingProject] = useState(null);
    const [lastSync, setLastSync] = useState(null);
    const [showAddProject, setShowAddProject] = useState(false);
    const [addingProject, setAddingProject] = useState(false);
    const [newProject, setNewProject] = useState({
        taskTitle: '', taskType: 'Tesis', clientName: '', clientEmail: '', clientPhone: '',
        studyArea: '', career: '', educationLevel: 'licenciatura',
        requirements: '', pages: '', dueDate: '', priority: 'medium',
        amount: '', method: 'transferencia', esquemaPago: 'Pago único', paymentDate: new Date().toISOString().slice(0, 10),
    });

    const [creatingClient, setCreatingClient] = useState(null); // project ID being processed
    const [showManualClientForm, setShowManualClientForm] = useState(false);
    const [manualClientData, setManualClientData] = useState({ email: '', password: '' });
    const [uploadingFile, setUploadingFile] = useState(false);
    const [deletingDeliverable, setDeletingDeliverable] = useState(null);
    const fileInputRef = useRef(null);
    const revisionFileRef = useRef(null);

    // Status filter
    const [statusFilter, setStatusFilter] = useState('active'); // 'all' | 'active' | specific status

    // Revision upload
    const [uploadingRevision, setUploadingRevision] = useState(false);
    const [revisionForm, setRevisionForm] = useState({ label: '', type: 'revision', notes: '' });
    const [showRevisionForm, setShowRevisionForm] = useState(false);
    const [updatingRevStatus, setUpdatingRevStatus] = useState(null);
    const [correctionNotes, setCorrectionNotes] = useState('');

    // Detail panel tab
    const [detailTab, setDetailTab] = useState('overview'); // overview | revisions | files | comments

    // Handler para subir archivo entregable
    const handleUploadDeliverable = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedProject) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo no puede superar 10 MB');
            return;
        }
        setUploadingFile(true);
        try {
            const updated = await projectService.uploadDeliverable(selectedProject._id, file);
            setSelectedProject(updated);
            dispatch(getAllProjects());
            toast.success(`Archivo "${file.name}" subido correctamente`);
        } catch (err) {
            toast.error('Error al subir archivo: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Handler para eliminar entregable
    const handleRemoveDeliverable = async (deliverableId, filename) => {
        if (!selectedProject) return;
        setDeletingDeliverable(deliverableId);
        try {
            const updated = await projectService.removeDeliverable(selectedProject._id, deliverableId);
            setSelectedProject(updated);
            dispatch(getAllProjects());
            toast.success(`Archivo "${filename}" eliminado`);
        } catch (err) {
            toast.error('Error al eliminar archivo: ' + (err.response?.data?.message || err.message));
        } finally {
            setDeletingDeliverable(null);
        }
    };

    // Upload revision
    const handleUploadRevision = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedProject) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo no puede superar 10 MB');
            return;
        }
        setUploadingRevision(true);
        try {
            const updated = await projectService.uploadRevision(
                selectedProject._id, file, revisionForm.label, revisionForm.type, revisionForm.notes
            );
            setSelectedProject(updated);
            dispatch(getAllProjects());
            toast.success(`Revisión v${updated.revisions?.length || '?'} subida`);
            setShowRevisionForm(false);
            setRevisionForm({ label: '', type: 'revision', notes: '' });
        } catch (err) {
            toast.error('Error al subir revisión: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingRevision(false);
            if (revisionFileRef.current) revisionFileRef.current.value = '';
        }
    };

    // Update revision status
    const handleUpdateRevisionStatus = async (version, newStatus) => {
        if (!selectedProject) return;
        setUpdatingRevStatus(version);
        try {
            const updated = await projectService.updateRevisionStatus(
                selectedProject._id, version, newStatus,
                newStatus === 'corrections_requested' ? correctionNotes : ''
            );
            setSelectedProject(updated);
            dispatch(getAllProjects());
            toast.success(`Revisión v${version}: ${newStatus.replace(/_/g, ' ')}`);
            setCorrectionNotes('');
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingRevStatus(null);
        }
    };

    // Refresh selected project detail
    const refreshProject = useCallback(async (id) => {
        try {
            const data = await projectService.getProjectById(id);
            setSelectedProject(data);
        } catch (_) {}
    }, []);

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Handler to create client user from project
    const handleCreateClient = async (e, project, manualData = null) => {
        e?.stopPropagation?.();
        if (project.client) {
            toast('Este proyecto ya tiene un usuario cliente vinculado', { icon: '👤' });
            return;
        }
        // Si no tiene email/phone y no se proporcionan datos manuales, pedir formulario
        if (!project.clientEmail && !project.clientPhone && !manualData?.email) {
            toast.error('Ingresa al menos un email para crear el usuario');
            return;
        }
        setCreatingClient(project._id);
        try {
            const body = manualData ? {
                email: manualData.email || undefined,
                password: manualData.password || undefined,
            } : {};
            const { data } = await axiosWithAuth.post(`/projects/${project._id}/create-client`, body);
            if (data.alreadyExists && !data.password) {
                toast.success(`Usuario ya existía: ${data.loginIdentifier || data.user.email}\nSe vinculó al proyecto`, {
                    duration: 5000, style: { whiteSpace: 'pre-line' }
                });
            } else {
                const login = data.loginIdentifier || data.user.email;
                toast.success(
                    `Usuario creado\nLogin: ${login}\nContraseña: ${data.password}`,
                    { duration: 10000, style: { whiteSpace: 'pre-line' } }
                );
            }
            setShowManualClientForm(false);
            setManualClientData({ email: '', password: '' });
            dispatch(getAllProjects());
            // Actualizar el selectedProject con los datos nuevos
            try {
                const { data: updated } = await axiosWithAuth.get(`/projects/${project._id}`);
                setSelectedProject(updated);
            } catch (_) {}
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al crear usuario cliente');
        } finally {
            setCreatingClient(null);
        }
    };

    // Load projects on mount
    useEffect(() => {
        dispatch(getAllProjects());
        checkGoogleConnection();
    }, [dispatch]);

    // Check URL params for google=connected
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('google') === 'connected') {
            setGoogleConnected(true);
            checkGoogleConnection();
            // Clean the URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    // Fetch Google events for the current month
    useEffect(() => {
        if (googleConnected) {
            fetchGoogleEvents(currentMonth.getFullYear(), currentMonth.getMonth());
        }
    }, [currentMonth, googleConnected]);

    const checkGoogleConnection = async () => {
        try {
            const response = await axiosWithAuth.get('/google/connection-status');
            setGoogleConnected(response.data.connected || false);
            if (response.data.email) {
                setGoogleEmail(response.data.email);
            }
        } catch (err) {
            setGoogleConnected(false);
        }
    };

    const fetchGoogleEvents = async (year, month) => {
        try {
            const timeMin = new Date(year, month, 1).toISOString();
            const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
            const response = await axiosWithAuth.get(`/google/events?timeMin=${timeMin}&timeMax=${timeMax}`);
            // Google Calendar API returns { items: [...] } or the data directly
            const events = response.data?.items || response.data || [];
            setGoogleEvents(Array.isArray(events) ? events : []);
            setLastSync(new Date());
        } catch (err) {
            // Silently fail if Google Calendar not connected
        }
    };

    const handleConnectGoogle = async () => {
        try {
            const response = await axiosWithAuth.get('/google/auth-url');
            window.open(response.data.authUrl, '_blank');
            // Check connection status after a delay
            setTimeout(checkGoogleConnection, 2000);
        } catch (err) {
            console.error('Error connecting Google Calendar:', err);
        }
    };

    const handleSyncProject = async (projectId) => {
        setSyncingProject(projectId);
        try {
            await axiosWithAuth.post(`/google/sync-project/${projectId}`);
            await fetchGoogleEvents(currentMonth.getFullYear(), currentMonth.getMonth());
        } catch (err) {
            console.error('Error syncing project:', err);
        }
        setSyncingProject(null);
    };

    const handleRefreshEvents = async () => {
        setLoading(true);
        await fetchGoogleEvents(currentMonth.getFullYear(), currentMonth.getMonth());
        setLoading(false);
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        if (!newProject.taskTitle || !newProject.taskType || !newProject.dueDate) {
            toast.error('Completa los campos obligatorios');
            return;
        }
        setAddingProject(true);
        try {
            const res = await axiosWithAuth.post('/projects/manual', newProject);
            const msgs = ['Proyecto creado'];
            if (res.data?.payment) msgs.push('+ pago registrado');
            if (res.data?.clientCreated) msgs.push('+ cuenta de cliente creada');
            toast.success(msgs.join(' '));
            setShowAddProject(false);
            setNewProject({ taskTitle: '', taskType: 'Tesis', clientName: '', clientEmail: '', clientPhone: '', studyArea: '', career: '', educationLevel: 'licenciatura', requirements: '', pages: '', dueDate: '', priority: 'medium', amount: '', method: 'transferencia', esquemaPago: 'Pago único', paymentDate: new Date().toISOString().slice(0, 10) });
            dispatch(getAllProjects());
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al crear proyecto');
        }
        setAddingProject(false);
    };

    const filteredProjects = projects.filter((project) => {
        // Status filter
        if (statusFilter === 'active') {
            if (project.status === 'completed' || project.status === 'cancelled') return false;
        } else if (statusFilter !== 'all') {
            if (project.status !== statusFilter) return false;
        }
        // Search
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
            project.taskTitle?.toLowerCase().includes(term) ||
            project.clientName?.toLowerCase().includes(term) ||
            project.taskType?.toLowerCase().includes(term) ||
            project.career?.toLowerCase().includes(term)
        );
    });

    const statusColumns = {
        pending: { label: 'Pendiente', color: '#9ca3af' },
        in_progress: { label: 'En Progreso', color: '#3b82f6' },
        review: { label: 'En Revisión', color: '#f59e0b' },
        completed: { label: 'Completado', color: '#10b981' },
        cancelled: { label: 'Cancelado', color: '#ef4444' }
    };

    const projectsByStatus = {
        pending: filteredProjects.filter(p => p.status === 'pending'),
        in_progress: filteredProjects.filter(p => p.status === 'in_progress'),
        review: filteredProjects.filter(p => p.status === 'review'),
        completed: filteredProjects.filter(p => p.status === 'completed'),
        cancelled: filteredProjects.filter(p => p.status === 'cancelled')
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleDragStart = (e, project) => {
        setDraggedCard(project);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, status) => {
        e.preventDefault();
        if (!draggedCard || draggedCard.status === status) {
            setDraggedCard(null);
            return;
        }

        try {
            await dispatch(updateProjectStatus({ projectId: draggedCard._id, status }));
        } catch (err) {
            console.error('Error updating project status:', err);
        }
        setDraggedCard(null);
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !selectedProject) return;

        try {
            await dispatch(addComment({ projectId: selectedProject._id, text: commentText }));
            // Refresh the selected project
            const updated = projects.find(p => p._id === selectedProject._id);
            if (updated) {
                setSelectedProject(updated);
            }
            setCommentText('');
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#f97316',
            urgent: '#ef4444'
        };
        return colors[priority] || '#9ca3af';
    };

    const getPriorityLabel = (priority) => {
        const labels = { low: 'Bajo', medium: 'Medio', high: 'Alto', urgent: 'Urgente' };
        return labels[priority] || priority;
    };

    // Calendar View
    const renderCalendarView = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        return (
            <div className="mp-calendar">
                <div className="mp-cal-header">
                    <h2 className="mp-cal-title">
                        {googleConnected ? 'Calendario de Arturo' : 'Calendario de Proyectos'}
                    </h2>
                    <div className="mp-cal-nav">
                        <button onClick={() => setCurrentMonth(new Date(year, month - 1))}>
                            <FaChevronLeft />
                        </button>
                        <span className="mp-cal-month">
                            {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => setCurrentMonth(new Date(year, month + 1))}>
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                <div className="mp-cal-grid">
                    {dayLabels.map((day) => (
                        <div key={day} className="mp-cal-day-header">
                            {day}
                        </div>
                    ))}

                    {days.map((day, idx) => {
                        const isToday = day && day.toDateString() === new Date().toDateString();
                        const isOtherMonth = !day;
                        const projectsOnDay = day
                            ? filteredProjects.filter(
                                (p) => p.dueDate && new Date(p.dueDate).toDateString() === day.toDateString()
                            )
                            : [];
                        const eventsOnDay = day
                            ? googleEvents.filter(
                                (e) => e.start && new Date(e.start.dateTime || e.start.date).toDateString() === day.toDateString()
                            )
                            : [];

                        return (
                            <div
                                key={idx}
                                className={`mp-cal-day ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}`}
                            >
                                {day && <span className="mp-cal-day-num">{day.getDate()}</span>}
                                <div className="mp-cal-events">
                                    {projectsOnDay.map((project) => (
                                        <div
                                            key={project._id}
                                            className="mp-cal-event-chip"
                                            style={{ borderLeftColor: project.color || '#9ca3af' }}
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setShowModal(true);
                                            }}
                                        >
                                            {project.taskTitle}
                                        </div>
                                    ))}
                                    {eventsOnDay.map((event) => (
                                        <div key={event.id} className="mp-cal-event-chip google-event">
                                            <FaGoogle style={{ fontSize: '0.6rem', marginRight: '3px' }} />
                                            {event.summary}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Kanban View
    const renderKanbanView = () => (
        <div className="mp-kanban">
            {Object.entries(statusColumns).map(([statusKey, statusInfo]) => (
                <div
                    key={statusKey}
                    className="mp-kanban-col"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, statusKey)}
                >
                    <div className="mp-kanban-col-header" style={{ borderColor: statusInfo.color }}>
                        <h3>{statusInfo.label}</h3>
                        <span className="mp-count-badge">{projectsByStatus[statusKey].length}</span>
                    </div>

                    <div className="mp-kanban-cards">
                        {projectsByStatus[statusKey].map((project) => (
                            <div
                                key={project._id}
                                className={`mp-kanban-card ${draggedCard?._id === project._id ? 'dragging' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, project)}
                                onClick={() => {
                                    setSelectedProject(project);
                                    setShowModal(true);
                                }}
                            >
                                <div className="mp-kanban-card-color" style={{ backgroundColor: project.color || '#d1d5db' }}></div>

                                <div className="mp-kanban-card-content">
                                    <h4 className="mp-card-title">{project.taskTitle}</h4>

                                    {project.taskType && (
                                        <span className="mp-card-type-badge">{project.taskType}</span>
                                    )}

                                    {project.clientName && (
                                        <p className="mp-card-client">
                                            <FaUser /> {project.clientName}
                                            {!project.client && (project.clientEmail || project.clientPhone) && (
                                                <button
                                                    className="mp-create-client-btn-inline"
                                                    title="Crear usuario cliente"
                                                    onClick={(e) => handleCreateClient(e, project)}
                                                    disabled={creatingClient === project._id}
                                                >
                                                    <FaUserPlus />
                                                </button>
                                            )}
                                            {project.client && (
                                                <span className="mp-client-linked-badge" title={`Usuario: ${project.client.email || ''}`}>
                                                    <FaCheckCircle />
                                                </span>
                                            )}
                                        </p>
                                    )}

                                    {project.dueDate && (
                                        <p className={`mp-card-due-date ${isOverdue(project.dueDate) ? 'overdue' : ''}`}>
                                            <FaCalendar /> {formatDate(project.dueDate)}
                                        </p>
                                    )}

                                    {project.progress !== undefined && (
                                        <div className="mp-progress-bar">
                                            <div
                                                className="mp-progress-fill"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    {project.priority && (
                                        <span
                                            className="mp-priority-badge"
                                            style={{ backgroundColor: getPriorityColor(project.priority) }}
                                        >
                                            {getPriorityLabel(project.priority)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    // List View
    const renderListView = () => (
        <div className="mp-table-container">
            <table className="mp-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Tipo</th>
                        <th>Título</th>
                        <th>Estado</th>
                        <th>Fecha Entrega</th>
                        <th>Prioridad</th>
                        <th>Progreso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProjects.map((project) => (
                        <tr key={project._id} className="mp-table-row">
                            <td className="mp-table-id">{project._id?.slice(-6).toUpperCase() || 'N/A'}</td>
                            <td>{project.clientName || '-'}</td>
                            <td>{project.taskType || '-'}</td>
                            <td className="mp-table-title" onClick={() => {
                                setSelectedProject(project);
                                setShowModal(true);
                            }} style={{ cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline' }}>
                                {project.taskTitle}
                            </td>
                            <td>
                                <span
                                    className={`mp-status-badge mp-status-${project.status}`}
                                    style={{ backgroundColor: statusColumns[project.status]?.color || '#9ca3af' }}
                                >
                                    {statusColumns[project.status]?.label || project.status}
                                </span>
                            </td>
                            <td className={isOverdue(project.dueDate) ? 'overdue' : ''}>
                                {formatDate(project.dueDate)}
                            </td>
                            <td>
                                <span
                                    className="mp-priority-badge"
                                    style={{ backgroundColor: getPriorityColor(project.priority) }}
                                >
                                    {getPriorityLabel(project.priority)}
                                </span>
                            </td>
                            <td>
                                <div className="mp-progress-bar-small">
                                    <div
                                        className="mp-progress-fill"
                                        style={{ width: `${project.progress || 0}%` }}
                                    ></div>
                                </div>
                                <small>{project.progress || 0}%</small>
                            </td>
                            <td className="mp-actions-cell">
                                <button className="mp-action-btn" onClick={() => {
                                    setSelectedProject(project);
                                    setShowModal(true);
                                }}>
                                    Ver
                                </button>
                                {!project.client && (project.clientEmail || project.clientPhone) && (
                                    <button
                                        className="mp-action-btn mp-create-client-btn"
                                        onClick={(e) => handleCreateClient(e, project)}
                                        disabled={creatingClient === project._id}
                                        title="Crear usuario cliente"
                                    >
                                        <FaUserPlus /> {creatingClient === project._id ? '...' : 'Crear Usuario'}
                                    </button>
                                )}
                                {project.client && (
                                    <span className="mp-client-linked-badge" title={`Usuario: ${project.client.email || ''}`}>
                                        <FaCheckCircle style={{ color: '#22c55e' }} /> Vinculado
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const REV_STATUS_LABELS = {
        delivered: { label: 'Entregado', color: '#3b82f6', bg: '#dbeafe' },
        pending_review: { label: 'En revisión', color: '#f59e0b', bg: '#fef3c7' },
        corrections_requested: { label: 'Correcciones', color: '#ef4444', bg: '#fef2f2' },
        approved: { label: 'Aprobado', color: '#10b981', bg: '#d1fae5' },
    };

    const REV_TYPE_LABELS = {
        preliminary: 'Preliminar',
        correction: 'Corrección',
        revision: 'Revisión',
        final: 'Final',
    };

    // Detail panel (replaces modal for selected project)
    const renderDetailPanel = () => {
        if (!selectedProject || !showModal) return null;
        const p = selectedProject;
        const revisions = (p.revisions || []).slice().sort((a, b) => b.version - a.version);

        return (
            <div className="mp-detail-panel">
                <div className="mp-detail-panel-header">
                    <button className="mp-back-btn" onClick={() => setShowModal(false)}>
                        <FaArrowLeft /> Volver
                    </button>
                    <div className="mp-detail-title-row">
                        <h2>{p.taskTitle}</h2>
                        <span className="mp-status-badge" style={{ backgroundColor: statusColumns[p.status]?.color }}>
                            {statusColumns[p.status]?.label}
                        </span>
                    </div>
                    <div className="mp-detail-meta-row">
                        <span><FaUser /> {p.clientName || 'Sin cliente'}</span>
                        <span>{p.taskType}</span>
                        <span>{p.career || ''}</span>
                        <span><FaCalendar /> {formatDate(p.dueDate)} {isOverdue(p.dueDate) && <span style={{ color: '#ef4444' }}>(Vencido)</span>}</span>
                        <span>{p.pages || '?'} págs</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mp-detail-tabs">
                    {[
                        { key: 'overview', label: 'Resumen', icon: <FaEye /> },
                        { key: 'revisions', label: `Versiones (${revisions.length})`, icon: <FaHistory /> },
                        { key: 'files', label: `Archivos (${(p.deliverables?.length || 0)})`, icon: <FaFileAlt /> },
                        { key: 'comments', label: `Mensajes (${(p.comments?.length || 0)})`, icon: <FaComment /> },
                    ].map(tab => (
                        <button key={tab.key} className={`mp-detail-tab ${detailTab === tab.key ? 'active' : ''}`}
                            onClick={() => setDetailTab(tab.key)}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="mp-detail-body">
                    {/* === OVERVIEW TAB === */}
                    {detailTab === 'overview' && (
                        <div className="mp-overview">
                            <div className="mp-overview-grid">
                                <div className="mp-overview-card">
                                    <label>Estado</label>
                                    <select className="mp-select" value={p.status}
                                        onChange={async (e) => {
                                            await dispatch(updateProjectStatus({ projectId: p._id, status: e.target.value }));
                                            refreshProject(p._id);
                                        }}>
                                        {Object.entries(statusColumns).map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mp-overview-card">
                                    <label>Prioridad</label>
                                    <span className="mp-priority-badge" style={{ backgroundColor: getPriorityColor(p.priority) }}>
                                        {getPriorityLabel(p.priority)}
                                    </span>
                                </div>
                                <div className="mp-overview-card">
                                    <label>Progreso: {p.progress || 0}%</label>
                                    <input type="range" min="0" max="100" value={p.progress || 0}
                                        className="mp-slider"
                                        onChange={(e) => {
                                            dispatch(updateProgress({ projectId: p._id, progress: parseInt(e.target.value) }));
                                            setSelectedProject(prev => ({ ...prev, progress: parseInt(e.target.value) }));
                                        }} />
                                    <div className="mp-progress-bar"><div className="mp-progress-fill" style={{ width: `${p.progress || 0}%` }} /></div>
                                </div>
                                <div className="mp-overview-card">
                                    <label>Nivel</label>
                                    <p>{p.educationLevel || '-'}</p>
                                </div>
                            </div>

                            {p.requirements?.text && (
                                <div className="mp-requirements-block">
                                    <h4>Requisitos / Descripción</h4>
                                    <p>{p.requirements.text}</p>
                                </div>
                            )}

                            {/* Client section */}
                            <div className="mp-client-section-detail">
                                <h4>Cliente</h4>
                                {p.client ? (
                                    <div className="mp-client-exists">
                                        <FaCheckCircle style={{ color: '#22c55e' }} />
                                        <span>Vinculado: <strong>{p.client.email || p.clientEmail}</strong></span>
                                    </div>
                                ) : (
                                    <button className="mp-btn mp-btn-create-client"
                                        onClick={(e) => handleCreateClient(e, p)}
                                        disabled={creatingClient === p._id}>
                                        <FaUserPlus /> {creatingClient === p._id ? 'Creando...' : 'Crear Usuario'}
                                    </button>
                                )}
                                {p.clientPhone && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Tel: {p.clientPhone}</p>}
                                {p.clientEmail && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Email: {p.clientEmail}</p>}
                            </div>

                            {/* Google Calendar */}
                            <div className="mp-gcal-section-detail">
                                <h4>Google Calendar</h4>
                                {p.googleCalendarEventId ? (
                                    <span><FaCheckCircle style={{ color: '#22c55e' }} /> Sincronizado</span>
                                ) : (
                                    <button className="mp-btn mp-btn-secondary mp-btn-sm"
                                        onClick={() => handleSyncProject(p._id)}
                                        disabled={syncingProject === p._id}>
                                        <FaGoogle /> {syncingProject === p._id ? 'Sincronizando...' : 'Sincronizar'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === REVISIONS TAB === */}
                    {detailTab === 'revisions' && (
                        <div className="mp-revisions-tab">
                            {/* Upload new revision */}
                            <div className="mp-revision-upload-area">
                                {!showRevisionForm ? (
                                    <button className="mp-btn mp-btn-primary" onClick={() => setShowRevisionForm(true)}>
                                        <FaPlus /> Subir nueva versión
                                    </button>
                                ) : (
                                    <div className="mp-revision-form">
                                        <div className="mp-revision-form-row">
                                            <div className="mp-revision-form-field">
                                                <label>Etiqueta</label>
                                                <input type="text" placeholder="Ej: Capítulo 1 completo" value={revisionForm.label}
                                                    onChange={(e) => setRevisionForm(f => ({ ...f, label: e.target.value }))} />
                                            </div>
                                            <div className="mp-revision-form-field">
                                                <label>Tipo</label>
                                                <select value={revisionForm.type}
                                                    onChange={(e) => setRevisionForm(f => ({ ...f, type: e.target.value }))}>
                                                    <option value="preliminary">Preliminar</option>
                                                    <option value="revision">Revisión</option>
                                                    <option value="correction">Corrección</option>
                                                    <option value="final">Final</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mp-revision-form-field">
                                            <label>Notas (opcional)</label>
                                            <textarea rows="2" placeholder="Notas sobre esta versión..." value={revisionForm.notes}
                                                onChange={(e) => setRevisionForm(f => ({ ...f, notes: e.target.value }))} />
                                        </div>
                                        <div className="mp-revision-form-actions">
                                            <input type="file" ref={revisionFileRef} onChange={handleUploadRevision} style={{ display: 'none' }}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.pptx,.ppt,.zip,.rar" />
                                            <button className="mp-btn mp-btn-primary"
                                                onClick={() => revisionFileRef.current?.click()} disabled={uploadingRevision}>
                                                {uploadingRevision ? <><FaSync className="spinning" /> Subiendo...</> : <><FaCloudUploadAlt /> Seleccionar archivo y subir</>}
                                            </button>
                                            <button className="mp-btn mp-btn-ghost" onClick={() => setShowRevisionForm(false)}>Cancelar</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Revision timeline */}
                            {revisions.length === 0 ? (
                                <div className="mp-empty-revisions">
                                    <FaHistory style={{ fontSize: '2rem', color: '#d1d5db' }} />
                                    <p>No hay versiones todavía</p>
                                </div>
                            ) : (
                                <div className="mp-revision-timeline">
                                    {revisions.map((rev) => {
                                        const statusInfo = REV_STATUS_LABELS[rev.status] || REV_STATUS_LABELS.delivered;
                                        return (
                                            <div key={rev._id || rev.version} className="mp-revision-card">
                                                <div className="mp-revision-card-header">
                                                    <div className="mp-revision-version">v{rev.version}</div>
                                                    <div className="mp-revision-info">
                                                        <span className="mp-revision-label">{rev.label || `Versión ${rev.version}`}</span>
                                                        <span className="mp-revision-type-badge">{REV_TYPE_LABELS[rev.type] || rev.type}</span>
                                                        <span className="mp-revision-status-badge" style={{ color: statusInfo.color, background: statusInfo.bg }}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="mp-revision-date">
                                                        {rev.createdAt && new Date(rev.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>

                                                {rev.notes && <p className="mp-revision-notes">{rev.notes}</p>}

                                                {rev.correctionNotes && (
                                                    <div className="mp-revision-correction-notes">
                                                        <strong>Correcciones solicitadas:</strong> {rev.correctionNotes}
                                                    </div>
                                                )}

                                                <div className="mp-revision-card-actions">
                                                    {rev.file && (
                                                        <a href={rev.file.path} target="_blank" rel="noopener noreferrer"
                                                            className="mp-btn mp-btn-sm mp-btn-secondary">
                                                            <FaDownload /> {rev.file.originalname} ({formatFileSize(rev.file.size)})
                                                        </a>
                                                    )}

                                                    {/* Status actions */}
                                                    <div className="mp-revision-status-actions">
                                                        {rev.status !== 'approved' && (
                                                            <button className="mp-btn mp-btn-sm" style={{ background: '#d1fae5', color: '#065f46' }}
                                                                onClick={() => handleUpdateRevisionStatus(rev.version, 'approved')}
                                                                disabled={updatingRevStatus === rev.version}>
                                                                <FaCheckCircle /> Aprobar
                                                            </button>
                                                        )}
                                                        {rev.status !== 'corrections_requested' && rev.status !== 'approved' && (
                                                            <>
                                                                <input type="text" placeholder="Notas de corrección..."
                                                                    className="mp-correction-input"
                                                                    value={updatingRevStatus === rev.version ? correctionNotes : ''}
                                                                    onChange={(e) => { setUpdatingRevStatus(rev.version); setCorrectionNotes(e.target.value); }}
                                                                    onFocus={() => setUpdatingRevStatus(rev.version)} />
                                                                <button className="mp-btn mp-btn-sm" style={{ background: '#fef2f2', color: '#991b1b' }}
                                                                    onClick={() => handleUpdateRevisionStatus(rev.version, 'corrections_requested')}
                                                                    disabled={updatingRevStatus !== rev.version}>
                                                                    Pedir correcciones
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* === FILES TAB === */}
                    {detailTab === 'files' && (
                        <div className="mp-files-tab">
                            <h4>Archivos entregables</h4>
                            {p.deliverables && p.deliverables.length > 0 ? (
                                <div className="mp-deliverables-list">
                                    {p.deliverables.map((del) => (
                                        <div key={del._id} className="mp-deliverable-item">
                                            <div className="mp-deliverable-info">
                                                <FaFileAlt className="mp-deliverable-icon" />
                                                <div>
                                                    <span className="mp-deliverable-name">{del.originalname}</span>
                                                    <span className="mp-deliverable-meta">
                                                        {formatFileSize(del.size)} &middot; {new Date(del.uploadedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mp-deliverable-actions">
                                                <a href={del.path} target="_blank" rel="noopener noreferrer" className="mp-btn mp-btn-sm mp-btn-secondary"><FaDownload /></a>
                                                <button className="mp-btn mp-btn-sm mp-btn-danger"
                                                    onClick={() => handleRemoveDeliverable(del._id, del.originalname)}
                                                    disabled={deletingDeliverable === del._id}>
                                                    {deletingDeliverable === del._id ? '...' : <FaTrash />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="mp-no-deliverables">No hay archivos cargados.</p>}

                            <div className="mp-upload-section">
                                <input type="file" ref={fileInputRef} onChange={handleUploadDeliverable} style={{ display: 'none' }}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.pptx,.ppt,.zip,.rar" />
                                <button className="mp-btn mp-btn-primary mp-btn-upload"
                                    onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}>
                                    {uploadingFile ? <><FaSync className="spinning" /> Subiendo...</> : <><FaCloudUploadAlt /> Subir Archivo</>}
                                </button>
                                <span className="mp-upload-hint">PDF, Word, Excel, imagen o ZIP (max 10 MB)</span>
                            </div>

                            {/* Requirements file */}
                            {p.requirements?.file && (
                                <div style={{ marginTop: 16 }}>
                                    <h4>Archivo de requisitos</h4>
                                    <a href={p.requirements.file.path} target="_blank" rel="noopener noreferrer" className="mp-btn mp-btn-secondary">
                                        <FaDownload /> {p.requirements.file.originalname}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === COMMENTS TAB === */}
                    {detailTab === 'comments' && (
                        <div className="mp-comments-tab">
                            <div className="mp-comments-list">
                                {(!p.comments || p.comments.length === 0) ? (
                                    <p className="mp-no-deliverables">Sin comentarios</p>
                                ) : p.comments.map((comment, idx) => (
                                    <div key={idx} className="mp-comment">
                                        <div className="mp-comment-header">
                                            <FaUser style={{ fontSize: '0.7rem' }} />
                                            <span className="mp-comment-author">{comment.user?.name || 'Admin'}</span>
                                            <small className="mp-comment-date">
                                                {new Date(comment.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                        <p className="mp-comment-text">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mp-comment-input">
                                <textarea placeholder="Escribe un comentario..." value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)} />
                                <button className="mp-btn mp-btn-primary" onClick={handleAddComment} disabled={!commentText.trim()}>
                                    <FaPaperPlane /> Enviar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mp">
            <div className="mp-header">
                <div className="mp-header-left">
                    <h1 className="mp-title">Proyectos</h1>
                    <span className="mp-count">{filteredProjects.length} proyectos</span>
                </div>

                <div className="mp-header-center">
                    <div className="mp-view-toggle">
                        <button
                            className={`mp-toggle-btn ${view === 'kanban' ? 'active' : ''}`}
                            onClick={() => setView('kanban')}
                        >
                            Tablero
                        </button>
                        <button
                            className={`mp-toggle-btn ${view === 'calendar' ? 'active' : ''}`}
                            onClick={() => setView('calendar')}
                        >
                            <FaCalendar /> Calendario
                        </button>
                        <button
                            className={`mp-toggle-btn ${view === 'list' ? 'active' : ''}`}
                            onClick={() => setView('list')}
                        >
                            Lista
                        </button>
                    </div>
                </div>

                <div className="mp-header-right">
                    <button className="mp-add-btn" onClick={() => setShowAddProject(true)}>
                        <FaPlus /> Nuevo Proyecto
                    </button>
                    <div className="mp-search">
                        <FaSearch className="mp-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {googleConnected ? (
                        <div className="mp-google-status">
                            <FaCheckCircle className="mp-google-check" />
                            <span>Google Calendar conectado</span>
                        </div>
                    ) : (
                        <button
                            className="mp-google-btn"
                            onClick={handleConnectGoogle}
                        >
                            <FaGoogle />
                            Conectar Google Calendar
                        </button>
                    )}
                </div>
            </div>

            {/* Google Calendar Connected Banner */}
            {googleConnected && (
                <div className="mp-google-banner">
                    <div className="mp-google-banner-left">
                        <FaGoogle className="mp-google-banner-icon" />
                        <div>
                            <h3>Calendario de Arturo</h3>
                            {googleEmail && <span className="mp-google-email">{googleEmail}</span>}
                        </div>
                    </div>
                    <div className="mp-google-banner-right">
                        {lastSync && (
                            <span className="mp-last-sync">
                                Última sincronización: {lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <button className="mp-refresh-btn" onClick={handleRefreshEvents} disabled={loading}>
                            <FaSync className={loading ? 'spinning' : ''} />
                            {loading ? 'Sincronizando...' : 'Actualizar'}
                        </button>
                        {googleEvents.length > 0 && (
                            <span className="mp-event-count">{googleEvents.length} eventos este mes</span>
                        )}
                    </div>
                </div>
            )}

            {/* Status filter row */}
            <div className="mp-status-filters">
                {[
                    { key: 'active', label: 'Activos' },
                    { key: 'all', label: 'Todos' },
                    ...Object.entries(statusColumns).map(([k, v]) => ({ key: k, label: v.label, color: v.color })),
                ].map(f => (
                    <button key={f.key}
                        className={`mp-status-filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                        style={statusFilter === f.key && f.color ? { borderColor: f.color, color: f.color } : {}}
                        onClick={() => setStatusFilter(f.key)}>
                        {f.label} {f.key !== 'all' && f.key !== 'active' ? `(${projects.filter(p => p.status === f.key).length})` : f.key === 'active' ? `(${projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length})` : `(${projects.length})`}
                    </button>
                ))}
            </div>

            {showModal && selectedProject ? (
                renderDetailPanel()
            ) : (
                <>
                    {view === 'kanban' && renderKanbanView()}
                    {view === 'calendar' && renderCalendarView()}
                    {view === 'list' && renderListView()}
                </>
            )}

            {/* Add Project Modal */}
            {showAddProject && (
                <div className="mp-modal-overlay" onClick={() => setShowAddProject(false)}>
                    <div className="mp-modal mp-modal-wide" onClick={(e) => e.stopPropagation()}>
                        <div className="mp-modal-header">
                            <h2>Nuevo Proyecto Manual</h2>
                            <button className="mp-close" onClick={() => setShowAddProject(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddProject}>
                            <div className="mp-modal-body">
                                <div className="mp-add-form-grid">
                                    <div className="mp-add-form-group mp-add-form-full">
                                        <label>Título del Proyecto *</label>
                                        <input type="text" value={newProject.taskTitle} onChange={(e) => setNewProject({ ...newProject, taskTitle: e.target.value })} required />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Tipo de Trabajo *</label>
                                        <select value={newProject.taskType} onChange={(e) => setNewProject({ ...newProject, taskType: e.target.value })}>
                                            <option value="Tesis">Tesis</option>
                                            <option value="Tesina">Tesina</option>
                                            <option value="Ensayo">Ensayo</option>
                                            <option value="Protocolo">Protocolo</option>
                                            <option value="Proyecto de investigación">Proyecto de investigación</option>
                                            <option value="Artículo">Artículo</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Nivel Educativo</label>
                                        <select value={newProject.educationLevel} onChange={(e) => setNewProject({ ...newProject, educationLevel: e.target.value })}>
                                            <option value="licenciatura">Licenciatura</option>
                                            <option value="maestria">Maestría</option>
                                            <option value="doctorado">Doctorado</option>
                                            <option value="preparatoria">Preparatoria</option>
                                        </select>
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Nombre del Cliente</label>
                                        <input type="text" value={newProject.clientName} onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })} />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Email del Cliente</label>
                                        <input type="email" value={newProject.clientEmail} onChange={(e) => setNewProject({ ...newProject, clientEmail: e.target.value })} placeholder="Se creará cuenta automática" />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Teléfono (WhatsApp)</label>
                                        <input type="tel" value={newProject.clientPhone} onChange={(e) => setNewProject({ ...newProject, clientPhone: e.target.value })} placeholder="55 1234 5678" />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Carrera</label>
                                        <input type="text" value={newProject.career} onChange={(e) => setNewProject({ ...newProject, career: e.target.value })} placeholder="Ej: Derecho" />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Área de Estudio</label>
                                        <input type="text" value={newProject.studyArea} onChange={(e) => setNewProject({ ...newProject, studyArea: e.target.value })} placeholder="Ej: Ciencias Sociales" />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Páginas</label>
                                        <input type="number" min="1" value={newProject.pages} onChange={(e) => setNewProject({ ...newProject, pages: e.target.value })} />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Fecha de Entrega *</label>
                                        <input type="date" value={newProject.dueDate} onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })} required />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Prioridad</label>
                                        <select value={newProject.priority} onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}>
                                            <option value="low">Bajo</option>
                                            <option value="medium">Medio</option>
                                            <option value="high">Alto</option>
                                            <option value="urgent">Urgente</option>
                                        </select>
                                    </div>
                                    <div className="mp-add-form-group mp-add-form-full">
                                        <label>Requisitos / Descripción</label>
                                        <textarea rows="3" value={newProject.requirements} onChange={(e) => setNewProject({ ...newProject, requirements: e.target.value })} placeholder="Describe los requisitos del proyecto..." />
                                    </div>

                                    {/* --- Sección de Pago (opcional) --- */}
                                    <div className="mp-add-form-group mp-add-form-full">
                                        <label style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem', marginTop: 8, display: 'block' }}>Datos del Pago (opcional)</label>
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Monto (MXN)</label>
                                        <input type="number" min="0" step="0.01" value={newProject.amount} onChange={(e) => setNewProject({ ...newProject, amount: e.target.value })} placeholder="Si ingresa monto, se registra el pago" />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Fecha del Pago</label>
                                        <input type="date" value={newProject.paymentDate} onChange={(e) => setNewProject({ ...newProject, paymentDate: e.target.value })} />
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Método de Pago</label>
                                        <select value={newProject.method} onChange={(e) => setNewProject({ ...newProject, method: e.target.value })}>
                                            <option value="transferencia">Transferencia</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="mercadolibre">Mercado Libre</option>
                                            <option value="stripe">Stripe</option>
                                            <option value="paypal">PayPal</option>
                                        </select>
                                    </div>
                                    <div className="mp-add-form-group">
                                        <label>Esquema de Pago</label>
                                        <select value={newProject.esquemaPago} onChange={(e) => setNewProject({ ...newProject, esquemaPago: e.target.value })}>
                                            <option value="Pago único">Pago único</option>
                                            <option value="50-50">50% - 50%</option>
                                            <option value="33-33-34">33% - 33% - 34%</option>
                                            <option value="6 quincenas">6 Quincenas</option>
                                            <option value="6 MSI">6 MSI</option>
                                        </select>
                                    </div>

                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', gridColumn: '1/-1', margin: '4px 0 0' }}>
                                        Al crear el proyecto se creará automáticamente la cuenta del cliente (si proporcionas email).
                                        Si ingresas monto, se vinculará un pago. Las credenciales se envían por WhatsApp.
                                    </p>
                                </div>
                            </div>
                            <div className="mp-modal-footer">
                                <button type="button" className="mp-btn mp-btn-ghost" onClick={() => setShowAddProject(false)}>Cancelar</button>
                                <button type="submit" className="mp-btn mp-btn-primary" disabled={addingProject}>
                                    {addingProject ? <><FaSync className="spinning" /> Creando...</> : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageProjects;
