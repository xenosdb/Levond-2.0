import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const Marquee = () => {
  const { t, langs } = useLanguage();
  const items = [
    ...langs.map((l) => `${l.flag} ${l.label}`),
    'CRM', 'POS · Restaurante', 'POS · Retail', 'Inventario Multi-almacén', 'Viajes', 'Marketing', 'Web Studio', 'IA Nativa', 'Multi-tenant',
  ];
  // Duplicate for seamless loop
  const loop = [...items, ...items];

  return (
    <section className="relative py-12 overflow-hidden border-y border-[#7C5CFF]/8 bg-white/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-5">
        <div className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[#8A8A9E]">
          {t.marquee}
        </div>
      </div>
      <div className="relative">
        <motion.div
          className="flex gap-10 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          {loop.map((item, i) => (
            <span
              key={i}
              className="font-display font-bold text-[#0F0F13] text-2xl tracking-tight inline-flex items-center gap-3"
            >
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]/40" />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Marquee;
