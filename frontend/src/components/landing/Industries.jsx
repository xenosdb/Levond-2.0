import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Store, Plane, Briefcase, Factory, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ICONS = [UtensilsCrossed, Store, Plane, Briefcase, Factory, ShoppingCart];

const Industries = () => {
  const { t } = useLanguage();
  return (
    <section id="industries" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7C5CFF]/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB042] mb-4">
              {t.industries.eyebrow}
            </div>
            <h2 className="font-display font-black tracking-[-0.025em] leading-[1.05] text-[#0F0F13]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {t.industries.title}
            </h2>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {t.industries.items.map((label, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  data-testid={`industry-card-${i}`}
                  className="group glass-card rounded-2xl p-6 cursor-pointer hover:border-[#7C5CFF]/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#7C5CFF]/10 text-[#7C5CFF] flex items-center justify-center group-hover:bg-[#7C5CFF] group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#8A8A9E] group-hover:text-[#7C5CFF] transition-colors" />
                  </div>
                  <div className="font-display font-bold text-[#0F0F13] text-base leading-tight">
                    {label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Industries;
