import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, GripVertical, Trash2, CheckCircle2, Circle, AlertCircle, KanbanSquare,
  X, Plane, Users, Clock, Sparkles,
} from 'lucide-react';
import { crmApi } from '@/lib/api';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";

const STAGES = [
  { key: 'lead', label: 'Lead', color: '#64748B' },
  { key: 'quote', label: 'Cotización', color: '#3B82F6' },
  { key: 'followup', label: 'Seguimiento', color: '#F59E0B' },
  { key: 'closing', label: 'Cierre', color: '#8B5CF6' },
  { key: 'won', label: 'Ganado', color: '#10B981' },
  { key: 'lost', label: 'Perdido', color: '#F43F5E' },
];

const PRIORITY = {
  low: { label: 'Baja', color: '#64748B' },
  medium: { label: 'Media', color: '#3B82F6' },
  high: { label: 'Alta', color: '#F59E0B' },
  urgent: { label: 'Urgente', color: '#F43F5E' },
};

// AI stage automations — replicated from Levond Travel OS
const STAGE_AUTOMATIONS = {
  quote: [{ title: (l) => `Enviar cotización a ${l.contact_name || l.title}`,
    description: (l) => `Preparar propuesta${l.destination ? ` para ${l.destination}` : ''}${l.pax ? ` (${l.pax} pax)` : ''} y enviarla en menos de 24h.`,
    dueInHours: 24, remindBeforeHours: 4, priority: 'high' }],
  followup: [
    { title: (l) => `Seguimiento 1: llamar a ${l.contact_name || l.title}`, description: () => 'Confirmar que recibió la cotización y resolver dudas.', dueInHours: 48, remindBeforeHours: 2, priority: 'high' },
    { title: (l) => `Seguimiento 2: WhatsApp/email a ${l.contact_name || l.title}`, description: () => 'Si no hubo respuesta, reforzar valor y proponer cierre.', dueInHours: 120, remindBeforeHours: 2, priority: 'medium' },
  ],
  closing: [{ title: (l) => `Cierre: confirmar pago/reserva de ${l.contact_name || l.title}`, description: () => 'Enviar link de pago, validar condiciones y cerrar la venta.', dueInHours: 48, remindBeforeHours: 4, priority: 'urgent' }],
};

function buildAutoTasks(stage, lead) {
  const rules = STAGE_AUTOMATIONS[stage];
  if (!rules) return [];
  const now = Date.now();
  return rules.map((r) => {
    const due = new Date(now + r.dueInHours * 3600000);
    const remind = r.remindBeforeHours ? new Date(due.getTime() - r.remindBeforeHours * 3600000) : null;
    return {
      lead_id: lead.id, client_id: lead.client_id || '',
      title: r.title(lead), description: r.description ? r.description(lead) : '',
      due_at: due.toISOString(), remind_at: remind ? remind.toISOString() : '',
      priority: r.priority, status: 'pending',
    };
  });
}

const fmtDate = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
};

