import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, DollarSign, ShoppingCart, Users, Package, TrendingUp, Activity,
  UtensilsCrossed, ShoppingBag, Plane, Sparkles, X, Check, ChevronRight, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Topbar from '@/components/dashboard/Topbar';
import { dashApi, crmApi, productsApi, restApi, retailApi, travelApi } from '@/lib/api';

// ===================== HOME =====================
export const Home = () => {
  const { t } = useLanguage();
  const { user, tenant } = useAuth();
  const [kpis, setKpis] = useState(null);

  useEffect(() => { dashApi.kpis().then(setKpis).catch(() => {}); }, []);

  const cards = [
    { key: 'revenue', icon: DollarSign, color: '#7C5CFF', prefix: '$', value: kpis?.revenue ?? 0 },
    { key: 'orders', icon: ShoppingCart, color: '#FFB042', value: kpis?.orders ?? 0 },
    { key: 'customers', icon: Users, color: '#10B981', value: kpis?.customers ?? 0 },
    { key: 'stock', icon: Package, color: '#EC4899', value: kpis?.stock ?? 0 },
  ];

  return (
    <div>
      <Topbar
        title={`${t.dash.home.greeting}, ${user?.name?.split(' ')[0] || ''} 👋`}
        subtitle={`${tenant?.name} · ${t.dash.home.welcome}`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="home-kpis">
        {cards.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            data-testid={`kpi-${c.key}`}
            className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">{t.dash.home.kpis[c.key]}</div>
            <div className="font-display font-black text-3xl tracking-tight text-[#0F0F13] mt-1">
              {c.prefix || ''}{c.value.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick + Activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#FFB042]" />
            <h3 className="font-display font-extrabold text-lg text-[#0F0F13]">{t.dash.home.quick}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: t.dash.menu.crm, to: '/app/crm', Icon: Users, c: '#7C5CFF' },
              { label: t.dash.menu.pos_restaurant, to: '/app/restaurant', Icon: UtensilsCrossed, c: '#FF6B6B' },
              { label: t.dash.menu.pos_retail, to: '/app/retail', Icon: ShoppingBag, c: '#10B981' },
              { label: t.dash.menu.inventory, to: '/app/inventory', Icon: Package, c: '#8B5CF6' },
              { label: t.dash.menu.travel, to: '/app/travel', Icon: Plane, c: '#3B82F6' },
            ].map((q, i) => (
              <a
                key={i} href={q.to}
                data-testid={`quick-action-${i}`}
                className="group flex items-center justify-between gap-2 p-4 rounded-xl bg-white/70 hover:bg-white border border-[#7C5CFF]/8 hover:border-[#7C5CFF]/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${q.c}18`, color: q.c }}>
                    <q.Icon className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <span className="font-bold text-sm text-[#0F0F13]">{q.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A8A9E] group-hover:text-[#7C5CFF] group-hover:translate-x-0.5 transition-all" />
              </a>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#7C5CFF]" />
            <h3 className="font-display font-extrabold text-lg text-[#0F0F13]">{t.dash.home.recent}</h3>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-auto pr-1" data-testid="activity-feed">
            {(kpis?.activity || []).length === 0 && <div className="text-sm text-[#8A8A9E]">{t.dash.common.empty}</div>}
            {(kpis?.activity || []).map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7C5CFF] flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-[#0F0F13] font-medium">{a.message}</div>
                  <div className="text-xs text-[#8A8A9E] mt-0.5 uppercase tracking-wider">{a.kind}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== helpers =====================
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose} data-testid="modal-backdrop">
      <div className="glass-card-strong rounded-3xl p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-extrabold text-xl text-[#0F0F13]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center" data-testid="modal-close"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = 'text', testid, ...rest }) => (
  <div className="mb-3">
    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1 block">{label}</label>
    <input
      data-testid={testid}
      type={type} value={value} onChange={onChange}
      className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 text-sm font-medium text-[#0F0F13]"
      {...rest}
    />
  </div>
);

const PrimaryBtn = ({ children, ...p }) => (
  <button {...p} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F0F13] hover:bg-[#7C5CFF] text-white font-bold text-sm transition-all ${p.className || ''}`}>{children}</button>
);

// ===================== CRM =====================
export const CRM = () => {
  const { t } = useLanguage();
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', value: 0, stage: 'Nuevo' });

  const refresh = () => crmApi.list().then(setLeads);
  useEffect(() => { refresh(); }, []);

  const stages = t.dash.crm.stages;

  const create = async (e) => {
    e.preventDefault();
    await crmApi.create({ ...form, value: parseFloat(form.value) || 0 });
    setOpen(false); setForm({ name: '', email: '', phone: '', value: 0, stage: stages[0] });
    refresh();
  };

  const changeStage = async (lead, stage) => { await crmApi.update(lead.id, { stage }); refresh(); };
  const remove = async (id) => { await crmApi.remove(id); refresh(); };

  const byStage = (s) => leads.filter((l) => l.stage === s);

  return (
    <div>
      <Topbar
        title={t.dash.crm.title}
        subtitle={t.dash.crm.pipeline}
        right={<PrimaryBtn onClick={() => setOpen(true)} data-testid="crm-add-lead"><Plus className="w-4 h-4" />{t.dash.crm.addLead}</PrimaryBtn>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {stages.map((s) => (
          <div key={s} className="glass-card rounded-2xl p-3.5" data-testid={`crm-column-${s}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-extrabold text-sm text-[#0F0F13]">{s}</div>
              <div className="text-xs font-bold text-[#8A8A9E] bg-white/70 rounded-full px-2 py-0.5">{byStage(s).length}</div>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {byStage(s).map((l) => (
                <div key={l.id} className="bg-white rounded-xl p-3 border border-[#7C5CFF]/8 hover:border-[#7C5CFF]/30 transition-all group" data-testid={`lead-card-${l.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F0F13] truncate">{l.name}</div>
                      <div className="text-xs text-[#8A8A9E] truncate">{l.email}</div>
                    </div>
                    <button onClick={() => remove(l.id)} data-testid={`lead-delete-${l.id}`} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[11px] font-bold text-[#7C5CFF]">${(l.value || 0).toLocaleString()}</span>
                    <select
                      value={l.stage} onChange={(e) => changeStage(l, e.target.value)}
                      data-testid={`lead-stage-${l.id}`}
                      className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-[#7C5CFF]/10 text-[#7C5CFF] border-none focus:outline-none cursor-pointer"
                    >
                      {stages.map((st) => <option key={st}>{st}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t.dash.crm.addLead}>
        <form onSubmit={create}>
          <Input label={t.dash.crm.leadName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required testid="lead-form-name" />
          <Input label={t.dash.crm.leadEmail} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" testid="lead-form-email" />
          <Input label={t.dash.crm.leadPhone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} testid="lead-form-phone" />
          <Input label={t.dash.crm.leadValue} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} type="number" testid="lead-form-value" />
          <button type="submit" data-testid="lead-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full mt-3 text-sm">{t.dash.common.save}</button>
        </form>
      </Modal>
    </div>
  );
};

// ===================== POS Restaurante =====================
export const PosRestaurant = () => {
  const { t } = useLanguage();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTable, setActiveTable] = useState(null);

  const refresh = async () => {
    const [tt, pp] = await Promise.all([restApi.tables(), productsApi.list('restaurant')]);
    setTables(tt); setProducts(pp);
    if (activeTable) {
      const upd = tt.find((x) => x.id === activeTable.id);
      if (upd) setActiveTable(upd);
    }
  };
  useEffect(() => { refresh(); }, []); // eslint-disable-line

  const openTable = async (tbl) => {
    if (!tbl.order) await restApi.openOrder(tbl.id);
    await refresh();
    const fresh = (await restApi.tables()).find((x) => x.id === tbl.id);
    setActiveTable(fresh);
  };

  const addItem = async (p) => {
    if (!activeTable) return;
    await restApi.addItem(activeTable.id, { product_id: p.id, name: p.name, price: p.price, qty: 1 });
    await refresh();
  };

  const closeAndCharge = async () => {
    if (!activeTable) return;
    await restApi.closeOrder(activeTable.id, 'cash');
    setActiveTable(null);
    refresh();
  };

  return (
    <div>
      <Topbar title={t.dash.pos_r.title} subtitle={t.dash.pos_r.tables} />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Tables */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tables.map((tbl) => {
              const isOpen = !!tbl.order;
              const isActive = activeTable?.id === tbl.id;
              return (
                <button
                  key={tbl.id} onClick={() => openTable(tbl)}
                  data-testid={`table-${tbl.name}`}
                  className={`relative p-5 rounded-2xl transition-all text-left ${
                    isActive ? 'bg-[#7C5CFF] text-white shadow-[0_8px_24px_rgba(124,92,255,0.35)]' :
                    isOpen ? 'bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 hover:border-[#FF6B6B]/60' :
                    'glass-card hover:border-[#7C5CFF]/30'
                  }`}
                >
                  <UtensilsCrossed className={`w-5 h-5 mb-3 ${isActive ? 'text-white' : isOpen ? 'text-[#FF6B6B]' : 'text-[#7C5CFF]'}`} />
                  <div className={`font-display font-black text-lg ${isActive ? 'text-white' : 'text-[#0F0F13]'}`}>{tbl.name}</div>
                  <div className={`text-xs font-bold ${isActive ? 'text-white/80' : isOpen ? 'text-[#FF6B6B]' : 'text-emerald-600'}`}>
                    {isOpen ? t.dash.pos_r.occupied : t.dash.pos_r.free} · {tbl.capacity}p
                  </div>
                  {isOpen && !isActive && (
                    <div className="absolute top-3 right-3 text-xs font-bold text-[#FF6B6B]">${tbl.order.total?.toFixed(2)}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Menu */}
          {activeTable && (
            <div className="mt-6">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#8A8A9E] mb-3">{t.dash.pos_r.menu}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5" data-testid="restaurant-menu">
                {products.map((p) => (
                  <button
                    key={p.id} onClick={() => addItem(p)}
                    data-testid={`menu-item-${p.sku}`}
                    className="text-left p-3 rounded-xl bg-white border border-[#7C5CFF]/8 hover:border-[#7C5CFF]/40 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="font-bold text-sm text-[#0F0F13]">{p.name}</div>
                    <div className="text-xs text-[#8A8A9E]">{p.category}</div>
                    <div className="mt-1.5 text-sm font-black text-[#7C5CFF]">${p.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order ticket */}
        <div className="glass-card-strong rounded-2xl p-5 h-fit sticky top-6" data-testid="restaurant-ticket">
          <h3 className="font-display font-extrabold text-lg text-[#0F0F13] mb-4">
            {activeTable ? activeTable.name : t.dash.pos_r.openTable}
          </h3>
          {!activeTable && <div className="text-sm text-[#8A8A9E]">Selecciona una mesa</div>}
          {activeTable && (
            <>
              <div className="space-y-2 max-h-[300px] overflow-auto mb-3">
                {(activeTable.order?.items || []).length === 0 && <div className="text-sm text-[#8A8A9E]">{t.dash.pos_r.empty_order}</div>}
                {(activeTable.order?.items || []).map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white/60 rounded-xl px-3 py-2">
                    <div className="min-w-0">
                      <div className="font-bold text-[#0F0F13] truncate">{it.name}</div>
                      <div className="text-xs text-[#8A8A9E]">x{it.qty}</div>
                    </div>
                    <div className="font-bold text-[#0F0F13]">${(it.price * it.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#7C5CFF]/10 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">{t.dash.pos_r.orderTotal}</span>
                <span className="font-display font-black text-2xl text-[#0F0F13]" data-testid="ticket-total">${(activeTable.order?.total || 0).toFixed(2)}</span>
              </div>
              <button
                onClick={closeAndCharge} disabled={!activeTable.order?.items?.length}
                data-testid="close-table-btn"
                className="w-full bg-[#0F0F13] hover:bg-[#7C5CFF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> {t.dash.pos_r.closeTable}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ===================== POS Retail =====================
export const PosRetail = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => { productsApi.list('retail').then(setProducts); }, []);

  const add = (p) => {
    setCart((c) => {
      const ex = c.find((x) => x.product_id === p.id);
      if (ex) return c.map((x) => x.product_id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { product_id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };
  const dec = (pid) => setCart((c) => c.flatMap((x) => x.product_id === pid ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]));
  const removeItem = (pid) => setCart((c) => c.filter((x) => x.product_id !== pid));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const checkout = async () => {
    if (!cart.length) return;
    await retailApi.createSale(cart, 'cash');
    setMsg(`${t.dash.pos_x.paid} $${total.toFixed(2)}`);
    setCart([]);
    productsApi.list('retail').then(setProducts);
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div>
      <Topbar title={t.dash.pos_x.title} subtitle={t.dash.menu.pos_retail} />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Products */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map((p) => (
            <button
              key={p.id} onClick={() => add(p)}
              data-testid={`retail-product-${p.sku}`}
              className="text-left p-4 rounded-2xl bg-white border border-[#7C5CFF]/8 hover:border-[#7C5CFF]/40 hover:-translate-y-1 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-[#0F0F13]">{p.name}</div>
              <div className="text-xs text-[#8A8A9E]">{p.category} · Stock {p.stock}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-display font-black text-lg text-[#0F0F13]">${p.price.toFixed(2)}</span>
                <span className="text-xs font-bold text-[#7C5CFF] bg-[#7C5CFF]/10 rounded-full px-2 py-0.5 flex items-center gap-1"><Plus className="w-3 h-3" />{t.dash.pos_x.addToCart}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Cart */}
        <div className="glass-card-strong rounded-2xl p-5 h-fit sticky top-6" data-testid="retail-cart">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-[#7C5CFF]" />
            <h3 className="font-display font-extrabold text-lg text-[#0F0F13]">{t.dash.pos_x.cart}</h3>
            <span className="ml-auto text-xs font-bold text-white bg-[#7C5CFF] rounded-full px-2 py-0.5">{cart.length}</span>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-auto mb-3">
            {cart.length === 0 && <div className="text-sm text-[#8A8A9E]">{t.dash.pos_x.empty}</div>}
            {cart.map((it) => (
              <div key={it.product_id} className="bg-white/60 rounded-xl px-3 py-2 text-sm">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-[#0F0F13] truncate">{it.name}</div>
                  <button onClick={() => removeItem(it.product_id)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1">
                    <button onClick={() => dec(it.product_id)} className="w-6 h-6 rounded-md bg-[#7C5CFF]/10 text-[#7C5CFF] font-bold">-</button>
                    <span className="w-8 text-center text-sm font-bold">{it.qty}</span>
                    <button onClick={() => add({ id: it.product_id, name: it.name, price: it.price })} className="w-6 h-6 rounded-md bg-[#7C5CFF]/10 text-[#7C5CFF] font-bold">+</button>
                  </div>
                  <div className="font-bold text-[#0F0F13]">${(it.price * it.qty).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 py-3 border-t border-[#7C5CFF]/10 text-sm">
            <div className="flex justify-between text-[#5F5F6B]"><span>{t.dash.pos_x.subtotal}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-[#5F5F6B]"><span>{t.dash.pos_x.tax}</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between items-baseline pt-2"><span className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">{t.dash.pos_x.total}</span><span className="font-display font-black text-2xl text-[#0F0F13]" data-testid="retail-total">${total.toFixed(2)}</span></div>
          </div>

          <button
            onClick={checkout} disabled={!cart.length}
            data-testid="retail-checkout"
            className="w-full mt-3 bg-[#FFB042] hover:bg-[#F09C2E] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F0F13] font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2"
          >
            <DollarSign className="w-4 h-4" /> {t.dash.pos_x.checkout}
          </button>
          {msg && <div className="mt-3 text-center text-sm font-bold text-emerald-600" data-testid="retail-success">{msg}</div>}
        </div>
      </div>
    </div>
  );
};

// ===================== Inventory =====================
export const Inventory = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', price: 0, category: 'General', stock: 0, type: 'retail' });

  const refresh = () => productsApi.list().then(setProducts);
  useEffect(() => { refresh(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await productsApi.create({ ...form, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0 });
    setOpen(false); setForm({ name: '', sku: '', price: 0, category: 'General', stock: 0, type: 'retail' });
    refresh();
  };
  const remove = async (id) => { await productsApi.remove(id); refresh(); };
  const adjust = async (id, delta) => { const p = products.find(x => x.id === id); await productsApi.update(id, { stock: (p.stock || 0) + delta }); refresh(); };

  return (
    <div>
      <Topbar
        title={t.dash.inv.title} subtitle={`${products.length} ${t.dash.inv.products.toLowerCase()}`}
        right={<PrimaryBtn onClick={() => setOpen(true)} data-testid="inv-add-product"><Plus className="w-4 h-4" />{t.dash.inv.addProduct}</PrimaryBtn>}
      />

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm" data-testid="inv-table">
          <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">
              <th className="p-4">{t.dash.inv.name}</th>
              <th className="p-4">{t.dash.inv.sku}</th>
              <th className="p-4">{t.dash.inv.category}</th>
              <th className="p-4">{t.dash.inv.price}</th>
              <th className="p-4">{t.dash.inv.stock}</th>
              <th className="p-4">{t.dash.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#7C5CFF]/5 hover:bg-white/50 transition-colors" data-testid={`inv-row-${p.sku}`}>
                <td className="p-4 font-bold text-[#0F0F13]">{p.name}</td>
                <td className="p-4 font-mono text-xs text-[#5F5F6B]">{p.sku}</td>
                <td className="p-4"><span className="text-xs font-bold bg-[#7C5CFF]/10 text-[#7C5CFF] px-2 py-0.5 rounded-full">{p.category}</span></td>
                <td className="p-4 font-bold text-[#0F0F13]">${p.price.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => adjust(p.id, -1)} className="w-6 h-6 rounded-md bg-[#7C5CFF]/10 text-[#7C5CFF] font-bold text-xs">-</button>
                    <span className={`w-10 text-center font-bold ${p.stock < 5 ? 'text-red-500' : 'text-[#0F0F13]'}`}>{p.stock}</span>
                    <button onClick={() => adjust(p.id, 1)} className="w-6 h-6 rounded-md bg-[#7C5CFF]/10 text-[#7C5CFF] font-bold text-xs">+</button>
                  </div>
                </td>
                <td className="p-4"><button onClick={() => remove(p.id)} data-testid={`inv-delete-${p.sku}`} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t.dash.inv.addProduct}>
        <form onSubmit={create}>
          <Input label={t.dash.inv.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required testid="prod-form-name" />
          <Input label={t.dash.inv.sku} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} testid="prod-form-sku" />
          <Input label={t.dash.inv.category} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} testid="prod-form-cat" />
          <Input label={t.dash.inv.price} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" step="0.01" testid="prod-form-price" />
          <Input label={t.dash.inv.stock} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} type="number" testid="prod-form-stock" />
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1 block">Tipo</label>
            <select
              data-testid="prod-form-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF]"
            >
              <option value="retail">Retail</option>
              <option value="restaurant">Restaurante</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <button type="submit" data-testid="prod-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full mt-3 text-sm">{t.dash.common.save}</button>
        </form>
      </Modal>
    </div>
  );
};

// ===================== Travel =====================
export const Travel = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ traveler: '', destination: '', start_date: '', end_date: '', amount: 0, status: 'pending', notes: '' });

  const refresh = () => travelApi.list().then(setBookings);
  useEffect(() => { refresh(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await travelApi.create({ ...form, amount: parseFloat(form.amount) || 0 });
    setOpen(false); setForm({ traveler: '', destination: '', start_date: '', end_date: '', amount: 0, status: 'pending', notes: '' });
    refresh();
  };
  const remove = async (id) => { await travelApi.remove(id); refresh(); };

  const statusColor = (s) => s === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : s === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-[#FFB042]/20 text-[#B27200]';

  return (
    <div>
      <Topbar
        title={t.dash.travel.title} subtitle={`${bookings.length} ${t.dash.travel.bookings.toLowerCase()}`}
        right={<PrimaryBtn onClick={() => setOpen(true)} data-testid="travel-add"><Plus className="w-4 h-4" />{t.dash.travel.addBooking}</PrimaryBtn>}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {bookings.map((b) => (
          <div key={b.id} className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all group" data-testid={`booking-${b.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
            </div>
            <div className="font-display font-black text-lg text-[#0F0F13]">{b.destination}</div>
            <div className="text-sm text-[#5F5F6B] mt-0.5">{b.traveler}</div>
            <div className="text-xs text-[#8A8A9E] mt-2 font-mono">{b.start_date} → {b.end_date}</div>
            {b.notes && <div className="text-xs text-[#5F5F6B] mt-2 italic">"{b.notes}"</div>}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#7C5CFF]/10">
              <span className="font-display font-black text-xl text-[#7C5CFF]">${b.amount.toLocaleString()}</span>
              <button onClick={() => remove(b.id)} data-testid={`booking-delete-${b.id}`} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && <div className="text-center text-[#8A8A9E] py-16 text-sm">{t.dash.common.empty}</div>}

      <Modal open={open} onClose={() => setOpen(false)} title={t.dash.travel.addBooking}>
        <form onSubmit={create}>
          <Input label={t.dash.travel.traveler} value={form.traveler} onChange={(e) => setForm({ ...form, traveler: e.target.value })} required testid="booking-form-traveler" />
          <Input label={t.dash.travel.destination} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required testid="booking-form-dest" />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Inicio" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} type="date" testid="booking-form-start" />
            <Input label="Fin" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} type="date" testid="booking-form-end" />
          </div>
          <Input label={t.dash.travel.amount} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" step="0.01" testid="booking-form-amount" />
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1 block">{t.dash.travel.status}</label>
            <select
              data-testid="booking-form-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF]"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <button type="submit" data-testid="booking-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full mt-3 text-sm">{t.dash.common.save}</button>
        </form>
      </Modal>
    </div>
  );
};
