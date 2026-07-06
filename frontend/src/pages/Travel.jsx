import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Calendar, Users, MapPin, ArrowRight, Sparkles,
  Bot, Plane, Hotel, CreditCard, Megaphone, ChevronRight, ChevronLeft,
  Check, Instagram, Twitter, Facebook, Youtube, Zap, ArrowLeft,
  Send, Star, TrendingUp, DollarSign, MessageCircle, Ticket
} from 'lucide-react';
import LanguageSwitcher from '@/components/landing/LanguageSwitcher';

import heroMaldives from '@/assets/travel/levond-hero-maldives.jpg';
import moduleCrm from '@/assets/travel/module-crm.jpg';
import moduleAzumi from '@/assets/travel/module-axion-clean.jpg';
import moduleProposals from '@/assets/travel/module-proposals.jpg';
import moduleMarketing from '@/assets/travel/module-marketing.jpg';
import modulePayments from '@/assets/travel/module-payments.jpg';
import moduleFlights from '@/assets/travel/module-flights.jpg';
import caseNomad from '@/assets/travel/case-nomad.jpg';
import caseSelva from '@/assets/travel/case-selva.jpg';
import caseAlpine from '@/assets/travel/case-alpine.jpg';
import destBora from '@/assets/travel/dest-bora-bora.jpg';
import destGreece from '@/assets/travel/dest-greece.jpg';
import destJapan from '@/assets/travel/dest-japan.jpg';
import destMachu from '@/assets/travel/dest-machu-picchu.jpg';
import destPatagonia from '@/assets/travel/dest-patagonia.jpg';
import destSafari from '@/assets/travel/dest-safari.jpg';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";
const BODY = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
const GOLD_TEXT = {
  backgroundImage: 'linear-gradient(135deg,#fff4cc 0%,#f7d76a 22%,#eac050 42%,#d4a72e 62%,#c6931a 82%,#e4b83a 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
};

// ---------- Data ----------
const MODULES = [
  { name: 'CRM & Clientes', tag: 'Operaciones', img: moduleCrm, excerpt: 'Cada lead, conversación, reserva y viajero anterior en una sola línea de tiempo.' },
  { name: 'Azumi IA', tag: 'Inteligencia Artificial', img: moduleAzumi, excerpt: 'Tu jefa de operaciones con IA. Responde, redacta propuestas y cierra reservas 24/7.' },
  { name: 'Propuestas & Reservas', tag: 'Ventas', img: moduleProposals, excerpt: 'Itinerarios cinematográficos en minutos. Contratos, confirmaciones y pagos en un clic.' },
  { name: 'Estudio de Marketing', tag: 'Crecimiento', img: moduleMarketing, excerpt: 'Posts, carruseles y reels generados por IA, publicados en Instagram y Meta Ads.' },
  { name: 'Pagos & Facturación', tag: 'Finanzas', img: modulePayments, excerpt: 'Checkout Stripe multi-moneda, facturas, reembolsos y comisiones en piloto automático.' },
  { name: 'Vuelos & Disponibilidad', tag: 'Inventario', img: moduleFlights, excerpt: 'Datos de vuelos en vivo, hoteles e inventario DMC integrados en tus propuestas.' },
];

const DESTINATIONS = [
  { name: 'Maldivas', tag: 'Beach', img: destBora },
  { name: 'Grecia', tag: 'Mediterráneo', img: destGreece },
  { name: 'Japón', tag: 'Cultura', img: destJapan },
  { name: 'Machu Picchu', tag: 'Aventura', img: destMachu },
  { name: 'Patagonia', tag: 'Naturaleza', img: destPatagonia },
  { name: 'Safari Kenya', tag: 'Wildlife', img: destSafari },
];

