import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock, ArrowRight, DollarSign, ShoppingCart, Users, Package, Activity, TrendingUp, Sparkles } from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashApi } from '@/lib/api';
import { APP_CATEGORIES } from '@/config/apps';

const StatusChip = ({ s }) => {
  if (s === 'live') return <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Live</span>;
  if (s === 'partial') return <span className="text-[9px] font-bold uppercase tracking-wider bg-[#FFB042]/20 text-[#B27200] px-1.5 py-0.5 rounded-full">Beta</span>;
  return <span className="text-[9px] font-bold uppercase tracking-wider bg-[#7C5CFF]/10 text-[#7C5CFF] px-1.5 py-0.5 rounded-full">Pronto</span>;
};

const AppLauncher = () => {
  const { lang } = useLanguage();
  const { user, tenant } = useAuth();
  const [kpis, setKpis] = useState(null);
  const L = (obj) => obj[lang] || obj.es || obj.en;

  useEffect(() => { dashApi.kpis().then(setKpis).catch(() => {}); }, []);

  const kpiCards = [
    { key: 'revenue', label: lang === 'en' ? 'Monthly revenue' : 'Ingresos del mes', icon: DollarSign, color: '#7C5CFF', prefix: '$', value: kpis?.revenue ?? 0 },
    { key: 'orders', label: lang === 'en' ? 'Orders' : 'Pedidos', icon: ShoppingCart, color: '#FFB042', value: kpis?.orders ?? 0 },
    { key: 'customers', label: lang === 'en' ? 'Active customers' : 'Clientes activos', icon: Users, color: '#10B981', value: kpis?.customers ?? 0 },
    { key: 'stock', label: lang === 'en' ? 'Products in stock' : 'Productos en stock', icon: Package, color: '#EC4899', value: kpis?.stock ?? 0 },
  ];

  return (
    <div>
      <Topbar
        title={`${lang === 'en' ? 'Hello' : 'Hola'}, ${user?.name?.split(' ')[0] || ''} 👋`}
        subtitle={`${tenant?.name} · ${lang === 'en' ? 'Your app launcher' : 'Tu launcher de aplicaciones'}`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10" data-testid="launcher-kpis">
        {kpiCards.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            data-testid={`kpi-${c.key}`}
            className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">{c.label}</div>
            <div className="font-display font-black text-3xl tracking-tight text-[#0F0F13] mt-1">
              {c.prefix || ''}{c.value.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* App Launcher (all apps by category) */}
      <div className="space-y-10" data-testid="app-launcher">
        {APP_CATEGORIES.map((cat) => (
          <div key={cat.id} data-testid={`launcher-cat-${cat.id}`}>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.accent }} />
              <h3 className="font-display font-black text-lg tracking-tight" style={{ color: cat.accent }}>
                {L(cat.title)}
              </h3>
              <span className="text-[10px] font-bold text-[#8A8A9E] font-mono">{cat.apps.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {cat.apps.map((app, ai) => {
                const isLive = app.status === 'live' || app.status === 'partial';
                const Wrapper = ({ children }) => isLive
                  ? <Link to={app.route} data-testid={`launcher-app-${app.id}`}>{children}</Link>
                  : <div data-testid={`launcher-app-${app.id}`} className="cursor-not-allowed">{children}</div>;
                return (
                  <Wrapper key={app.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: (ai % 4) * 0.04 }}
                      whileHover={isLive ? { y: -3 } : {}}
                      className={`group relative bg-white rounded-2xl p-4 border transition-all duration-300 ${
                        isLive
                          ? 'border-[#7C5CFF]/10 hover:border-[#7C5CFF]/30 hover:shadow-[0_10px_28px_rgba(124,92,255,0.10)]'
                          : 'border-[#7C5CFF]/5 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ background: `${cat.accent}${isLive ? '18' : '10'}`, color: cat.accent }}
                        >
                          <app.Icon className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <StatusChip s={app.status} />
                      </div>
                      <div className="font-display font-extrabold text-[15px] text-[#0F0F13] leading-tight mb-0.5">
                        {lang === 'en' ? app.en : app.name}
                      </div>
                      <p className="text-[12px] text-[#5F5F6B] leading-snug line-clamp-2">
                        {L(app.desc)}
                      </p>
                    </motion.div>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      {kpis?.activity?.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#7C5CFF]" />
            <h3 className="font-display font-extrabold text-lg text-[#0F0F13]">{lang === 'en' ? 'Recent activity' : 'Actividad reciente'}</h3>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-auto" data-testid="activity-feed">
            {kpis.activity.map((a) => (
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
      )}
    </div>
  );
};

export default AppLauncher;
