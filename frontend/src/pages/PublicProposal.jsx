import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Hotel, MapPin, Ticket, Check, X, Users, Calendar, AlertCircle } from 'lucide-react';
import { travelPartnersApi as api } from '@/lib/travel';

const KIND_ICON = { flight: Plane, hotel: Hotel, attraction: MapPin, transport: MapPin, extra: Ticket };

const PublicProposal = () => {
  const { code } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => { api.publicView(code).then(setP).catch(e => setErr(e?.response?.data?.detail || 'No encontrada')); }, [code]);

  const decide = async (decision) => {
    setSubmitting(true);
    try {
      await api.publicDecision(code, decision, comment);
      setDone(decision);
      const fresh = await api.publicView(code); setP(fresh);
    } finally { setSubmitting(false); }
  };

  if (err) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card-strong rounded-3xl p-10 max-w-md text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <div className="font-display font-black text-xl text-[#0F0F13]">{err}</div>
      </div>
    </div>
  );
  if (!p) return <div className="min-h-screen flex items-center justify-center text-[#5F5F6B]">Cargando…</div>;

  const decided = ['accepted','rejected','booked'].includes(p.status);

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center">
              <span className="font-display font-black text-white text-lg">L</span>
            </div>
            <div className="font-display font-black text-xl text-[#0F0F13]">{p.agency_name}</div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C5CFF]">Propuesta de viaje</div>
          <h1 className="font-display font-black tracking-tight text-[#0F0F13] mt-2" style={{ fontSize:'clamp(2rem,5vw,3.5rem)' }}>{p.destination}</h1>
          <div className="text-[#5F5F6B] mt-2">Para {p.contact_name} · {p.travelers} viajeros</div>
          <div className="text-xs font-mono text-[#8A8A9E] mt-1">{p.code}</div>
        </motion.div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Calendar, label: 'Inicio', value: p.start_date },
            { icon: Calendar, label: 'Fin', value: p.end_date },
            { icon: Users, label: 'Viajeros', value: p.travelers },
          ].map((k, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 text-center">
              <k.icon className="w-4 h-4 text-[#7C5CFF] mx-auto mb-1" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">{k.label}</div>
              <div className="font-display font-black text-[#0F0F13]">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="glass-card-strong rounded-3xl p-6 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C5CFF] mb-4">Qué incluye tu paquete</div>
          <div className="space-y-2">
            {p.items?.map((it, i) => {
              const Icon = KIND_ICON[it.kind] || Ticket;
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#7C5CFF]/8 last:border-b-0">
                  <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 text-[#7C5CFF] flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="font-bold text-[#0F0F13]">{it.name}</div>
                    {it.description && <div className="text-xs text-[#5F5F6B]">{it.description}</div>}
                  </div>
                  <div className="text-xs text-[#8A8A9E]">x{it.qty}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Itinerary */}
        {p.itinerary?.length > 0 && (
          <div className="glass-card rounded-3xl p-6 mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C5CFF] mb-4">Itinerario</div>
            <div className="space-y-3">
              {p.itinerary.map((d, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center text-white font-display font-black flex-shrink-0">D{d.day}</div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-[#0F0F13]">{d.title}</div>
                    {d.date && <div className="text-xs text-[#8A8A9E] font-mono">{d.date}</div>}
                    <div className="text-sm text-[#5F5F6B] mt-1">{d.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="glass-card-strong rounded-3xl p-6 mb-6 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A8A9E]">Precio total</div>
          <div className="font-display font-black text-[#0F0F13] mt-1" style={{ fontSize:'clamp(2.5rem,6vw,4rem)' }}>${p.total?.toLocaleString()}</div>
          <div className="text-sm text-[#5F5F6B]">{p.currency} · Todo incluido</div>
          {p.notes && <div className="text-xs text-[#8A8A9E] italic mt-2 max-w-md mx-auto">"{p.notes}"</div>}
        </div>

        {/* Decision */}
        {!decided && !done && (
          <div className="glass-card-strong rounded-3xl p-6">
            <div className="font-display font-black text-lg text-[#0F0F13] mb-3 text-center">¿Aceptas esta propuesta?</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} data-testid="pub-comment"
              placeholder="Comentarios opcionales…" rows={3}
              className="w-full px-3.5 py-2.5 bg-white/80 border border-[#7C5CFF]/15 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF] mb-3" />
            <div className="flex gap-3">
              <button onClick={() => decide('rejected')} disabled={submitting} data-testid="pub-reject"
                className="flex-1 py-3 rounded-full font-bold text-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40">
                <X className="inline w-4 h-4 mr-1" />Rechazar
              </button>
              <button onClick={() => decide('accepted')} disabled={submitting} data-testid="pub-accept"
                className="flex-1 py-3 rounded-full font-bold text-sm bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] text-white shadow-[0_8px_24px_rgba(124,92,255,0.35)] disabled:opacity-40">
                <Check className="inline w-4 h-4 mr-1" />Aceptar propuesta
              </button>
            </div>
          </div>
        )}
        {(decided || done) && (
          <div className={`glass-card-strong rounded-3xl p-8 text-center ${(p.status === 'accepted' || p.status === 'booked' || done === 'accepted') ? 'border-emerald-300' : 'border-red-300'}`}>
            <div className="text-4xl mb-2">{(p.status === 'accepted' || p.status === 'booked' || done === 'accepted') ? '🎉' : '😔'}</div>
            <div className="font-display font-black text-xl text-[#0F0F13]">
              {(p.status === 'accepted' || p.status === 'booked') ? '¡Propuesta aceptada!' : 'Propuesta rechazada'}
            </div>
            <div className="text-sm text-[#5F5F6B] mt-1">
              {(p.status === 'accepted' || p.status === 'booked') ? 'La agencia se pondrá en contacto contigo.' : 'Gracias por tu tiempo.'}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-[#8A8A9E] mt-8">Powered by <span className="font-display font-black text-[#7C5CFF]">LEVOND</span> · Travel Partners</div>
      </div>
    </div>
  );
};

export default PublicProposal;