const CASES = [
  { n: '01', name: 'Agencia boutique', place: 'Perfil: 1-3 personas', img: caseNomad,
    excerpt: 'Un equipo pequeño que hoy responde por WhatsApp y cotiza en Excel. Azumi califica cada consulta al instante y arma la propuesta mientras el equipo sigue atendiendo en persona.' },
  { n: '02', name: 'DMC / operador B2B', place: 'Red de proveedores propia', img: caseSelva,
    excerpt: 'Gestiona tarifas y disponibilidad de múltiples proveedores y entrega propuestas white-label a agencias minoristas en distintos países, todo desde el mismo panel.' },
  { n: '03', name: 'Especialista de nicho', place: 'Freelancer o agencia de 1 persona', img: caseAlpine,
    excerpt: 'Vende paquetes muy específicos (esquí, buceo, luna de miel) y usa Levond para operar como si tuviera un equipo completo. IA, CRM, propuestas y cobros sin contratar a nadie.' },
];

const CATEGORIES = ['Leads', 'Reservas', 'Propuestas', 'Clientes', 'Pagos', 'Facturación', 'Marketing', 'Estudio', 'Call center', 'Vuelos', 'Analítica', 'Equipo'];
const PARTNERS = ['stripe', 'amadeus', 'sabre', 'whatsapp', 'meta', 'google', 'booking', 'apify'];

// ---------- Components ----------
const Wordmark = ({ onDark = false, size = 'md' }) => {
  const s = size === 'lg' ? 'text-3xl' : 'text-2xl';
  return (
    <div className="flex items-center gap-2 select-none">
      <span className={`${s} font-black tracking-[0.02em] leading-none`}
        style={{ fontFamily: HEADING,
          backgroundImage: onDark
            ? 'linear-gradient(180deg,#ffffff 0%,#e6ecf5 45%,#a8b3c7 55%,#f5f8ff 100%)'
            : 'linear-gradient(180deg,#1a1a1a 0%,#3a3a3a 55%,#0a0a0a 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          textShadow: onDark ? '0 2px 12px rgba(124,58,237,0.45)' : 'none',
        }}>Levond</span>
      <span className={`${s} font-light italic tracking-tight leading-none`}
        style={{ fontFamily: HEADING, color: onDark ? '#e6c875' : '#7c3aed' }}>Travels</span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] ml-0.5" style={{ boxShadow: '0 0 8px #7c3aed' }} />
    </div>
  );
};

