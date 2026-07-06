import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Play, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Floating module bubble used inside the orb composition
const FloatingPill = ({ icon: Icon, label, status, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    className={`absolute glass-card-strong rounded-2xl px-3 py-2 flex items-center gap-2.5 ${className}`}
  >
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFF]/15 to-[#FFB042]/15 flex items-center justify-center">
      <Icon className="w-4 h-4 text-[#7C5CFF]" strokeWidth={2.2} />
    </div>
    <div className="leading-tight">
      <div className="text-[12px] font-bold text-[#0F0F13]">{label}</div>
      <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {status}
      </div>
    </div>
  </motion.div>
);

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section id="hero" className="relative pt-36 lg:pt-44 pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 -left-20 w-[600px] h-[600px] rounded-full bg-[#7C5CFF] opacity-[0.18] blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-[500px] h-[500px] rounded-full bg-[#FFB042] opacity-[0.12] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          {/* Left — copy */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              data-testid="hero-badge"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C5CFF] mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
              {t.hero.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black tracking-[-0.03em] leading-[0.95] text-[#0F0F13]"
              style={{ fontSize: 'clamp(2.75rem, 6vw, 5.5rem)' }}
              data-testid="hero-title"
            >
              {t.hero.title_a}{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] bg-clip-text text-transparent">
                  {t.hero.title_b}
                </span>
              </span>{' '}
              {t.hero.title_c}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-7 text-lg sm:text-xl text-[#5F5F6B] leading-relaxed max-w-2xl"
              data-testid="hero-subtitle"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a href="#pricing" data-testid="hero-cta-primary" className="btn-accent flex items-center gap-2 group">
                {t.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="#modules" data-testid="hero-cta-secondary" className="btn-ghost flex items-center gap-2">
                <Play className="w-4 h-4 text-[#7C5CFF]" fill="currentColor" />
                {t.hero.ctaSecondary}
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-sm font-semibold text-[#8A8A9E] flex items-center gap-2"
              data-testid="hero-proof"
            >
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
              {t.hero.proof}
            </motion.p>
          </div>

          {/* Right — abstract orb composition (NO human avatar) */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[460px] lg:h-[520px] flex items-center justify-center"
            >
              {/* Outer ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] rounded-full border border-[#7C5CFF]/15 animate-spin-slow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] rounded-full border border-[#FFB042]/20 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '40s' }} />
              </div>

              {/* Central orb */}
              <div className="relative w-[260px] h-[260px] animate-float-soft">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C5CFF] via-[#9B7BFF] to-[#FFB042] blur-2xl opacity-60 animate-pulse-orb" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#7C5CFF] via-[#A78BFA] to-[#FFB042] shadow-[0_0_80px_rgba(124,92,255,0.5)]">
                  <div className="absolute inset-4 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-display font-black text-white text-5xl tracking-tighter drop-shadow-lg">L</div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/90 font-bold mt-1">NEXUS AI</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating pills around */}
              <FloatingPill
                icon={require('lucide-react').Users}
                label="CRM"
                status="Activo"
                className="top-2 left-0"
                delay={0.6}
              />
              <FloatingPill
                icon={require('lucide-react').UtensilsCrossed}
                label="POS Restaurante"
                status="12 mesas"
                className="top-16 right-0"
                delay={0.7}
              />
              <FloatingPill
                icon={require('lucide-react').ShoppingBag}
                label="POS Retail"
                status="Caja abierta"
                className="bottom-24 left-2"
                delay={0.8}
              />
              <FloatingPill
                icon={require('lucide-react').Package}
                label="Inventario"
                status="3 almacenes"
                className="bottom-4 right-4"
                delay={0.9}
              />
              <FloatingPill
                icon={require('lucide-react').Plane}
                label="Viajes"
                status="8 reservas"
                className="bottom-44 right-[-20px]"
                delay={1.0}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
