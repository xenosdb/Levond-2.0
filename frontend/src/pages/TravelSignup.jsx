import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, Mail, Lock, Eye, EyeOff, Plane, TrendingUp, ShieldCheck, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import heroMaldives from '@/assets/travel/levond-hero-maldives.jpg';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";
const BODY = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";

const SILVER_TEXT = {
  backgroundImage: 'linear-gradient(90deg,#ffffff 0%,#eef3fb 20%,#c7d1e0 45%,#ffffff 60%,#d8e0ec 80%,#ffffff 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  WebkitTextStroke: '1px rgba(255,255,255,0.35)',
};
const GOLD_TEXT = {
  backgroundImage: 'linear-gradient(180deg,#fffce6 0%,#ffe66e 40%,#ffd700 60%,#c9a86a 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  WebkitTextStroke: '1px rgba(255,230,110,0.5)',
};

const TravelSignup = () => {
  const { signup, login, user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app/travel" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'signup') {
        await signup(form);
        nav('/onboarding');
        return;
      } else {
        await login(form.email, form.password);
      }
      nav('/app/travel');
    } catch (err) {
      setError(err?.response?.data?.detail || `Error al ${mode === 'signup' ? 'crear cuenta' : 'iniciar sesión'}`);
    } finally { setLoading(false); }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen flex" style={{ fontFamily: BODY }} data-testid="travel-signup-page">
      {/* LEFT — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <img src={heroMaldives} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,4,16,0.92) 0%, rgba(76,29,149,0.72) 45%, rgba(10,4,16,0.90) 100%)' }} />
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#ffd700]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-[#7c3aed]/25 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border border-white" />
        </div>

        <Link to="/travel" data-testid="travel-signup-back" className="absolute top-8 left-8 inline-flex items-center gap-2 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-[0.24em] z-20">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Travel OS
        </Link>

        <div className="relative z-10 text-center max-w-md">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-black leading-[0.95] tracking-tight text-6xl xl:text-7xl mb-6 select-none"
            style={{ fontFamily: HEADING, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))' }}>
            <span style={SILVER_TEXT}>Levond</span>
            <br />
            <span className="italic font-light" style={GOLD_TEXT}>Travel OS</span>
          </motion.h1>

          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[#ffd700]/60 to-transparent mb-6" />

          <p className="text-white/85 text-lg leading-relaxed">
            El sistema operativo con IA para agencias de viaje.
            <span className="block mt-2 text-white/60 text-base">
              CRM, propuestas, reservas y marketing en un solo lugar.
            </span>
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Building2, value: '500+', label: 'Agencias' },
              { icon: TrendingUp, value: '$2M+', label: 'En reservas' },
              { icon: ShieldCheck, value: '99.9%', label: 'Uptime' },
            ].map((s, i) => (
              <div key={s.label} className={'flex flex-col items-center gap-2 px-2 ' + (i < 2 ? 'border-r border-white/10' : '')}>
                <s.icon className="h-4 w-4 text-[#ffd700]/80" strokeWidth={1.5} />
                <p className="text-2xl font-bold" style={{ fontFamily: HEADING, ...GOLD_TEXT, WebkitTextStroke: '0' }}>{s.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAF7] relative">
        {/* Mobile back link */}
        <Link to="/travel" className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#5F5F6B] hover:text-[#0F0F13]">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </Link>

        <div className="w-full max-w-md space-y-7">
          <div className="text-center lg:hidden mb-6">
            <div className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#ffd700] flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black" style={{ fontFamily: HEADING }}>Levond Travel OS</span>
            </div>
          </div>

          <div>
            <h2 className="font-black text-[#0F0F13]" style={{ fontFamily: HEADING, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>
              {isSignup ? 'Registra tu agencia' : 'Bienvenido de vuelta'}
            </h2>
            <p className="text-[#5F5F6B] mt-2 text-sm">
              {isSignup
                ? 'Empieza a vender viajes con la IA orquestada por Azumi. 14 días gratis, sin tarjeta.'
                : 'Ingresa para gestionar tu agencia y ver tus propuestas.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="travel-signup-form">
            {/* Google OAuth (Freelancer / rápido) */}
            {/* REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH */}
            <button
              type="button"
              onClick={() => {
                const redirectUrl = window.location.origin + '/auth/callback';
                window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
              }}
              data-testid="signup-google-btn"
              className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-full font-bold text-[14px] text-[#0F0F13] bg-white border border-black/10 hover:border-black/25 hover:shadow-sm transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A8A9E] text-center">
              Recomendado para freelancers
            </div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#FAFAF7] px-3 text-[#8A8A9E]">o con email corporativo</span>
              </div>
            </div>

            {isSignup && (
              <>
                <Field icon={User} label="Nombre completo" type="text" testid="signup-name" value={form.name} onChange={set('name')} required autoComplete="name" placeholder="Tu nombre" />
                <Field icon={Building2} label="Nombre de tu agencia" type="text" testid="signup-company" value={form.company} onChange={set('company')} required autoComplete="organization" placeholder="Ej. Wanderlust Travel" />
              </>
            )}
            <Field icon={Mail} label="Email" type="email" testid="signup-email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="tu@agencia.com" />
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5F6B] mb-1.5 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A9E]" />
                <input
                  data-testid="signup-password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A9E] hover:text-[#0F0F13]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700" data-testid="signup-error">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="signup-submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-[15px] text-white bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] hover:shadow-[0_12px_32px_rgba(124,58,237,0.35)] transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {loading
                ? (isSignup ? 'Creando cuenta…' : 'Ingresando…')
                : (isSignup ? 'Crear cuenta gratis' : 'Iniciar sesión')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {isSignup && (
              <p className="text-[11px] text-[#8A8A9E] text-center leading-relaxed">
                Al registrarte aceptas los <a href="#" className="underline hover:text-[#7c3aed]">Términos</a> y la <a href="#" className="underline hover:text-[#7c3aed]">Privacidad</a> de Levond.
              </p>
            )}
          </form>

          <div className="text-center text-sm text-[#5F5F6B]">
            {isSignup ? '¿Ya tienes cuenta?' : '¿Nueva agencia?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}
              data-testid="signup-toggle-mode"
              className="font-bold text-[#7c3aed] hover:underline"
            >
              {isSignup ? 'Iniciar sesión' : 'Crear cuenta gratis'}
            </button>
          </div>

          <div className="pt-6 border-t border-black/6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A8A9E]">
            <Plane className="w-3.5 h-3.5 text-[#7c3aed]" />
            Powered by Levond OS · Azumi AI
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, testid, ...rest }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5F6B] mb-1.5 block">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A9E]" />
      <input
        data-testid={testid}
        className="w-full pl-10 pr-3 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition"
        {...rest}
      />
    </div>
  </div>
);

export default TravelSignup;
