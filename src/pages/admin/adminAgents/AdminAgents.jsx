import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
    FaRobot, FaCrown, FaLaptopCode, FaTasks, FaCode, FaBug,
    FaUsers, FaPenNib, FaBullhorn, FaPalette, FaHandshake,
    FaChartLine, FaCopy, FaGavel, FaHeart, FaStar,
    FaHistory, FaEye, FaCheckCircle, FaClipboard, FaTerminal,
    FaSitemap, FaArrowRight, FaChevronRight, FaInfoCircle,
    FaNetworkWired, FaLayerGroup, FaProjectDiagram, FaTrash,
    FaMoneyBillWave, FaCalendarAlt, FaCalendarWeek, FaCalendarCheck
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './AdminAgents.css';

// Configure marked for dark theme
marked.setOptions({ breaks: true, gfm: true });
const renderMd = (text) => DOMPurify.sanitize(marked.parse(text || ''));

/* ─── AGENT DATA ─── */
const AGENTS = [
    {
        id: 'orchestrator', name: 'Orquestador', fullName: 'Orquestador Central',
        icon: FaNetworkWired, color: '#1E40AF', department: 'Core', model: 'sonnet',
        isOrchestrator: true,
        description: 'Punto de entrada principal. Coordina agentes, pasa contexto, optimiza tokens.',
        capabilities: ['Coordinaci\u00f3n multi-agente', 'Secuenciaci\u00f3n de tareas', 'Contexto compartido', 'Consolidaci\u00f3n de outputs'],
        usageExample: 'Usa el orchestrator para lanzar la campa\u00f1a de mayo para tesis de licenciatura',
        connects: ['ceo','cto','cfo','pm','dev','qa','uxui','marketing','cm','content','copywriter','sales','analyst','brand','legal','customer-success']
    },
    {
        id: 'ceo', name: 'CEO', fullName: 'Director General',
        icon: FaCrown, color: '#F59E0B', department: 'C-Suite', model: 'opus',
        description: 'Visi\u00f3n estrat\u00e9gica, KPIs, crecimiento y posicionamiento nacional.',
        capabilities: ['Estrategia de crecimiento', 'An\u00e1lisis de mercado', 'Priorizaci\u00f3n de inversi\u00f3n', 'Decisiones de expansi\u00f3n'],
        usageExample: 'Usa el CEO para definir la estrategia del trimestre',
        connects: ['cto','cfo','pm','brand','marketing']
    },
    {
        id: 'cto', name: 'CTO', fullName: 'Director de Tecnolog\u00eda',
        icon: FaLaptopCode, color: '#3B82F6', department: 'C-Suite', model: 'opus',
        description: 'Arquitectura, infraestructura, escalabilidad y decisiones t\u00e9cnicas.',
        capabilities: ['Arquitectura del sistema', 'Roadmap t\u00e9cnico', 'Optimizaci\u00f3n de infra', 'Evaluaci\u00f3n de stack'],
        usageExample: 'Pide al CTO que eval\u00fae si el stack aguanta 10x crecimiento',
        connects: ['dev','qa','uxui','pm']
    },
    {
        id: 'cfo', name: 'CFO', fullName: 'Director Financiero',
        icon: FaMoneyBillWave, color: '#10B981', department: 'C-Suite', model: 'sonnet',
        description: 'P&L, presupuestos, pricing, control de costos y proyecciones.',
        capabilities: ['Estado de resultados', 'An\u00e1lisis de pricing', 'Proyecciones financieras', 'Control de costos'],
        usageExample: 'Pide al CFO un an\u00e1lisis de rentabilidad por servicio',
        connects: ['analyst','sales','ceo','marketing']
    },
    {
        id: 'pm', name: 'PM', fullName: 'Project Manager',
        icon: FaTasks, color: '#8B5CF6', department: 'Operaciones', model: 'sonnet',
        description: 'Roadmap, sprints, priorizaci\u00f3n y coordinaci\u00f3n entre agentes.',
        capabilities: ['Roadmap semanal/mensual', 'Sprint planning', 'Priorizaci\u00f3n ICE', 'Coordinaci\u00f3n de equipo'],
        usageExample: 'Pide al PM que arme el sprint de esta semana',
        connects: ['dev','qa','uxui','marketing','cm','content']
    },
    {
        id: 'dev', name: 'Dev', fullName: 'Desarrollador Senior',
        icon: FaCode, color: '#06B6D4', department: 'Tecnolog\u00eda', model: 'sonnet',
        description: 'Implementa features, refactoriza, debuggea. Conoce toda la arquitectura.',
        capabilities: ['Implementaci\u00f3n de features', 'Bug fixing', 'Refactoring', 'Integraci\u00f3n de APIs'],
        usageExample: 'Usa el Dev para implementar los payment links de MercadoPago',
        connects: ['qa','uxui','cto']
    },
    {
        id: 'qa', name: 'QA', fullName: 'Quality Assurance',
        icon: FaBug, color: '#EF4444', department: 'Tecnolog\u00eda', model: 'sonnet',
        description: 'Testing, code review, seguridad, detecci\u00f3n de bugs y dead code.',
        capabilities: ['Code review', 'Test runner', 'Security audit', 'Dead code detection'],
        usageExample: 'Pide al QA que revise los \u00faltimos cambios antes de deploy',
        connects: ['dev','cto']
    },
    {
        id: 'uxui', name: 'UX/UI', fullName: 'UX/UI Designer',
        icon: FaPalette, color: '#EC4899', department: 'Tecnolog\u00eda', model: 'opus',
        description: 'Dise\u00f1o de interfaces, wireframes, UX research y design system.',
        capabilities: ['Wireframes', 'UX Research', 'Design System', 'CRO'],
        usageExample: 'Pide al UX/UI que redise\u00f1e la landing page para mejorar conversi\u00f3n',
        connects: ['dev','brand','content','copywriter']
    },
    {
        id: 'marketing', name: 'Marketing', fullName: 'Director de Marketing',
        icon: FaBullhorn, color: '#F97316', department: 'Growth', model: 'sonnet',
        description: 'Growth strategy, campa\u00f1as de ads, SEO, funnels y m\u00e9tricas.',
        capabilities: ['Estrategia de growth', 'Campa\u00f1as Meta/Google Ads', 'SEO strategy', 'An\u00e1lisis de funnel'],
        usageExample: 'Que Marketing dise\u00f1e la campa\u00f1a de Meta Ads para este mes',
        connects: ['copywriter','cm','content','analyst','brand']
    },
    {
        id: 'cm', name: 'CM', fullName: 'Community Manager',
        icon: FaUsers, color: '#14B8A6', department: 'Growth', model: 'sonnet',
        description: 'Contenido para redes, calendario editorial, comunidad.',
        capabilities: ['Posts para IG/TikTok/FB', 'Calendario editorial', 'Copies para redes', 'Estrategia de comunidad'],
        usageExample: 'Que el CM genere el calendario de contenido de esta semana',
        connects: ['copywriter','content','marketing','brand']
    },
    {
        id: 'content', name: 'Content', fullName: 'Content SEO Specialist',
        icon: FaPenNib, color: '#6366F1', department: 'Growth', model: 'sonnet',
        description: 'Art\u00edculos de blog, landing pages SEO, posicionamiento org\u00e1nico.',
        capabilities: ['Blog posts (1500-3000 palabras)', 'Landing pages SEO', 'Keyword research', 'Meta descriptions'],
        usageExample: 'Que Content escriba un art\u00edculo sobre tesis de derecho',
        connects: ['marketing','cm','uxui']
    },
    {
        id: 'copywriter', name: 'Copywriter', fullName: 'Copywriter de Ventas',
        icon: FaCopy, color: '#A855F7', department: 'Growth', model: 'sonnet',
        description: 'Copies de venta, emails, ads, landing pages y secuencias de WhatsApp.',
        capabilities: ['Ad copies A/B', 'Email sequences', 'Landing page copies', 'WhatsApp messages'],
        usageExample: 'Que el Copywriter escriba los copies para la campa\u00f1a de mayo',
        connects: ['marketing','cm','sales','brand']
    },
    {
        id: 'sales', name: 'Sales', fullName: 'Director de Ventas',
        icon: FaHandshake, color: '#059669', department: 'Comercial', model: 'sonnet',
        description: 'Scripts de venta, pricing, seguimiento de leads, conversi\u00f3n.',
        capabilities: ['Scripts para bot Sofia', 'Manejo de objeciones', 'Follow-up sequences', 'Pricing strategy'],
        usageExample: 'Pide a Sales scripts de follow-up para leads que no respondieron',
        connects: ['copywriter','customer-success','cfo','analyst']
    },
    {
        id: 'analyst', name: 'Analyst', fullName: 'Data Analyst',
        icon: FaChartLine, color: '#0EA5E9', department: 'Comercial', model: 'sonnet',
        description: 'An\u00e1lisis de m\u00e9tricas, insights, reportes y recomendaciones basadas en datos.',
        capabilities: ['Dashboard ejecutivo', 'An\u00e1lisis de funnel', 'KPIs y tendencias', 'Forecasting'],
        usageExample: 'Que el Analyst genere el reporte semanal de m\u00e9tricas',
        connects: ['cfo','marketing','ceo']
    },
    {
        id: 'brand', name: 'Brand', fullName: 'Brand Strategist',
        icon: FaStar, color: '#D946EF', department: 'Comercial', model: 'sonnet',
        description: 'Identidad de marca, posicionamiento, messaging y diferenciaci\u00f3n.',
        capabilities: ['Brand guidelines', 'Posicionamiento nacional', 'Messaging framework', 'PR strategy'],
        usageExample: 'Pide al Brand Strategist un plan de posicionamiento para CDMX',
        connects: ['uxui','copywriter','cm','marketing','ceo']
    },
    {
        id: 'legal', name: 'Legal', fullName: 'Asesor Legal',
        icon: FaGavel, color: '#78716C', department: 'Soporte', model: 'sonnet',
        description: 'T\u00e9rminos de servicio, privacidad, contratos y compliance mexicano.',
        capabilities: ['ToS y Privacy Policy', 'Contratos con redactores', 'LFPDPPP compliance', 'Protecci\u00f3n de marca'],
        usageExample: 'Pide a Legal que actualice los t\u00e9rminos de servicio',
        connects: ['ceo','cfo']
    },
    {
        id: 'customer-success', name: 'CS', fullName: 'Customer Success',
        icon: FaHeart, color: '#F43F5E', department: 'Soporte', model: 'sonnet',
        description: 'Retenci\u00f3n, satisfacci\u00f3n, onboarding, post-venta y referidos.',
        capabilities: ['Onboarding flows', 'NPS y satisfacci\u00f3n', 'Programa de referidos', 'Re-engagement'],
        usageExample: 'Pide a CS que dise\u00f1e el programa de referidos',
        connects: ['sales','copywriter','analyst']
    }
];

