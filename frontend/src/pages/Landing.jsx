import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Check, Bot, Zap, ArrowUpRight, Clock,
  Instagram, Twitter, Facebook, Youtube, Plane, Megaphone,
  Globe, Wand2, Play, TrendingUp, Shield, Layers, Users, MessageSquare, DollarSign
} from 'lucide-react';
import LanguageSwitcher from '@/components/landing/LanguageSwitcher';
import azumiAvatar from '@/assets/travel/module-axion-clean.jpg';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";
const BODY = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";

// Brand tokens
const VIOLET = '#7C5CFF';
const ORANGE = '#FFB042';
const INK = '#0F0F13';
const MUTED = '#5F5F6B';

const GRADIENT_TEXT = {
  background: `linear-gradient(135deg, ${VIOLET} 0%, ${ORANGE} 100%)`,
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

// ---------- Data ----------
const VERTICALS = [
  {
    id: 'travel', name: 'Travel OS', tag: 'Agencias de viajes',
    status: 'live', to: '/travel',
    excerpt: 'CRM, propuestas cinematográficas, reservas, pagos y marketing — automatizados por Azumi. Migra tu agencia en 48h.',
    features: ['CRM & Leads', 'Propuestas IA', 'Reservas & Pagos', 'Marketing Meta'],
  },
  {
    id: 'marketing', name: 'Marketing OS', tag: 'Estudio creativo con IA',
    status: 'soon', to: '#',
    excerpt: 'Genera posts, carruseles, reels y campañas Meta Ads. Publica y analiza en una sola pantalla.',
    features: ['Contenido IA', 'Multi-red social', 'Meta Ads', 'Analítica'],
  },
  {
    id: 'web', name: 'Web OS', tag: 'Sitios y landings',
    status: 'soon', to: '#',
    excerpt: 'Crea micro-sitios de conversión desde una descripción. Optimizados para SEO y checkout Stripe.',
    features: ['Studio no-code', 'Templates', 'SEO técnico', 'Multi-idioma'],
  },
  {
    id: 'studio', name: 'Studio OS', tag: 'Apps a medida',
    status: 'soon', to: '#',
    excerpt: 'Construye apps internas sin código: dashboards, formularios y workflows automatizados por IA.',
    features: ['No-code', 'Workflows IA', 'API pública', 'Multi-tenant'],
  },
];

const PRINCIPLES = [
  { icon: Layers, t: 'Una sola arquitectura', d: 'Multi-tenant, multi-idioma, integraciones nativas. Todas las verticales heredan la misma base.' },
  { icon: Bot, t: 'IA que ejecuta', d: 'Azumi no solo responde: crea facturas, envía emails, publica marketing y cierra reservas por ti.' },
  { icon: Shield, t: 'Tus datos, tus reglas', d: 'BYOK (Bring Your Own Key). Usa tus claves de OpenAI, Anthropic o self-hosted. Cero vendor lock-in.' },
  { icon: TrendingUp, t: 'Diseñado para escalar', d: 'De 1 usuario a 500 sin cambiar de plataforma. White-label y API completa incluidas.' },
];

// ---------- Nav ----------
const Nav = ({ scrolled }) => (
  <motion.header
    initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6 }}
    className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
  >
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(124,92,255,0.12)] border border-white/60' : 'bg-white/50 backdrop-blur-md border border-white/30'}`}>
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] animate-pulse" />
            <div className="absolute inset-0.5 rounded-[10px] bg-white flex items-center justify-center">
              <span className="font-black text-[#7C5CFF] text-lg leading-none" style={{ fontFamily: HEADING }}>L</span>
            </div>
          </div>
          <span className="font-black tracking-tight text-xl text-[#0F0F13] group-hover:text-[#7C5CFF] transition-colors" style={{ fontFamily: HEADING }}>LEVOND</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {[['Verticales', '#verticales'], ['Azumi IA', '#azumi'], ['Filosofía', '#filosofia'], ['Precios', '#precios']].map(([l, h]) => (
            <a key={l} href={h} className="px-4 py-2 text-sm font-semibold text-[#5F5F6B] hover:text-[#0F0F13] rounded-full hover:bg-[#7C5CFF]/5 transition-all">{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link to="/login" data-testid="navbar-signin" className="hidden md:inline-flex px-4 py-2 text-sm font-bold text-[#0F0F13] hover:text-[#7C5CFF]">Entrar</Link>
          <Link to="/signup" data-testid="navbar-try-free"
            className="inline-flex items-center gap-1.5 bg-[#0F0F13] hover:bg-[#7C5CFF] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-[0_4px_12px_rgba(15,15,19,0.15)] hover:shadow-[0_8px_24px_rgba(124,92,255,0.35)]">
            Empezar gratis
          </Link>
        </div>
      </div>
    </div>
  </motion.header>
);

// ---------- Hero — cinematic dark background ----------
const Hero = () => (
  <section className="relative pt-40 lg:pt-44 pb-24 overflow-hidden bg-[#08070C]">
    {/* Layered background: aurora blobs + grid + noise */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-[-200px] left-[-200px] w-[900px] h-[900px] rounded-full bg-[#7C5CFF] opacity-[0.35] blur-[160px]" />
      <div className="absolute top-[100px] right-[-200px] w-[800px] h-[800px] rounded-full bg-[#FFB042] opacity-[0.22] blur-[160px]" />
      <div className="absolute bottom-[-200px] left-[30%] w-[700px] h-[700px] rounded-full bg-[#c084fc] opacity-[0.18] blur-[160px]" />
      {/* SVG grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Radial vignette bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08070C]" />
    </div>

    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        {/* LEFT — copy */}
        <div className="lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
            data-testid="hero-badge">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB042]" strokeWidth={2.5} />
            <span style={GRADIENT_TEXT}>LEVOND OS · Enterprise AI Operating System</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="mt-7 font-black tracking-[-0.03em] leading-[0.95] text-white"
            style={{ fontFamily: HEADING, fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)' }} data-testid="hero-title">
            El sistema operativo<br />
            con <span style={GRADIENT_TEXT} className="italic">inteligencia</span><br />
            para tu negocio.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-7 max-w-xl text-lg text-white/70 leading-relaxed">
            LEVOND OS unifica CRM, ventas, propuestas, pagos, operaciones y marketing en una sola plataforma. Cada vertical corre sobre la misma infraestructura con IA nativa.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-9 flex flex-wrap items-center gap-4" data-testid="hero-cta-group">
            <Link to="/travel" data-testid="hero-cta-primary"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold text-[#0F0F13] bg-gradient-to-r from-[#FFB042] to-[#ffcc7a] hover:shadow-[0_16px_40px_rgba(255,176,66,0.45)] transition-all">
              Descubre Travel OS
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#verticales" data-testid="hero-cta-secondary"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-[15px] font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all">
              <Play className="w-4 h-4 text-white" fill="currentColor" />
              Ver la plataforma
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" strokeWidth={3} /> 14 días gratis</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" strokeWidth={3} /> Sin tarjeta</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" strokeWidth={3} /> Migración incluida</span>
          </motion.div>
        </div>

        {/* RIGHT — visual composition (dark version) */}
        <div className="lg:col-span-5 relative">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }}
            className="relative h-[520px]" data-testid="hero-visual">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] rounded-full border border-white/10 animate-spin" style={{ animationDuration: '30s' }} />
              <div className="absolute w-[300px] h-[300px] rounded-full border border-[#FFB042]/25 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C5CFF] via-[#a78bfa] to-[#FFB042] blur-2xl opacity-80 animate-pulse" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#7C5CFF] via-[#a78bfa] to-[#FFB042] shadow-[0_0_100px_rgba(124,92,255,0.7)]">
                <div className="absolute inset-4 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-black text-white text-6xl tracking-tighter drop-shadow-lg" style={{ fontFamily: HEADING }}>L</div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white font-bold mt-1">LEVOND OS</div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="absolute top-4 left-0 bg-white/10 backdrop-blur-2xl rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#a78bfa] flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div>
                <div className="leading-tight">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Ventas hoy</div>
                  <div className="text-base font-black text-white" style={{ fontFamily: HEADING }}>€24,890</div>
                </div>
                <div className="text-[10px] font-bold text-emerald-400 ml-2">+34%</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
              className="absolute top-24 right-0 bg-gradient-to-r from-[#FFB042]/95 to-[#ffcc7a]/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(255,176,66,0.35)] text-[#0F0F13]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F0F13] flex items-center justify-center"><Bot className="w-4 h-4 text-[#FFB042]" /></div>
                <div className="leading-tight">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Azumi</div>
                  <div className="text-sm font-bold">Cerró 3 leads</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="absolute bottom-24 left-4 bg-white/10 backdrop-blur-2xl rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFB042] to-[#ffcc7a] flex items-center justify-center"><Users className="w-4 h-4 text-[#0F0F13]" /></div>
                <div className="leading-tight">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Leads activos</div>
                  <div className="text-base font-black text-white" style={{ fontFamily: HEADING }}>127</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
              className="absolute bottom-6 right-2 bg-white/10 backdrop-blur-2xl rounded-full px-4 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-white/15 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-[11px] font-bold text-white">6 agentes activos</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);


// ---------- Verticales ----------
const Verticales = () => (
  <section id="verticales" className="py-24 sm:py-32 bg-white relative">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="max-w-3xl mb-16">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C5CFF] mb-4">La plataforma</div>
        <h2 className="font-black tracking-[-0.025em] leading-[1.02] text-[#0F0F13]" style={{ fontFamily: HEADING, fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}>
          Un sistema operativo. <span style={GRADIENT_TEXT} className="italic">Múltiples verticales.</span>
        </h2>
        <p className="mt-6 text-lg text-[#5F5F6B] leading-relaxed max-w-2xl">
          Cada vertical LEVOND hereda la misma arquitectura de IA, multi-tenant y white-label. Activa solo la que necesitas — o todas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {VERTICALS.map((v, i) => {
          const isLive = v.status === 'live';
          const Card = (
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              data-testid={`vertical-${v.id}`}
              className={`relative group rounded-3xl p-8 md:p-10 cursor-pointer transition-all duration-500 h-full ${isLive
                ? 'bg-gradient-to-br from-[#0F0F13] via-[#1a1420] to-[#0F0F13] text-white shadow-[0_25px_70px_rgba(124,92,255,0.20)] hover:shadow-[0_40px_100px_rgba(124,92,255,0.45)] overflow-hidden'
                : 'bg-white border border-[#0F0F13]/8 hover:border-[#7C5CFF]/30 hover:shadow-[0_20px_60px_rgba(124,92,255,0.10)]'
                }`}>
              {isLive && (
                <>
                  <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#7C5CFF]/25 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FFB042]/15 blur-3xl pointer-events-none" />
                </>
              )}
              <div className="relative">
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isLive ? 'bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] text-white shadow-lg' : 'bg-[#7C5CFF]/10 text-[#7C5CFF]'}`}>
                    {v.id === 'travel' && <Plane className="w-7 h-7" strokeWidth={2} />}
                    {v.id === 'marketing' && <Megaphone className="w-7 h-7" strokeWidth={2} />}
                    {v.id === 'web' && <Globe className="w-7 h-7" strokeWidth={2} />}
                    {v.id === 'studio' && <Wand2 className="w-7 h-7" strokeWidth={2} />}
                  </div>
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-[#7C5CFF]/10 text-[#7C5CFF] px-3 py-1.5 rounded-full border border-[#7C5CFF]/15">
                      <Clock className="w-3 h-3" strokeWidth={3} /> Próximamente
                    </span>
                  )}
                </div>

                <div className={`text-[10px] font-bold uppercase tracking-[0.24em] mb-2 ${isLive ? 'text-white/50' : 'text-[#8A8A9E]'}`}>{v.tag}</div>
                <h3 className="font-black text-4xl mb-4 leading-none" style={{ fontFamily: HEADING }}>{v.name}</h3>
                <p className={`text-[15px] leading-relaxed mb-8 ${isLive ? 'text-white/70' : 'text-[#5F5F6B]'}`}>{v.excerpt}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {v.features.map((f) => (
                    <span key={f} className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${isLive ? 'bg-white/8 text-white/85 border border-white/10' : 'bg-[#F7F4EF] text-[#5F5F6B]'}`}>{f}</span>
                  ))}
                </div>

                <div className={`inline-flex items-center gap-2 text-sm font-bold transition-all ${isLive ? 'text-[#FFB042] group-hover:gap-3' : 'text-[#7C5CFF]'}`}>
                  {isLive ? 'Explorar Travel OS' : 'Únete a la lista de espera'}
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
          return isLive
            ? <Link key={v.id} to={v.to} className="block h-full">{Card}</Link>
            : <div key={v.id} className="h-full">{Card}</div>;
        })}
      </div>
    </div>
  </section>
);

