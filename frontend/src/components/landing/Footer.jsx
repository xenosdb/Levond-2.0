import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, langs } = useLanguage();
  const year = new Date().getFullYear();

  const productLinks = ['CRM', 'POS Restaurante', 'POS Retail', 'Inventario', 'Viajes', 'Marketing', 'Web Studio'];
  const companyLinks = ['Sobre nosotros', 'Carreras', 'Blog', 'Contacto'];
  const legalLinks = ['Términos', 'Privacidad', 'Cookies', 'Seguridad'];

  return (
    <footer className="relative bg-[#0F0F13] text-[#FAFAFC] mt-16 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#7C5CFF] opacity-10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042]" />
                <div className="absolute inset-0.5 rounded-[10px] bg-[#0F0F13] flex items-center justify-center">
                  <span className="font-display font-black text-white text-lg leading-none">L</span>
                </div>
              </div>
              <span className="font-display font-black text-2xl tracking-tight">LEVOND</span>
            </div>
            <p className="text-white/60 max-w-md leading-relaxed">{t.footer.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {langs.map((l) => (
                <span key={l.code} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 font-medium">
                  {l.flag} {l.code.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFB042] mb-4">{t.footer.product}</div>
              <ul className="space-y-2.5">
                {productLinks.map((l) => (
                  <li key={l}><a href="#modules" className="text-sm text-white/70 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFB042] mb-4">{t.footer.company}</div>
              <ul className="space-y-2.5">
                {companyLinks.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFB042] mb-4">{t.footer.legal}</div>
              <ul className="space-y-2.5">
                {legalLinks.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Massive brand text */}
        <div className="relative overflow-hidden">
          <div
            className="font-display font-black tracking-[-0.04em] leading-none whitespace-nowrap bg-gradient-to-b from-white/10 to-white/[0.02] bg-clip-text text-transparent select-none"
            style={{ fontSize: 'clamp(5rem, 18vw, 18rem)' }}
            data-testid="footer-brand-mega"
          >
            LEVOND
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/50">© {year} LEVOND Inc. {t.footer.rights}.</p>
          <p className="text-xs text-white/50 font-mono">v 2026.1 · Edición Azumi</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
