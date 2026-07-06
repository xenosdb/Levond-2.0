import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Rocket } from 'lucide-react';
import { ALL_APPS } from '@/config/apps';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";

const ComingSoon = () => {
  const { module } = useParams();
  const app = ALL_APPS.find((a) => a.id === module || a.route === `/app/${module}`);
  const Icon = app?.Icon || Rocket;
  const name = app?.name || 'Módulo';
  const desc = app?.desc?.es || 'Este módulo forma parte de Levond Travel OS.';

  return (
    <div className="min-h-[70vh] flex items-center justify-center" data-testid="coming-soon-page">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 text-white"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))' }}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand-primary,#7C3AED)] mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Próximamente
        </div>
        <h1 className="text-4xl font-black text-[#0F0F13] mb-3" style={{ fontFamily: HEADING }}>{name}</h1>
        <p className="text-[#5F5F6B] mb-8">{desc}. Estamos construyendo este módulo dentro de Levond Travel OS.</p>
        <Link to="/app" data-testid="coming-soon-back"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white"
          style={{ background: 'linear-gradient(90deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))' }}>
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
