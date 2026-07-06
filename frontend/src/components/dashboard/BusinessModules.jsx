import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Search, Check, X, FileText, Printer, ArrowRight,
  UserRound, Building2, Mail, Phone, Send, Package as PackageIcon
} from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { contactsApi, salesApi, invoicesApi, purchasesApi, productsApi } from '@/lib/api';

// ---- Shared UI ----
const Modal = ({ open, onClose, title, children, wide = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div className={`glass-card-strong rounded-3xl p-7 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} my-8`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-extrabold text-xl text-[#0F0F13]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};
const Input = ({ label, testid, ...p }) => (
  <div className="mb-3">
    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1 block">{label}</label>
    <input data-testid={testid} className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 text-sm font-medium text-[#0F0F13]" {...p} />
  </div>
);
const PrimaryBtn = ({ children, ...p }) => (
  <button {...p} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F0F13] hover:bg-[#7C5CFF] text-white font-bold text-sm transition-all ${p.className || ''}`}>{children}</button>
);
const Badge = ({ children, color = 'purple' }) => {
  const map = {
    purple: 'bg-[#7C5CFF]/10 text-[#7C5CFF]',
    amber: 'bg-[#FFB042]/20 text-[#B27200]',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-[#8A8A9E]/15 text-[#5F5F6B]',
    blue: 'bg-blue-100 text-blue-700',
  };
  return <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${map[color]}`}>{children}</span>;
};

// ===================== CONTACTS =====================
export const Contacts = () => {
  const { lang } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('all'); // all | customer | vendor
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', tax_id: '', is_customer: true, is_vendor: false, notes: '' });

  const refresh = () => contactsApi.list().then(setContacts);
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (filter === 'customer' && !c.is_customer) return false;
      if (filter === 'vendor' && !c.is_vendor) return false;
      if (q && !`${c.name} ${c.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [contacts, filter, q]);

  const create = async (e) => {
    e.preventDefault();
    await contactsApi.create(form);
    setOpen(false); setForm({ name: '', email: '', phone: '', address: '', tax_id: '', is_customer: true, is_vendor: false, notes: '' });
    refresh();
  };

  const T = { title: lang === 'en' ? 'Contacts' : 'Contactos', sub: lang === 'en' ? 'Customers & vendors' : 'Clientes y proveedores', add: lang === 'en' ? 'New contact' : 'Nuevo contacto', all: lang === 'en' ? 'All' : 'Todos', c: lang === 'en' ? 'Customers' : 'Clientes', v: lang === 'en' ? 'Vendors' : 'Proveedores' };

  return (
    <div>
      <Topbar title={T.title} subtitle={`${filtered.length} · ${T.sub}`} right={
        <PrimaryBtn onClick={() => setOpen(true)} data-testid="contacts-add"><Plus className="w-4 h-4" />{T.add}</PrimaryBtn>
      } />
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-1 glass-card rounded-full p-1">
          {[['all', T.all], ['customer', T.c], ['vendor', T.v]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} data-testid={`contacts-filter-${k}`}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === k ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}>{l}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E]" />
          <input data-testid="contacts-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === 'en' ? 'Search…' : 'Buscar…'} className="w-full pl-9 pr-3 py-2 rounded-full glass-card text-sm font-medium" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}
            data-testid={`contact-card-${c.id}`}
            className="glass-card rounded-2xl p-5 hover:shadow-[0_12px_32px_rgba(124,92,255,0.10)] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center text-white font-display font-black">
                {c.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex gap-1">
                {c.is_customer && <Badge color="green">{T.c}</Badge>}
                {c.is_vendor && <Badge color="amber">{T.v}</Badge>}
              </div>
            </div>
            <div className="font-display font-extrabold text-[#0F0F13] text-base truncate">{c.name}</div>
            <div className="mt-1.5 space-y-0.5 text-xs text-[#5F5F6B]">
              {c.email && <div className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3" />{c.email}</div>}
              {c.phone && <div className="flex items-center gap-1.5 truncate"><Phone className="w-3 h-3" />{c.phone}</div>}
              {c.tax_id && <div className="font-mono text-[10px] text-[#8A8A9E] mt-1">{c.tax_id}</div>}
            </div>
            <button onClick={() => contactsApi.remove(c.id).then(refresh)} data-testid={`contact-del-${c.id}`} className="mt-3 opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-16 text-[#8A8A9E]">{lang === 'en' ? 'No contacts' : 'Sin contactos'}</div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={T.add}>
        <form onSubmit={create}>
          <Input label={lang === 'en' ? 'Name' : 'Nombre'} testid="contact-form-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label={lang === 'en' ? 'Email' : 'Correo'} testid="contact-form-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label={lang === 'en' ? 'Phone' : 'Teléfono'} testid="contact-form-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label={lang === 'en' ? 'Address' : 'Dirección'} testid="contact-form-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label={lang === 'en' ? 'Tax ID' : 'ID Fiscal'} testid="contact-form-tax" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
          <div className="flex gap-4 mt-2 mb-3">
            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
              <input type="checkbox" data-testid="contact-form-iscustomer" checked={form.is_customer} onChange={(e) => setForm({ ...form, is_customer: e.target.checked })} /> {T.c}
            </label>
            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
              <input type="checkbox" data-testid="contact-form-isvendor" checked={form.is_vendor} onChange={(e) => setForm({ ...form, is_vendor: e.target.checked })} /> {T.v}
            </label>
          </div>
          <button type="submit" data-testid="contact-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </form>
      </Modal>
    </div>
  );
};

// ===================== Order editor (shared by Sales + Purchases) =====================
const OrderEditor = ({ open, onClose, onSubmit, roleFilter, title, entityLabel, submitLabel, lang }) => {
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [contactId, setContactId] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    contactsApi.list(roleFilter).then(setContacts);
    productsApi.list().then(setProducts);
    setContactId(''); setItems([]); setNotes('');
  }, [open, roleFilter]);

  const addProduct = (p) => {
    setItems((it) => {
      const ex = it.find((x) => x.product_id === p.id);
      if (ex) return it.map((x) => x.product_id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...it, { product_id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };
  const updateQty = (pid, d) => setItems((it) => it.flatMap((x) => x.product_id === pid ? (x.qty + d > 0 ? [{ ...x, qty: x.qty + d }] : []) : [x]));

  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const submit = async () => {
    if (!contactId || items.length === 0) return;
    const contact = contacts.find((c) => c.id === contactId);
    await onSubmit({ contact_id: contactId, contact_name: contact.name, vendor_id: contactId, vendor_name: contact.name, items, notes });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      <div className="mb-3">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1 block">{entityLabel}</label>
        <select value={contactId} onChange={(e) => setContactId(e.target.value)} data-testid="order-contact-select"
          className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF]">
          <option value="">— {lang === 'en' ? 'Select' : 'Seleccionar'} —</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1.5">{lang === 'en' ? 'Add products' : 'Añadir productos'}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1">
          {products.map((p) => (
            <button key={p.id} onClick={() => addProduct(p)} data-testid={`order-add-prod-${p.sku}`}
              className="text-left p-2 rounded-lg bg-white border border-[#7C5CFF]/8 hover:border-[#7C5CFF]/30 text-xs transition-all">
              <div className="font-bold text-[#0F0F13] truncate">{p.name}</div>
              <div className="text-[#7C5CFF] font-black">${p.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1.5">{lang === 'en' ? 'Line items' : 'Líneas'}</div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {items.length === 0 && <div className="text-xs text-[#8A8A9E] italic">{lang === 'en' ? 'No items' : 'Sin líneas'}</div>}
          {items.map((it) => (
            <div key={it.product_id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-1.5 text-sm">
              <div className="min-w-0 flex-1 font-bold text-[#0F0F13] truncate">{it.name}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(it.product_id, -1)} className="w-6 h-6 rounded bg-[#7C5CFF]/10 text-[#7C5CFF] font-bold">-</button>
                <span className="w-8 text-center text-xs font-bold">{it.qty}</span>
                <button onClick={() => updateQty(it.product_id, 1)} className="w-6 h-6 rounded bg-[#7C5CFF]/10 text-[#7C5CFF] font-bold">+</button>
              </div>
              <div className="w-20 text-right font-bold text-[#0F0F13]">${(it.price * it.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#7C5CFF]/10 pt-3 space-y-1 text-sm mb-3">
        <div className="flex justify-between text-[#5F5F6B]"><span>{lang === 'en' ? 'Subtotal' : 'Subtotal'}</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-[#5F5F6B]"><span>{lang === 'en' ? 'Tax (19%)' : 'Impuestos (19%)'}</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between items-baseline pt-1"><span className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">Total</span><span className="font-display font-black text-2xl text-[#0F0F13]">${total.toFixed(2)}</span></div>
      </div>

      <button onClick={submit} disabled={!contactId || items.length === 0} data-testid="order-submit"
        className="w-full bg-[#0F0F13] hover:bg-[#7C5CFF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full text-sm">
        {submitLabel}
      </button>
    </Modal>
  );
};

// ===================== SALES =====================
export const Sales = () => {
  const { lang } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);

  const refresh = () => salesApi.list().then(setOrders);
  useEffect(() => { refresh(); }, []);

  const T = {
    title: lang === 'en' ? 'Sales' : 'Ventas',
    sub: lang === 'en' ? 'Quotes → Orders → Invoices' : 'Cotizaciones → Órdenes → Facturas',
    add: lang === 'en' ? 'New quote' : 'Nueva cotización',
    submit: lang === 'en' ? 'Create quote' : 'Crear cotización',
  };

  const statusColor = { draft: 'gray', confirmed: 'blue', invoiced: 'green', cancelled: 'red' };

  return (
    <div>
      <Topbar title={T.title} subtitle={T.sub}
        right={<PrimaryBtn onClick={() => setOpen(true)} data-testid="sales-add"><Plus className="w-4 h-4" />{T.add}</PrimaryBtn>} />

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
            <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              <th className="p-4">#</th>
              <th className="p-4">{lang === 'en' ? 'Customer' : 'Cliente'}</th>
              <th className="p-4">{lang === 'en' ? 'Items' : 'Líneas'}</th>
              <th className="p-4">Total</th>
              <th className="p-4">{lang === 'en' ? 'Status' : 'Estado'}</th>
              <th className="p-4 text-right">{lang === 'en' ? 'Actions' : 'Acciones'}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} data-testid={`sale-row-${o.number}`} className="border-b border-[#7C5CFF]/5 hover:bg-white/50">
                <td className="p-4 font-mono font-bold text-[#7C5CFF]">{o.number}</td>
                <td className="p-4 font-bold text-[#0F0F13]">{o.contact_name}</td>
                <td className="p-4 text-[#5F5F6B]">{o.items.length}</td>
                <td className="p-4 font-black text-[#0F0F13]">${o.total.toFixed(2)}</td>
                <td className="p-4"><Badge color={statusColor[o.status] || 'gray'}>{o.status}</Badge></td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    {o.status === 'draft' && (
                      <button onClick={async () => { await salesApi.confirm(o.id); refresh(); }}
                        data-testid={`sale-confirm-${o.number}`}
                        className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full">
                        {lang === 'en' ? 'Confirm' : 'Confirmar'}
                      </button>
                    )}
                    {(o.status === 'draft' || o.status === 'confirmed') && (
                      <button onClick={async () => { await salesApi.invoice(o.id); refresh(); }}
                        data-testid={`sale-invoice-${o.number}`}
                        className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {lang === 'en' ? 'Invoice' : 'Facturar'}
                      </button>
                    )}
                    <button onClick={() => salesApi.remove(o.id).then(refresh)} data-testid={`sale-del-${o.number}`} className="text-red-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-[#8A8A9E]">{lang === 'en' ? 'No orders yet' : 'Aún no hay cotizaciones'}</td></tr>}
          </tbody>
        </table>
      </div>

      <OrderEditor open={open} onClose={() => setOpen(false)}
        onSubmit={async (data) => { await salesApi.create(data); refresh(); }}
        roleFilter="customer" title={T.add} entityLabel={lang === 'en' ? 'Customer' : 'Cliente'} submitLabel={T.submit} lang={lang} />
    </div>
  );
};

// ===================== INVOICING =====================
export const Invoicing = () => {
  const { lang } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const refresh = () => invoicesApi.list().then(setInvoices);
  useEffect(() => { refresh(); }, []);

  const T = { title: lang === 'en' ? 'Invoicing' : 'Facturación', sub: lang === 'en' ? 'Invoices & payments' : 'Facturas y pagos' };
  const statusColor = { open: 'amber', paid: 'green', overdue: 'red' };

  const printInvoice = (inv) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${inv.number}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#0F0F13;max-width:800px;margin:auto}
      h1{font-size:32px;letter-spacing:-0.02em;margin:0}
      .brand{color:#7C5CFF;font-weight:900;font-size:24px}
      .meta{margin-top:20px;color:#5F5F6B}
      table{width:100%;border-collapse:collapse;margin-top:30px}
      th,td{padding:10px;text-align:left;border-bottom:1px solid #eee}
      th{background:#f8f8fb;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8A8A9E}
      .totals{margin-top:20px;margin-left:auto;width:300px}
      .totals div{display:flex;justify-content:space-between;padding:6px 0}
      .totals .total{border-top:2px solid #0F0F13;font-weight:900;font-size:20px;margin-top:8px;padding-top:12px}
      .status{display:inline-block;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;background:#7C5CFF;color:white;margin-top:10px}
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><div class="brand">LEVOND</div><div style="color:#5F5F6B;margin-top:4px">Command Center</div></div>
        <div style="text-align:right"><h1>${lang === 'en' ? 'Invoice' : 'Factura'} ${inv.number}</h1>
        <div class="status">${inv.status.toUpperCase()}</div></div>
      </div>
      <div class="meta"><div><strong>${lang === 'en' ? 'Bill to' : 'Facturar a'}:</strong> ${inv.contact_name}</div>
      <div><strong>${lang === 'en' ? 'Date' : 'Fecha'}:</strong> ${new Date(inv.created_at).toLocaleDateString()}</div>
      ${inv.sales_order_number ? `<div><strong>SO:</strong> ${inv.sales_order_number}</div>` : ''}</div>
      <table><thead><tr><th>${lang === 'en' ? 'Item' : 'Concepto'}</th><th style="text-align:right">${lang === 'en' ? 'Qty' : 'Cant.'}</th><th style="text-align:right">${lang === 'en' ? 'Price' : 'Precio'}</th><th style="text-align:right">Total</th></tr></thead><tbody>
      ${inv.items.map((it) => `<tr><td>${it.name}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">$${it.price.toFixed(2)}</td><td style="text-align:right">$${(it.price * it.qty).toFixed(2)}</td></tr>`).join('')}
      </tbody></table>
      <div class="totals">
        <div><span>${lang === 'en' ? 'Subtotal' : 'Subtotal'}</span><span>$${inv.subtotal.toFixed(2)}</span></div>
        <div><span>${lang === 'en' ? 'Tax (19%)' : 'Impuestos (19%)'}</span><span>$${inv.tax.toFixed(2)}</span></div>
        <div class="total"><span>Total</span><span>$${inv.total.toFixed(2)}</span></div>
      </div>
      <p style="color:#8A8A9E;margin-top:60px;font-size:12px">${lang === 'en' ? 'Generated by LEVOND ERP · Powered by AI' : 'Generado con LEVOND ERP · Potenciado por IA'}</p>
      <script>window.print();</script></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html); w.document.close();
  };

  return (
    <div>
      <Topbar title={T.title} subtitle={T.sub} />
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
            <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              <th className="p-4">#</th>
              <th className="p-4">{lang === 'en' ? 'Customer' : 'Cliente'}</th>
              <th className="p-4">{lang === 'en' ? 'Date' : 'Fecha'}</th>
              <th className="p-4">Total</th>
              <th className="p-4">{lang === 'en' ? 'Status' : 'Estado'}</th>
              <th className="p-4 text-right">{lang === 'en' ? 'Actions' : 'Acciones'}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} data-testid={`invoice-row-${inv.number}`} className="border-b border-[#7C5CFF]/5 hover:bg-white/50">
                <td className="p-4 font-mono font-bold text-[#7C5CFF]">{inv.number}</td>
                <td className="p-4 font-bold text-[#0F0F13]">{inv.contact_name}</td>
                <td className="p-4 text-[#5F5F6B]">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-black text-[#0F0F13]">${inv.total.toFixed(2)}</td>
                <td className="p-4"><Badge color={statusColor[inv.status] || 'gray'}>{inv.status}</Badge></td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => printInvoice(inv)} data-testid={`invoice-print-${inv.number}`}
                      className="text-xs font-bold px-2.5 py-1 bg-[#7C5CFF]/10 text-[#7C5CFF] hover:bg-[#7C5CFF]/20 rounded-full inline-flex items-center gap-1">
                      <Printer className="w-3 h-3" /> PDF
                    </button>
                    {inv.status === 'open' && (
                      <button onClick={async () => { await invoicesApi.pay(inv.id); refresh(); }}
                        data-testid={`invoice-pay-${inv.number}`}
                        className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full">
                        {lang === 'en' ? 'Mark paid' : 'Marcar pagada'}
                      </button>
                    )}
                    <button onClick={() => invoicesApi.remove(inv.id).then(refresh)} data-testid={`invoice-del-${inv.number}`} className="text-red-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-[#8A8A9E]">{lang === 'en' ? 'No invoices yet — create one from Sales' : 'Aún no hay facturas — genera una desde Ventas'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== PURCHASES =====================
export const Purchases = () => {
  const { lang } = useLanguage();
  const [pos, setPos] = useState([]);
  const [open, setOpen] = useState(false);
  const refresh = () => purchasesApi.list().then(setPos);
  useEffect(() => { refresh(); }, []);

  const T = {
    title: lang === 'en' ? 'Purchases' : 'Compras',
    sub: lang === 'en' ? 'Purchase orders & receiving' : 'Órdenes de compra y recepción',
    add: lang === 'en' ? 'New PO' : 'Nueva OC',
    submit: lang === 'en' ? 'Create PO' : 'Crear OC',
  };
  const statusColor = { draft: 'gray', received: 'green', cancelled: 'red' };

  return (
    <div>
      <Topbar title={T.title} subtitle={T.sub}
        right={<PrimaryBtn onClick={() => setOpen(true)} data-testid="purchases-add"><Plus className="w-4 h-4" />{T.add}</PrimaryBtn>} />

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
            <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              <th className="p-4">#</th>
              <th className="p-4">{lang === 'en' ? 'Vendor' : 'Proveedor'}</th>
              <th className="p-4">{lang === 'en' ? 'Items' : 'Líneas'}</th>
              <th className="p-4">Total</th>
              <th className="p-4">{lang === 'en' ? 'Status' : 'Estado'}</th>
              <th className="p-4 text-right">{lang === 'en' ? 'Actions' : 'Acciones'}</th>
            </tr>
          </thead>
          <tbody>
            {pos.map((o) => (
              <tr key={o.id} data-testid={`po-row-${o.number}`} className="border-b border-[#7C5CFF]/5 hover:bg-white/50">
                <td className="p-4 font-mono font-bold text-[#7C5CFF]">{o.number}</td>
                <td className="p-4 font-bold text-[#0F0F13]">{o.vendor_name}</td>
                <td className="p-4 text-[#5F5F6B]">{o.items.length}</td>
                <td className="p-4 font-black text-[#0F0F13]">${o.total.toFixed(2)}</td>
                <td className="p-4"><Badge color={statusColor[o.status] || 'gray'}>{o.status}</Badge></td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    {o.status === 'draft' && (
                      <button onClick={async () => { await purchasesApi.receive(o.id); refresh(); }}
                        data-testid={`po-receive-${o.number}`}
                        className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full inline-flex items-center gap-1">
                        <PackageIcon className="w-3 h-3" /> {lang === 'en' ? 'Receive' : 'Recibir'}
                      </button>
                    )}
                    <button onClick={() => purchasesApi.remove(o.id).then(refresh)} data-testid={`po-del-${o.number}`} className="text-red-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pos.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-[#8A8A9E]">{lang === 'en' ? 'No purchase orders yet' : 'Aún no hay órdenes de compra'}</td></tr>}
          </tbody>
        </table>
      </div>

      <OrderEditor open={open} onClose={() => setOpen(false)}
        onSubmit={async (data) => { await purchasesApi.create(data); refresh(); }}
        roleFilter="vendor" title={T.add} entityLabel={lang === 'en' ? 'Vendor' : 'Proveedor'} submitLabel={T.submit} lang={lang} />
    </div>
  );
};
