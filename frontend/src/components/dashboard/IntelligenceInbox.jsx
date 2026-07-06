import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, Zap, Clock, UserPlus, Ban, Repeat, RefreshCw, AlertTriangle,
  Cake, BookText, ShieldAlert, Users, Megaphone, DollarSign, TrendingUp, Plane, Bot,
} from 'lucide-react';
import { intelligenceApi } from '@/lib/api';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";

const PRIORITY = {
  critical: { label: 'Crítico', color: '#F43F5E', order: 0 },
  high: { label: 'Alto', color: '#F59E0B', order: 1 },
  medium: { label: 'Medio', color: '#3B82F6', order: 2 },
  low: { label: 'Bajo', color: '#64748B', order: 3 },
  info: { label: 'Info', color: '#94A3B8', order: 4 },
};

const TYPE_ICON = {
  birthday: Cake, passport_expiry: BookText, visa_expiry: ShieldAlert, vip_client: Users,
  inactive_client: Repeat, interest_cluster: Megaphone, finance: DollarSign, sales: TrendingUp,
  opportunity: Sparkles, risk: AlertTriangle, default: Plane,
};

const AGENT_ICON = { AZUMI: Bot, TRAVEL: Plane, MARKETING: Megaphone, FINANCE: DollarSign, SALES: TrendingUp, OPS: Zap };

const ACTIONS = [
  { key: 'approve', label: 'Aprobar', Icon: Check, primary: true },
  { key: 'execute', label: 'Ejecutar', Icon: Zap },
  { key: 'snooze', label: 'Posponer', Icon: Clock },
  { key: 'delegate', label: 'Delegar', Icon: UserPlus },
  { key: 'dismiss', label: 'Ignorar', Icon: Ban },
  { key: 'automate', label: 'Automatizar', Icon: Repeat },
];

const FILTERS = [['all', 'Todo'], ['critical', 'Crítico'], ['high', 'Alto'], ['medium', 'Medio']];

export default function IntelligenceInbox({ compact = false }) {
  const [data, setData] = useState({ items: [], counts: {}, agents: {} });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try { setData(await intelligenceApi.list('active')); } catch (e) { /* noop */ }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const scan = async () => {
    setScanning(true);
    try { await intelligenceApi.scan(); await load(); } catch (e) { /* noop */ }
    setScanning(false);
  };

  const act = async (item, action) => {
    setBusy(item.id + action);
    // optimistic remove (except approve which keeps as approved briefly)
    setData((d) => ({ ...d, items: d.items.filter((x) => x.id !== item.id) }));
    try {
      const res = await intelligenceApi.act(item.id, action);
      if (res.automated) setToast({ type: 'ok', msg: `Automatización creada · ${item.title}` });
      else if (res.suggest_automation) setToast({ type: 'learn', msg: res.suggest_message, item, });
      else setToast({ type: 'ok', msg: `${ACTIONS.find((a) => a.key === action)?.label || action} · ${item.title}` });
    } catch (e) { setToast({ type: 'err', msg: 'No se pudo completar la acción' }); load(); }
    setBusy(null);
    setTimeout(() => setToast(null), 5000);
  };

  const items = filter === 'all' ? data.items : data.items.filter((i) => i.priority === filter);
  const critical = data.counts.critical || 0;

  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-white/5 border border-black/8 dark:border-white/10" data-testid="intelligence-inbox">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="font-black text-lg text-[#0F0F13] dark:text-white flex items-center gap-2" style={{ fontFamily: HEADING }}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))' }}>
              <Sparkles className="w-4 h-4" />
            </span>
            Bandeja de Inteligencia
          </h2>
          <p className="text-xs text-[#8A8A9E] mt-0.5">Tus agentes IA trabajan continuamente · {data.items.length} recomendación(es){critical > 0 ? ` · ${critical} crítica(s)` : ''}</p>
        </div>
        <button onClick={scan} disabled={scanning} data-testid="intel-scan-btn"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-black/10 dark:border-white/15 text-[#0F0F13] dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} /> {scanning ? 'Analizando…' : 'Re-analizar'}
        </button>
      </div>

      {!compact && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {FILTERS.map(([k, lbl]) => (
            <button key={k} onClick={() => setFilter(k)} data-testid={`intel-filter-${k}`}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === k ? 'text-white' : 'text-[#5F5F6B] dark:text-white/60 bg-black/5 dark:bg-white/10'}`}
              style={filter === k ? { background: 'var(--brand-primary,#7C3AED)' } : {}}>
              {lbl}{k !== 'all' && data.counts[k] ? ` (${data.counts[k]})` : ''}
            </button>
          ))}
        </div>
      )}

      {loading ? <p className="text-[#8A8A9E] text-sm">Cargando inteligencia…</p> : items.length === 0 ? (
        <div className="text-center py-10">
          <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-[#5F5F6B] dark:text-white/60 text-sm">Todo al día. No hay recomendaciones pendientes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {(compact ? items.slice(0, 5) : items).map((it) => {
              const p = PRIORITY[it.priority] || PRIORITY.info;
              const TIcon = TYPE_ICON[it.type] || TYPE_ICON.default;
              const AIcon = AGENT_ICON[it.agent] || Bot;
              const agent = it.agent_meta || {};
              return (
                <motion.div key={it.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
                  data-testid="intel-item"
                  className="rounded-xl border border-black/8 dark:border-white/10 p-4 relative overflow-hidden">
                  <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: p.color }} />
                  <div className="flex items-start gap-3 pl-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: (agent.color || '#7C3AED') + '18', color: agent.color || '#7C3AED' }}>
                      <TIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: (agent.color || '#7C3AED') + '22', color: agent.color || '#7C3AED' }}>
                          <AIcon className="w-3 h-3" /> {agent.label || it.agent}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: p.color + '22', color: p.color }}>{p.label}</span>
                        {it.auto_suggest && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Auto-sugerido</span>}
                      </div>
                      <div className="font-bold text-sm text-[#0F0F13] dark:text-white">{it.title}</div>
                      <div className="text-sm text-[#5F5F6B] dark:text-white/60 mt-0.5">{it.message}</div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {ACTIONS.filter((a) => it.actions?.includes(a.key)).map((a) => (
                          <button key={a.key} onClick={() => act(it, a.key)} disabled={busy === it.id + a.key}
                            data-testid={`intel-action-${a.key}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
                              a.primary ? 'text-white' : 'text-[#5F5F6B] dark:text-white/70 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                            style={a.primary ? { background: 'var(--brand-primary,#7C3AED)' } : {}}>
                            <a.Icon className="w-3.5 h-3.5" /> {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[3000] max-w-sm rounded-xl shadow-2xl p-4 text-sm font-medium bg-[#141019] text-white border border-white/10"
            data-testid="intel-toast">
            {toast.type === 'learn' ? (
              <div>
                <div className="flex items-center gap-2 font-bold mb-2"><Repeat className="w-4 h-4 text-[color:var(--brand-secondary,#FFD700)]" /> Aprendizaje de Azumi</div>
                <p className="text-white/80 mb-3">{toast.msg}</p>
                <div className="flex gap-2">
                  <button onClick={() => { act(toast.item, 'automate'); setToast(null); }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--brand-primary,#7C3AED)' }}>Sí, automatizar</button>
                  <button onClick={() => setToast(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 border border-white/15">Ahora no</button>
                </div>
              </div>
            ) : (
              <span>{toast.msg}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
