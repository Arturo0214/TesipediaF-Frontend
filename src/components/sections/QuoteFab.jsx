import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaRegEdit, FaTimes, FaArrowRight, FaArrowLeft, FaCheckCircle,
  FaUser, FaWhatsapp, FaEnvelope, FaGraduationCap, FaFileAlt, FaWhatsapp as FaWA,
} from 'react-icons/fa';
import './QuoteFab.css';

const API_BASE = import.meta.env.VITE_SOCKET_URL || import.meta.env.API_URL || '';
const BACKEND_URL = API_BASE ? API_BASE.replace(/\/$/, '') : window.location.origin;
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_COTIZAR_URL || '';

const NIVELES = ['Licenciatura', 'Maestría', 'Doctorado', 'Especialidad', 'Preparatoria', 'Diplomado'];
const PROYECTOS = ['Tesis', 'Tesina', 'Protocolo / Anteproyecto', 'Artículo científico', 'Reporte / Memoria', 'Otro'];

const EMPTY = { nombre: '', telefono: '', email: '', carrera: '', nivel_estudios: '', tipo_proyecto: '', num_paginas: '', fecha_entrega: '' };

export default function QuoteFab() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 contacto · 1 proyecto · 2 detalle
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validStep = () => {
    if (step === 0) {
      if (!form.nombre.trim()) return 'Escribe tu nombre';
      if (form.telefono.replace(/\D/g, '').length < 10) return 'Escribe un WhatsApp válido (10 dígitos)';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Escribe un correo válido';
    }
    if (step === 1) {
      if (!form.carrera.trim()) return 'Escribe tu carrera';
      if (!form.nivel_estudios) return 'Elige tu nivel';
      if (!form.tipo_proyecto) return 'Elige el tipo de proyecto';
    }
    return '';
  };

  const next = () => {
    const v = validStep();
    if (v) { setErr(v); return; }
    setErr('');
    if (step < 2) setStep(step + 1); else submit();
  };

  const submit = async () => {
    setStatus('sending'); setErr('');
    const clean = form.telefono.replace(/\D/g, '');
    const e164 = clean.startsWith('52') ? `+${clean}` : `+52${clean.slice(-10)}`;
    const payload = {
      nombre: form.nombre.trim(), telefono: clean, telefono_e164: e164, email: form.email.trim(),
      carrera: form.carrera.trim(), nivel_estudios: form.nivel_estudios, tipo_proyecto: form.tipo_proyecto,
      num_paginas: form.num_paginas ? Number(form.num_paginas) : undefined, fecha_entrega: form.fecha_entrega,
      source: 'fab_cotizar', page: window.location.pathname, timestamp: new Date().toISOString(),
    };
    try {
      const [backendRes] = await Promise.allSettled([
        fetch(`${BACKEND_URL}/cotizar-leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        WEBHOOK_URL ? fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}) : Promise.resolve(),
      ]);
      if (backendRes.status === 'fulfilled' && backendRes.value?.ok) {
        setStatus('success');
        try { window.gtag?.('event', 'generate_lead', { source: 'fab_cotizar' }); } catch { /* noop */ }
      } else throw new Error('No se pudo enviar');
    } catch {
      setStatus('error'); setErr('No se pudo enviar. Intenta por WhatsApp.');
    }
  };

  const close = () => { setOpen(false); setTimeout(() => { setStep(0); setForm(EMPTY); setStatus('idle'); setErr(''); }, 300); };

  const pct = ((step + 1) / 3) * 100;

  return (
    <>
      <button className="qf-launch" onClick={() => setOpen(true)} aria-label="Cotiza tu asesoría" data-track-cta="fab_cotizar_open">
        <FaRegEdit /> <span>Cotiza tu asesoría</span>
        <span className="qf-launch-pulse" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="qf-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
            <motion.div
              className="qf-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="qf-close" onClick={close} aria-label="Cerrar"><FaTimes /></button>

              {status === 'success' ? (
                <div className="qf-success">
                  <div className="qf-success-ico"><FaCheckCircle /></div>
                  <h3>¡Listo, {form.nombre.split(' ')[0]}! 🎉</h3>
                  <p>Recibimos tus datos. Un asesor te escribirá por <strong>WhatsApp</strong> en breve con tu cotización sin compromiso.</p>
                  <a className="qf-wa" href={`https://wa.me/525670071517?text=${encodeURIComponent('Hola, acabo de llenar el formulario para cotizar mi ' + (form.tipo_proyecto || 'tesis'))}`} target="_blank" rel="noopener noreferrer">
                    <FaWA /> Adelantar por WhatsApp
                  </a>
                </div>
              ) : (
                <>
                  <div className="qf-head">
                    <span className="qf-kicker">Cotización gratis · sin compromiso</span>
                    <h3>{step === 0 ? 'Empecemos por ti' : step === 1 ? 'Tu proyecto' : 'Últimos detalles'}</h3>
                    <div className="qf-steps">
                      <div className="qf-steps-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="qf-step-n">Paso {step + 1} de 3</span>
                  </div>

                  <div className="qf-body">
                    {step === 0 && (
                      <>
                        <label className="qf-field"><FaUser /><input placeholder="Tu nombre" value={form.nombre} onChange={set('nombre')} autoFocus /></label>
                        <label className="qf-field"><FaWhatsapp /><input placeholder="WhatsApp (10 dígitos)" inputMode="tel" value={form.telefono} onChange={set('telefono')} /></label>
                        <label className="qf-field"><FaEnvelope /><input placeholder="Correo electrónico" inputMode="email" value={form.email} onChange={set('email')} /></label>
                        <p className="qf-hint">🔒 Tus datos son confidenciales. Solo los usamos para enviarte tu cotización.</p>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <label className="qf-field"><FaGraduationCap /><input placeholder="Tu carrera (ej. Derecho)" value={form.carrera} onChange={set('carrera')} autoFocus /></label>
                        <label className="qf-field qf-select"><FaGraduationCap /><select value={form.nivel_estudios} onChange={set('nivel_estudios')}><option value="">Nivel de estudios…</option>{NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
                        <label className="qf-field qf-select"><FaFileAlt /><select value={form.tipo_proyecto} onChange={set('tipo_proyecto')}><option value="">Tipo de proyecto…</option>{PROYECTOS.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <label className="qf-field"><FaFileAlt /><input placeholder="Número de páginas aprox. (opcional)" inputMode="numeric" value={form.num_paginas} onChange={set('num_paginas')} autoFocus /></label>
                        <label className="qf-field"><span className="qf-field-lbl">Fecha objetivo</span><input type="date" value={form.fecha_entrega} onChange={set('fecha_entrega')} /></label>
                        <p className="qf-hint">Con estos datos te damos una cotización precisa en minutos.</p>
                      </>
                    )}
                    {err && <p className="qf-err">{err}</p>}
                  </div>

                  <div className="qf-actions">
                    {step > 0 && <button className="qf-back" onClick={() => { setErr(''); setStep(step - 1); }}><FaArrowLeft /> Atrás</button>}
                    <button className="qf-next" onClick={next} disabled={status === 'sending'}>
                      {status === 'sending' ? 'Enviando…' : step < 2 ? <>Continuar <FaArrowRight /></> : <>Recibir mi cotización <FaCheckCircle /></>}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