const DEPARTMENTS = ['Core','C-Suite','Tecnolog\u00eda','Operaciones','Growth','Comercial','Soporte'];
const DEPT_COLORS = { 'Core':'#1E40AF','C-Suite':'#F59E0B','Tecnolog\u00eda':'#06B6D4','Operaciones':'#8B5CF6','Growth':'#F97316','Comercial':'#059669','Soporte':'#78716C' };

const WORKFLOWS = [
    { name: 'Lanzar campa\u00f1a', agents: ['marketing','copywriter','cm','analyst'], desc: 'Estrategia \u2192 Copies \u2192 Calendario \u2192 M\u00e9tricas' },
    { name: 'Nueva feature', agents: ['pm','uxui','dev','qa'], desc: 'Planear \u2192 Dise\u00f1ar \u2192 Implementar \u2192 Validar' },
    { name: 'Estrategia trimestral', agents: ['ceo','cfo','pm','analyst'], desc: 'Visi\u00f3n \u2192 Budget \u2192 Roadmap \u2192 Datos' },
    { name: 'Contenido SEO', agents: ['content','cm','marketing'], desc: 'Art\u00edculo \u2192 Distribuci\u00f3n \u2192 Boost ads' },
    { name: 'Posicionamiento de marca', agents: ['brand','copywriter','uxui','dev'], desc: 'Messaging \u2192 Copies \u2192 Dise\u00f1o \u2192 Implementar' },
    { name: 'Optimizar ventas', agents: ['sales','copywriter','customer-success','analyst'], desc: 'Scripts \u2192 Copies \u2192 Retenci\u00f3n \u2192 An\u00e1lisis' },
];

const AGENT_TASKS = {
    diario: [
        { agent: 'analyst', task: 'Revisar KPIs del dashboard: leads nuevos, conversión, ingresos del día, alertas activas', priority: 'alta' },
        { agent: 'sales', task: 'Revisar leads sin atender >24h y asignar seguimiento. Verificar cotizaciones listas sin enviar', priority: 'alta' },
        { agent: 'cm', task: 'Responder comentarios y DMs en Instagram y Facebook. Publicar story del día', priority: 'alta' },
        { agent: 'customer-success', task: 'Verificar proyectos con entregas próximas (<3 días). Contactar clientes con pagos vencidos', priority: 'alta' },
        { agent: 'pm', task: 'Revisar progreso de proyectos activos. Verificar que escritores actualicen avances', priority: 'media' },
        { agent: 'copywriter', task: 'Revisar y optimizar mensajes de seguimiento automático de Sofia bot', priority: 'media' },
        { agent: 'dev', task: 'Monitorear errores en producción (Railway logs). Verificar uptime de APIs', priority: 'media' },
        { agent: 'qa', task: 'Verificar que flujos críticos funcionen: cotización → pago → proyecto', priority: 'baja' },
    ],
    semanal: [
        { agent: 'marketing', task: 'Analizar performance de campañas Meta Ads. Ajustar presupuesto y audiencias. Reportar CAC', priority: 'alta' },
        { agent: 'analyst', task: 'Generar reporte semanal: revenue, leads, conversión, CAC, LTV. Identificar tendencias', priority: 'alta' },
        { agent: 'content', task: 'Publicar 2 artículos SEO en blog. Investigar keywords con volumen de búsqueda', priority: 'alta' },
        { agent: 'cm', task: 'Planificar contenido de la próxima semana (7 posts IG + 3 FB). Scrapping de competencia', priority: 'alta' },
        { agent: 'cfo', task: 'Revisar P&L semanal. Verificar cobros pendientes. Calcular cashflow proyectado', priority: 'media' },
        { agent: 'sales', task: 'Revisar scripts de venta con base en objeciones más comunes. Capacitar al equipo', priority: 'media' },
        { agent: 'brand', task: 'Auditar presencia de marca en redes. Monitorear menciones y reseñas', priority: 'media' },
        { agent: 'uxui', task: 'Revisar analytics de la web: bounce rate, páginas con más salida, CTAs con bajo click', priority: 'baja' },
        { agent: 'dev', task: 'Actualizar dependencias de seguridad. Revisar performance del backend', priority: 'baja' },
    ],
    mensual: [
        { agent: 'ceo', task: 'Definir OKRs del mes. Revisar forecast de revenue. Decisiones estratégicas de crecimiento', priority: 'alta' },
        { agent: 'cfo', task: 'Cerrar mes fiscal: revenue real vs proyectado, márgenes, gastos por categoría, costo por tesis', priority: 'alta' },
        { agent: 'marketing', task: 'Reporte mensual de marketing: ROI por canal, mejores campañas, plan del próximo mes', priority: 'alta' },
        { agent: 'analyst', task: 'Dashboard ejecutivo mensual. Análisis de cohortes. Predicción de revenue próximo mes', priority: 'alta' },
        { agent: 'content', task: 'Auditoría SEO: rankings, tráfico orgánico, contenido que mejor convierte. Plan editorial', priority: 'media' },
        { agent: 'brand', task: 'Revisar posicionamiento vs competencia. Actualizar brand guidelines si necesario', priority: 'media' },
        { agent: 'pm', task: 'Retrospectiva de proyectos: tiempos de entrega, satisfacción, cuellos de botella', priority: 'media' },
        { agent: 'legal', task: 'Revisar términos y condiciones. Verificar cumplimiento LFPDPPP. Contratos de escritores', priority: 'baja' },
        { agent: 'customer-success', task: 'Encuesta NPS a clientes del mes. Identificar candidatos para testimonios y referidos', priority: 'baja' },
        { agent: 'dev', task: 'Revisión de arquitectura. Plan de mejoras técnicas. Optimización de costos cloud', priority: 'baja' },
    ],
};

