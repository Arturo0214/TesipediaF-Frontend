import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProjects, updateProjectStatus, updateProgress, addComment } from '../../../features/projects/projectSlice';
import axiosWithAuth from '../../../utils/axioswithAuth';
import { FaGoogle, FaSearch, FaChevronLeft, FaChevronRight, FaCalendar, FaClock, FaFlag, FaTimes, FaUser, FaFileAlt } from 'react-icons/fa';
import './ManageProjects.css';

function ManageProjects() {
    const dispatch = useDispatch();
    const { projects } = useSelector((state) => state.projects);

    const [view, setView] = useState('kanban'); // kanban, calendar, list
    const [searchTerm, setSearchTerm] = useState('');
    const [googleConnected, setGoogleConnected] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [googleEvents, setGoogleEvents] = useState([]);
    const [draggedCard, setDraggedCard] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);

    // Load projects on mount
    useEffect(() => {
        dispatch(getAllProjects());
        checkGoogleConnection();
    }, [dispatch]);

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
        } catch (err) {
            setGoogleConnected(false);
        }
    };

    const fetchGoogleEvents = async (year, month) => {
        try {
            const timeMin = new Date(year, month, 1).toISOString();
            const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
            const response = await axiosWithAuth.get(`/google/events?timeMin=${timeMin}&timeMax=${timeMax}`);
            setGoogleEvents(response.data || []);
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

    const filteredProjects = projects.filter((project) => {
        const term = searchTerm.toLowerCase();
        return (
            project.taskTitle?.toLowerCase().includes(term) ||
            project.clientName?.toLowerCase().includes(term) ||
            project.taskType?.toLowerCase().includes(term)
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
                            <td>
                                <button className="mp-action-btn" onClick={() => {
                                    setSelectedProject(project);
                                    setShowModal(true);
                                }}>
                                    Ver
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Project Detail Modal
    const renderModal = () => {
        if (!selectedProject || !showModal) return null;

        return (
            <div className="mp-modal-overlay" onClick={() => setShowModal(false)}>
                <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="mp-modal-header">
                        <h2>{selectedProject.taskTitle}</h2>
                        <button className="mp-close" onClick={() => setShowModal(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="mp-modal-body">
                        <div className="mp-modal-section">
                            <h3 className="mp-section-title">Detalles del Proyecto</h3>
                            <div className="mp-detail-grid">
                                <div className="mp-detail-item">
                                    <label>Cliente</label>
                                    <p>{selectedProject.clientName || '-'}</p>
                                </div>
                                <div className="mp-detail-item">
                                    <label>Tipo</label>
                                    <p>{selectedProject.taskType || '-'}</p>
                                </div>
                                <div className="mp-detail-item">
                                    <label>Carrera</label>
                                    <p>{selectedProject.career || '-'}</p>
                                </div>
                                <div className="mp-detail-item">
                                    <label>Área de Estudio</label>
                                    <p>{selectedProject.studyArea || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mp-modal-section">
                            <h3 className="mp-section-title">Estado y Progreso</h3>
                            <div className="mp-detail-grid">
                                <div className="mp-detail-item">
                                    <label>Estado Actual</label>
                                    <select
                                        className="mp-select"
                                        value={selectedProject.status}
                                        onChange={(e) => {
                                            dispatch(updateProjectStatus({
                                                projectId: selectedProject._id,
                                                status: e.target.value
                                            }));
                                        }}
                                    >
                                        {Object.entries(statusColumns).map(([key, val]) => (
                                            <option key={key} value={key}>
                                                {val.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mp-detail-item">
                                    <label>Prioridad</label>
                                    <select className="mp-select" defaultValue={selectedProject.priority}>
                                        <option value="low">Bajo</option>
                                        <option value="medium">Medio</option>
                                        <option value="high">Alto</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>
                                <div className="mp-detail-item">
                                    <label>Progreso: {selectedProject.progress || 0}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        defaultValue={selectedProject.progress || 0}
                                        className="mp-slider"
                                        onChange={(e) => {
                                            dispatch(updateProgress({
                                                projectId: selectedProject._id,
                                                progress: parseInt(e.target.value)
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="mp-detail-item">
                                    <label>Fecha de Entrega</label>
                                    <p>{formatDate(selectedProject.dueDate)} {isOverdue(selectedProject.dueDate) && '(Vencido)'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mp-modal-section">
                            <h3 className="mp-section-title">Comentarios</h3>
                            <div className="mp-comments">
                                {selectedProject.comments && selectedProject.comments.map((comment, idx) => (
                                    <div key={idx} className="mp-comment">
                                        <p className="mp-comment-text">{comment.text}</p>
                                        <small className="mp-comment-date">
                                            {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                                        </small>
                                    </div>
                                ))}
                            </div>

                            <div className="mp-comment-input">
                                <textarea
                                    placeholder="Añade un comentario..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                ></textarea>
                                <button
                                    className="mp-btn mp-btn-primary"
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                >
                                    Comentar
                                </button>
                            </div>
                        </div>

                        <div className="mp-modal-section">
                            <h3 className="mp-section-title">Google Calendar</h3>
                            {googleConnected ? (
                                <button className="mp-btn mp-btn-secondary">
                                    <FaGoogle /> Sincronizar con Google Calendar
                                </button>
                            ) : (
                                <p className="mp-no-connection">Google Calendar no conectado</p>
                            )}
                        </div>
                    </div>

                    <div className="mp-modal-footer">
                        <button className="mp-btn mp-btn-ghost" onClick={() => setShowModal(false)}>
                            Cerrar
                        </button>
                    </div>
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
                    <div className="mp-search">
                        <FaSearch className="mp-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        className={`mp-google-btn ${googleConnected ? 'connected' : ''}`}
                        onClick={handleConnectGoogle}
                    >
                        <FaGoogle />
                        {googleConnected ? 'Conectado' : 'Conectar Google Calendar'}
                    </button>
                </div>
            </div>

            {view === 'kanban' && renderKanbanView()}
            {view === 'calendar' && renderCalendarView()}
            {view === 'list' && renderListView()}

            {renderModal()}
        </div>
    );
}

export default ManageProjects;
