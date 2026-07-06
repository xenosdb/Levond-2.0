import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, X, ArrowRight, Warehouse as WhIcon, Calendar as CalIcon,
  Wrench, FolderKanban, Calculator, ArrowLeftRight, Clock
} from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  warehousesApi, transfersApi, accountsApi, entriesApi,
  projectsApi, appointmentsApi, maintenanceApi, productsApi, contactsApi,
} from '@/lib/api';

// ---- shared ----
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
const Field = ({ label, testid, as = 'input', options = [], ...p }) => (
  <div className="mb-3">
    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B] mb-1 block">{label}</label>
    {as === 'select' ? (
      <select data-testid={testid} className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF]" {...p}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input data-testid={testid} className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 text-[#0F0F13]" {...p} />
    )}
  </div>
);
const PrimaryBtn = ({ children, ...p }) => (
  <button {...p} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F0F13] hover:bg-[#7C5CFF] text-white font-bold text-sm transition-all ${p.className || ''}`}>{children}</button>
);
const Badge = ({ children, color = 'purple' }) => {
  const map = {
    purple: 'bg-[#7C5CFF]/10 text-[#7C5CFF]', amber: 'bg-[#FFB042]/20 text-[#B27200]',
    green: 'bg-emerald-100 text-emerald-700', red: 'bg-red-100 text-red-700',
    gray: 'bg-[#8A8A9E]/15 text-[#5F5F6B]', blue: 'bg-blue-100 text-blue-700',
  };
  return <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${map[color]}`}>{children}</span>;
};

// ===================== WAREHOUSES + TRANSFERS =====================
export const Warehouses = () => {
  const { lang } = useLanguage();
  const [whs, setWhs] = useState([]);
  const [trs, setTrs] = useState([]);
  const [products, setProducts] = useState([]);
  const [openW, setOpenW] = useState(false);
  const [openT, setOpenT] = useState(false);
  const [fw, setFw] = useState({ name: '', code: '', location: '' });
  const [ft, setFt] = useState({ product_id: '', from_warehouse_id: '', to_warehouse_id: '', qty: 1 });

  const refresh = async () => {
    const [w, t, p] = await Promise.all([warehousesApi.list(), transfersApi.list(), productsApi.list()]);
    setWhs(w); setTrs(t); setProducts(p);
  };
  useEffect(() => { refresh(); }, []);

  const createW = async (e) => {
    e.preventDefault();
    await warehousesApi.create(fw); setOpenW(false); setFw({ name: '', code: '', location: '' }); refresh();
  };
  const createT = async (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === ft.product_id);
    if (!prod) return;
    await transfersApi.create({ ...ft, product_name: prod.name, qty: parseInt(ft.qty) || 1 });
    setOpenT(false); setFt({ product_id: '', from_warehouse_id: '', to_warehouse_id: '', qty: 1 }); refresh();
  };

  const T = lang === 'en' ? { title: 'Warehouses', sub: 'Multi-warehouse & transfers', addWh: 'New warehouse', addTr: 'New transfer' }
    : { title: 'Almacenes', sub: 'Múltiples almacenes y transferencias', addWh: 'Nuevo almacén', addTr: 'Nueva transferencia' };

  return (
    <div>
      <Topbar title={T.title} subtitle={`${whs.length} · ${T.sub}`} right={
        <div className="flex gap-2">
          <PrimaryBtn onClick={() => setOpenT(true)} data-testid="wh-add-transfer" className="!bg-[#7C5CFF]"><ArrowLeftRight className="w-4 h-4" />{T.addTr}</PrimaryBtn>
          <PrimaryBtn onClick={() => setOpenW(true)} data-testid="wh-add"><Plus className="w-4 h-4" />{T.addWh}</PrimaryBtn>
        </div>
      } />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {whs.map((w) => (
          <div key={w.id} className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all group" data-testid={`wh-card-${w.code}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
                <WhIcon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <button onClick={() => warehousesApi.remove(w.id).then(refresh)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="font-display font-black text-lg text-[#0F0F13]">{w.name}</div>
            <div className="text-xs text-[#8A8A9E] font-mono">{w.code}</div>
            {w.location && <div className="text-sm text-[#5F5F6B] mt-2">{w.location}</div>}
          </div>
        ))}
      </div>

      <h3 className="font-display font-extrabold text-lg text-[#0F0F13] mb-3">{lang === 'en' ? 'Recent transfers' : 'Transferencias recientes'}</h3>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
            <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              <th className="p-3">{lang === 'en' ? 'Product' : 'Producto'}</th>
              <th className="p-3">{lang === 'en' ? 'Qty' : 'Cant.'}</th>
              <th className="p-3">{lang === 'en' ? 'From' : 'Desde'}</th>
              <th className="p-3">{lang === 'en' ? 'To' : 'Hacia'}</th>
              <th className="p-3">{lang === 'en' ? 'Date' : 'Fecha'}</th>
            </tr>
          </thead>
          <tbody>
            {trs.map((t) => {
              const fromW = whs.find((w) => w.id === t.from_warehouse_id)?.name || '—';
              const toW = whs.find((w) => w.id === t.to_warehouse_id)?.name || '—';
              return (
                <tr key={t.id} className="border-b border-[#7C5CFF]/5" data-testid={`transfer-${t.id}`}>
                  <td className="p-3 font-bold text-[#0F0F13]">{t.product_name}</td>
                  <td className="p-3 text-[#7C5CFF] font-black">{t.qty}</td>
                  <td className="p-3 text-[#5F5F6B]">{fromW}</td>
                  <td className="p-3 text-[#5F5F6B]"><ArrowRight className="inline w-3 h-3 mr-1" />{toW}</td>
                  <td className="p-3 text-xs text-[#8A8A9E] font-mono">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {trs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[#8A8A9E]">{lang === 'en' ? 'No transfers yet' : 'Sin transferencias'}</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={openW} onClose={() => setOpenW(false)} title={T.addWh}>
        <form onSubmit={createW}>
          <Field label={lang === 'en' ? 'Name' : 'Nombre'} testid="wh-form-name" value={fw.name} onChange={(e) => setFw({ ...fw, name: e.target.value })} required />
          <Field label={lang === 'en' ? 'Code' : 'Código'} testid="wh-form-code" value={fw.code} onChange={(e) => setFw({ ...fw, code: e.target.value })} />
          <Field label={lang === 'en' ? 'Location' : 'Ubicación'} testid="wh-form-loc" value={fw.location} onChange={(e) => setFw({ ...fw, location: e.target.value })} />
          <button type="submit" data-testid="wh-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </form>
      </Modal>

      <Modal open={openT} onClose={() => setOpenT(false)} title={T.addTr}>
        <form onSubmit={createT}>
          <Field label={lang === 'en' ? 'Product' : 'Producto'} as="select" testid="tr-form-product" value={ft.product_id} onChange={(e) => setFt({ ...ft, product_id: e.target.value })} required
            options={[{ value: '', label: '—' }, ...products.map((p) => ({ value: p.id, label: p.name }))]} />
          <Field label={lang === 'en' ? 'From warehouse' : 'Desde almacén'} as="select" testid="tr-form-from" value={ft.from_warehouse_id} onChange={(e) => setFt({ ...ft, from_warehouse_id: e.target.value })} required
            options={[{ value: '', label: '—' }, ...whs.map((w) => ({ value: w.id, label: w.name }))]} />
          <Field label={lang === 'en' ? 'To warehouse' : 'Hacia almacén'} as="select" testid="tr-form-to" value={ft.to_warehouse_id} onChange={(e) => setFt({ ...ft, to_warehouse_id: e.target.value })} required
            options={[{ value: '', label: '—' }, ...whs.map((w) => ({ value: w.id, label: w.name }))]} />
          <Field label={lang === 'en' ? 'Quantity' : 'Cantidad'} testid="tr-form-qty" type="number" min="1" value={ft.qty} onChange={(e) => setFt({ ...ft, qty: e.target.value })} required />
          <button type="submit" data-testid="tr-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Transfer' : 'Transferir'}</button>
        </form>
      </Modal>
    </div>
  );
};

// ===================== ACCOUNTING =====================
export const Accounting = () => {
  const { lang } = useLanguage();
  const [tab, setTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [openA, setOpenA] = useState(false);
  const [openE, setOpenE] = useState(false);
  const [fa, setFa] = useState({ code: '', name: '', type: 'asset' });
  const [fe, setFe] = useState({ date: new Date().toISOString().slice(0, 10), reference: '', memo: '', lines: [{ account_code: '', account_name: '', debit: 0, credit: 0 }, { account_code: '', account_name: '', debit: 0, credit: 0 }] });

  const refresh = async () => {
    const [a, e] = await Promise.all([accountsApi.list(), entriesApi.list()]);
    setAccounts(a); setEntries(e);
  };
  useEffect(() => { refresh(); }, []);

  const T = lang === 'en'
    ? { title: 'Accounting', sub: 'Chart of accounts & journal entries', addA: 'New account', addE: 'New entry', accounts: 'Chart of accounts', entries: 'Journal entries' }
    : { title: 'Contabilidad', sub: 'Plan de cuentas y asientos', addA: 'Nueva cuenta', addE: 'Nuevo asiento', accounts: 'Plan de cuentas', entries: 'Asientos' };

  const types = [
    { value: 'asset', label: lang === 'en' ? 'Asset' : 'Activo' },
    { value: 'liability', label: lang === 'en' ? 'Liability' : 'Pasivo' },
    { value: 'equity', label: lang === 'en' ? 'Equity' : 'Patrimonio' },
    { value: 'income', label: lang === 'en' ? 'Income' : 'Ingreso' },
    { value: 'expense', label: lang === 'en' ? 'Expense' : 'Gasto' },
  ];
  const typeColor = { asset: 'blue', liability: 'amber', equity: 'purple', income: 'green', expense: 'red' };

  const createA = async (e) => {
    e.preventDefault();
    await accountsApi.create(fa); setOpenA(false); setFa({ code: '', name: '', type: 'asset' }); refresh();
  };

  const setLine = (idx, k, v) => {
    const lines = [...fe.lines];
    lines[idx] = { ...lines[idx], [k]: v };
    if (k === 'account_code') {
      const acc = accounts.find((a) => a.code === v);
      lines[idx].account_name = acc?.name || '';
    }
    setFe({ ...fe, lines });
  };
  const addLine = () => setFe({ ...fe, lines: [...fe.lines, { account_code: '', account_name: '', debit: 0, credit: 0 }] });
  const removeLine = (idx) => setFe({ ...fe, lines: fe.lines.filter((_, i) => i !== idx) });

  const totalDebit = fe.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = fe.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const createE = async () => {
    if (!balanced) return;
    const lines = fe.lines.filter((l) => l.account_code).map((l) => ({ ...l, debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0 }));
    await entriesApi.create({ ...fe, lines });
    setOpenE(false);
    setFe({ date: new Date().toISOString().slice(0, 10), reference: '', memo: '', lines: [{ account_code: '', account_name: '', debit: 0, credit: 0 }, { account_code: '', account_name: '', debit: 0, credit: 0 }] });
    refresh();
  };

  return (
    <div>
      <Topbar title={T.title} subtitle={T.sub} right={
        <div className="flex gap-2">
          {tab === 'accounts' && <PrimaryBtn onClick={() => setOpenA(true)} data-testid="acc-add"><Plus className="w-4 h-4" />{T.addA}</PrimaryBtn>}
          {tab === 'entries' && <PrimaryBtn onClick={() => setOpenE(true)} data-testid="entry-add"><Plus className="w-4 h-4" />{T.addE}</PrimaryBtn>}
        </div>
      } />

      <div className="flex items-center gap-1 glass-card rounded-full p-1 mb-5 inline-flex">
        <button onClick={() => setTab('accounts')} data-testid="acc-tab-accounts" className={`px-4 py-1.5 rounded-full text-xs font-bold ${tab === 'accounts' ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}>{T.accounts}</button>
        <button onClick={() => setTab('entries')} data-testid="acc-tab-entries" className={`px-4 py-1.5 rounded-full text-xs font-bold ${tab === 'entries' ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}>{T.entries}</button>
      </div>

      {tab === 'accounts' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
                <th className="p-3">{lang === 'en' ? 'Code' : 'Código'}</th>
                <th className="p-3">{lang === 'en' ? 'Name' : 'Nombre'}</th>
                <th className="p-3">{lang === 'en' ? 'Type' : 'Tipo'}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} data-testid={`acc-row-${a.code}`} className="border-b border-[#7C5CFF]/5">
                  <td className="p-3 font-mono font-bold text-[#7C5CFF]">{a.code}</td>
                  <td className="p-3 font-bold text-[#0F0F13]">{a.name}</td>
                  <td className="p-3"><Badge color={typeColor[a.type]}>{types.find((t) => t.value === a.type)?.label}</Badge></td>
                  <td className="p-3 text-right"><button onClick={() => accountsApi.remove(a.id).then(refresh)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
              {accounts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-[#8A8A9E]">{lang === 'en' ? 'No accounts' : 'Sin cuentas'}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'entries' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
                <th className="p-3">#</th>
                <th className="p-3">{lang === 'en' ? 'Date' : 'Fecha'}</th>
                <th className="p-3">{lang === 'en' ? 'Memo' : 'Concepto'}</th>
                <th className="p-3">{lang === 'en' ? 'Debit' : 'Débito'}</th>
                <th className="p-3">{lang === 'en' ? 'Credit' : 'Crédito'}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} data-testid={`entry-row-${e.number}`} className="border-b border-[#7C5CFF]/5">
                  <td className="p-3 font-mono font-bold text-[#7C5CFF]">{e.number}</td>
                  <td className="p-3 text-[#5F5F6B]">{e.date}</td>
                  <td className="p-3 font-bold text-[#0F0F13]">{e.memo || '—'}</td>
                  <td className="p-3 font-bold">${e.total_debit.toFixed(2)}</td>
                  <td className="p-3 font-bold">${e.total_credit.toFixed(2)}</td>
                  <td className="p-3 text-right"><button onClick={() => entriesApi.remove(e.id).then(refresh)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[#8A8A9E]">{lang === 'en' ? 'No entries' : 'Sin asientos'}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={openA} onClose={() => setOpenA(false)} title={T.addA}>
        <form onSubmit={createA}>
          <Field label={lang === 'en' ? 'Code' : 'Código'} testid="acc-form-code" value={fa.code} onChange={(e) => setFa({ ...fa, code: e.target.value })} required />
          <Field label={lang === 'en' ? 'Name' : 'Nombre'} testid="acc-form-name" value={fa.name} onChange={(e) => setFa({ ...fa, name: e.target.value })} required />
          <Field label={lang === 'en' ? 'Type' : 'Tipo'} as="select" testid="acc-form-type" value={fa.type} onChange={(e) => setFa({ ...fa, type: e.target.value })} options={types} />
          <button type="submit" data-testid="acc-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </form>
      </Modal>

      <Modal open={openE} onClose={() => setOpenE(false)} title={T.addE} wide>
        <div className="grid grid-cols-2 gap-3">
          <Field label={lang === 'en' ? 'Date' : 'Fecha'} type="date" testid="entry-form-date" value={fe.date} onChange={(e) => setFe({ ...fe, date: e.target.value })} />
          <Field label={lang === 'en' ? 'Reference' : 'Referencia'} testid="entry-form-ref" value={fe.reference} onChange={(e) => setFe({ ...fe, reference: e.target.value })} />
        </div>
        <Field label={lang === 'en' ? 'Memo' : 'Concepto'} testid="entry-form-memo" value={fe.memo} onChange={(e) => setFe({ ...fe, memo: e.target.value })} />

        <div className="mt-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B]">{lang === 'en' ? 'Lines' : 'Líneas'}</div>
        <div className="space-y-1.5">
          {fe.lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-1.5 items-center" data-testid={`entry-line-${i}`}>
              <select value={l.account_code} onChange={(e) => setLine(i, 'account_code', e.target.value)}
                className="col-span-5 px-2 py-1.5 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs">
                <option value="">—</option>
                {accounts.map((a) => <option key={a.id} value={a.code}>{a.code} · {a.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Débito" value={l.debit || ''} onChange={(e) => setLine(i, 'debit', e.target.value)}
                className="col-span-3 px-2 py-1.5 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs" />
              <input type="number" step="0.01" placeholder="Crédito" value={l.credit || ''} onChange={(e) => setLine(i, 'credit', e.target.value)}
                className="col-span-3 px-2 py-1.5 bg-white/80 border border-[#7C5CFF]/15 rounded-lg text-xs" />
              <button onClick={() => removeLine(i)} className="col-span-1 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <button onClick={addLine} data-testid="entry-add-line" className="mt-2 text-xs font-bold text-[#7C5CFF] hover:underline">+ {lang === 'en' ? 'Add line' : 'Añadir línea'}</button>

        <div className="mt-4 flex justify-between text-sm font-bold border-t border-[#7C5CFF]/10 pt-3">
          <div>Debit ${totalDebit.toFixed(2)} · Credit ${totalCredit.toFixed(2)}</div>
          {balanced ? <Badge color="green">{lang === 'en' ? 'Balanced' : 'Cuadrado'}</Badge> : <Badge color="red">{lang === 'en' ? 'Unbalanced' : 'No cuadra'}</Badge>}
        </div>

        <button onClick={createE} disabled={!balanced} data-testid="entry-form-submit"
          className="w-full mt-4 bg-[#7C5CFF] hover:bg-[#6A4BE5] disabled:opacity-40 text-white font-bold py-3 rounded-full text-sm">
          {lang === 'en' ? 'Post entry' : 'Registrar asiento'}
        </button>
      </Modal>
    </div>
  );
};

// ===================== PROJECTS =====================
const TASK_STATUS = ['todo', 'in_progress', 'review', 'done'];
export const Projects = () => {
  const { lang } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [openP, setOpenP] = useState(false);
  const [openT, setOpenT] = useState(false);
  const [fp, setFp] = useState({ name: '', client: '', color: '#7C5CFF', deadline: '' });
  const [ft, setFt] = useState({ title: '', assignee: '', deadline: '' });

  const refresh = async () => setProjects(await projectsApi.list());
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (active) projectsApi.tasks(active.id).then(setTasks); }, [active]);

  const statusLabel = (s) => lang === 'en'
    ? ({ todo: 'To do', in_progress: 'In progress', review: 'Review', done: 'Done' }[s])
    : ({ todo: 'Por hacer', in_progress: 'En progreso', review: 'Revisión', done: 'Hecho' }[s]);

  const createP = async (e) => {
    e.preventDefault();
    const p = await projectsApi.create(fp); setOpenP(false); setFp({ name: '', client: '', color: '#7C5CFF', deadline: '' });
    refresh(); setActive(p);
  };
  const createT = async (e) => {
    e.preventDefault();
    await projectsApi.createTask({ ...ft, project_id: active.id, status: 'todo', hours: 0 });
    setOpenT(false); setFt({ title: '', assignee: '', deadline: '' });
    projectsApi.tasks(active.id).then(setTasks); refresh();
  };
  const moveTask = async (task, status) => { await projectsApi.updateTask(task.id, { status }); projectsApi.tasks(active.id).then(setTasks); };

  const T = lang === 'en' ? { title: 'Projects', sub: 'Manage tasks & progress', addP: 'New project', addT: 'New task' }
    : { title: 'Proyectos', sub: 'Gestiona tareas y avance', addP: 'Nuevo proyecto', addT: 'Nueva tarea' };

  if (active) {
    return (
      <div>
        <Topbar title={active.name} subtitle={active.client}
          right={<div className="flex gap-2">
            <button onClick={() => setActive(null)} data-testid="proj-back" className="btn-ghost !py-2 !px-4 !text-xs">← {lang === 'en' ? 'Back' : 'Volver'}</button>
            <PrimaryBtn onClick={() => setOpenT(true)} data-testid="proj-add-task"><Plus className="w-4 h-4" />{T.addT}</PrimaryBtn>
          </div>} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {TASK_STATUS.map((s) => (
            <div key={s} className="glass-card rounded-2xl p-3.5" data-testid={`kanban-col-${s}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-extrabold text-sm text-[#0F0F13]">{statusLabel(s)}</div>
                <div className="text-xs font-bold text-[#8A8A9E] bg-white/70 rounded-full px-2 py-0.5">{tasks.filter((t) => t.status === s).length}</div>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {tasks.filter((t) => t.status === s).map((t) => (
                  <div key={t.id} className="bg-white rounded-xl p-3 border border-[#7C5CFF]/8 hover:border-[#7C5CFF]/30 transition-all group" data-testid={`task-${t.id}`}>
                    <div className="font-bold text-sm text-[#0F0F13]">{t.title}</div>
                    {t.assignee && <div className="text-xs text-[#8A8A9E] mt-1">👤 {t.assignee}</div>}
                    <div className="flex items-center justify-between mt-2">
                      <select value={t.status} onChange={(e) => moveTask(t, e.target.value)}
                        data-testid={`task-status-${t.id}`}
                        className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-[#7C5CFF]/10 text-[#7C5CFF] border-none focus:outline-none cursor-pointer">
                        {TASK_STATUS.map((st) => <option key={st} value={st}>{statusLabel(st)}</option>)}
                      </select>
                      <button onClick={() => projectsApi.removeTask(t.id).then(() => projectsApi.tasks(active.id).then(setTasks))}
                        className="opacity-0 group-hover:opacity-100 text-red-500 text-xs"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Modal open={openT} onClose={() => setOpenT(false)} title={T.addT}>
          <form onSubmit={createT}>
            <Field label={lang === 'en' ? 'Title' : 'Título'} testid="task-form-title" value={ft.title} onChange={(e) => setFt({ ...ft, title: e.target.value })} required />
            <Field label={lang === 'en' ? 'Assignee' : 'Asignado'} testid="task-form-assignee" value={ft.assignee} onChange={(e) => setFt({ ...ft, assignee: e.target.value })} />
            <Field label={lang === 'en' ? 'Deadline' : 'Fecha límite'} type="date" testid="task-form-deadline" value={ft.deadline} onChange={(e) => setFt({ ...ft, deadline: e.target.value })} />
            <button type="submit" data-testid="task-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Create' : 'Crear'}</button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <Topbar title={T.title} subtitle={T.sub}
        right={<PrimaryBtn onClick={() => setOpenP(true)} data-testid="proj-add"><Plus className="w-4 h-4" />{T.addP}</PrimaryBtn>} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((p) => (
          <motion.div key={p.id} whileHover={{ y: -3 }}
            data-testid={`proj-card-${p.id}`}
            onClick={() => setActive(p)}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:shadow-[0_12px_32px_rgba(124,92,255,0.10)] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${p.color}18`, color: p.color }}>
                <FolderKanban className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <button onClick={(e) => { e.stopPropagation(); projectsApi.remove(p.id).then(refresh); }} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="font-display font-black text-lg text-[#0F0F13]">{p.name}</div>
            {p.client && <div className="text-sm text-[#5F5F6B]">{p.client}</div>}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#7C5CFF]/10">
              <span className="text-xs text-[#8A8A9E]"><Clock className="inline w-3 h-3 mr-1" />{p.deadline || '—'}</span>
              <Badge color="purple">{p.task_count || 0} {lang === 'en' ? 'tasks' : 'tareas'}</Badge>
            </div>
          </motion.div>
        ))}
        {projects.length === 0 && <div className="col-span-full text-center py-16 text-[#8A8A9E]">{lang === 'en' ? 'No projects' : 'Sin proyectos'}</div>}
      </div>

      <Modal open={openP} onClose={() => setOpenP(false)} title={T.addP}>
        <form onSubmit={createP}>
          <Field label={lang === 'en' ? 'Name' : 'Nombre'} testid="proj-form-name" value={fp.name} onChange={(e) => setFp({ ...fp, name: e.target.value })} required />
          <Field label={lang === 'en' ? 'Client' : 'Cliente'} testid="proj-form-client" value={fp.client} onChange={(e) => setFp({ ...fp, client: e.target.value })} />
          <Field label={lang === 'en' ? 'Deadline' : 'Fecha límite'} type="date" testid="proj-form-deadline" value={fp.deadline} onChange={(e) => setFp({ ...fp, deadline: e.target.value })} />
          <button type="submit" data-testid="proj-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </form>
      </Modal>
    </div>
  );
};

// ===================== APPOINTMENTS =====================
export const Appointments = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: '', contact_name: '', start: '', end: '', notes: '', status: 'scheduled' });
  const refresh = () => appointmentsApi.list().then(setItems);
  useEffect(() => { refresh(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await appointmentsApi.create(f);
    setOpen(false); setF({ title: '', contact_name: '', start: '', end: '', notes: '', status: 'scheduled' });
    refresh();
  };

  const T = lang === 'en' ? { title: 'Appointments', sub: 'Meetings & bookings', add: 'New appointment' }
    : { title: 'Citas', sub: 'Reuniones y agendamientos', add: 'Nueva cita' };
  const statusColor = { scheduled: 'blue', completed: 'green', cancelled: 'red' };

  // Group by date
  const byDate = items.reduce((acc, a) => {
    const d = a.start?.slice(0, 10) || '—';
    acc[d] = acc[d] || []; acc[d].push(a); return acc;
  }, {});
  const dates = Object.keys(byDate).sort();

  return (
    <div>
      <Topbar title={T.title} subtitle={`${items.length} · ${T.sub}`}
        right={<PrimaryBtn onClick={() => setOpen(true)} data-testid="appt-add"><Plus className="w-4 h-4" />{T.add}</PrimaryBtn>} />

      {dates.length === 0 && <div className="text-center py-16 text-[#8A8A9E]">{lang === 'en' ? 'No appointments' : 'Sin citas'}</div>}

      <div className="space-y-6">
        {dates.map((d) => (
          <div key={d} data-testid={`appt-day-${d}`}>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C5CFF] mb-2 flex items-center gap-2">
              <CalIcon className="w-3.5 h-3.5" /> {new Date(d).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="space-y-2">
              {byDate[d].map((a) => (
                <div key={a.id} data-testid={`appt-${a.id}`}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4 group hover:shadow-[0_8px_24px_rgba(124,92,255,0.10)]">
                  <div className="w-12 text-center flex-shrink-0">
                    <div className="font-display font-black text-2xl text-[#7C5CFF] leading-none">{a.start?.slice(11, 16) || '—'}</div>
                    <div className="text-[10px] font-bold text-[#8A8A9E] mt-1">HORA</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-extrabold text-[#0F0F13]">{a.title}</div>
                    {a.contact_name && <div className="text-xs text-[#5F5F6B]">👤 {a.contact_name}</div>}
                    {a.notes && <div className="text-xs text-[#8A8A9E] italic mt-0.5">"{a.notes}"</div>}
                  </div>
                  <Badge color={statusColor[a.status] || 'gray'}>{a.status}</Badge>
                  <button onClick={() => appointmentsApi.remove(a.id).then(refresh)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={T.add}>
        <form onSubmit={create}>
          <Field label={lang === 'en' ? 'Title' : 'Título'} testid="appt-form-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
          <Field label={lang === 'en' ? 'Contact' : 'Contacto'} testid="appt-form-contact" value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Field label={lang === 'en' ? 'Start' : 'Inicio'} type="datetime-local" testid="appt-form-start" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} required />
            <Field label={lang === 'en' ? 'End' : 'Fin'} type="datetime-local" testid="appt-form-end" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} />
          </div>
          <Field label={lang === 'en' ? 'Notes' : 'Notas'} testid="appt-form-notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          <button type="submit" data-testid="appt-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </form>
      </Modal>
    </div>
  );
};

// ===================== MAINTENANCE =====================
export const Maintenance = () => {
  const { lang } = useLanguage();
  const [tab, setTab] = useState('equipment');
  const [equipment, setEquipment] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openE, setOpenE] = useState(false);
  const [openW, setOpenW] = useState(false);
  const [fe, setFe] = useState({ name: '', category: '', location: '', status: 'operational' });
  const [fw, setFw] = useState({ equipment_id: '', equipment_name: '', type: 'corrective', description: '', assignee: '', deadline: '' });

  const refresh = async () => {
    const [eq, wo] = await Promise.all([maintenanceApi.equipment(), maintenanceApi.workOrders()]);
    setEquipment(eq); setOrders(wo);
  };
  useEffect(() => { refresh(); }, []);

  const T = lang === 'en' ? { title: 'Maintenance', sub: 'Equipment & work orders', addE: 'New equipment', addW: 'New WO', eq: 'Equipment', wo: 'Work orders' }
    : { title: 'Mantenimiento', sub: 'Equipos y órdenes de trabajo', addE: 'Nuevo equipo', addW: 'Nueva OT', eq: 'Equipos', wo: 'Órdenes de trabajo' };
  const statusColor = { operational: 'green', maintenance: 'amber', broken: 'red', todo: 'blue', in_progress: 'amber', done: 'green' };

  const createE = async (e) => {
    e.preventDefault();
    await maintenanceApi.createEquipment(fe); setOpenE(false); setFe({ name: '', category: '', location: '', status: 'operational' }); refresh();
  };
  const createW = async (e) => {
    e.preventDefault();
    const eq = equipment.find((x) => x.id === fw.equipment_id);
    if (!eq) return;
    await maintenanceApi.createWO({ ...fw, equipment_name: eq.name, status: 'todo' });
    setOpenW(false); setFw({ equipment_id: '', equipment_name: '', type: 'corrective', description: '', assignee: '', deadline: '' }); refresh();
  };

  return (
    <div>
      <Topbar title={T.title} subtitle={T.sub} right={
        <div className="flex gap-2">
          {tab === 'equipment' && <PrimaryBtn onClick={() => setOpenE(true)} data-testid="mnt-add-eq"><Plus className="w-4 h-4" />{T.addE}</PrimaryBtn>}
          {tab === 'wo' && <PrimaryBtn onClick={() => setOpenW(true)} data-testid="mnt-add-wo"><Plus className="w-4 h-4" />{T.addW}</PrimaryBtn>}
        </div>
      } />

      <div className="inline-flex items-center gap-1 glass-card rounded-full p-1 mb-5">
        <button onClick={() => setTab('equipment')} data-testid="mnt-tab-eq" className={`px-4 py-1.5 rounded-full text-xs font-bold ${tab === 'equipment' ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}>{T.eq}</button>
        <button onClick={() => setTab('wo')} data-testid="mnt-tab-wo" className={`px-4 py-1.5 rounded-full text-xs font-bold ${tab === 'wo' ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}>{T.wo}</button>
      </div>

      {tab === 'equipment' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {equipment.map((e) => (
            <div key={e.id} data-testid={`eq-card-${e.id}`} className="glass-card rounded-2xl p-5 group hover:-translate-y-1 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center">
                  <Wrench className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <Badge color={statusColor[e.status] || 'gray'}>{e.status}</Badge>
              </div>
              <div className="font-display font-black text-[#0F0F13]">{e.name}</div>
              <div className="text-xs text-[#8A8A9E] mt-0.5">{e.category} · {e.location}</div>
              <button onClick={() => maintenanceApi.removeEquipment(e.id).then(refresh)} className="mt-3 opacity-0 group-hover:opacity-100 text-red-500 text-xs"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {equipment.length === 0 && <div className="col-span-full text-center py-16 text-[#8A8A9E]">{lang === 'en' ? 'No equipment' : 'Sin equipos'}</div>}
        </div>
      )}

      {tab === 'wo' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/50 border-b border-[#7C5CFF]/10">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">
                <th className="p-3">#</th>
                <th className="p-3">{lang === 'en' ? 'Equipment' : 'Equipo'}</th>
                <th className="p-3">{lang === 'en' ? 'Type' : 'Tipo'}</th>
                <th className="p-3">{lang === 'en' ? 'Description' : 'Descripción'}</th>
                <th className="p-3">{lang === 'en' ? 'Assignee' : 'Asignado'}</th>
                <th className="p-3">{lang === 'en' ? 'Status' : 'Estado'}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} data-testid={`wo-row-${o.number}`} className="border-b border-[#7C5CFF]/5">
                  <td className="p-3 font-mono font-bold text-[#7C5CFF]">{o.number}</td>
                  <td className="p-3 font-bold text-[#0F0F13]">{o.equipment_name}</td>
                  <td className="p-3"><Badge color={o.type === 'preventive' ? 'blue' : 'amber'}>{o.type}</Badge></td>
                  <td className="p-3 text-[#5F5F6B] truncate max-w-xs">{o.description}</td>
                  <td className="p-3 text-[#5F5F6B]">{o.assignee || '—'}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={async (e) => { await maintenanceApi.updateWO(o.id, { status: e.target.value }); refresh(); }}
                      data-testid={`wo-status-${o.number}`}
                      className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-[#7C5CFF]/10 text-[#7C5CFF] border-none focus:outline-none cursor-pointer">
                      {['todo', 'in_progress', 'done'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right"><button onClick={() => maintenanceApi.removeWO(o.id).then(refresh)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#8A8A9E]">{lang === 'en' ? 'No work orders' : 'Sin órdenes de trabajo'}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={openE} onClose={() => setOpenE(false)} title={T.addE}>
        <form onSubmit={createE}>
          <Field label={lang === 'en' ? 'Name' : 'Nombre'} testid="eq-form-name" value={fe.name} onChange={(e) => setFe({ ...fe, name: e.target.value })} required />
          <Field label={lang === 'en' ? 'Category' : 'Categoría'} testid="eq-form-cat" value={fe.category} onChange={(e) => setFe({ ...fe, category: e.target.value })} />
          <Field label={lang === 'en' ? 'Location' : 'Ubicación'} testid="eq-form-loc" value={fe.location} onChange={(e) => setFe({ ...fe, location: e.target.value })} />
          <Field label={lang === 'en' ? 'Status' : 'Estado'} as="select" testid="eq-form-status" value={fe.status} onChange={(e) => setFe({ ...fe, status: e.target.value })}
            options={[
              { value: 'operational', label: lang === 'en' ? 'Operational' : 'Operativo' },
              { value: 'maintenance', label: lang === 'en' ? 'In maintenance' : 'En mantenimiento' },
              { value: 'broken', label: lang === 'en' ? 'Broken' : 'Averiado' },
            ]} />
          <button type="submit" data-testid="eq-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </form>
      </Modal>

      <Modal open={openW} onClose={() => setOpenW(false)} title={T.addW}>
        <form onSubmit={createW}>
          <Field label={lang === 'en' ? 'Equipment' : 'Equipo'} as="select" testid="wo-form-eq" value={fw.equipment_id} onChange={(e) => setFw({ ...fw, equipment_id: e.target.value })} required
            options={[{ value: '', label: '—' }, ...equipment.map((eq) => ({ value: eq.id, label: eq.name }))]} />
          <Field label={lang === 'en' ? 'Type' : 'Tipo'} as="select" testid="wo-form-type" value={fw.type} onChange={(e) => setFw({ ...fw, type: e.target.value })}
            options={[
              { value: 'corrective', label: lang === 'en' ? 'Corrective' : 'Correctiva' },
              { value: 'preventive', label: lang === 'en' ? 'Preventive' : 'Preventiva' },
            ]} />
          <Field label={lang === 'en' ? 'Description' : 'Descripción'} testid="wo-form-desc" value={fw.description} onChange={(e) => setFw({ ...fw, description: e.target.value })} required />
          <Field label={lang === 'en' ? 'Assignee' : 'Asignado'} testid="wo-form-assignee" value={fw.assignee} onChange={(e) => setFw({ ...fw, assignee: e.target.value })} />
          <Field label={lang === 'en' ? 'Deadline' : 'Fecha límite'} type="date" testid="wo-form-deadline" value={fw.deadline} onChange={(e) => setFw({ ...fw, deadline: e.target.value })} />
          <button type="submit" data-testid="wo-form-submit" className="w-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white font-bold py-3 rounded-full text-sm mt-2">{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </form>
      </Modal>
    </div>
  );
};