export default function TravelCRM() {
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pipeline');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [l, t] = await Promise.all([crmApi.list(), crmApi.tasks()]);
      setLeads(l); setTasks(t);
    } catch (e) { /* noop */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const byStage = useMemo(() => {
    const m = { lead: [], quote: [], followup: [], closing: [], won: [], lost: [] };
    leads.forEach((l) => { (m[l.stage] || m.lead).push(l); });
    return m;
  }, [leads]);

  const stats = useMemo(() => {
    const active = leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost');
    const pipeline = active.reduce((s, l) => s + Number(l.estimated_value || l.value || 0), 0);
    const won = leads.filter((l) => l.stage === 'won').reduce((s, l) => s + Number(l.estimated_value || l.value || 0), 0);
    const overdue = tasks.filter((t) => t.status !== 'done' && t.due_at && new Date(t.due_at) < new Date()).length;
    return { active: active.length, pipeline, won, overdue };
  }, [leads, tasks]);

  const moveLead = async (leadId, newStage) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));
    await crmApi.update(leadId, { stage: newStage });
    const auto = buildAutoTasks(newStage, { ...lead, stage: newStage });
    if (auto.length) {
      const created = await crmApi.createTasksBulk(auto);
      setTasks((ts) => [...created, ...ts]);
    }
  };

  const removeLead = async (id) => {
    if (!window.confirm('¿Eliminar este lead?')) return;
    setLeads((ls) => ls.filter((l) => l.id !== id));
    await crmApi.remove(id);
  };

  const toggleTask = async (task) => {
    const status = task.status === 'done' ? 'pending' : 'done';
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
    await crmApi.updateTask(task.id, { status, completed_at: status === 'done' ? new Date().toISOString() : null });
  };
  const removeTask = async (id) => { setTasks((ts) => ts.filter((t) => t.id !== id)); await crmApi.removeTask(id); };

  return (
    <div className="space-y-6" data-testid="travel-crm-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5 text-[#0F0F13]" style={{ fontFamily: HEADING }}>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))' }}>
              <KanbanSquare className="w-5 h-5" />
            </span>
            Pipeline & Tareas
          </h1>
          <p className="text-[#5F5F6B] text-sm mt-1">CRM de tu agencia — leads, seguimiento y recordatorios con IA</p>
        </div>
        <button onClick={() => setCreating(true)} data-testid="crm-new-lead"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-white text-sm"
          style={{ background: 'linear-gradient(90deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))' }}>
          <Plus className="w-4 h-4" /> Nuevo lead
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Leads activos" value={stats.active} icon={Users} />
        <Stat label="Pipeline (USD)" value={`$${stats.pipeline.toLocaleString()}`} icon={Plane} />
        <Stat label="Cerrado (USD)" value={`$${stats.won.toLocaleString()}`} icon={CheckCircle2} />
        <Stat label="Tareas vencidas" value={stats.overdue} icon={AlertCircle} danger={stats.overdue > 0} />
      </div>

      <div className="flex gap-2 border-b border-black/8">
        {[['pipeline', 'Pipeline Kanban'], ['tasks', 'Tareas & Recordatorios']].map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`crm-tab-${k}`}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all ${tab === k ? 'border-[color:var(--brand-primary,#7C3AED)] text-[#0F0F13]' : 'border-transparent text-[#8A8A9E] hover:text-[#0F0F13]'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {loading ? <p className="text-[#8A8A9E]">Cargando…</p> : tab === 'pipeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {STAGES.map((s) => (
            <Column key={s.key} stage={s} leads={byStage[s.key]} onDrop={(id) => moveLead(id, s.key)} onClick={setEditing} onDelete={removeLead} />
          ))}
        </div>
      ) : (
        <TasksList tasks={tasks} leads={leads} onToggle={toggleTask} onDelete={removeTask} />
      )}

      {(creating || editing) && (
        <LeadDialog lead={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, danger }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-black/8 shadow-sm" data-testid="crm-stat">
      <div className="flex items-center justify-between">
        <div className="text-xs text-[#8A8A9E]">{label}</div>
        <Icon className={`w-4 h-4 ${danger ? 'text-rose-500' : 'text-[color:var(--brand-primary,#7C3AED)]'}`} />
      </div>
      <div className={`text-2xl font-black mt-1 ${danger ? 'text-rose-500' : 'text-[#0F0F13]'}`}>{value}</div>
    </div>
  );
}

