import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X, Plane, Hotel, MapPin, Send, Eye, ExternalLink, Copy, Check, Building2, Ticket, Users, Calendar } from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { travelPartnersApi as api } from '@/lib/travel';

// ---- shared ----
const Modal = ({ open, onClose, title, children, wide }) => open ? (
  <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto" onClick={onClose}>
    <div className={`glass-card-strong rounded-3xl p-7 w-full ${wide ? 'max-w-3xl' : 'max-w-md'} my-8`} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-extrabold text-xl text-[#0F0F13]">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>
      {children}
    </div>
  </div>
) : null;

const F = ({ label, testid, as='input', options=[], ...p }) => (
  <div className="mb-3">
    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1 block">{label}</label>
    {as === 'select' ? (
      <select data-testid={testid} className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF]" {...p}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input data-testid={testid} className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF]" {...p} />
    )}
  </div>
);

const Badge = ({ children, c='purple' }) => {
  const map = { purple:'bg-[#7C5CFF]/10 text-[#7C5CFF]', amber:'bg-[#FFB042]/20 text-[#B27200]', green:'bg-emerald-100 text-emerald-700', red:'bg-red-100 text-red-700', gray:'bg-[#8A8A9E]/15 text-[#5F5F6B]', blue:'bg-blue-100 text-blue-700' };
  return <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${map[c]}`}>{children}</span>;
};

const KIND_ICON = { flight: Plane, hotel: Hotel, attraction: MapPin, transport: MapPin, extra: Ticket };
const STATUS_COLOR = { draft:'gray', sent:'blue', accepted:'green', rejected:'red', booked:'purple' };

// ===================== PROPOSALS =====================
const Proposals = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [openNew, setOpenNew] = useState(false);
  const [detail, setDetail] = useState(null);
  const [sentUrl, setSentUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ contact_name:'', destination:'', start_date:'', end_date:'', travelers:2, currency:'USD', markup_pct:15, notes:'', items:[] });
  const [newItem, setNewItem] = useState({ kind:'hotel', name:'', description:'', qty:1, unit_price:0, supplier:'' });

  const refresh = () => api.listProposals().then(setItems);
  useEffect(() => { refresh(); }, []);

  const addItem = () => {
    if (!newItem.name) return;
    setForm(f => ({ ...f, items: [...f.items, { ...newItem, qty: +newItem.qty||1, unit_price: +newItem.unit_price||0 }] }));
    setNewItem({ kind:'hotel', name:'', description:'', qty:1, unit_price:0, supplier:'' });
  };
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_,idx) => idx !== i) }));

  const create = async () => {
    if (!form.contact_name || !form.destination || form.items.length === 0) return;
    const p = await api.createProposal({ ...form, markup_pct: +form.markup_pct||0, travelers: +form.travelers||1 });
    setOpenNew(false);
    setForm({ contact_name:'', destination:'', start_date:'', end_date:'', travelers:2, currency:'USD', markup_pct:15, notes:'', items:[] });
    refresh();
    setDetail(p);
  };

  const send = async (p) => {
    const r = await api.sendProposal(p.id);
    const fullUrl = `${window.location.origin}${r.public_url}`;
    setSentUrl(fullUrl);
    refresh();
  };

  const subtotal = form.items.reduce((s,i) => s + (+i.unit_price||0) * (+i.qty||0), 0);
  const markup = subtotal * (+form.markup_pct||0) / 100;
  const total = subtotal + markup;

  const T = lang==='en' ? { title:'Proposals', add:'New proposal', sub:'Travel packages for clients' } : { title:'Propuestas', add:'Nueva propuesta', sub:'Paquetes de viaje para clientes' };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-display font-black text-2xl text-[#0F0F13]">{T.title}</div>
          <div className="text-sm text-[#5F5F6B]">{items.length} · {T.sub}</div>
        </div>
        <button onClick={() => setOpenNew(true)} data-testid="tp-add-proposal" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F0F13] hover:bg-[#7C5CFF] text-white font-bold text-sm">
          <Plus className="w-4 h-4" />{T.add}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(p => (
          <motion.div key={p.id} whileHover={{ y:-3 }} onClick={() => setDetail(p)} data-testid={`tp-prop-${p.code}`}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:shadow-[0_12px_32px_rgba(124,92,255,0.10)] transition-all group">
            <div className="flex items-start justify-between mb-2">
              <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center"><Plane className="w-5 h-5" /></div>
              <Badge c={STATUS_COLOR[p.status]}>{p.status}</Badge>
            </div>
            <div className="font-display font-black text-lg text-[#0F0F13] truncate">{p.destination}</div>
            <div className="text-sm text-[#5F5F6B] truncate">👤 {p.contact_name}</div>
            <div className="text-xs text-[#8A8A9E] font-mono mt-1">{p.start_date} → {p.end_date}</div>
            <div className="text-xs text-[#8A8A9E] mt-1">{p.travelers} viajeros · {p.items?.length || 0} items · {p.public_views || 0} vistas</div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#7C5CFF]/10">
              <span className="font-mono text-[10px] text-[#7C5CFF] font-bold">{p.code}</span>
              <span className="font-display font-black text-xl text-[#7C5CFF]">${p.total?.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center py-16 text-[#8A8A9E]">{lang==='en'?'No proposals yet':'Sin propuestas aún'}</div>}
      </div>

      {/* CREATE */}
      <Modal open={openNew} onClose={() => setOpenNew(false)} title={T.add} wide>
        <div className="grid grid-cols-2 gap-3">
          <F label="Cliente" testid="tp-form-contact" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} required />
          <F label="Destino" testid="tp-form-dest" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required />
          <F label="Inicio" type="date" testid="tp-form-start" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
          <F label="Fin" type="date" testid="tp-form-end" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          <F label="Viajeros" type="number" min="1" testid="tp-form-trav" value={form.travelers} onChange={e => setForm({...form, travelers: e.target.value})} />
          <F label="Markup %" type="number" step="0.5" testid="tp-form-markup" value={form.markup_pct} onChange={e => setForm({...form, markup_pct: e.target.value})} />
        </div>

        <div className="mt-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B]">Items del paquete</div>
        <div className="grid grid-cols-12 gap-1.5 mb-2">
          <select value={newItem.kind} onChange={e => setNewItem({...newItem, kind: e.target.value})} data-testid="tp-item-kind"
            className="col-span-2 px-2 py-2 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs">
            <option value="flight">✈️ Vuelo</option>
            <option value="hotel">🏨 Hotel</option>
            <option value="attraction">📍 Atracción</option>
            <option value="transport">🚗 Transporte</option>
            <option value="extra">🎁 Extra</option>
          </select>
          <input placeholder="Nombre" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} data-testid="tp-item-name"
            className="col-span-4 px-2 py-2 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs" />
          <input placeholder="Descripción" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}
            className="col-span-3 px-2 py-2 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs" />
          <input type="number" placeholder="Qty" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: e.target.value})}
            className="col-span-1 px-2 py-2 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs" />
          <input type="number" step="0.01" placeholder="Precio" value={newItem.unit_price} onChange={e => setNewItem({...newItem, unit_price: e.target.value})} data-testid="tp-item-price"
            className="col-span-1 px-2 py-2 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs" />
          <button onClick={addItem} data-testid="tp-item-add" className="col-span-1 bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white rounded-lg text-xs font-bold"><Plus className="w-3.5 h-3.5 mx-auto" /></button>
        </div>

        <div className="space-y-1 max-h-40 overflow-y-auto mb-3">
          {form.items.map((it, i) => {
            const Icon = KIND_ICON[it.kind] || Ticket;
            return (
              <div key={i} className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1.5 text-xs">
                <Icon className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <div className="flex-1 truncate"><b>{it.name}</b> — x{it.qty} · ${it.unit_price}</div>
                <div className="font-bold">${(it.unit_price * it.qty).toFixed(2)}</div>
                <button onClick={() => removeItem(i)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[#7C5CFF]/10 pt-3 space-y-1 text-sm mb-3">
          <div className="flex justify-between text-[#5F5F6B]"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-[#5F5F6B]"><span>Markup ({form.markup_pct}%)</span><span>${markup.toFixed(2)}</span></div>
          <div className="flex justify-between items-baseline pt-1"><span className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">Total</span><span className="font-display font-black text-2xl text-[#0F0F13]">${total.toFixed(2)} {form.currency}</span></div>
        </div>

        <F label="Notas" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} testid="tp-form-notes" />
        <button onClick={create} data-testid="tp-form-submit" className="w-full mt-2 bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm">Crear propuesta</button>
      </Modal>

      {/* DETAIL */}
      <Modal open={!!detail} onClose={() => { setDetail(null); setSentUrl(null); }} title={detail ? `${detail.code} · ${detail.destination}` : ''} wide>
        {detail && (
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge c={STATUS_COLOR[detail.status]}>{detail.status}</Badge>
              <Badge c="gray">{detail.travelers} viajeros</Badge>
              <Badge c="gray">{detail.public_views || 0} vistas</Badge>
              <span className="ml-auto font-display font-black text-2xl text-[#7C5CFF]">${detail.total?.toLocaleString()} {detail.currency}</span>
            </div>
            <div className="text-sm text-[#5F5F6B] mb-3">👤 {detail.contact_name} · 📅 {detail.start_date} → {detail.end_date}</div>

            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7C5CFF] mb-2">Items</div>
            <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
              {detail.items?.map((it, i) => {
                const Icon = KIND_ICON[it.kind] || Ticket;
                return (
                  <div key={i} className="flex items-center gap-3 bg-white/60 rounded-lg px-3 py-2 text-sm">
                    <Icon className="w-4 h-4 text-[#7C5CFF]" />
                    <div className="flex-1"><b>{it.name}</b>{it.description && <span className="text-[#8A8A9E]"> — {it.description}</span>}</div>
                    <div className="text-xs text-[#8A8A9E]">x{it.qty}</div>
                    <div className="font-bold w-24 text-right">${(it.unit_price * it.qty).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            {detail.itinerary?.length > 0 && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7C5CFF] mb-2">Itinerario</div>
                <div className="space-y-1.5 mb-4">
                  {detail.itinerary.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-8 text-center font-display font-black text-[#7C5CFF]">D{d.day}</div>
                      <div className="flex-1"><b>{d.title}</b> — <span className="text-[#8A8A9E]">{d.description}</span></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#7C5CFF]/10">
              {detail.status === 'draft' && (
                <button onClick={() => send(detail)} data-testid="tp-send-btn" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold text-sm">
                  <Send className="w-3.5 h-3.5" />Enviar al cliente
                </button>
              )}
              <a href={`/p/${detail.code}`} target="_blank" rel="noreferrer" data-testid="tp-view-public" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#7C5CFF]/20 hover:border-[#7C5CFF]/50 text-[#0F0F13] font-bold text-sm">
                <Eye className="w-3.5 h-3.5" />Ver como cliente
              </a>
              <button onClick={() => { api.deleteProposal(detail.id).then(() => { setDetail(null); refresh(); }); }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm">
                <Trash2 className="w-3.5 h-3.5" />Eliminar
              </button>
            </div>

            {sentUrl && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-xs font-bold text-emerald-700 mb-1">✓ Propuesta enviada. Comparte este link:</div>
                <div className="flex items-center gap-2">
                  <input readOnly value={sentUrl} className="flex-1 px-2 py-1 bg-white rounded text-xs" />
                  <button onClick={() => { navigator.clipboard.writeText(sentUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-xs font-bold px-2 py-1 bg-[#7C5CFF] text-white rounded">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===================== BOOKINGS =====================
const Bookings = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { api.listBookings().then(setItems); }, []);
  return (
    <div>
      <div className="mb-4">
        <div className="font-display font-black text-2xl text-[#0F0F13]">Reservas confirmadas</div>
        <div className="text-sm text-[#5F5F6B]">{items.length} reservas · generadas automáticamente al aceptar propuesta</div>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
            <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              <th className="p-3">#</th><th className="p-3">Cliente</th><th className="p-3">Destino</th><th className="p-3">Fechas</th><th className="p-3">Viajeros</th><th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(b => (
              <tr key={b.id} data-testid={`tp-booking-${b.code}`} className="border-b border-[#7C5CFF]/5">
                <td className="p-3 font-mono font-bold text-[#7C5CFF]">{b.code}</td>
                <td className="p-3 font-bold text-[#0F0F13]">{b.contact_name}</td>
                <td className="p-3">{b.destination}</td>
                <td className="p-3 text-xs font-mono text-[#8A8A9E]">{b.start_date} → {b.end_date}</td>
                <td className="p-3">{b.travelers}</td>
                <td className="p-3 font-black">${b.total?.toLocaleString()} {b.currency}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[#8A8A9E]">Sin reservas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== CATALOG =====================
const Catalog = () => {
  const [tab, setTab] = useState('hotels');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({});

  const cfgs = {
    hotels: { api: api.hotels, fields: ['name','city','stars','room_type','price_per_night','supplier'], icon: Hotel, label: 'Hoteles' },
    attractions: { api: api.attractions, fields: ['name','city','category','price','duration_hours'], icon: MapPin, label: 'Atracciones' },
    airlines: { api: api.airlines, fields: ['name','code','origin','destination','price'], icon: Plane, label: 'Aerolíneas' },
  };
  const c = cfgs[tab];

  const refresh = () => c.api.list().then(setItems);
  useEffect(() => { refresh(); setF({}); }, [tab]);

  const create = async () => {
    await c.api.create(f);
    setOpen(false); setF({}); refresh();
  };

  const Icon = c.icon;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-display font-black text-2xl text-[#0F0F13]">Catálogo</div>
          <div className="text-sm text-[#5F5F6B]">Hoteles, atracciones y aerolíneas</div>
        </div>
        <button onClick={() => setOpen(true)} data-testid="tp-cat-add" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F0F13] hover:bg-[#7C5CFF] text-white font-bold text-sm">
          <Plus className="w-4 h-4" />Añadir
        </button>
      </div>

      <div className="inline-flex items-center gap-1 glass-card rounded-full p-1 mb-4">
        {Object.entries(cfgs).map(([k, v]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`tp-cat-tab-${k}`}
            className={`px-4 py-1.5 rounded-full text-xs font-bold ${tab === k ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(it => (
          <div key={it.id} data-testid={`tp-cat-item-${it.id}`} className="glass-card rounded-2xl p-5 group hover:-translate-y-1 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="w-11 h-11 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] flex items-center justify-center"><Icon className="w-5 h-5" /></div>
              <button onClick={() => c.api.remove(it.id).then(refresh)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="font-display font-black text-lg text-[#0F0F13]">{it.name}</div>
            <div className="text-sm text-[#5F5F6B]">{it.city || `${it.origin} → ${it.destination}`}</div>
            {it.stars && <div className="text-xs text-[#FFB042]">{'★'.repeat(it.stars)}</div>}
            {it.category && <Badge c="purple">{it.category}</Badge>}
            <div className="mt-2 font-black text-[#7C5CFF]">${it.price || it.price_per_night}</div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center py-16 text-[#8A8A9E]">Sin registros</div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Añadir a ${c.label}`}>
        {c.fields.map(field => (
          <F key={field} label={field.replace(/_/g, ' ')} testid={`tp-cat-form-${field}`}
            type={['price','price_per_night','stars','duration_hours'].includes(field) ? 'number' : 'text'}
            step="0.01"
            value={f[field] || ''} onChange={e => setF({...f, [field]: e.target.value})} />
        ))}
        <button onClick={create} data-testid="tp-cat-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">Guardar</button>
      </Modal>
    </div>
  );
};

// ===================== LEADS (Travel CRM) =====================
const LEADS_SEED = [
  { col: 'new', name: 'María González', dest: 'Bali · 7 días', budget: 4200, source: 'WhatsApp', hot: true },
  { col: 'new', name: 'Familia Pérez', dest: 'Grecia · 10 días', budget: 8900, source: 'Web' },
  { col: 'contacted', name: 'Carlos Ruiz', dest: 'Japón · 14 días', budget: 12500, source: 'Email' },
  { col: 'contacted', name: 'Lucía Torres', dest: 'Maldivas · 5 días', budget: 6800, source: 'Referido', hot: true },
  { col: 'contacted', name: 'Ana Villa', dest: 'Machu Picchu', budget: 3400, source: 'IG' },
  { col: 'proposal', name: 'Corp. Innova', dest: 'Incentivo Cancún', budget: 45000, source: 'B2B', hot: true },
  { col: 'proposal', name: 'Diego Marín', dest: 'Patagonia', budget: 9200, source: 'Web' },
  { col: 'booked', name: 'Isabel Cortés', dest: 'Safari Kenya', budget: 11000, source: 'IG' },
];
const COLS = [
  { key: 'new', label: 'Nuevo', color: '#3b82f6' },
  { key: 'contacted', label: 'Contactado', color: '#8b5cf6' },
  { key: 'proposal', label: 'Propuesta', color: '#FFB042' },
  { key: 'booked', label: 'Reservado', color: '#10b981' },
];

const Leads = () => {
  const [items, setItems] = useState(LEADS_SEED);
  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({ name: '', dest: '', budget: '', source: 'Web', col: 'new' });

  const totalValue = items.reduce((s, l) => s + l.budget, 0);
  const create = () => {
    if (!form.name || !form.dest) return;
    setItems([...items, { ...form, budget: +form.budget || 0 }]);
    setForm({ name: '', dest: '', budget: '', source: 'Web', col: 'new' });
    setOpenNew(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-display font-black text-2xl text-[#0F0F13]">Pipeline de leads</div>
          <div className="text-sm text-[#5F5F6B]">{items.length} leads · Valor total: <b className="text-[#7C5CFF]">${totalValue.toLocaleString()}</b></div>
        </div>
        <button onClick={() => setOpenNew(true)} data-testid="tp-lead-add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F0F13] hover:bg-[#7C5CFF] text-white font-bold text-sm">
          <Plus className="w-4 h-4" />Nuevo lead
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {COLS.map((c) => {
          const cItems = items.filter((l) => l.col === c.key);
          return (
            <div key={c.key} data-testid={`tp-lead-col-${c.key}`} className="bg-black/[0.03] rounded-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#5F5F6B]">{c.label}</div>
                </div>
                <div className="text-[11px] font-bold text-[#0F0F13]">{cItems.length}</div>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {cItems.map((l, i) => (
                  <div key={`${c.key}-${i}`} className="glass-card rounded-xl p-3 border border-white/40 hover:shadow-md transition-shadow cursor-grab">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-bold text-[#0F0F13] truncate">{l.name}</div>
                      {l.hot && <div className="text-[9px] font-bold text-red-500">HOT</div>}
                    </div>
                    <div className="text-xs text-[#5F5F6B] truncate">{l.dest}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#7C5CFF]">{l.source}</span>
                      <span className="text-xs font-black text-[#0F0F13]">${l.budget.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Nuevo lead">
        <F label="Cliente" testid="tp-lead-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <F label="Destino / duración" testid="tp-lead-dest" value={form.dest} onChange={(e) => setForm({ ...form, dest: e.target.value })} placeholder="Ej. Grecia · 10 días" />
        <F label="Presupuesto (USD)" type="number" testid="tp-lead-budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        <F label="Fuente" as="select" testid="tp-lead-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
          options={[{ value: 'Web', label: 'Web' }, { value: 'WhatsApp', label: 'WhatsApp' }, { value: 'Email', label: 'Email' }, { value: 'Referido', label: 'Referido' }, { value: 'IG', label: 'Instagram' }, { value: 'B2B', label: 'B2B' }]} />
        <button onClick={create} data-testid="tp-lead-submit" className="w-full mt-2 bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm">Crear lead</button>
      </Modal>
    </div>
  );
};

// ===================== MAIN =====================
const TravelAgency = () => {
  const { lang } = useLanguage();
  const [tab, setTab] = useState('leads');
  const tabs = [
    { key: 'leads', label: lang==='en'?'Leads':'Leads', icon: Users },
    { key: 'proposals', label: lang==='en'?'Proposals':'Propuestas', icon: Ticket },
    { key: 'bookings', label: lang==='en'?'Bookings':'Reservas', icon: Calendar },
    { key: 'catalog', label: lang==='en'?'Catalog':'Catálogo', icon: Building2 },
  ];

  return (
    <div>
      <Topbar title={lang==='en'?'Travel CRM':'CRM Travel'} subtitle={lang==='en'?'Complete travel operations system':'Leads, propuestas, reservas y catálogo'} />
      <div className="inline-flex items-center gap-1 glass-card rounded-full p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} data-testid={`tp-tab-${t.key}`}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${tab === t.key ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>
      {tab === 'leads' && <Leads />}
      {tab === 'proposals' && <Proposals />}
      {tab === 'bookings' && <Bookings />}
      {tab === 'catalog' && <Catalog />}
    </div>
  );
};

export default TravelAgency;
