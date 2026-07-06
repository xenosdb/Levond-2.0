import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CTA = () => {
  const { t } = useLanguage();
  return (
    <section className="relative py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0F0F13] via-[#1a1230] to-[#0F0F13] p-12 md:p-20 text-center"
        >
          {/* Decorative glows */}
          <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-[#7C5CFF] opacity-30 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-[#FFB042] opacity-20 blur-[120px] pointer-events-none" />

          <div className="relative">
            <h2 className="font-display font-black tracking-[-0.025em] leading-[1.05] text-white" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {t.cta.title}
            </h2>
            <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto">{t.cta.subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3 justify-center">
              <button data-testid="cta-bottom-primary" className="btn-accent inline-flex items-center gap-2 group">
                {t.cta.primary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button data-testid="cta-bottom-secondary" className="px-7 py-3.5 rounded-full font-bold text-white border border-white/20 hover:bg-white/10 transition-all">
                {t.cta.secondary}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
