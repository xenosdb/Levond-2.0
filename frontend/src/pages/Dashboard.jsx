import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plane, Hotel, Users, DollarSign, MapPin, CalendarDays, Activity, TrendingUp, X, Clock, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { travelApi, dashApi } from '@/lib/api';
import ClientsWorldMap, { JourneyStats } from '@/components/dashboard/ClientsWorldMap';
import IntelligenceInbox from '@/components/dashboard/IntelligenceInbox';
import { buildJourneys, PHASE_LABEL, PHASE_COLOR } from '@/lib/journey';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";
const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short' });
const fmtLong = (d) => new Date(d).toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Dashboard() {
  const { user, tenant } = useAuth();
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [b, k] = await Promise.all([travelApi.list(), dashApi.kpis().catch(() => null)]);
      setBookings(b); setKpis(k);
    } catch (e) { /* noop */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const journeys = useMemo(() => buildJourneys(bookings), [bookings]);
  const jstats = JourneyStats({ bookings });
  const revenue = bookings.reduce((s, b) => s + Number(b.amount || 0), 0);

  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed').sort((a, b) => new Date(a.start_date) - new Date(b.start_date)),
    [bookings]
  );

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  const kpiCards = [
    { label: 'Viajes activos', value: jstats.total - journeys.filter((j) => j.phase === 'completed').length, icon: Plane, color: '#7C3AED' },
    { label: 'En vuelo ahora', value: jstats.inFlight, icon: Activity, color: '#3B82F6' },
    { label: 'En destino', value: jstats.atDest, icon: Hotel, color: '#10B981' },
    { label: 'Facturación', value: `$${revenue.toLocaleString()}`, icon: DollarSign, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6" data-testid="operations-dashboard">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#0F0F13] dark:text-white" style={{ fontFamily: HEADING }}>
          {greet}, {user?.name?.split(' ')[0] || ''} 👋
        </h1>
        <p className="text-[#5F5F6B] dark:text-white/50 mt-1">Centro de Operaciones · {tenant?.name} — todo sincronizado en tiempo real</p>
      </div>

      {/* AI Intelligence Inbox — el centro del AI Operating System */}
      <IntelligenceInbox compact />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            data-testid={`dash-kpi-${i}`}
            className="rounded-2xl p-5 bg-white dark:bg-white/5 border border-black/8 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">{c.label}</div>
            <div className="font-black text-3xl tracking-tight text-[#0F0F13] dark:text-white mt-1">{c.value}</div>
          </motion.div>
        ))}
      </div>

      {/* World map — operations center */}
      <div className="rounded-2xl p-4 bg-white dark:bg-white/5 border border-black/8 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-lg text-[#0F0F13] dark:text-white flex items-center gap-2" style={{ fontFamily: HEADING }}>
            <MapPin className="w-5 h-5 text-[color:var(--brand-primary,#7C3AED)]" /> Mapa mundial de clientes
          </h2>
          <span className="text-xs text-[#8A8A9E]">Actualización automática cada 15s</span>
        </div>
        <ClientsWorldMap bookings={bookings} theme={theme} height={480} onSelect={(j) => setSelected(bookings.find((b) => b.id === j.id))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar of confirmed bookings */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-white/5 border border-black/8 dark:border-white/10">
          <h2 className="font-black text-lg text-[#0F0F13] dark:text-white flex items-center gap-2 mb-4" style={{ fontFamily: HEADING }}>
            <CalendarDays className="w-5 h-5 text-[color:var(--brand-primary,#7C3AED)]" /> Calendario de reservas
          </h2>
          {loading ? <p className="text-[#8A8A9E]">Cargando…</p> : confirmed.length === 0 ? (
            <p className="text-[#8A8A9E] text-sm">No hay reservas confirmadas.</p>
          ) : (
            <div className="space-y-2" data-testid="dash-calendar">
              {confirmed.map((b) => {
                const j = journeys.find((x) => x.id === b.id);
                const color = PHASE_COLOR[j?.phase] || '#7C3AED';
                return (
                  <button key={b.id} onClick={() => setSelected(b)} data-testid="calendar-booking"
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-black/8 dark:border-white/10 hover:border-[color:var(--brand-primary,#7C3AED)]/50 transition-colors text-left">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0" style={{ background: color + '18', color }}>
                      <span className="text-[10px] font-bold uppercase">{new Date(b.start_date).toLocaleDateString('es', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none">{new Date(b.start_date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#0F0F13] dark:text-white truncate">Propuesta #{b.proposal_number || '—'} · {b.traveler}</div>
                      <div className="text-xs text-[#8A8A9E]">{j?.originCode || b.origin} → {j?.destinationCode || b.destination} · {b.pax || 1} pasajero(s)</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ background: color + '22', color }}>{PHASE_LABEL[j?.phase] || b.status}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Live activity */}
        <div className="rounded-2xl p-5 bg-white dark:bg-white/5 border border-black/8 dark:border-white/10">
          <h2 className="font-black text-lg text-[#0F0F13] dark:text-white flex items-center gap-2 mb-4" style={{ fontFamily: HEADING }}>
            <Activity className="w-5 h-5 text-[color:var(--brand-primary,#7C3AED)]" /> Actividad
          </h2>
          <div className="space-y-3 max-h-[360px] overflow-auto">
            {(kpis?.activity || []).slice(0, 12).map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--brand-primary,#7C3AED)] flex-shrink-0" />
                <div className="flex-1"><div className="text-[#0F0F13] dark:text-white/90 font-medium">{a.message}</div>
                  <div className="text-xs text-[#8A8A9E] uppercase tracking-wider">{a.kind}</div></div>
              </div>
            ))}
            {(!kpis?.activity || kpis.activity.length === 0) && <p className="text-[#8A8A9E] text-sm">Sin actividad reciente.</p>}
          </div>
        </div>
      </div>

      {selected && <BookingDetail booking={selected} journey={journeys.find((j) => j.id === selected.id)} onClose={() => setSelected(null)} />}
    </div>
  );
}

function BookingDetail({ booking, journey, onClose }) {
  const j = journey || {};
  const color = PHASE_COLOR[j.phase] || '#7C3AED';
  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-black/6 dark:border-white/10">
      <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A9E]">{label}</span>
      <span className="text-sm text-[#0F0F13] dark:text-white text-right">{value}</span>
    </div>
  );
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50" onClick={onClose} data-testid="booking-detail-modal">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#141019] rounded-2xl p-6 max-h-[90vh] overflow-y-auto border border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ background: color + '22', color }}>{PHASE_LABEL[j.phase] || booking.status}</span>
          <button onClick={onClose}><X className="w-5 h-5 text-[#8A8A9E]" /></button>
        </div>
        <h3 className="text-2xl font-black text-[#0F0F13] dark:text-white mb-1" style={{ fontFamily: HEADING }}>{booking.traveler}</h3>
        <p className="text-[#5F5F6B] dark:text-white/50 text-sm mb-4">Propuesta #{booking.proposal_number || '—'} · {j.originCode} → {j.destinationCode}</p>
        <div className="space-y-0">
          <Row label="Destino" value={booking.destination} />
          <Row label="Pasajeros" value={`${booking.pax || 1}`} />
          <Row label="Paquete / Hotel" value={booking.hotel || '—'} />
          <Row label="Ida" value={j.departureOverride ? fmtTime(j.departureOverride) : fmtLong(booking.start_date)} />
          <Row label="Regreso" value={j.returnOverride ? fmtTime(j.returnOverride) : fmtLong(booking.end_date)} />
          <Row label="Distancia" value={j.distanceKm ? `${j.distanceKm.toLocaleString()} km` : '—'} />
          <Row label="Vuelo" value={j.flightNumber} />
          <Row label="Importe" value={`$${Number(booking.amount || 0).toLocaleString()}`} />
          {j.phase === 'at_destination' && <Row label="Días restantes" value={`${j.daysLeft}`} />}
        </div>
        {booking.notes && <p className="text-sm text-[#5F5F6B] dark:text-white/60 mt-4">{booking.notes}</p>}
      </motion.div>
    </div>
  );
}