// ---------- Azumi Block ----------
const AzumiBlock = () => (
  <section id="azumi" className="bg-[#0F0F13] text-white py-32 relative overflow-hidden">
    <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#7C5CFF]/35 to-[#FFB042]/25 blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#7C5CFF]/15 blur-3xl" />

    <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center relative">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-[0.24em] text-[#FFB042]">
          <Bot className="w-3.5 h-3.5" /> Azumi · Orquestador IA
        </div>
        <h2 className="mt-5 font-black leading-[1.02]" style={{ fontFamily: HEADING, fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)' }}>
          Una <span style={GRADIENT_TEXT} className="italic">consciencia</span><br />
          para tu operación.
        </h2>
        <p className="mt-7 text-white/70 leading-relaxed text-lg max-w-lg">
          Azumi coordina un consejo de agentes especializados que ejecutan por ti. Habla contigo en tu idioma, aprende de tu negocio y toma decisiones con contexto real.
        </p>
        <ul className="mt-10 space-y-4 text-[15px] text-white/85">
          {[
            'Seis agentes especializados con function calling',
            'Análisis proactivo diario de tu operación',
            'Ejecuta acciones: facturas, emails, marketing, reservas',
            'BYOK: usa tus claves de OpenAI, Anthropic o self-hosted',
          ].map((li) => (
            <li key={li} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span>{li}</span>
            </li>
          ))}
        </ul>
        <Link to="/signup" data-testid="azumi-cta"
          className="mt-12 inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold text-[#0F0F13] bg-gradient-to-r from-[#FFB042] to-[#ffcc7a] hover:shadow-[0_16px_40px_rgba(255,176,66,0.40)] transition-all">
          Activar Azumi <Zap className="w-4 h-4" />
        </Link>
      </div>

      {/* Right — Agents grid (no image) */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="relative" data-testid="azumi-visual">
        <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/10">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C5CFF] via-[#a78bfa] to-[#FFB042] animate-pulse" />
              <div className="absolute inset-1 rounded-full bg-[#0F0F13] flex items-center justify-center">
                <span className="font-black text-white text-lg" style={{ fontFamily: HEADING }}>A</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-white flex items-center gap-2">
                Azumi
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                </div>
              </div>
              <div className="text-[11px] text-white/50">Orquestando 6 agentes especializados</div>
            </div>
            <div className="text-[10px] font-mono text-white/40">v2.6</div>
          </div>

          {/* Agent list */}
          <div className="space-y-2.5">
            {[
              { emoji: '💰', name: 'Salvo', role: 'Ventas & CRM', color: '#7C5CFF', task: 'Calificando 3 leads nuevos' },
              { emoji: '📊', name: 'Fina', role: 'Contabilidad & Finanzas', color: '#FFB042', task: 'Cierre mensual · 89%' },
              { emoji: '📦', name: 'Kai', role: 'Inventario & Operaciones', color: '#8B5CF6', task: 'Stock bajo detectado (4 SKUs)' },
              { emoji: '✈️', name: 'Vega', role: 'Servicios & Viajes', color: '#3B82F6', task: 'Propuesta LV-7823 lista' },
              { emoji: '📣', name: 'Iris', role: 'Marketing & Comunicación', color: '#EC4899', task: 'Publicando en 4 redes' },
              { emoji: '🍽️', name: 'Rio', role: 'POS & Retail', color: '#10B981', task: 'Corte de caja procesado' },
            ].map((a, i) => (
              <motion.div key={a.name}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${a.color}20`, border: `1px solid ${a.color}40` }}>{a.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-white text-sm">{a.name}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{a.role}</div>
                  </div>
                  <div className="text-[11px] text-white/60 truncate">{a.task}</div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          {/* Footer input */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-full px-4 py-2.5 flex items-center gap-2 text-[12px] text-white/40">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB042]" />
              <span>Pregúntale a Azumi…</span>
              <div className="ml-auto text-[10px] font-mono">⌘K</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ---------- Filosofía ----------
const Filosofia = () => (
  <section id="filosofia" className="py-32 bg-[#FAFAF7] relative">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="max-w-3xl mb-16 text-center mx-auto">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C5CFF] mb-4">Nuestra filosofía</div>
        <h2 className="font-black tracking-[-0.02em] leading-[1.05] text-[#0F0F13]" style={{ fontFamily: HEADING, fontSize: 'clamp(2rem, 4.5vw, 3.75rem)' }}>
          Software que <span style={GRADIENT_TEXT} className="italic">respeta</span><br />el negocio detrás.
        </h2>
        <p className="mt-6 text-lg text-[#5F5F6B] leading-relaxed">
          LEVOND no es otro SaaS más. Es una infraestructura pensada para que los negocios reales — con clientes reales, dinero real y tiempo escaso — operen sin fricción.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PRINCIPLES.map((p, i) => (
          <motion.div key={p.t}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-3xl p-7 border border-[#0F0F13]/6 hover:border-[#7C5CFF]/25 hover:shadow-[0_20px_50px_rgba(124,92,255,0.10)] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/15 to-[#FFB042]/15 flex items-center justify-center mb-5">
              <p.icon className="w-5 h-5 text-[#7C5CFF]" strokeWidth={2.2} />
            </div>
            <h3 className="font-black text-lg text-[#0F0F13] mb-2" style={{ fontFamily: HEADING }}>{p.t}</h3>
            <p className="text-sm text-[#5F5F6B] leading-relaxed">{p.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ---------- Pricing ----------
const Pricing = () => (
  <section id="precios" className="py-32 bg-white">
    <div className="max-w-6xl mx-auto px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C5CFF]">Precios simples</div>
        <h2 className="mt-4 font-black text-[#0F0F13]" style={{ fontFamily: HEADING, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}>
          Paga solo por lo que <span style={GRADIENT_TEXT} className="italic">necesitas</span>.
        </h2>
        <p className="mt-5 text-lg text-[#5F5F6B]">Empieza gratis 14 días. Sin tarjeta. Azumi IA incluido en todos los planes.</p>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-5">
        {[
          { name: 'Starter', price: '49', desc: 'Para negocios que arrancan', features: ['1 vertical activa', '1 usuario', '50 operaciones/mes', 'Azumi básico', 'Soporte email'] },
          { name: 'Growth', price: '149', desc: 'Lo más elegido', features: ['2 verticales activas', '5 usuarios', 'Operaciones ilimitadas', 'Azumi Pro', 'Integraciones nativas', 'Onboarding 1-a-1'], featured: true },
          { name: 'Enterprise', price: 'Custom', desc: 'Cadenas y grupos', features: ['Verticales ilimitadas', 'Usuarios ilimitados', 'White-label completo', 'API completa', 'Manager dedicado', 'SLA 99.9%'] },
        ].map((p, i) => (
          <motion.div key={p.name}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            data-testid={`plan-${p.name.toLowerCase()}`}
            className={`rounded-3xl p-8 ${p.featured
              ? 'bg-gradient-to-br from-[#0F0F13] via-[#1a1420] to-[#0F0F13] text-white lg:-translate-y-4 shadow-[0_30px_70px_rgba(15,15,19,0.25)] relative overflow-hidden'
              : 'bg-white border border-[#0F0F13]/8'}`}>
            {p.featured && (
              <>
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#7C5CFF]/25 blur-3xl pointer-events-none" />
                <div className="absolute top-6 right-6 text-[9px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#7C5CFF] to-[#FFB042] text-white px-2 py-1 rounded-full">Más elegido</div>
              </>
            )}
            <div className="relative">
              <div className={`text-[11px] font-bold uppercase tracking-widest ${p.featured ? 'text-[#FFB042]' : 'text-[#7C5CFF]'}`}>{p.name}</div>
              <div className="mt-3 font-black leading-none" style={{ fontFamily: HEADING, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
                {p.price === 'Custom' ? p.price : <>€{p.price}<span className="text-lg font-medium opacity-60"> /mes</span></>}
              </div>
              <p className={`mt-3 text-sm ${p.featured ? 'text-white/60' : 'text-[#5F5F6B]'}`}>{p.desc}</p>
              <ul className="mt-7 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.featured ? 'text-[#FFB042]' : 'text-[#7C5CFF]'}`} strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-9 block text-center py-3.5 rounded-full text-sm font-bold transition-all ${p.featured ? 'bg-gradient-to-r from-[#FFB042] to-[#ffcc7a] text-[#0F0F13] hover:shadow-[0_12px_32px_rgba(255,176,66,0.40)]' : 'bg-[#0F0F13] text-white hover:bg-[#7C5CFF]'}`}>
                {p.price === 'Custom' ? 'Contactar' : 'Empezar gratis'}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ---------- Footer with mega LEVOND ----------
const FooterMega = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-[#0F0F13] text-[#FAFAFC] overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-[#7C5CFF] opacity-[0.10] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] rounded-full bg-[#FFB042] opacity-[0.08] blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-10">
        <div className="grid lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-11 h-11">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042]" />
                <div className="absolute inset-0.5 rounded-[10px] bg-[#0F0F13] flex items-center justify-center">
                  <span className="font-black text-white text-lg leading-none" style={{ fontFamily: HEADING }}>L</span>
                </div>
              </div>
              <span className="font-black text-2xl tracking-tight" style={{ fontFamily: HEADING }}>LEVOND</span>
            </div>
            <p className="text-white/60 max-w-md leading-relaxed text-[15px]">
              El sistema operativo con IA para la próxima generación de negocios. Software que respeta el negocio detrás.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Ic, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:border-[#FFB042] hover:text-[#FFB042] transition-colors">
                  <Ic className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { title: 'Plataforma', items: ['Travel OS', 'Marketing OS', 'Web OS', 'Studio OS', 'Azumi IA'] },
              { title: 'Empresa', items: ['Sobre LEVOND', 'Filosofía', 'Blog', 'Contacto'] },
              { title: 'Legal', items: ['Términos', 'Privacidad', 'Cookies', 'Seguridad'] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB042] mb-5">{col.title}</div>
                <ul className="space-y-3">
                  {col.items.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Massive LEVOND wordmark — fits fully centered */}
        <div className="relative w-full flex items-center justify-center overflow-hidden py-4">
          <div
            className="font-black tracking-[-0.04em] leading-none select-none text-center bg-gradient-to-b from-white/20 to-white/[0.03] bg-clip-text text-transparent"
            style={{ fontFamily: HEADING, fontSize: 'clamp(4rem, 15vw, 15rem)', letterSpacing: '-0.04em' }}
            data-testid="footer-brand-mega"
          >
            LEVOND
          </div>
        </div>

        <div className="border-t border-white/10 pt-7 mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/50">© {year} LEVOND · Todos los derechos reservados</p>
          <p className="text-xs text-white/50 font-mono">v 2026.1 · Edición Azumi</p>
        </div>
      </div>
    </footer>
  );
};

// ---------- Main ----------
const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F13]" style={{ fontFamily: BODY }} data-testid="landing-page">
      <Nav scrolled={scrolled} />
      <Hero />
      <Verticales />
      <AzumiBlock />
      <Filosofia />
      <Pricing />
      <FooterMega />
    </div>
  );
};

export default Landing;