function Column({ stage, leads, onDrop, onClick, onDelete }) {
  const [hover, setHover] = useState(false);
  const total = leads.reduce((s, l) => s + Number(l.estimated_value || l.value || 0), 0);
  return (
    <div data-testid={`crm-col-${stage.key}`}
      className={`rounded-xl border bg-[#FAFAF7] p-3 min-h-[420px] transition-colors ${hover ? 'border-[color:var(--brand-primary,#7C3AED)] bg-[color:var(--brand-primary,#7C3AED)]/5' : 'border-black/8'}`}
      onDragOver={(e) => { e.preventDefault(); setHover(true); }} onDragLeave={() => setHover(false)}
      onDrop={(e) => { setHover(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id); }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: stage.color + '22', color: stage.color }}>{stage.label}</span>
        <span className="text-xs text-[#8A8A9E]">{leads.length}</span>
      </div>
      {total > 0 && <div className="text-[11px] text-[#8A8A9E] mb-2">${total.toLocaleString()}</div>}
      <div className="space-y-2">
        {leads.map((l) => (
          <div key={l.id} draggable data-testid={`crm-card-${l.id}`}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', l.id)} onClick={() => onClick(l)}
            className="group rounded-lg border border-black/8 bg-white p-3 cursor-grab active:cursor-grabbing hover:border-[color:var(--brand-primary,#7C3AED)]/50 transition-colors">
            <div className="flex items-start gap-2">
              <GripVertical className="w-3 h-3 mt-1 text-[#B0B0BE] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#0F0F13] truncate">{l.title || l.name}</div>
                {l.contact_name && <div className="text-xs text-[#8A8A9E] truncate">{l.contact_name}</div>}
                {l.destination && <div className="text-xs text-[#8A8A9E] truncate">✈ {l.destination}</div>}
                {(l.estimated_value || l.value) ? <div className="text-xs font-bold text-[#0F0F13] mt-1">${Number(l.estimated_value || l.value).toLocaleString()}</div> : null}
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(l.id); }} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksList({ tasks, leads, onToggle, onDelete }) {
  const leadName = (id) => leads.find((l) => l.id === id)?.title || '';
  const sorted = [...tasks].sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0));
  if (!tasks.length) return <div className="p-8 text-center text-[#8A8A9E] rounded-2xl border border-dashed border-black/12">No hay tareas aún. Mueve un lead a "Cotización", "Seguimiento" o "Cierre" y la IA creará tareas automáticamente.</div>;
  return (
    <div className="space-y-2" data-testid="crm-tasks-list">
      {sorted.map((t) => {
        const overdue = t.status !== 'done' && t.due_at && new Date(t.due_at) < new Date();
        const p = PRIORITY[t.priority] || PRIORITY.medium;
        return (
          <div key={t.id} data-testid="crm-task-row" className={`flex items-start gap-3 p-3 rounded-xl bg-white border ${overdue ? 'border-rose-300' : 'border-black/8'}`}>
            <button onClick={() => onToggle(t)} className="mt-0.5">{t.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-[#B0B0BE]" />}</button>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm ${t.status === 'done' ? 'line-through text-[#8A8A9E]' : 'text-[#0F0F13]'}`}>{t.title}</div>
              {t.description && <div className="text-xs text-[#8A8A9E] mt-0.5">{t.description}</div>}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: p.color + '22', color: p.color }}>{p.label}</span>
                {t.due_at && <span className={`text-[11px] inline-flex items-center gap-1 ${overdue ? 'text-rose-500 font-bold' : 'text-[#8A8A9E]'}`}><Clock className="w-3 h-3" /> {fmtDate(t.due_at)}</span>}
                {leadName(t.lead_id) && <span className="text-[11px] text-[color:var(--brand-primary,#7C3AED)]">· {leadName(t.lead_id)}</span>}
              </div>
            </div>
            <button onClick={() => onDelete(t.id)} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        );
      })}
    </div>
  );
}

function LeadDialog({ lead, onClose, onSaved }) {
  const [f, setF] = useState({
    title: lead?.title || '', contact_name: lead?.contact_name || '', contact_email: lead?.contact_email || '',
    contact_phone: lead?.contact_phone || '', stage: lead?.stage || 'lead', source: lead?.source || '',
    estimated_value: lead?.estimated_value || lead?.value || 0, currency: lead?.currency || 'USD',
    destination: lead?.destination || '', travel_date: lead?.travel_date || '', pax: lead?.pax || 1, notes: lead?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    if (!f.title) return;
    setSaving(true);
    try {
      const payload = { ...f, name: f.title, estimated_value: Number(f.estimated_value) || 0, value: Number(f.estimated_value) || 0, pax: Number(f.pax) || 0 };
      if (lead) await crmApi.update(lead.id, payload); else await crmApi.create(payload);
      onSaved();
    } catch (e) { alert('Error al guardar'); } finally { setSaving(false); }
  };

  const inp = 'w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-sm focus:outline-none focus:border-[color:var(--brand-primary,#7C3AED)]';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose} data-testid="crm-lead-dialog">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-[#0F0F13]" style={{ fontFamily: HEADING }}>{lead ? 'Editar lead' : 'Nuevo lead'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-[#8A8A9E]" /></button>
        </div>
        <div className="space-y-3">
          <input placeholder="Título del viaje / oportunidad *" data-testid="crm-lead-title" value={f.title} onChange={set('title')} className={inp} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nombre del contacto" data-testid="crm-lead-contact" value={f.contact_name} onChange={set('contact_name')} className={inp} />
            <input placeholder="Teléfono" value={f.contact_phone} onChange={set('contact_phone')} className={inp} />
          </div>
          <input placeholder="Email" type="email" value={f.contact_email} onChange={set('contact_email')} className={inp} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Destino" data-testid="crm-lead-destination" value={f.destination} onChange={set('destination')} className={inp} />
            <input placeholder="Origen del lead (Instagram, Web…)" value={f.source} onChange={set('source')} className={inp} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Valor" type="number" data-testid="crm-lead-value" value={f.estimated_value} onChange={set('estimated_value')} className={inp} />
            <input placeholder="Pax" type="number" value={f.pax} onChange={set('pax')} className={inp} />
            <select value={f.stage} onChange={set('stage')} data-testid="crm-lead-stage" className={inp}>
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <textarea placeholder="Notas" rows={2} value={f.notes} onChange={set('notes')} className={inp} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-[#5F5F6B] hover:bg-black/5">Cancelar</button>
          <button onClick={save} disabled={saving || !f.title} data-testid="crm-lead-save"
            className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))' }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
