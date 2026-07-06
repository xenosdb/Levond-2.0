import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, UtensilsCrossed, ShoppingBag, Package,
  Plane, Megaphone, LayoutTemplate, Brain
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const MODULES = [
  { key: 'crm',            Icon: Users,           color: '#7C5CFF', span: 'md:col-span-8', size: 'lg' },
  { key: 'webstudio',      Icon: LayoutTemplate,  color: '#FFB042', span: 'md:col-span-4', size: 'sm' },
  { key: 'pos_restaurant', Icon: UtensilsCrossed, color: '#FF6B6B', span: 'md:col-span-6', size: 'md' },
  { key: 'pos_retail',     Icon: ShoppingBag,     color: '#10B981', span: 'md:col-span-6', size: 'md' },
  { key: 'travel',         Icon: Plane,           color: '#3B82F6', span: 'md:col-span-4', size: 'sm' },
  { key: 'inventory',      Icon: Package,         color: '#8B5CF6', span: 'md:col-span-8', size: 'md' },
  { key: 'sales',          Icon: FileText,        color: '#7C5CFF', span: 'md:col-span-4', size: 'sm' },
  { key: 'marketing',      Icon: Megaphone,       color: '#EC4899', span: 'md:col-span-4', size: 'sm' },
  { key: 'ai',             Icon: Brain,           color: '#FFB042', span: 'md:col-span-4', size: 'lg' },
];

const ModuleCard = ({ k, Icon, color, span, size, index, t }) => {
  const item = t.modules.items[k];
  if (!item) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      data-testid={`module-card-${k}`}
      className={`group relative ${span} glass-card rounded-[2rem] p-7 md:p-9 overflow-hidden hover:shadow-[0_24px_60px_rgba(124,92,255,0.18)] transition-all duration-500`}
    >
      {/* Color bloom */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: color }}
      />

      <div className="relative">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
          style={{ background: `${color}18`, color }}
        >
          <Icon className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <h3 className={`font-display font-extrabold tracking-tight text-[#0F0F13] mb-2.5 ${size === 'lg' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
          {item.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-[#5F5F6B] max-w-md">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
};

const Modules = () => {
  const { t } = useLanguage();
  return (
    <section id="modules" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C5CFF] mb-4">
            {t.modules.eyebrow}
          </div>
          <h2 className="font-display font-black tracking-[-0.025em] leading-[1.05] text-[#0F0F13]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            {t.modules.title}
          </h2>
          <p className="mt-5 text-lg text-[#5F5F6B] leading-relaxed">
            {t.modules.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {MODULES.map((m, i) => (
            <ModuleCard key={m.key} k={m.key} {...m} index={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modules;
