import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_CATEGORIES } from '@/config/apps';

const StatusPill = ({ status }) => {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
      <Check className="w-2.5 h-2.5" strokeWidth={3} /> Live
    </span>
  );
  if (status === 'partial') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[#FFB042]/20 text-[#B27200] px-1.5 py-0.5 rounded-full">
      <Check className="w-2.5 h-2.5" strokeWidth={3} /> Beta
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[#7C5CFF]/10 text-[#7C5CFF] px-1.5 py-0.5 rounded-full">
      <Clock className="w-2.5 h-2.5" strokeWidth={3} /> Pronto
    </span>
  );
};

const Applications = () => {
  const { lang } = useLanguage();
  const L = (obj) => obj[lang] || obj.es || obj.en;

  return (
    <section id="applications" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C5CFF] mb-4">
            APLICACIONES LEVOND
          </div>
          <h2 className="font-display font-black tracking-[-0.025em] leading-[1.05] text-[#0F0F13]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Una aplicación para cada necesidad.
          </h2>
          <p className="mt-5 text-lg text-[#5F5F6B] leading-relaxed">
            Elige solo lo que uses. Cada app es independiente, se conecta con las demás y funciona en 12 idiomas.
          </p>
        </div>

        <div className="space-y-16">
          {APP_CATEGORIES.map((cat, ci) => (
            <div key={cat.id} data-testid={`app-category-${cat.id}`}>
              <div className="flex items-baseline gap-3 mb-6">
                <h3
                  className="font-display font-black tracking-tight text-[#0F0F13]"
                  style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', color: cat.accent }}
                >
                  {L(cat.title)}
                </h3>
                <span className="text-xs font-bold text-[#8A8A9E] font-mono">{cat.apps.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.apps.map((app, ai) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.35, delay: (ai % 6) * 0.03 }}
                    whileHover={{ y: -3 }}
                    data-testid={`app-card-${app.id}`}
                    className="group relative bg-white rounded-2xl p-4 border border-[#7C5CFF]/8 hover:border-[#7C5CFF]/25 hover:shadow-[0_12px_32px_rgba(124,92,255,0.10)] transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat.accent}15`, color: cat.accent }}
                      >
                        <app.Icon className="w-5 h-5" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-display font-extrabold text-[15px] text-[#0F0F13] leading-tight truncate">
                            {lang === 'en' ? app.en : app.name}
                          </h4>
                          <StatusPill status={app.status} />
                        </div>
                        <p className="text-[13px] text-[#5F5F6B] leading-snug">
                          {L(app.desc)}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#8A8A9E] group-hover:text-[#7C5CFF] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Applications;