const TASK_TABS = ['diario', 'semanal', 'mensual'];
const PRIORITY_COLORS = { alta: '#EF4444', media: '#F59E0B', baja: '#6B7280' };

const AdminAgents = () => {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterDept, setFilterDept] = useState('Todos');
    const [outputs, setOutputs] = useState([]);
    const [showOutputModal, setShowOutputModal] = useState(false);
    const [selectedOutput, setSelectedOutput] = useState(null);
    const [hoveredAgent, setHoveredAgent] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [taskFreq, setTaskFreq] = useState('diario');
    const [agentTab, setAgentTab] = useState('overview');
    // Agent conversation state
    const [convAgents, setConvAgents] = useState([]);
    const [convTopic, setConvTopic] = useState('');
    const [convContext, setConvContext] = useState('');
    const [convLoading, setConvLoading] = useState(false);
    const [convHistory, setConvHistory] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);

    const toggleConvAgent = (id) => {
        setConvAgents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    // Estimate tokens for a conversation
    const estimateTokens = (numAgents, topicLen, contextLen) => {
        const agentContext = numAgents * 400; // ~400 tokens per agent profile
        const systemPrompt = 300;
        const input = systemPrompt + agentContext + Math.ceil(topicLen / 4) + Math.ceil(contextLen / 4);
        const output = numAgents * 400; // ~400 tokens per agent response
        return { input, output, total: input + output, costUSD: ((input * 3 + output * 15) / 1000000).toFixed(3) };
    };

    // Reply to agents in an ongoing conversation
    const sendReply = async () => {
        if (!replyText.trim() || !activeConvo) return;
        setConvLoading(true);
        try {
            const res = await fetch('/local/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agents: activeConvo.agents,
                    topic: `Continuación de: "${activeConvo.topic}". El usuario responde a tu última pregunta.`,
                    context: `CONVERSACIÓN ANTERIOR:\n${activeConvo.response.slice(-1500)}\n\nRESPUESTA DEL USUARIO:\n${replyText}\n\nINSTRUCCIÓN: Continúa la conversación tomando en cuenta la respuesta del usuario. Si ya tienes toda la info necesaria, procede a detallar los pasos exactos de ejecución.`,
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setActiveConvo(data);
            setConvHistory(prev => [data, ...prev]);
            setReplyText('');
        } catch (err) {
            alert('Error: ' + err.message);
        }
        setConvLoading(false);
    };

    const loadSavedConversations = async () => {
        try {
            const res = await fetch('/local/agents/conversations');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.conversations) setConvHistory(data.conversations);
        } catch (err) {
            console.warn('[Agentes] No se pudieron cargar conversaciones guardadas:', err.message);
            // Fallback to localStorage if file-based storage fails
            try {
                const local = JSON.parse(localStorage.getItem('tesipedia_agent_convos') || '[]');
                if (local.length) setConvHistory(local);
            } catch {}
        }
    };

    const toggleActionDone = async (convoId, actionIndex, done) => {
        try {
            await fetch('/local/agents/action', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ convoId, actionIndex, done }),
            });
            // Refresh
            await loadSavedConversations();
            if (activeConvo?.id === convoId) {
                const updated = { ...activeConvo };
                if (updated.actions?.[actionIndex]) updated.actions[actionIndex].done = done;
                setActiveConvo(updated);
            }
        } catch {}
    };

    // Redux data for agent context (token-efficient summaries)
    const reduxQuotes = useSelector(state => state.quotes?.quotes || []);
    const reduxProjects = useSelector(state => state.projects?.projects || []);
    const reduxUsers = useSelector(state => state.users?.users || []);
    const reduxConvos = useSelector(state => state.chat?.conversations || []);

    const buildBusinessContext = () => {
        const lines = [];
        if (reduxQuotes.length) {
            const pending = reduxQuotes.filter(q => q.status === 'pending').length;
            const paid = reduxQuotes.filter(q => q.status === 'paid').length;
            const approved = reduxQuotes.filter(q => q.status === 'approved').length;
            lines.push(`Cotizaciones: ${reduxQuotes.length} total, ${pending} pendientes, ${approved} aprobadas, ${paid} pagadas`);
        }
        if (reduxProjects.length) {
            const active = reduxProjects.filter(p => p.status === 'in_progress' || p.status === 'review').length;
            const completed = reduxProjects.filter(p => p.status === 'completed').length;
            const writers = [...new Set(reduxProjects.filter(p => p.writer?.name).map(p => p.writer.name))];
            lines.push(`Proyectos: ${reduxProjects.length} total, ${active} activos, ${completed} completados`);
            if (writers.length) lines.push(`Redactores: ${writers.join(', ')}`);
        }
        if (reduxUsers.length) lines.push(`Usuarios registrados: ${reduxUsers.length}`);
        if (reduxConvos.length) {
            const unread = reduxConvos.filter(c => c.unreadCount > 0 || c.hasUnread).length;
            lines.push(`Conversaciones: ${reduxConvos.length}, ${unread} sin leer`);
        }
        lines.push('Redes: FB facebook.com/profile.php?id=61582053080466 · IG @tesipediaoficial');
        lines.push('n8n (Sofia bot): https://primary-production-73558.up.railway.app');
        lines.push('Web: tesipedia.com');
        return lines.length ? '\nMÉTRICAS ACTUALES DE TESIPEDIA:\n' + lines.join('\n') : '';
    };

    const startConversation = async () => {
        if (convAgents.length < 2 || !convTopic.trim()) return;
        setConvLoading(true);
        try {
            let bizContext = buildBusinessContext();

            // If marketing agents involved, fetch Meta Ads data
            const hasMarketing = convAgents.some(id => ['marketing', 'cm', 'analyst', 'ceo', 'cfo'].includes(id));
            if (hasMarketing) {
                try {
                    const metaRes = await fetch('/local/agents/meta-ads');
                    const metaData = await metaRes.json();
                    if (metaData.campaigns && Array.isArray(metaData.campaigns) && metaData.campaigns.length > 0) {
                        const totalSpend = metaData.campaigns.reduce((s, c) => s + parseFloat(c.spend || 0), 0);
                        const totalClicks = metaData.campaigns.reduce((s, c) => s + parseInt(c.clicks || 0), 0);
                        const totalImpressions = metaData.campaigns.reduce((s, c) => s + parseInt(c.impressions || 0), 0);
                        bizContext += `\n\nMETA ADS (últimos 30 días):\nGasto total: $${totalSpend.toFixed(2)} | Clicks: ${totalClicks} | Impresiones: ${totalImpressions} | CTR promedio: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%`;
                        bizContext += '\nCampañas:\n' + metaData.campaigns.slice(0, 5).map(c => {
                            const leads = c.actions?.find(a => a.action_type === 'lead')?.value || 0;
                            return `- ${c.campaign_name}: $${parseFloat(c.spend||0).toFixed(0)} gastado, ${c.clicks} clicks, ${leads} leads, CPC $${parseFloat(c.cpc||0).toFixed(2)}`;
                        }).join('\n');
                    }
                } catch { /* Meta ads not available, continue without */ }
            }

            const fullContext = (convContext ? convContext + '\n' : '') + bizContext;
            const res = await fetch('/local/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agents: convAgents, topic: convTopic, context: fullContext }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            // data already includes the full convo with actions, saved to disk
            setActiveConvo(data);
            setConvHistory(prev => [data, ...prev]);
            setConvTopic('');
            setConvContext('');
        } catch (err) {
            alert('Error: ' + err.message);
        }
        setConvLoading(false);
    };

    // Load saved conversations on mount
    useEffect(() => { loadSavedConversations(); }, []);

    useEffect(() => {
        const saved = localStorage.getItem('tesipedia_agent_outputs');
        if (saved) { try { setOutputs(JSON.parse(saved)); } catch {} }
    }, []);

    const clearOutputs = () => {
        setOutputs([]);
        localStorage.removeItem('tesipedia_agent_outputs');
    };

    const filteredAgents = filterDept === 'Todos'
        ? AGENTS.filter(a => !a.isOrchestrator)
        : AGENTS.filter(a => a.department === filterDept && !a.isOrchestrator);

    const orchestrator = AGENTS.find(a => a.isOrchestrator);

    const copyCommand = useCallback((agent) => {
        const cmd = agent.usageExample;
        navigator.clipboard.writeText(cmd);
        setCopiedId(agent.id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    const isConnected = (agentId) => {
        if (!hoveredAgent) return false;
        const hovered = AGENTS.find(a => a.id === hoveredAgent);
        return hovered?.connects?.includes(agentId) || agentId === hoveredAgent;
    };

    return (
        <div className="cc-command-center">

            {/* ─── HERO: ORCHESTRATOR ─── */}
            <div className="cc-hero">
                <div className="cc-hero-content">
                    <div className="cc-hero-icon">
                        <FaNetworkWired />
                        <div className="cc-hero-pulse" />
                    </div>
                    <div className="cc-hero-text">
                        <h1>Command Center</h1>
                        <p>Orquesta tu equipo de {AGENTS.length} agentes IA desde un solo lugar</p>
                    </div>
                    <div className="cc-hero-stats">
                        <div className="cc-stat">
                            <span className="cc-stat-number">{AGENTS.length}</span>
                            <span className="cc-stat-label">Agentes</span>
                        </div>
                        <div className="cc-stat">
                            <span className="cc-stat-number">{DEPARTMENTS.length}</span>
                            <span className="cc-stat-label">Departamentos</span>
                        </div>
                        <div className="cc-stat">
                            <span className="cc-stat-number">{outputs.length}</span>
                            <span className="cc-stat-label">Outputs</span>
                        </div>
                    </div>
                </div>
                <div className="cc-hero-terminal">
                    <div className="cc-terminal-bar">
                        <span className="cc-dot red" /><span className="cc-dot yellow" /><span className="cc-dot green" />
                        <span className="cc-terminal-title">Claude Code</span>
                    </div>
                    <div className="cc-terminal-body">
                        <p><span className="cc-prompt">$</span> cd ~/Tesipedia-F && claude</p>
                        <p><span className="cc-prompt">&gt;</span> <span className="cc-typing">Usa el orchestrator para...</span></p>
                        <p className="cc-dim">El orquestador decide qu\u00e9 agentes necesita,</p>
                        <p className="cc-dim">pasa contexto entre ellos y consolida resultados.</p>
                    </div>
                </div>
            </div>

            {/* ─── NAVIGATION TABS ─── */}
            <div className="cc-nav-tabs">
                <button className={`cc-nav-tab ${agentTab === 'overview' ? 'active' : ''}`} onClick={() => setAgentTab('overview')}>
                    <FaProjectDiagram /> Overview
                </button>
                <button className={`cc-nav-tab ${agentTab === 'tareas' ? 'active' : ''}`} onClick={() => setAgentTab('tareas')}>
                    <FaCalendarAlt /> Tareas
                </button>
                <button className={`cc-nav-tab ${agentTab === 'sala' ? 'active' : ''}`} onClick={() => setAgentTab('sala')}>
                    <FaNetworkWired /> Sala de Operaciones
                </button>
                <button className={`cc-nav-tab ${agentTab === 'resultados' ? 'active' : ''}`} onClick={() => { setAgentTab('resultados'); loadSavedConversations(); }}>
                    <FaClipboard /> Resultados {convHistory.length > 0 && <span className="cc-tab-badge">{convHistory.length}</span>}
                </button>
                <button className={`cc-nav-tab ${agentTab === 'historial' ? 'active' : ''}`} onClick={() => { setAgentTab('historial'); loadSavedConversations(); }}>
                    <FaHistory /> Historial
                </button>
                <button className={`cc-nav-tab ${agentTab === 'equipo' ? 'active' : ''}`} onClick={() => setAgentTab('equipo')}>
                    <FaUsers /> Equipo
                </button>
            </div>

            {/* ─── TAB: OVERVIEW — Workflows ─── */}
            {agentTab === 'overview' && <>

            {/* ─── WORKFLOWS PREDEFINIDOS ─── */}
            <div className="cc-section">
                <h3 className="cc-section-title"><FaProjectDiagram /> Workflows predefinidos</h3>
                <p className="cc-section-sub">Flujos de trabajo listos para ejecutar con el orquestador</p>
                <div className="cc-workflows">
                    {WORKFLOWS.map((wf, i) => (
                        <div
                            key={i}
                            className="cc-workflow-card"
                            onClick={() => {
                                const cmd = `Usa el orchestrator para: ${wf.name}`;
                                navigator.clipboard.writeText(cmd);
                                setCopiedId(`wf-${i}`);
                                setTimeout(() => setCopiedId(null), 2000);
                            }}
                        >
                            <div className="cc-wf-header">
                                <strong>{wf.name}</strong>
                                {copiedId === `wf-${i}`
                                    ? <Badge bg="success" className="cc-copied-badge"><FaCheckCircle /> Copiado</Badge>
                                    : <FaClipboard className="cc-wf-copy" />
                                }
                            </div>
                            <div className="cc-wf-agents">
                                {wf.agents.map((aId, j) => {
                                    const ag = AGENTS.find(a => a.id === aId);
                                    if (!ag) return null;
                                    const Icon = ag.icon;
                                    return (
                                        <React.Fragment key={aId}>
                                            {j > 0 && <FaChevronRight className="cc-wf-arrow" />}
                                            <OverlayTrigger placement="top" overlay={<Tooltip>{ag.fullName}</Tooltip>}>
                                                <span className="cc-wf-agent" style={{ background: `${ag.color}15`, color: ag.color, border: `1px solid ${ag.color}30` }}>
                                                    <Icon /> {ag.name}
                                                </span>
                                            </OverlayTrigger>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                            <small className="cc-wf-desc">{wf.desc}</small>
                        </div>
                    ))}
                </div>
            </div>

            </>}

            {/* ─── TAB: TAREAS ─── */}
            {agentTab === 'tareas' && <>
            {/* ─── AGENT TASKS — Daily / Weekly / Monthly ─── */}
            <div className="cc-section">
                <h3 className="cc-section-title"><FaCalendarAlt /> Tareas programadas del equipo</h3>
                <p className="cc-section-sub">Responsabilidades recurrentes de cada agente para operar el negocio</p>

                <div className="cc-task-tabs">
                    {TASK_TABS.map(tab => {
                        const icons = { diario: <FaCalendarAlt />, semanal: <FaCalendarWeek />, mensual: <FaCalendarCheck /> };
                        const labels = { diario: 'Diario', semanal: 'Semanal', mensual: 'Mensual' };
                        return (
                            <button
                                key={tab}
                                className={`cc-task-tab ${taskFreq === tab ? 'active' : ''}`}
                                onClick={() => setTaskFreq(tab)}
                            >
                                {icons[tab]} {labels[tab]} ({AGENT_TASKS[tab].length})
                            </button>
                        );
                    })}
                </div>

                <div className="cc-task-list">
                    {AGENT_TASKS[taskFreq].map((t, i) => {
                        const agent = AGENTS.find(a => a.id === t.agent);
                        if (!agent) return null;
                        const AgentIcon = agent.icon;
                        return (
                            <div key={i} className="cc-task-item" onClick={() => { setSelectedAgent(agent); setShowModal(true); }}>
                                <div className="cc-task-priority" style={{ background: PRIORITY_COLORS[t.priority] }} title={`Prioridad ${t.priority}`} />
                                <div className="cc-task-agent-icon" style={{ background: `${agent.color}18`, color: agent.color }}>
                                    <AgentIcon />
                                </div>
                                <div className="cc-task-body">
                                    <span className="cc-task-agent-name">{agent.fullName}</span>
                                    <span className="cc-task-desc">{t.task}</span>
                                </div>
                                <span className="cc-task-dept" style={{ color: DEPT_COLORS[agent.department] }}>{agent.department}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            </>}

            {/* ─── TAB: SALA DE OPERACIONES ─── */}
            {agentTab === 'sala' && <>
            {/* ─── SALA DE OPERACIONES — Agent Interaction ─── */}
            <div className="cc-section cc-ops-room">
                <h3 className="cc-section-title"><FaNetworkWired /> Sala de operaciones</h3>
                <p className="cc-section-sub">Selecciona 2+ agentes y un tema. El orquestador coordinará la conversación en tiempo real usando Claude Code local.</p>

                {/* Quick presets */}
                <div className="cc-ops-presets">
                    <button className="cc-ops-preset" onClick={() => { setConvAgents(['marketing','sales','analyst']); setConvTopic('Analizar las campañas de Meta Ads actuales. ¿Qué está funcionando? ¿Qué debemos cambiar? ¿Cómo mejorar el CAC?'); }}>
                        <FaBullhorn /> Marketing + Sales + Analyst
                        <small>Estrategia de campañas</small>
                    </button>
                    <button className="cc-ops-preset" onClick={() => { setConvAgents(['uxui','dev','qa']); setConvTopic('Revisar la UX del admin panel. ¿Qué secciones necesitan mejoras? ¿Qué bugs hay? ¿Qué priorizar?'); }}>
                        <FaPalette /> UX/UI + Dev + QA
                        <small>Mejoras del panel</small>
                    </button>
                    <button className="cc-ops-preset" onClick={() => { setConvAgents(['ceo','cfo','analyst']); setConvTopic('Revisar el estado financiero del mes. Revenue, gastos, márgenes, forecast. ¿Estamos en buen camino?'); }}>
                        <FaCrown /> CEO + CFO + Analyst
                        <small>Review financiero</small>
                    </button>
                    <button className="cc-ops-preset" onClick={() => { setConvAgents(['cm','content','copywriter']); setConvTopic('Planificar el contenido de la próxima semana para Instagram y Facebook. Revisar tendencias y competencia.'); }}>
                        <FaPenNib /> CM + Content + Copy
                        <small>Plan de contenido</small>
                    </button>
                    <button className="cc-ops-preset" onClick={() => { setConvAgents(['sales','customer-success','pm']); setConvTopic('Revisar los proyectos activos. ¿Hay clientes en riesgo? ¿Entregas atrasadas? ¿Cómo mejorar satisfacción?'); }}>
                        <FaHeart /> Sales + CS + PM
                        <small>Retención de clientes</small>
                    </button>
                </div>

                {/* Agent selector */}
                <div className="cc-ops-selector">
                    <span className="cc-ops-label">Agentes ({convAgents.length} seleccionados):</span>
                    <div className="cc-ops-agents">
                        {AGENTS.filter(a => !a.isOrchestrator).map(agent => {
                            const Icon = agent.icon;
                            const selected = convAgents.includes(agent.id);
                            return (
                                <button
                                    key={agent.id}
                                    className={`cc-ops-agent-btn ${selected ? 'selected' : ''}`}
                                    style={selected ? { borderColor: agent.color, background: `${agent.color}15` } : {}}
                                    onClick={() => toggleConvAgent(agent.id)}
                                >
                                    <Icon style={{ color: agent.color }} /> {agent.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Topic input */}
                <div className="cc-ops-input-group">
                    <input
                        className="cc-ops-topic"
                        placeholder="¿Sobre qué deben discutir los agentes?"
                        value={convTopic}
                        onChange={e => setConvTopic(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !convLoading && startConversation()}
                    />
                    <textarea
                        className="cc-ops-context"
                        placeholder="Contexto adicional (opcional): datos, métricas, URLs, problemas específicos..."
                        value={convContext}
                        onChange={e => setConvContext(e.target.value)}
                        rows={2}
                    />
                    <div className="cc-ops-start-row">
                        <button
                            className="cc-ops-start"
                            onClick={startConversation}
                            disabled={convAgents.length < 2 || !convTopic.trim() || convLoading}
                        >
                            {convLoading ? (
                                <><span className="cc-ops-spinner" /> Agentes conversando...</>
                            ) : (
                                <><FaArrowRight /> Iniciar conversación</>
                            )}
                        </button>
                        {convAgents.length >= 2 && convTopic.trim() && (() => {
                            const est = estimateTokens(convAgents.length, convTopic.length, convContext.length);
                            return <span className="cc-chat-token-est">~{est.total.toLocaleString()} tokens · ~${est.costUSD} USD</span>;
                        })()}
                    </div>
                </div>

                {/* Active conversation — chat-style display */}
                {activeConvo && (() => {
                    // Parse the response into structured messages
                    const parseMessages = (text) => {
                        const messages = [];
                        let currentAgent = null;
                        let currentText = '';

                        text.split('\n').forEach(line => {
                            // Match patterns like: **[CFO]:** , [Dev]: , **CEO:** , CEO: , **[Analyst]:**
                            const match = line.match(/^\*{0,2}\[?(\w+(?:\/\w+)?)\]?\*{0,2}[:\s]*\*{0,2}(.*)/);
                            if (match) {
                                const name = match[1];
                                const agent = AGENTS.find(a =>
                                    a.name.toLowerCase() === name.toLowerCase() ||
                                    a.id.toLowerCase() === name.toLowerCase() ||
                                    a.fullName.toLowerCase().includes(name.toLowerCase())
                                );
                                if (agent) {
                                    // Save previous message
                                    if (currentAgent && currentText.trim()) {
                                        messages.push({ agent: currentAgent, text: currentText.trim() });
                                    }
                                    currentAgent = agent;
                                    currentText = match[2].replace(/^\*{1,2}\s*/, '').trim();
                                    return;
                                }
                            }

                            // Stop parsing at ACCIONES section
                            if (line.startsWith('## ACCIONES')) {
                                if (currentAgent && currentText.trim()) {
                                    messages.push({ agent: currentAgent, text: currentText.trim() });
                                    currentAgent = null;
                                    currentText = '';
                                }
                                return;
                            }

                            // Skip separators (---) but don't break the flow
                            if (line.trim() === '---') return;

                            // Continuation of current agent's message
                            if (currentAgent) {
                                currentText += '\n' + line;
                            } else if (line.trim() && !line.startsWith('#') && !line.startsWith('-')) {
                                // System/context text before first agent speaks
                                messages.push({ agent: null, text: line.trim() });
                            }
                        });
                        if (currentAgent && currentText.trim()) {
                            messages.push({ agent: currentAgent, text: currentText.trim() });
                        }
                        return messages;
                    };

                    const msgs = parseMessages(activeConvo.response);

                    return (
                        <>
                        <div className="cc-chat">
                            <div className="cc-chat-header">
                                <div className="cc-chat-header-left">
                                    <div className="cc-chat-avatars">
                                        {activeConvo.agents.slice(0, 4).map(id => {
                                            const a = AGENTS.find(ag => ag.id === id);
                                            if (!a) return null;
                                            const I = a.icon;
                                            return <span key={id} className="cc-chat-avatar-mini" style={{ background: `${a.color}25`, color: a.color }}><I /></span>;
                                        })}
                                        {activeConvo.agents.length > 4 && <span className="cc-chat-avatar-more">+{activeConvo.agents.length - 4}</span>}
                                    </div>
                                    <div>
                                        <span className="cc-chat-title">{activeConvo.topic}</span>
                                        <span className="cc-chat-date">{new Date(activeConvo.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <button className="cc-chat-close" onClick={() => setActiveConvo(null)}><FaInfoCircle /></button>
                            </div>

                            <div className="cc-chat-messages">
                                {msgs.map((msg, i) => {
                                    if (!msg.agent) return <div key={i} className="cc-chat-system" dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }} />;
                                    const Icon = msg.agent.icon;
                                    return (
                                        <div key={i} className="cc-chat-bubble">
                                            <div className="cc-chat-bubble-avatar" style={{ background: `${msg.agent.color}20`, color: msg.agent.color }}>
                                                <Icon />
                                            </div>
                                            <div className="cc-chat-bubble-content">
                                                <span className="cc-chat-bubble-name" style={{ color: msg.agent.color }}>{msg.agent.fullName}</span>
                                                <div className="cc-chat-bubble-text" dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions with execute button */}
                        {activeConvo.actions?.length > 0 && (
                            <div className="cc-chat-actions">
                                <div className="cc-chat-actions-header">
                                    <h4><FaCheckCircle style={{ color: '#10B981' }} /> Acciones resultantes</h4>
                                    <span className="cc-chat-actions-count">
                                        {activeConvo.actions.filter(a => a.done).length}/{activeConvo.actions.length}
                                    </span>
                                </div>
                                {activeConvo.actions.map((action, i) => {
                                    const agent = AGENTS.find(a =>
                                        a.id === action.agent?.toLowerCase() ||
                                        a.name.toLowerCase() === action.agent?.toLowerCase() ||
                                        action.text.toLowerCase().includes(`[${a.name.toLowerCase()}]`) ||
                                        action.text.toLowerCase().includes(`[${a.id}]`)
                                    );
                                    const Icon = agent?.icon;
                                    return (
                                        <div key={i} className={`cc-chat-action ${action.done ? 'done' : ''}`}>
                                            <button className={`cc-chat-action-check ${action.done ? 'checked' : ''}`}
                                                onClick={() => toggleActionDone(activeConvo.id, i, !action.done)}>
                                                {action.done ? <FaCheckCircle /> : <span className="cc-action-circle" />}
                                            </button>
                                            {agent && <div className="cc-chat-action-icon" style={{ color: agent.color }}>{Icon && <Icon />}</div>}
                                            <span className="cc-chat-action-text">{action.text.replace(/\*\*/g, '')}</span>
                                        </div>
                                    );
                                })}
                                <button className="cc-chat-execute" disabled={convLoading} onClick={async () => {
                                    const pending = activeConvo.actions.filter(a => !a.done).map(a => a.text.replace(/\*\*/g, '')).join('\n');
                                    // Get involved agents from the actions
                                    const involvedIds = [...new Set(activeConvo.actions.filter(a => !a.done).map(a => {
                                        const found = AGENTS.find(ag => a.text.toLowerCase().includes(`[${ag.name.toLowerCase()}]`) || a.text.toLowerCase().includes(`[${ag.id}]`));
                                        return found?.id;
                                    }).filter(Boolean))];
                                    const agents = involvedIds.length >= 2 ? involvedIds : ['orchestrator', ...involvedIds].slice(0, 3);
                                    if (agents.length < 2) agents.push('pm', 'dev');

                                    setConvLoading(true);
                                    try {
                                        const res = await fetch('/local/agents/chat', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                agents: [...new Set(['pm', ...agents])],
                                                topic: `Evaluar y planificar la ejecución de las tareas pendientes de "${activeConvo.topic}"`,
                                                context: `TAREAS PROPUESTAS:\n${pending}\n\nPara CADA tarea, el equipo debe:\n1. **Evaluar factibilidad** — ¿Se puede hacer? ¿Qué se necesita? ¿Hay riesgos?\n2. **Dar recomendación** — ¿Vale la pena? ¿Hay una mejor alternativa?\n3. **Estimar esfuerzo** — ¿Cuánto tiempo real toma?\n4. **Definir pasos exactos** — archivos a modificar, comandos a correr\n5. **Identificar dependencias** — ¿Qué debe ir primero?\n\nSi algo NO es factible o no tiene sentido, díganlo claramente. Si necesitan info del usuario, pregunten.`,
                                            }),
                                        });
                                        const data = await res.json();
                                        if (data.error) throw new Error(data.error);
                                        setActiveConvo(data);
                                        setConvHistory(prev => [data, ...prev]);
                                    } catch (err) {
                                        alert('Error: ' + err.message);
                                    }
                                    setConvLoading(false);
                                }}>
                                    {convLoading ? <><span className="cc-ops-spinner" /> Orquestador ejecutando...</> : <><FaArrowRight /> Ejecutar con Orquestador</>}
                                </button>
                            </div>
                        )}

                        {/* Reply input — respond to agents */}
                        <div className="cc-chat-reply">
                            <div className="cc-chat-reply-input-wrap">
                                <input
                                    className="cc-chat-reply-input"
                                    placeholder="Responde a los agentes..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !convLoading && sendReply()}
                                    disabled={convLoading}
                                />
                                <button className="cc-chat-reply-send" onClick={sendReply} disabled={!replyText.trim() || convLoading}>
                                    {convLoading ? <span className="cc-ops-spinner" /> : <FaArrowRight />}
                                </button>
                            </div>
                            {replyText.trim() && (() => {
                                const est = estimateTokens(activeConvo.agents.length, replyText.length, activeConvo.response.length > 1500 ? 1500 : activeConvo.response.length);
                                return <span className="cc-chat-token-est">~{est.total.toLocaleString()} tokens · ~${est.costUSD} USD</span>;
                            })()}
                        </div>

                        <button className="cc-ops-back" onClick={() => setActiveConvo(null)}>← Volver</button>
                        </>
                    );
                })()}
            </div>

            </>}

            {/* ─── TAB: RESULTADOS — Visual deliverables ─── */}
            {agentTab === 'resultados' && <>
            <div className="cc-section">
                <h3 className="cc-section-title"><FaClipboard /> Resultados y entregables</h3>
                <p className="cc-section-sub">Outputs concretos de las conversaciones entre agentes — calendarios, copies, análisis, estrategias</p>

                {convHistory.length === 0 ? (
                    <div className="cc-empty">
                        <FaClipboard size={32} />
                        <p>No hay resultados aún. Inicia una conversación en la Sala de Operaciones.</p>
                    </div>
                ) : selectedResult ? (
                    <div className="cc-result-detail">
                        <button className="cc-result-back" onClick={() => setSelectedResult(null)}>← Todos los resultados</button>
                        <div className="cc-result-detail-header">
                            <h3>{selectedResult.topic}</h3>
                            <div className="cc-result-detail-meta">
                                <span className="cc-result-date">{new Date(selectedResult.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="cc-result-agents-row">
                                    {selectedResult.agents.map(id => { const a = AGENTS.find(ag => ag.id === id); if (!a) return null; const I = a.icon; return <span key={id} className="cc-result-agent-chip" style={{ color: a.color }}><I /> {a.name}</span>; })}
                                </span>
                            </div>
                        </div>

                        {/* Resumen ejecutivo — extracted from response */}
                        <div className="cc-result-summary">
                            <h4><FaEye /> Resumen ejecutivo</h4>
                            <div className="cc-result-summary-body" dangerouslySetInnerHTML={{ __html: renderMd(
                                // Extract conclusion/summary portion of response (after last agent message, before ACCIONES)
                                (() => {
                                    const r = selectedResult.response || '';
                                    // Get everything after "---" separators and before "## ACCIONES"
                                    const parts = r.split('## ACCIONES');
                                    const mainContent = parts[0];
                                    // Get the last substantial paragraph as summary
                                    const lines = mainContent.split('\n').filter(l => l.trim() && !l.startsWith('---'));
                                    // Take last 15 lines as summary
                                    return lines.slice(-15).join('\n');
                                })()
                            ) }} />
                        </div>

                        {/* Acciones con checklist */}
                        {selectedResult.actions?.length > 0 && (
                            <div className="cc-chat-actions">
                                <div className="cc-chat-actions-header">
                                    <h4><FaCheckCircle style={{ color: '#10B981' }} /> Plan de acción</h4>
                                    <span className="cc-chat-actions-count">{selectedResult.actions.filter(a => a.done).length}/{selectedResult.actions.length}</span>
                                </div>
                                {selectedResult.actions.map((action, i) => (
                                    <div key={i} className={`cc-chat-action ${action.done ? 'done' : ''}`}>
                                        <button className={`cc-chat-action-check ${action.done ? 'checked' : ''}`}
                                            onClick={() => { toggleActionDone(selectedResult.id, i, !action.done); setSelectedResult(prev => ({ ...prev, actions: prev.actions.map((a, j) => j === i ? { ...a, done: !a.done } : a) })); }}>
                                            {action.done ? <FaCheckCircle /> : <span className="cc-action-circle" />}
                                        </button>
                                        <span className="cc-chat-action-text">{action.text.replace(/\*\*/g, '')}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ALWAYS show deliverable content from conversation */}
                        <div className="cc-result-deliverables">
                            <h4><FaPenNib /> Resultado</h4>
                            <div className="cc-deliverable-content" dangerouslySetInnerHTML={{ __html: renderMd((selectedResult.response || '').split('## ACCIONES')[0]) }} />
                        </div>

                        {/* ALWAYS show prompt if there are pending actions with code/technical tasks */}
                        {selectedResult.actions?.filter(a => !a.done).length > 0 && (() => {
                            const pending = selectedResult.actions.filter(a => !a.done).map(a => '- ' + a.text.replace(/\*\*/g, '')).join('\n');
                            const prompt = `Ejecuta las siguientes tareas en ~/Desktop/Proyectos-Recientes/Tesipedia-F/:\n\n${pending}\n\nContexto: ${selectedResult.topic}`;
                            return (
                                <div className="cc-result-prompt-section">
                                    <h4><FaTerminal /> Prompt para Claude Code</h4>
                                    <div className="cc-result-prompt-box">
                                        <pre className="cc-result-prompt-text">{prompt}</pre>
                                        <button className="cc-result-copy-btn" onClick={() => { navigator.clipboard.writeText(prompt); setCopiedId('prompt'); setTimeout(() => setCopiedId(null), 2000); }}>
                                            {copiedId === 'prompt' ? <><FaCheckCircle /> Copiado</> : <><FaCopy /> Copiar prompt</>}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        <button className="cc-result-view-convo" onClick={() => { setActiveConvo(selectedResult); setAgentTab('sala'); }}>
                            <FaHistory /> Ver conversación completa
                        </button>
                    </div>
                ) : (
                    <div className="cc-results-grid">
                        {convHistory.map(c => {
                            const agentIds = c.agents || [];
                            const hasMarketing = agentIds.some(id => ['marketing', 'cm', 'content', 'copywriter', 'brand'].includes(id));
                            const hasTech = agentIds.some(id => ['dev', 'qa', 'uxui', 'cto'].includes(id));
                            const hasFinance = agentIds.some(id => ['cfo', 'analyst', 'ceo'].includes(id));
                            const hasSales = agentIds.some(id => ['sales', 'customer-success'].includes(id));

                            let typeLabel = 'Estrategia'; let typeColor = '#60A5FA'; let typeIcon = <FaSitemap />;
                            if (hasMarketing && !hasTech) { typeLabel = 'Marketing'; typeColor = '#F97316'; typeIcon = <FaBullhorn />; }
                            else if (hasTech && !hasMarketing) { typeLabel = 'Técnico'; typeColor = '#06B6D4'; typeIcon = <FaCode />; }
                            else if (hasFinance && !hasTech) { typeLabel = 'Finanzas'; typeColor = '#10B981'; typeIcon = <FaMoneyBillWave />; }
                            else if (hasSales) { typeLabel = 'Ventas'; typeColor = '#059669'; typeIcon = <FaHandshake />; }

                            const completedActions = (c.actions || []).filter(a => a.done).length;
                            const totalActions = (c.actions || []).length;
                            const progress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

                            return (
                                <div key={c.id} className={`cc-result-card ${c.hasQuestions ? 'cc-result-needs-input' : ''}`} onClick={() => setSelectedResult(c)}>
                                    <div className="cc-result-header">
                                        <span className="cc-result-type" style={{ background: `${typeColor}15`, color: typeColor, borderColor: `${typeColor}30` }}>{typeIcon} {typeLabel}</span>
                                        <div className="cc-result-header-right">
                                            {c.autoRun && <span className="cc-result-auto-badge">Auto</span>}
                                            {c.hasQuestions && <span className="cc-result-question-badge">Respuesta requerida</span>}
                                            <span className="cc-result-date">{new Date(c.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <h4 className="cc-result-title">{c.topic}</h4>
                                    <div className="cc-result-agents-row">
                                        {c.agents.map(id => { const a = AGENTS.find(ag => ag.id === id); if (!a) return null; const I = a.icon; return <span key={id} className="cc-result-agent-chip" style={{ color: a.color }}><I /> {a.name}</span>; })}
                                    </div>
                                    {totalActions > 0 && (
                                        <div className="cc-result-progress">
                                            <div className="cc-result-progress-bar"><div className="cc-result-progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? '#10B981' : typeColor }} /></div>
                                            <span className="cc-result-progress-text" style={{ color: progress === 100 ? '#10B981' : typeColor }}>{completedActions}/{totalActions} {progress === 100 && '✓'}</span>
                                        </div>
                                    )}
                                    {c.actions?.filter(a => !a.done).slice(0, 2).map((action, i) => (
                                        <div key={i} className="cc-result-pending-item"><span className="cc-result-pending-dot" /><span>{action.text.replace(/\*\*/g, '').slice(0, 70)}...</span></div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            </>}

            {/* ─── TAB: HISTORIAL ─── */}
            {agentTab === 'historial' && <>
            <div className="cc-section">
                <h3 className="cc-section-title"><FaHistory /> Historial de conversaciones</h3>
                <p className="cc-section-sub">Todas las conversaciones entre agentes guardadas en disco — {convHistory.length} registros</p>

                {convHistory.length === 0 ? (
                    <div className="cc-empty">
                        <FaNetworkWired size={32} />
                        <p>No hay conversaciones guardadas. Ve a la Sala de Operaciones para iniciar una.</p>
                    </div>
                ) : (
                    <div className="cc-history-list">
                        {convHistory.map(c => {
                            const completedActions = (c.actions || []).filter(a => a.done).length;
                            const totalActions = (c.actions || []).length;
                            return (
                                <div key={c.id} className="cc-history-card" onClick={() => { setActiveConvo(c); setAgentTab('sala'); }}>
                                    <div className="cc-history-card-top">
                                        <div className="cc-history-card-agents">
                                            {c.agents.map(id => {
                                                const a = AGENTS.find(ag => ag.id === id);
                                                if (!a) return null;
                                                const Icon = a.icon;
                                                return <span key={id} className="cc-history-agent-chip" style={{ color: a.color, borderColor: `${a.color}40` }}><Icon /> {a.name}</span>;
                                            })}
                                        </div>
                                        <span className="cc-history-card-date">
                                            {new Date(c.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="cc-history-card-topic">{c.topic}</div>
                                    {totalActions > 0 && (
                                        <div className="cc-history-card-actions">
                                            <div className="cc-history-progress-bar">
                                                <div className="cc-history-progress-fill" style={{ width: `${totalActions > 0 ? (completedActions / totalActions) * 100 : 0}%` }} />
                                            </div>
                                            <span className="cc-history-progress-text">{completedActions}/{totalActions} acciones</span>
                                        </div>
                                    )}
                                    {c.response && (
                                        <div className="cc-history-card-preview">
                                            {c.response.slice(0, 150)}...
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            </>}

            {/* ─── TAB: EQUIPO ─── */}
            {agentTab === 'equipo' && <>
            {/* ─── DEPARTMENT FILTER ─── */}
            <div className="cc-section">
                <h3 className="cc-section-title"><FaLayerGroup /> Equipo por departamento</h3>
                <p className="cc-section-sub">Haz hover sobre un agente para ver sus conexiones</p>
                <div className="cc-filters">
                    <button className={`cc-filter-btn ${filterDept === 'Todos' ? 'active' : ''}`} onClick={() => setFilterDept('Todos')}>
                        Todos ({AGENTS.length - 1})
                    </button>
                    {DEPARTMENTS.filter(d => d !== 'Core').map(dept => (
                        <button
                            key={dept}
                            className={`cc-filter-btn ${filterDept === dept ? 'active' : ''}`}
                            style={filterDept === dept ? { background: DEPT_COLORS[dept], borderColor: DEPT_COLORS[dept] } : {}}
                            onClick={() => setFilterDept(dept)}
                        >
                            {dept} ({AGENTS.filter(a => a.department === dept).length})
                        </button>
                    ))}
                </div>

                {/* ─── AGENT GRID ─── */}
                <Row className="g-3 mt-1">
                    {filteredAgents.map(agent => {
                        const Icon = agent.icon;
                        const agentOutputs = outputs.filter(o => o.agentId === agent.id);
                        const dimmed = hoveredAgent && !isConnected(agent.id);
                        const highlighted = hoveredAgent && isConnected(agent.id) && hoveredAgent !== agent.id;
                        return (
                            <Col key={agent.id} xs={12} sm={6} lg={4} xl={3}>
                                <div
                                    className={`cc-agent-card ${dimmed ? 'cc-dimmed' : ''} ${highlighted ? 'cc-highlighted' : ''}`}
                                    style={{ '--agent-color': agent.color }}
                                    onMouseEnter={() => setHoveredAgent(agent.id)}
                                    onMouseLeave={() => setHoveredAgent(null)}
                                    onClick={() => { setSelectedAgent(agent); setShowModal(true); }}
                                >
                                    <div className="cc-agent-top">
                                        <div className="cc-agent-icon-wrap">
                                            <Icon />
                                        </div>
                                        <Badge className="cc-model-tag" style={{ background: agent.model === 'opus' ? '#F59E0B' : '#3B82F6' }}>
                                            {agent.model}
                                        </Badge>
                                    </div>
                                    <h5 className="cc-agent-name">{agent.name}</h5>
                                    <span className="cc-agent-role">{agent.fullName}</span>
                                    <p className="cc-agent-desc">{agent.description}</p>
                                    <div className="cc-agent-footer">
                                        <span className="cc-dept-tag" style={{ color: DEPT_COLORS[agent.department], background: `${DEPT_COLORS[agent.department]}12` }}>
                                            {agent.department}
                                        </span>
                                        {agentOutputs.length > 0 && (
                                            <span className="cc-output-count">{agentOutputs.length} outputs</span>
                                        )}
                                        <span className="cc-connections">{agent.connects?.length || 0} conexiones</span>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>

            {/* ─── QUICK GUIDE ─── */}
            <div className="cc-section">
                <div className="cc-guide">
                    <div className="cc-guide-header">
                        <FaTerminal />
                        <div>
                            <h4>C\u00f3mo funciona</h4>
                            <p>Todo tu equipo corre con tu suscripci\u00f3n Max de Claude. Sin costos extra.</p>
                        </div>
                    </div>
                    <div className="cc-guide-steps">
                        <div className="cc-guide-step">
                            <div className="cc-step-num">1</div>
                            <div>
                                <strong>Abre Claude Code</strong>
                                <code>cd ~/Desktop/Proyectos-Recientes/Tesipedia-F && claude</code>
                            </div>
                        </div>
                        <div className="cc-guide-step">
                            <div className="cc-step-num">2</div>
                            <div>
                                <strong>Describe lo que necesitas al orquestador</strong>
                                <code>"Usa el orchestrator para lanzar la campa\u00f1a de mayo"</code>
                            </div>
                        </div>
                        <div className="cc-guide-step">
                            <div className="cc-step-num">3</div>
                            <div>
                                <strong>El orquestador coordina autom\u00e1ticamente</strong>
                                <span>Decide qu\u00e9 agentes usa, en qu\u00e9 orden, y consolida el resultado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </>}

            {/* ─── OUTPUTS HISTORY (always visible) ─── */}
            {outputs.length > 0 && (
                <div className="cc-section">
                    <div className="cc-section-header-row">
                        <h3 className="cc-section-title"><FaHistory /> Historial de outputs</h3>
                        <Button variant="outline-danger" size="sm" onClick={clearOutputs}><FaTrash /> Limpiar</Button>
                    </div>
                    <div className="cc-outputs-grid">
                        {outputs.slice(0, 12).map(output => {
                            const agent = AGENTS.find(a => a.id === output.agentId);
                            const Icon = agent?.icon || FaRobot;
                            return (
                                <div
                                    key={output.id}
                                    className="cc-output-card"
                                    onClick={() => { setSelectedOutput(output); setShowOutputModal(true); }}
                                >
                                    <div className="cc-output-top">
                                        <span className="cc-output-agent" style={{ color: agent?.color || '#6B7280' }}>
                                            <Icon /> {output.agentName}
                                        </span>
                                        <small>{new Date(output.createdAt).toLocaleDateString('es-MX')}</small>
                                    </div>
                                    <p className="cc-output-task">{output.task}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── AGENT DETAIL MODAL ─── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="cc-modal">
                {selectedAgent && (() => {
                    const Icon = selectedAgent.icon;
                    const agentOutputs = outputs.filter(o => o.agentId === selectedAgent.id);
                    return (
                        <>
                            <Modal.Header closeButton className="cc-modal-header" style={{ background: `linear-gradient(135deg, ${selectedAgent.color}10, ${selectedAgent.color}05)` }}>
                                <Modal.Title className="cc-modal-title">
                                    <span className="cc-modal-icon" style={{ background: `${selectedAgent.color}20`, color: selectedAgent.color }}><Icon /></span>
                                    <div>
                                        <strong>{selectedAgent.name}</strong>
                                        <small>{selectedAgent.fullName}</small>
                                    </div>
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="cc-modal-body">
                                <p className="cc-modal-desc">{selectedAgent.description}</p>

                                <div className="cc-modal-section">
                                    <h6>Capacidades</h6>
                                    <div className="cc-caps-grid">
                                        {selectedAgent.capabilities.map((cap, i) => (
                                            <div key={i} className="cc-cap-item" style={{ borderLeft: `3px solid ${selectedAgent.color}` }}>
                                                <FaCheckCircle style={{ color: selectedAgent.color }} /> {cap}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="cc-modal-section">
                                    <h6>Ejemplo de uso</h6>
                                    <div className="cc-usage-block">
                                        <code>{selectedAgent.usageExample}</code>
                                        <button className="cc-copy-btn" onClick={() => copyCommand(selectedAgent)}>
                                            {copiedId === selectedAgent.id ? <FaCheckCircle /> : <FaClipboard />}
                                        </button>
                                    </div>
                                </div>

                                {selectedAgent.connects && selectedAgent.connects.length > 0 && (
                                    <div className="cc-modal-section">
                                        <h6>Se conecta con</h6>
                                        <div className="cc-connects-grid">
                                            {selectedAgent.connects.map(cId => {
                                                const conn = AGENTS.find(a => a.id === cId);
                                                if (!conn) return null;
                                                const CIcon = conn.icon;
                                                return (
                                                    <span key={cId} className="cc-connect-chip" style={{ borderColor: `${conn.color}40`, color: conn.color }}>
                                                        <CIcon /> {conn.name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="cc-modal-section">
                                    <h6>Detalles</h6>
                                    <div className="cc-details-grid">
                                        <div className="cc-detail"><span>Modelo</span><Badge style={{ background: selectedAgent.model === 'opus' ? '#F59E0B' : '#3B82F6' }}>Claude {selectedAgent.model}</Badge></div>
                                        <div className="cc-detail"><span>Departamento</span><strong>{selectedAgent.department}</strong></div>
                                        <div className="cc-detail"><span>Archivo</span><code>.claude/agents/{selectedAgent.id}.md</code></div>
                                        <div className="cc-detail"><span>Costo</span><Badge bg="success">Incluido en Max</Badge></div>
                                    </div>
                                </div>

                                {agentOutputs.length > 0 && (
                                    <div className="cc-modal-section">
                                        <h6>Outputs recientes</h6>
                                        {agentOutputs.slice(0, 3).map(output => (
                                            <div key={output.id} className="cc-modal-output" onClick={() => { setShowModal(false); setSelectedOutput(output); setShowOutputModal(true); }}>
                                                <small>{new Date(output.createdAt).toLocaleDateString('es-MX')}</small>
                                                <span>{output.task}</span>
                                                <FaEye />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Modal.Body>
                        </>
                    );
                })()}
            </Modal>

            {/* ─── OUTPUT DETAIL MODAL ─── */}
            <Modal show={showOutputModal} onHide={() => setShowOutputModal(false)} size="lg" centered>
                {selectedOutput && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <FaEye style={{ marginRight: 8 }} />
                                {selectedOutput.agentName} &mdash; {new Date(selectedOutput.createdAt).toLocaleDateString('es-MX')}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p><strong>Tarea:</strong> {selectedOutput.task}</p>
                            <hr />
                            <pre className="cc-output-pre">{selectedOutput.result}</pre>
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default AdminAgents;
