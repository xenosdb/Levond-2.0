import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Phone, MapPin, Building2, Globe, Cake, BookText, ShieldAlert, Star,
  Pencil, Check, Plus, FileText, Plane, Receipt, MessageSquarePlus, Clock,
  DollarSign, Ticket, Loader2, Paperclip, PhoneCall, CalendarClock, StickyNote,
} from 'lucide-react';
import { contactsApi } from '@/lib/api';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";
const fmt = (d) => (d ? new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const daysUntil = (d) => {
  if (!d) return null;
  try { return Math.ceil((new Date(String(d).slice(0, 10)) - new Date()) / 86400000); } catch { return null; }
};

const TABS = [
  ['profile', 'Perfil'], ['docs', 'Documentación'], ['history', 'Historial'],
  ['timeline', 'Cronología'], ['notes', 'Notas'],
];

const INTERACTION_KINDS = [
  { k: 'note', label: 'Nota', Icon: StickyNote },
  { k: 'call', label: 'Llamada', Icon: PhoneCall },
  { k: 'meeting', label: 'Reunión', Icon: CalendarClock },
  { k: 'task', label: 'Tarea', Icon: Check },
  { k: 'comment', label: 'Comentario', Icon: MessageSquarePlus },
];

const TL_META = {
  created: { Icon: Star, color: '#7C3AED' }, lead: { Icon: FileText, color: '#3B82F6' },
  booking: { Icon: Plane, color: '#10B981' }, invoice: { Icon: Receipt, color: '#F59E0B' },
  note: { Icon: StickyNote, color: '#64748B' }, call: { Icon: PhoneCall, color: '#EC4899' },
  meeting: { Icon: CalendarClock, color: '#8B5CF6' }, task: { Icon: Check, color: '#10B981' },
  comment: { Icon: MessageSquarePlus, color: '#64748B' },
};

export default function Client360({ contactId, onClose, onUpdated }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState({ kind: 'note', text: '' });

  const load = useCallback(async () => {
    if (!contactId) return;
    const d = await contactsApi.get360(contactId);
    setData(d);
    setForm(d.contact);
  }, [contactId]);
  useEffect(() => { load(); }, [load]);

  if (!contactId) return null;

  const c = data?.contact || {};
  const stats = data?.stats || {};
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async () => {
    setSaving(true);
    const patch = { name: form.name, email: form.email, phone: form.phone, address: form.address,
      company: form.company, country: form.country, birthday: form.birthday, tax_id: form.tax_id,
      passport_number: form.passport_number, passport_expiry: form.passport_expiry,
      visa_number: form.visa_number, visa_expiry: form.visa_expiry, vip: !!form.vip };
    await contactsApi.update(contactId, patch);
    setEditing(false); setSaving(false);
    await load(); onUpdated && onUpdated();
  };

  const addNote = async () => {
    if (!newNote.text.trim()) return;
    await contactsApi.addInteraction(contactId, newNote);
    setNewNote({ kind: 'note', text: '' });
    await load();
  };

  const pExp = daysUntil(c.passport_expiry);
  const vExp = daysUntil(c.visa_expiry);
  const bd = c.birthday ? daysUntil(new Date(new Date().getFullYear() + '-' + String(c.birthday).slice(5))) : null;

  const Field = ({ label, k, type = 'text', icon: Icon }) => (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E] mb-1 flex items-center gap-1">{Icon && <Icon className="w-3 h-3" />}{label}</label>
      {editing ? (
        <input type={type} value={form[k] || ''} onChange={set(k)} data-testid={`c360-field-${k}`}
          className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-sm focus:outline-none focus:border-[color:var(--brand-primary,#7C3AED)]" />
      ) : (
        <div className="text-sm text-[#0F0F13] font-medium py-1.5">{c[k] || '—'}</div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/40" onClick={onClose} data-testid="client-360-drawer">
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl h-full bg-[#FAFAF7] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 sticky top-0 bg-[#FAFAF7]/95 backdrop-blur z-10 border-b border-black/8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ background: 'linear-gradient(135deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))' }}>
                {c.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-[#0F0F13]" style={{ fontFamily: HEADING }}>{c.name}</h2>
                  {c.vip && <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><Star className="w-3 h-3" /> VIP</span>}
                </div>
                <p className="text-sm text-[#8A8A9E]">{c.company || c.country || (c.is_vendor ? 'Proveedor' : 'Cliente')}</p>
              </div>
            </div>
            <button onClick={onClose} data-testid="c360-close" className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[['Ingresos', `$${(stats.revenue || 0).toLocaleString()}`, DollarSign],
              ['Reservas', stats.bookings || 0, Plane],
              ['Propuestas', stats.proposals || 0, FileText],
              ['Canceladas', stats.cancelled || 0, Ticket]].map(([l, v, Ic]) => (
              <div key={l} className="rounded-xl bg-white border border-black/8 p-2.5 text-center">
                <Ic className="w-3.5 h-3.5 mx-auto text-[color:var(--brand-primary,#7C3AED)] mb-1" />
                <div className="text-sm font-black text-[#0F0F13] leading-none">{v}</div>
                <div className="text-[9px] uppercase tracking-wider text-[#8A8A9E] mt-1">{l}</div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {(pExp !== null && pExp <= 180) || (vExp !== null && vExp <= 120) || (bd !== null && bd <= 14) ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {pExp !== null && pExp <= 180 && <Alert Icon={BookText} color={pExp <= 60 ? '#F43F5E' : '#F59E0B'} text={`Pasaporte vence en ${pExp}d`} />}
              {vExp !== null && vExp <= 120 && <Alert Icon={ShieldAlert} color={vExp <= 45 ? '#F43F5E' : '#F59E0B'} text={`Visa vence en ${vExp}d`} />}
              {bd !== null && bd >= 0 && bd <= 14 && <Alert Icon={Cake} color="#EC4899" text={`Cumpleaños en ${bd}d`} />}
            </div>
          ) : null}

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-px overflow-x-auto">
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} data-testid={`c360-tab-${k}`}
                className={`px-3 py-2 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${tab === k ? 'border-[color:var(--brand-primary,#7C3AED)] text-[#0F0F13]' : 'border-transparent text-[#8A8A9E] hover:text-[#0F0F13]'}`}>{l}</button>
            ))}
          </div>
        </div>

        {!data ? (
          <div className="p-10 text-center text-[#8A8A9E]"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : (
          <div className="p-6">
            {/* PROFILE */}
            {tab === 'profile' && (
              <div>
                <div className="flex justify-end mb-3">
                  {editing ? (
                    <button onClick={save} disabled={saving} data-testid="c360-save" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: 'var(--brand-primary,#7C3AED)' }}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Guardar
                    </button>
                  ) : (
                    <button onClick={() => setEditing(true)} data-testid="c360-edit" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-black/10 hover:bg-black/5"><Pencil className="w-4 h-4" /> Editar</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre" k="name" icon={undefined} />
                  <Field label="Empresa" k="company" icon={Building2} />
                  <Field label="Email" k="email" type="email" icon={Mail} />
                  <Field label="Teléfono" k="phone" icon={Phone} />
                  <Field label="País" k="country" icon={Globe} />
                  <Field label="Cumpleaños" k="birthday" type="date" icon={Cake} />
                  <div className="col-span-2"><Field label="Dirección" k="address" icon={MapPin} /></div>
                  <Field label="ID Fiscal" k="tax_id" />
                  {editing && (
                    <label className="flex items-center gap-2 text-sm font-bold mt-6 cursor-pointer">
                      <input type="checkbox" checked={!!form.vip} onChange={set('vip')} data-testid="c360-field-vip" /> Cliente VIP
                    </label>
                  )}
                </div>
                {c.notes && !editing && <p className="text-sm text-[#5F5F6B] mt-4 p-3 rounded-xl bg-white border border-black/8">{c.notes}</p>}
              </div>
            )}

            {/* DOCS */}
            {tab === 'docs' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  {editing ? (
                    <button onClick={save} disabled={saving} data-testid="c360-save-docs" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: 'var(--brand-primary,#7C3AED)' }}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Guardar</button>
                  ) : (
                    <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-black/10 hover:bg-black/5"><Pencil className="w-4 h-4" /> Editar</button>
                  )}
                </div>
                <DocCard title="Pasaporte" icon={BookText} exp={pExp}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Número" k="passport_number" />
                    <Field label="Vencimiento" k="passport_expiry" type="date" />
                  </div>
                </DocCard>
                <DocCard title="Visa" icon={ShieldAlert} exp={vExp}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Número" k="visa_number" />
                    <Field label="Vencimiento" k="visa_expiry" type="date" />
                  </div>
                </DocCard>
                <div className="rounded-xl bg-white border border-black/8 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0F0F13] mb-2"><Paperclip className="w-4 h-4" /> Archivos adjuntos</div>
                  {(c.documents || []).length === 0 ? <p className="text-xs text-[#8A8A9E]">Sin archivos. (Próximamente: subida de archivos)</p> : (
                    <ul className="text-sm space-y-1">{(c.documents || []).map((d, i) => <li key={i} className="flex justify-between"><span>{d.name}</span><span className="text-[#8A8A9E]">{fmt(d.expiry)}</span></li>)}</ul>
                  )}
                </div>
              </div>
            )}

            {/* HISTORY */}
            {tab === 'history' && (
              <div className="space-y-5">
                <HistorySection title="Reservas" icon={Plane} items={data.bookings} render={(b) => (
                  <Row key={b.id} title={b.destination} sub={`${fmt(b.start_date)} → ${fmt(b.end_date)} · ${b.pax || 1} pax`} amount={b.amount} status={b.status} />
                )} />
                <HistorySection title="Propuestas / Leads" icon={FileText} items={data.leads} render={(l) => (
                  <Row key={l.id} title={l.title || l.destination} sub={l.stage} amount={l.estimated_value} />
                )} />
                <HistorySection title="Facturas" icon={Receipt} items={data.invoices} render={(iv) => (
                  <Row key={iv.id} title={iv.number} sub={fmt(iv.created_at)} amount={iv.total} status={iv.status} />
                )} />
                {data.stats.destinations?.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E] mb-2">Destinos visitados</div>
                    <div className="flex flex-wrap gap-1.5">{data.stats.destinations.map((d) => <span key={d} className="text-xs font-bold px-2.5 py-1 rounded-full bg-[color:var(--brand-primary,#7C3AED)]/10 text-[color:var(--brand-primary,#7C3AED)]">✈ {d}</span>)}</div>
                  </div>
                )}
              </div>
            )}

            {/* TIMELINE */}
            {tab === 'timeline' && (
              <div className="relative pl-4" data-testid="c360-timeline">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-black/10" />
                {data.timeline.length === 0 ? <p className="text-sm text-[#8A8A9E]">Sin eventos.</p> : data.timeline.map((ev, i) => {
                  const m = TL_META[ev.type] || TL_META.note;
                  return (
                    <div key={i} className="relative pl-6 pb-5">
                      <span className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: m.color }} />
                      <div className="flex items-center gap-2">
                        <m.Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                        <span className="text-sm font-semibold text-[#0F0F13]">{ev.label}</span>
                        {ev.amount ? <span className="text-xs font-bold text-emerald-600">${Number(ev.amount).toLocaleString()}</span> : null}
                      </div>
                      <div className="text-[11px] text-[#8A8A9E] mt-0.5">{fmt(ev.ts)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NOTES */}
            {tab === 'notes' && (
              <div>
                <div className="rounded-xl bg-white border border-black/8 p-3 mb-4">
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {INTERACTION_KINDS.map((k) => (
                      <button key={k.k} onClick={() => setNewNote({ ...newNote, kind: k.k })} data-testid={`c360-note-kind-${k.k}`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${newNote.kind === k.k ? 'text-white' : 'text-[#5F5F6B] bg-black/5'}`}
                        style={newNote.kind === k.k ? { background: 'var(--brand-primary,#7C3AED)' } : {}}>
                        <k.Icon className="w-3 h-3" /> {k.label}
                      </button>
                    ))}
                  </div>
                  <textarea value={newNote.text} onChange={(e) => setNewNote({ ...newNote, text: e.target.value })} data-testid="c360-note-text"
                    rows={2} placeholder="Registrar interacción…" className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:border-[color:var(--brand-primary,#7C3AED)]" />
                  <div className="flex justify-end mt-2">
                    <button onClick={addNote} data-testid="c360-note-add" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: 'var(--brand-primary,#7C3AED)' }}><Plus className="w-4 h-4" /> Agregar</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.interactions.length === 0 ? <p className="text-sm text-[#8A8A9E]">Sin notas ni interacciones.</p> : data.interactions.map((it) => {
                    const m = TL_META[it.kind] || TL_META.note;
                    return (
                      <div key={it.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-black/8" data-testid="c360-interaction">
                        <m.Icon className="w-4 h-4 mt-0.5" style={{ color: m.color }} />
                        <div className="flex-1">
                          <div className="text-sm text-[#0F0F13]">{it.text}</div>
                          <div className="text-[11px] text-[#8A8A9E] mt-0.5">{it.author} · {fmt(it.created_at)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

const Alert = ({ Icon, color, text }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: color + '18', color }}>
    <Icon className="w-3 h-3" /> {text}
  </span>
);
const DocCard = ({ title, icon: Icon, exp, children }) => (
  <div className="rounded-xl bg-white border border-black/8 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-sm font-bold text-[#0F0F13]"><Icon className="w-4 h-4" /> {title}</div>
      {exp !== null && exp <= 180 && <Alert Icon={Clock} color={exp <= 60 ? '#F43F5E' : '#F59E0B'} text={exp < 0 ? 'Vencido' : `${exp}d`} />}
    </div>
    {children}
  </div>
);
const HistorySection = ({ title, icon: Icon, items, render }) => (
  <div>
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A8A9E] mb-2"><Icon className="w-3.5 h-3.5" /> {title} ({items?.length || 0})</div>
    {(!items || items.length === 0) ? <p className="text-sm text-[#8A8A9E]">—</p> : <div className="space-y-1.5">{items.map(render)}</div>}
  </div>
);
const Row = ({ title, sub, amount, status }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/8">
    <div className="min-w-0"><div className="text-sm font-semibold text-[#0F0F13] truncate">{title}</div><div className="text-xs text-[#8A8A9E]">{sub}</div></div>
    <div className="text-right flex-shrink-0">
      {amount ? <div className="text-sm font-bold text-[#0F0F13]">${Number(amount).toLocaleString()}</div> : null}
      {status && <div className="text-[10px] uppercase font-bold text-[#8A8A9E]">{status}</div>}
    </div>
  </div>
);