// ---------- Sections ----------
const Nav = ({ scrolled }) => (
  <motion.header
    initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-white/5' : 'py-4 bg-transparent'}`}
    data-testid="landing-nav"
  >
    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" data-testid="nav-back-leaos" className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> LEAOS
        </Link>
        <Link to="/travel" data-testid="nav-logo"><Wordmark onDark size="md" /></Link>
      </div>
      <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold tracking-wide">
        {[['Cómo funciona', '#showcase'], ['Módulos', '#modulos'], ['Destinos', '#destinos'], ['Casos', '#casos']].map(([l, h]) => (
          <a key={l} href={h} className="text-white/70 hover:text-white transition-colors">{l}</a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Link to="/login" data-testid="nav-signin" className="hidden md:inline text-[13px] font-bold text-white/80 hover:text-white">Entrar</Link>
        <Link to="/travel/signup" data-testid="nav-cta"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold text-[#0a0a0a] bg-gradient-to-r from-[#e6c875] to-[#f0d98f] hover:shadow-[0_8px_24px_rgba(230,200,117,0.35)] transition-shadow">
          Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  </motion.header>
);

const Hero = () => (
  <section className="relative min-h-screen w-full overflow-hidden" data-testid="hero">
    <div className="absolute inset-0">
      <img src={heroMaldives} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0a0a0a]" />
    </div>
    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 lg:pt-48 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold uppercase tracking-[0.25em]"
        style={GOLD_TEXT} data-testid="hero-badge">
        <Sparkles className="w-3 h-3" style={{ color: '#e6c875' }} />
        LEVOND TRAVEL OS · 2026
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
        className="mt-6 font-black tracking-[-0.02em] leading-[0.95] text-[#faf7f0]"
        style={{ fontFamily: HEADING, fontSize: 'clamp(2.75rem, 7vw, 6.5rem)' }} data-testid="hero-title">
        El sistema operativo<br />
        con <span style={GOLD_TEXT} className="italic">IA</span> para agencias<br />
        de viajes.
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.3 }}
        className="mt-8 max-w-2xl text-lg text-white/75 leading-relaxed">
        CRM, propuestas cinematográficas, reservas, pagos y marketing — todo unificado y automatizado por <b style={{ color: '#e6c875' }}>Azumi</b>, tu directora de operaciones IA. Migra tu agencia en minutos.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-10 flex flex-wrap items-center gap-4" data-testid="hero-cta-group">
        <Link to="/travel/signup" data-testid="hero-cta-primary"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold text-[#0a0a0a] bg-gradient-to-r from-[#e6c875] to-[#f0d98f] hover:shadow-[0_12px_32px_rgba(230,200,117,0.4)] transition-all">
          Migra tu agencia <ArrowRight className="w-4 h-4" />
        </Link>
        <a href="#modulos" data-testid="hero-cta-secondary" className="text-[15px] font-bold text-white/90 hover:text-white underline underline-offset-8 decoration-[#e6c875]/40">
          Ver la plataforma
        </a>
      </motion.div>
      <div className="mt-14 flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: '#e6c875' }} /> 14 días gratis</span>
        <span className="hidden sm:flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: '#e6c875' }} /> Sin tarjeta</span>
        <span className="hidden md:flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: '#e6c875' }} /> Migración incluida</span>
      </div>
    </div>
    {/* Floating search bar */}
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-20 hidden md:block">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex items-center gap-2 border border-white/40" data-testid="search-bar">
        {[
          { i: MapPin, l: 'Destino', p: '¿A dónde?' },
          { i: Calendar, l: 'Fechas', p: 'Cuando quieras' },
          { i: Users, l: 'Viajeros', p: '2 adultos' },
        ].map((it, i) => (
          <div key={i} className="flex-1 flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-black/5 cursor-pointer transition-colors">
            <it.i className="w-4 h-4 text-[#7c3aed]" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B]">{it.l}</div>
              <div className="text-sm font-semibold text-[#0F0F13]">{it.p}</div>
            </div>
          </div>
        ))}
        <button className="px-6 py-3 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm flex items-center gap-2 hover:bg-[#7c3aed] transition-colors">
          <Search className="w-4 h-4" /> Explorar
        </button>
      </div>
    </motion.div>
  </section>
);

const Destinations = () => (
  <section id="destinos" className="bg-[#F7F4EF] py-24" data-testid="destinations">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed]">Destinos populares</div>
          <h2 className="mt-2 font-black text-[#0a0a0a]" style={{ fontFamily: HEADING, fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
            El mundo, listo para <span className="italic" style={{ color: '#7c3aed' }}>venderse</span>.
          </h2>
        </div>
        <a href="#modulos" className="hidden md:inline text-sm font-bold text-[#0a0a0a] hover:text-[#7c3aed]">Ver catálogo completo →</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DESTINATIONS.map((d, i) => (
          <motion.div key={d.name}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="relative group aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer" data-testid={`dest-${d.name.toLowerCase().replace(/\s/g, '-')}`}>
            <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">{d.tag}</div>
              <div className="text-2xl font-black mt-1" style={{ fontFamily: HEADING }}>{d.name}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Modules = () => (
  <section id="modulos" className="bg-[#0a0a0a] text-white py-28" data-testid="modules">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-3xl">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em]" style={GOLD_TEXT}>La plataforma</div>
        <h2 className="mt-3 font-black leading-[1.05]" style={{ fontFamily: HEADING, fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
          Seis módulos.<br />Un solo <span style={GOLD_TEXT} className="italic">sistema operativo</span>.
        </h2>
        <p className="mt-5 text-white/60 max-w-xl">Todo lo que necesita una agencia moderna para operar sin fricción. Sin Excel, sin WhatsApp perdidos, sin caos.</p>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MODULES.map((m, i) => (
          <motion.article key={m.name}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="group cursor-pointer" data-testid={`module-${i}`}>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 relative">
              <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={GOLD_TEXT}>{m.tag}</div>
            <h3 className="mt-2 text-2xl font-black" style={{ fontFamily: HEADING }}>{m.name}</h3>
            <p className="mt-2 text-white/60 text-sm leading-relaxed">{m.excerpt}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

const Categories = () => (
  <section className="bg-[#0a0a0a] pb-24" data-testid="categories">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-wrap gap-2.5 justify-center">
        {CATEGORIES.map((c) => (
          <span key={c} className="px-5 py-2 rounded-full border border-white/15 text-[13px] font-bold text-white/85 hover:border-[#e6c875] hover:text-[#e6c875] transition-colors cursor-default">
            {c}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const Cases = () => {
  const [i, setI] = useState(0);
  const c = CASES[i];
  return (
    <section id="casos" className="bg-[#F7F4EF] py-28" data-testid="cases">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div key={c.n} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="relative aspect-[4/5] rounded-3xl overflow-hidden">
          <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-6 left-6 text-white font-black text-6xl" style={{ fontFamily: HEADING }}>{c.n}</div>
        </motion.div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed]">Casos de uso</div>
          <h2 className="mt-3 font-black leading-tight text-[#0a0a0a]" style={{ fontFamily: HEADING, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            {c.name}
          </h2>
          <div className="mt-2 text-sm font-semibold text-[#7c3aed]">{c.place}</div>
          <p className="mt-6 text-[#3a3a3a] leading-relaxed text-lg">{c.excerpt}</p>
          <div className="mt-8 flex items-center gap-3">
            <button onClick={() => setI((v) => (v - 1 + CASES.length) % CASES.length)} data-testid="case-prev"
              className="w-12 h-12 rounded-full border border-[#0a0a0a]/20 flex items-center justify-center hover:bg-[#0a0a0a] hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setI((v) => (v + 1) % CASES.length)} data-testid="case-next"
              className="w-12 h-12 rounded-full border border-[#0a0a0a]/20 flex items-center justify-center hover:bg-[#0a0a0a] hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="ml-4 text-xs font-bold tracking-widest text-[#5F5F6B]">{String(i + 1).padStart(2, '0')} / {String(CASES.length).padStart(2, '0')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AzumiBlock = () => (
  <section className="bg-[#0a0a0a] text-white py-28 relative overflow-hidden" data-testid="azumi-block">
    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#7c3aed]/30 to-[#e6c875]/20 blur-3xl" />
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center relative">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em]" style={GOLD_TEXT}>
          <Bot className="w-3.5 h-3.5" style={{ color: '#e6c875' }} /> Azumi · IA
        </div>
        <h2 className="mt-3 font-black leading-[1.02]" style={{ fontFamily: HEADING, fontSize: 'clamp(2.25rem, 5vw, 4.25rem)' }}>
          La <span style={GOLD_TEXT} className="italic">jefa de operaciones</span><br />que nunca duerme.
        </h2>
        <p className="mt-6 text-white/70 leading-relaxed text-lg max-w-lg">
          Azumi orquesta a un equipo de agentes especializados: leads, propuestas, reservas, marketing y análisis. Habla contigo en tu idioma, ejecuta acciones y aprende de tu agencia.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-white/80">
          {['Califica leads y arma propuestas por WhatsApp/Email', 'Redacta itinerarios cinematográficos en 30s', 'Publica marketing y analiza métricas por ti', 'Detecta oportunidades de venta antes que tú'].map((li) => (
            <li key={li} className="flex items-start gap-3">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#e6c875' }} />
              <span>{li}</span>
            </li>
          ))}
        </ul>
        <Link to="/travel/signup" data-testid="azumi-cta" className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-[#0a0a0a] bg-gradient-to-r from-[#e6c875] to-[#f0d98f] hover:shadow-[0_12px_32px_rgba(230,200,117,0.4)] transition-all">
          Activar Azumi <Zap className="w-4 h-4" />
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="relative aspect-square max-w-md mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c3aed] via-[#a78bfa] to-[#e6c875] blur-3xl opacity-40" />
        <img src={moduleAzumi} alt="Azumi" className="relative w-full h-full object-cover rounded-full border-4 border-[#e6c875]/30 shadow-[0_0_80px_rgba(230,200,117,0.3)]" />
      </motion.div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="bg-[#F7F4EF] py-28" data-testid="pricing">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed]">Precios simples</div>
        <h2 className="mt-3 font-black text-[#0a0a0a]" style={{ fontFamily: HEADING, fontSize: 'clamp(2rem, 4.5vw, 3.75rem)' }}>
          Un precio. Todo incluido.
        </h2>
      </div>
      <div className="mt-14 grid md:grid-cols-3 gap-5">
        {[
          { name: 'Starter', price: '49', desc: 'Para agencias que arrancan', features: ['1 usuario', '50 propuestas/mes', 'CRM completo', 'Azumi básico'] },
          { name: 'Growth', price: '149', desc: 'Lo más elegido', features: ['5 usuarios', 'Propuestas ilimitadas', 'Marketing IA', 'Azumi Pro', 'Pagos Stripe'], featured: true },
          { name: 'Enterprise', price: 'Custom', desc: 'DMC y cadenas', features: ['Usuarios ilimitados', 'Multi-agencia', 'API completa', 'Manager dedicado', 'SLA 99.9%'] },
        ].map((p) => (
          <div key={p.name} data-testid={`plan-${p.name.toLowerCase()}`}
            className={`rounded-3xl p-8 ${p.featured ? 'bg-[#0a0a0a] text-white -translate-y-3 shadow-[0_25px_60px_rgba(10,10,10,0.25)]' : 'bg-white border border-black/8'}`}>
            <div className={`text-[11px] font-bold uppercase tracking-widest ${p.featured ? '' : 'text-[#7c3aed]'}`} style={p.featured ? GOLD_TEXT : {}}>{p.name}</div>
            <div className="mt-2 font-black" style={{ fontFamily: HEADING, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              {p.price === 'Custom' ? p.price : <>€{p.price}<span className="text-lg font-medium opacity-60">/mes</span></>}
            </div>
            <p className={`mt-2 text-sm ${p.featured ? 'text-white/60' : 'text-[#5F5F6B]'}`}>{p.desc}</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4" style={{ color: p.featured ? '#e6c875' : '#7c3aed' }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/travel/signup" className={`mt-8 block text-center py-3 rounded-full text-sm font-bold transition-all ${p.featured ? 'bg-gradient-to-r from-[#e6c875] to-[#f0d98f] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-white hover:bg-[#7c3aed]'}`}>
              Empezar
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Partners = () => (
  <section className="bg-[#F7F4EF] pb-24" data-testid="partners">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5F5F6B] text-center">Integraciones nativas</div>
      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4 items-center justify-center opacity-70">
        {PARTNERS.map((p) => (
          <div key={p} className="text-xl font-black tracking-tight text-[#0a0a0a]/70 lowercase" style={{ fontFamily: HEADING }}>{p}</div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#0a0a0a] text-white/60 pt-20 pb-10" data-testid="footer">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <Wordmark onDark size="lg" />
          <p className="mt-4 text-sm max-w-xs">El sistema operativo con IA para la próxima generación de agencias de viajes.</p>
          <div className="mt-5 flex items-center gap-3">
            {[Instagram, Twitter, Facebook, Youtube].map((Ic, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-[#e6c875] hover:text-[#e6c875] transition-colors"><Ic className="w-4 h-4" /></a>
            ))}
          </div>
        </div>
        {[
          { title: 'Producto', items: ['Módulos', 'Azumi IA', 'Precios', 'Migración'] },
          { title: 'Recursos', items: ['Blog', 'Playbooks', 'Documentación', 'Estado'] },
          { title: 'Empresa', items: ['Sobre nosotros', 'Contacto', 'Privacidad', 'Términos'] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em]" style={GOLD_TEXT}>{col.title}</div>
            <ul className="mt-5 space-y-2.5 text-sm">
              {col.items.map((i) => <li key={i}><a href="#" className="hover:text-white transition-colors">{i}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-16 pt-8 border-t border-white/8 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs">© 2026 Levond Travels. Todos los derechos reservados.</div>
        <div className="text-xs">Hecho con ♥ para agencias que sueñan a lo grande.</div>
      </div>
    </div>
  </footer>
);

// ---------- Dashboard Showcase (realistic mockups, no stock images) ----------
const LEADS = [
  { col: 'Nuevo', items: [
    { name: 'María González', dest: 'Bali · 7 días', budget: '$4,200', tag: 'WhatsApp', hot: true },
    { name: 'Familia Pérez', dest: 'Grecia · 10 días', budget: '$8,900', tag: 'Web' },
  ]},
  { col: 'Contactado', items: [
    { name: 'Carlos Ruiz', dest: 'Japón · 14 días', budget: '$12,500', tag: 'Email' },
    { name: 'Lucía Torres', dest: 'Maldivas · 5 días', budget: '$6,800', tag: 'Referido', hot: true },
    { name: 'Ana Villa', dest: 'Machu Picchu', budget: '$3,400', tag: 'IG' },
  ]},
  { col: 'Propuesta', items: [
    { name: 'Corp. Innova', dest: 'Incentivo Cancún', budget: '$45,000', tag: 'B2B', hot: true },
    { name: 'Diego Marín', dest: 'Patagonia', budget: '$9,200', tag: 'Web' },
  ]},
  { col: 'Reservado', items: [
    { name: 'Isabel Cortés', dest: 'Safari Kenya', budget: '$11,000', tag: 'IG' },
  ]},
];

const CHAT = [
  { role: 'user', text: 'Azumi, arma propuesta luna de miel Maldivas 7 días, presupuesto $8k, salida marzo' },
  { role: 'azumi', text: 'Perfecto. Combino Soneva Fushi (villa sobre el agua, 5 noches) + traslado en hidroavión + cena bioluminiscente + spa. Total estimado: $7,840 con 18% margen. ¿Genero la propuesta cinematográfica?' },
  { role: 'user', text: 'Sí, y añade excursión atolón Baa' },
  { role: 'azumi', text: '✓ Añadido snorkel manta rays en Hanifaru Bay. Propuesta LV-7823 lista, la envío por WhatsApp con link público al cliente.', action: true },
];

const KanbanCard = ({ item }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-black/5 mb-2 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-2 mb-1.5">
      <div className="text-xs font-bold text-[#0F0F13] truncate">{item.name}</div>
      {item.hot && <div className="text-[9px] font-bold text-red-500 flex items-center gap-0.5 flex-shrink-0"><TrendingUp className="w-2.5 h-2.5" /> HOT</div>}
    </div>
    <div className="text-[10px] text-[#5F5F6B] mb-2 truncate">{item.dest}</div>
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed]">{item.tag}</span>
      <span className="text-[11px] font-black text-[#0F0F13]">{item.budget}</span>
    </div>
  </div>
);

const DashboardShowcase = () => (
  <section id="showcase" className="bg-[#0a0a0a] text-white py-28 relative overflow-hidden" data-testid="dashboard-showcase">
    <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/15 blur-3xl" />
    <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-[#e6c875]/10 blur-3xl" />
    <div className="max-w-7xl mx-auto px-6 relative">
      <div className="max-w-3xl mb-14">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em]" style={GOLD_TEXT}>Cómo se ve por dentro</div>
        <h2 className="mt-3 font-black leading-[1.05]" style={{ fontFamily: HEADING, fontSize: 'clamp(2rem, 4.5vw, 3.75rem)' }}>
          Tu agencia, en una <span style={GOLD_TEXT} className="italic">sola pantalla</span>.
        </h2>
        <p className="mt-5 text-white/60 max-w-xl">Kanban de leads, editor de propuestas cinematográfico y una IA que trabaja mientras duermes. Sin cambiar de pestaña.</p>
      </div>

      {/* 3 mockups grid */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* KANBAN — spans 7 cols */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="lg:col-span-7 bg-gradient-to-br from-white to-[#F7F4EF] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/10">
          {/* Fake browser chrome */}
          <div className="bg-[#F7F4EF] px-4 py-3 flex items-center gap-2 border-b border-black/5">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
            <div className="flex-1 mx-4 text-[10px] font-mono text-[#8A8A9E] bg-white/60 rounded px-3 py-1 text-center">levond.travel/app/leads</div>
            <div className="text-[10px] font-bold text-[#7c3aed]">CRM</div>
          </div>
          <div className="p-5 text-[#0F0F13]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-black text-lg" style={{ fontFamily: HEADING }}>Pipeline de leads</div>
                <div className="text-xs text-[#5F5F6B]">Febrero 2026 · 8 leads activos · <span className="text-emerald-600 font-bold">+34% vs enero</span></div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7c3aed] bg-[#7c3aed]/10 px-2.5 py-1 rounded-full">
                <Bot className="w-3 h-3" /> Azumi califica en vivo
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {LEADS.map((c) => (
                <div key={c.col} className="bg-black/[0.03] rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F5F6B]">{c.col}</div>
                    <div className="text-[10px] font-bold text-[#7c3aed]">{c.items.length}</div>
                  </div>
                  {c.items.map((it, i) => <KanbanCard key={i} item={it} />)}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AZUMI CHAT — spans 5 cols */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-5 bg-gradient-to-br from-[#0f0f13] to-[#1a1420] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(230,200,117,0.15)] border border-[#e6c875]/15 flex flex-col">
          <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c3aed] via-[#a78bfa] to-[#e6c875] animate-pulse" />
              <div className="absolute inset-1 rounded-full bg-[#0f0f13] flex items-center justify-center">
                <span className="font-black text-white text-sm" style={{ fontFamily: HEADING }}>A</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-white">Azumi</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Orquestando 6 agentes
              </div>
            </div>
            <div className="text-[10px] font-mono text-white/40">LV-7823</div>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-hidden text-sm">
            {CHAT.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${m.role === 'user' ? 'bg-[#7c3aed] text-white' : 'bg-white/8 text-white/90 border border-white/10'}`}>
                  <div className="text-[13px] leading-snug">{m.text}</div>
                  {m.action && (
                    <div className="mt-2 pt-2 border-t border-white/15 flex items-center gap-2 text-[10px] font-bold" style={GOLD_TEXT}>
                      <Check className="w-3 h-3" style={{ color: '#e6c875' }} /> Ejecutado por Azumi
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/8">
            <div className="bg-white/5 rounded-full px-4 py-2.5 flex items-center gap-2 text-[13px] text-white/40">
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#e6c875' }} />
              <span>Pregúntale a Azumi…</span>
              <div className="ml-auto text-[10px] font-mono opacity-50">⌘K</div>
            </div>
          </div>
        </motion.div>

        {/* PROPOSAL EDITOR — full width */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-12 bg-white rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/10 text-[#0F0F13]">
          <div className="bg-[#F7F4EF] px-4 py-3 flex items-center gap-2 border-b border-black/5">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
            <div className="flex-1 mx-4 text-[10px] font-mono text-[#8A8A9E] bg-white/60 rounded px-3 py-1 text-center">levond.travel/app/proposals/LV-7823</div>
            <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700"><Check className="w-2.5 h-2.5" strokeWidth={3} /> Enviada</div>
          </div>
          <div className="grid lg:grid-cols-12 gap-0">
            {/* Sidebar steps */}
            <div className="lg:col-span-3 border-r border-black/5 p-5 bg-[#FAFAF7]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A9E] mb-3">Wizard 4 pasos</div>
              {[
                { n: 1, l: 'Cliente & Destino', done: true },
                { n: 2, l: 'Servicios (5)', done: true },
                { n: 3, l: 'Itinerario (7 días)', done: true },
                { n: 4, l: 'Resumen & Envío', done: true, current: true },
              ].map((s) => (
                <div key={s.n} className={`flex items-center gap-3 py-2.5 border-b border-black/5 last:border-0 ${s.current ? 'font-bold text-[#7c3aed]' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${s.done ? 'bg-[#7c3aed] text-white' : 'bg-black/10 text-[#5F5F6B]'}`}>{s.done ? <Check className="w-3 h-3" strokeWidth={3} /> : s.n}</div>
                  <div className="text-[12px] flex-1">{s.l}</div>
                </div>
              ))}
              <div className="mt-5 p-3 rounded-xl bg-gradient-to-br from-[#7c3aed]/10 to-[#e6c875]/10 border border-[#7c3aed]/15">
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#7c3aed] mb-1">Total propuesta</div>
                <div className="font-black text-2xl" style={{ fontFamily: HEADING }}>$7,840</div>
                <div className="text-[10px] text-[#5F5F6B]">Margen: 18% · $1,196</div>
              </div>
            </div>

            {/* Editor itinerary */}
            <div className="lg:col-span-9 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#7c3aed]">Propuesta LV-7823</div>
                  <div className="font-black text-2xl mt-0.5" style={{ fontFamily: HEADING }}>Luna de miel · Maldivas</div>
                  <div className="text-xs text-[#5F5F6B]">Para Lucía Torres · 2 viajeros · 15-22 mar 2026</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-[11px] font-bold px-3 py-2 rounded-full bg-white border border-black/10 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</button>
                  <button className="text-[11px] font-bold px-3 py-2 rounded-full bg-[#0F0F13] text-white flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Enviar</button>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { d: 1, t: 'Llegada a Malé + traslado hidroavión', desc: 'Recepción VIP, hidroavión privado a Soneva Fushi, check-in villa sobre el agua', icon: Plane, color: '#3b82f6' },
                  { d: 2, t: 'Snorkel Hanifaru Bay + spa', desc: 'Excursión atolón Baa, manta rays al atardecer, cena bioluminiscente', icon: Star, color: '#e6c875' },
                  { d: 3, t: 'Día libre + cena privada arrecife', desc: 'Chef privado en el arrecife, menú degustación 7 tiempos', icon: Ticket, color: '#7c3aed' },
                  { d: 4, t: 'Excursión delfines + noche cine bajo estrellas', desc: 'Cinema Paradiso al aire libre bajo la Vía Láctea', icon: MapPin, color: '#10b981' },
                ].map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFAF7] hover:bg-white hover:shadow-sm transition-all border border-black/5">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-white font-black" style={{ background: `linear-gradient(135deg,${r.color},${r.color}dd)` }}>
                      <div className="text-[8px] uppercase tracking-widest opacity-80 leading-none">Día</div>
                      <div className="text-lg leading-none" style={{ fontFamily: HEADING }}>{r.d}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#0F0F13]">{r.t}</div>
                      <div className="text-xs text-[#5F5F6B] mt-0.5">{r.desc}</div>
                    </div>
                    <r.icon className="w-4 h-4 flex-shrink-0" style={{ color: r.color }} />
                  </motion.div>
                ))}
                <div className="text-center py-2 text-[11px] font-bold text-[#7c3aed]">+ 3 días más · Editar</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-14 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 mb-3">Y mucho más</div>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {['Pagos Stripe multi-moneda', 'Comisiones automáticas', 'Marketing IA con Glitch', 'Vuelos en tiempo real', 'Call center integrado', 'White-label completo'].map((t) => (
            <span key={t} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70">{t}</span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ---------- Main ----------
const Travel = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#0a0a0a]" style={{ fontFamily: BODY }} data-testid="travel-page">
      <Nav scrolled={scrolled} />
      <Hero />
      <DashboardShowcase />
      <Destinations />
      <Modules />
      <Categories />
      <AzumiBlock />
      <Cases />
      <Pricing />
      <Partners />
      <Footer />
    </div>
  );
};

export default Travel;
