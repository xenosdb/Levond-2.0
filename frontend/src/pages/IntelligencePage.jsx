import React from 'react';
import IntelligenceInbox from '@/components/dashboard/IntelligenceInbox';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";

export default function IntelligencePage() {
  return (
    <div className="space-y-6 max-w-4xl" data-testid="intelligence-page">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#0F0F13] dark:text-white" style={{ fontFamily: HEADING }}>
          Centro de Inteligencia IA
        </h1>
        <p className="text-[#5F5F6B] dark:text-white/50 mt-1">
          Todos tus agentes especializados reportan aquí oportunidades, riesgos y acciones sugeridas — en tiempo real.
        </p>
      </div>
      <IntelligenceInbox />
    </div>
  );
}
