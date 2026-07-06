import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Pricing = () => {
  const { t } = useLanguage();
  const [yearly, setYearly] = useState(false);

  const planKeys = ['starter', 'pro', 'business', 'enterprise'];

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C5CFF] mb-4">
            {t.pricing.eyebrow}
          </div>
          <h2 className="font-display font-black tracking-[-0.025em] leading-[1.05] text-[#0F0F13]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            {t.pricing.title}
          </h2>
          <p className="mt-5 text-lg text-[#5F5F6B] leading-relaxed">{t.pricing.subtitle}</p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center glass-card rounded-full p-1.5 text-sm font-bold">
            <button
              data-testid="pricing-toggle-monthly"
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full transition-all ${!yearly ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}
            >
              {t.pricing.monthly}
            </button>
            <button
              data-testid="pricing-toggle-yearly"
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full transition-all flex items-center gap-2 ${yearly ? 'bg-[#0F0F13] text-white' : 'text-[#5F5F6B]'}`}
            >
              {t.pricing.yearly}
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${yearly ? 'bg-[#FFB042] text-[#0F0F13]' : 'bg-[#FFB042]/20 text-[#B27200]'}`}>
                {t.pricing.save}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {planKeys.map((pk, idx) => {
            const plan = t.pricing.plans[pk];
            const isPro = pk === 'pro';
            const priceNum = parseFloat(plan.price);
            const isNumeric = !isNaN(priceNum);
            const finalPrice = isNumeric ? (yearly ? Math.round(priceNum * 12 * 0.8) : priceNum) : plan.price;

            return (
              <motion.div
                key={pk}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                data-testid={`pricing-card-${pk}`}
                className={`relative rounded-[2rem] p-7 flex flex-col ${
                  isPro
                    ? 'bg-[#0F0F13] text-white shadow-[0_24px_60px_rgba(15,15,19,0.25)] scale-[1.02]'
                    : 'glass-card hover:-translate-y-1 transition-transform duration-300'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFB042] text-[#0F0F13] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Más popular
                  </div>
                )}
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isPro ? 'text-[#FFB042]' : 'text-[#7C5CFF]'}`}>
                  {plan.name}
                </div>
                <div className="mb-4">
                  {isNumeric ? (
                    <div className="flex items-baseline gap-1">
                      <span className={`font-display font-black tracking-tighter text-5xl ${isPro ? 'text-white' : 'text-[#0F0F13]'}`}>
                        ${finalPrice}
                      </span>
                      <span className={`text-sm font-bold ${isPro ? 'text-white/60' : 'text-[#8A8A9E]'}`}>
                        {yearly ? '/año' : t.pricing.perMonth}
                      </span>
                    </div>
                  ) : (
                    <div className={`font-display font-black tracking-tighter text-4xl ${isPro ? 'text-white' : 'text-[#0F0F13]'}`}>
                      {plan.price}
                    </div>
                  )}
                </div>
                <p className={`text-sm mb-6 ${isPro ? 'text-white/70' : 'text-[#5F5F6B]'}`}>
                  {plan.desc}
                </p>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-sm ${isPro ? 'text-white/90' : 'text-[#0F0F13]'}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPro ? 'text-[#FFB042]' : 'text-emerald-500'}`} strokeWidth={3} />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  data-testid={`pricing-cta-${pk}`}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full font-bold text-sm transition-all ${
                    isPro
                      ? 'bg-[#FFB042] text-[#0F0F13] hover:bg-[#F09C2E]'
                      : 'bg-[#0F0F13] text-white hover:bg-[#7C5CFF]'
                  }`}
                >
                  {isPro ? t.pricing.ctaPro : t.pricing.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
