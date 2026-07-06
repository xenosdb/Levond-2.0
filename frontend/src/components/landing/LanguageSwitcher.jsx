import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { lang, setLang, langs } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const current = langs.find((l) => l.code === lang) || langs[0];

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid="language-switcher-trigger"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/60 hover:bg-white border border-[#7C5CFF]/15 hover:border-[#7C5CFF]/40 transition-all text-sm font-semibold text-[#0F0F13]"
      >
        <Globe className="w-4 h-4 text-[#7C5CFF]" strokeWidth={2.2} />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="uppercase tracking-wider text-xs">{current.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          data-testid="language-switcher-menu"
          className="absolute right-0 mt-2 w-56 glass-card-strong rounded-2xl p-2 z-50 max-h-[420px] overflow-auto"
        >
          {langs.map((l) => (
            <button
              key={l.code}
              data-testid={`language-option-${l.code}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                lang === l.code ? 'bg-[#7C5CFF]/10 text-[#7C5CFF]' : 'hover:bg-[#7C5CFF]/5 text-[#0F0F13]'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg leading-none">{l.flag}</span>
                <span>{l.label}</span>
              </span>
              {lang === l.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
