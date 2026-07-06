import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Mic, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AIShowcase = () => {
  const { t } = useLanguage();
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left mockup */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              {/* Decorative glow */}
              <div className="absolute -inset-8 bg-gradient-to-br from-[#7C5CFF]/20 to-[#FFB042]/15 blur-3xl rounded-full pointer-events-none" />

              <div className="relative glass-card-strong rounded-[2rem] p-6 md:p-8 shadow-[0_24px_80px_rgba(124,92,255,0.18)]">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-[#7C5CFF]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm text-[#0F0F13]">LEVOND Azumi</div>
                      <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activo · GPT-5.2
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-[#8A8A9E] uppercase">EJEC. 0.4s</div>
                </div>

                {/* Chat */}
                <div className="py-6 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-[#7C5CFF] text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] font-medium">
                      Analiza el último correo de Acme y crea una propuesta.
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-white/80 border border-[#7C5CFF]/10 text-[#0F0F13] text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%]">
                      Listo. Detecté que Acme pide 50 unidades de Producto A. Generé la cotización <span className="font-mono font-bold text-[#7C5CFF]">#Q-2026-0142</span> y notifiqué a Sofía (Ventas).
                      <div className="mt-2.5 flex gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Cotización creada</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider bg-[#FFB042]/20 text-[#B27200] px-2 py-1 rounded-full">Tarea asignada</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div className="bg-white/80 border border-[#7C5CFF]/15 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
                  <span className="text-sm text-[#8A8A9E] flex-1 truncate">Escribe un comando o pregunta…</span>
                  <button className="w-8 h-8 rounded-xl bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 flex items-center justify-center transition-colors" data-testid="ai-mic-btn">
                    <Mic className="w-4 h-4 text-[#7C5CFF]" />
                  </button>
                  <button className="w-8 h-8 rounded-xl bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white flex items-center justify-center transition-colors" data-testid="ai-send-btn">
                    <Zap className="w-4 h-4" fill="currentColor" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right copy */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB042] mb-4">
              {t.ai.eyebrow}
            </div>
            <h2 className="font-display font-black tracking-[-0.025em] leading-[1.05] text-[#0F0F13]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {t.ai.title}
            </h2>
            <p className="mt-5 text-lg text-[#5F5F6B] leading-relaxed">
              {t.ai.subtitle}
            </p>
            <ul className="mt-8 space-y-4">
              {t.ai.bullets.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-start gap-3"
                  data-testid={`ai-bullet-${i}`}
                >
                  <span className="mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-base text-[#0F0F13] font-medium leading-relaxed">{b}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;
