import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const { t } = useLanguage();
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('demo@levond.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      nav('/app');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-20 -left-20 w-[500px] h-[500px] rounded-full bg-[#7C5CFF] opacity-15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] rounded-full bg-[#FFB042] opacity-12 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link to="/" data-testid="login-back-home" className="flex items-center gap-2.5 mb-8 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] animate-pulse-orb" />
            <div className="absolute inset-0.5 rounded-[10px] bg-white flex items-center justify-center">
              <span className="font-display font-black text-[#7C5CFF] text-lg leading-none">L</span>
            </div>
          </div>
          <span className="font-display font-black tracking-tight text-xl text-[#0F0F13] group-hover:text-[#7C5CFF] transition-colors">LEVOND</span>
        </Link>

        <div className="glass-card-strong rounded-[2rem] p-8 md:p-10">
          <h1 className="font-display font-black text-3xl tracking-tight text-[#0F0F13]">{t.auth.login.title}</h1>
          <p className="text-[#5F5F6B] mt-2 text-sm">{t.auth.login.subtitle}</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F6B] mb-1.5 block">{t.auth.login.email}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E]" />
                <input
                  data-testid="login-email"
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-[#7C5CFF]/15 rounded-xl focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all font-medium text-[#0F0F13]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F6B] mb-1.5 block">{t.auth.login.password}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E]" />
                <input
                  data-testid="login-password"
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-[#7C5CFF]/15 rounded-xl focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all font-medium text-[#0F0F13]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              data-testid="login-submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0F0F13] hover:bg-[#7C5CFF] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-full transition-all shadow-[0_4px_12px_rgba(15,15,19,0.15)] hover:shadow-[0_8px_24px_rgba(124,92,255,0.35)]"
            >
              {loading ? '...' : t.auth.login.submit}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[#7C5CFF]/10 text-sm text-center text-[#5F5F6B]">
            {t.auth.login.noAccount}{' '}
            <Link to="/signup" data-testid="login-goto-signup" className="font-bold text-[#7C5CFF] hover:underline">
              {t.auth.login.signup}
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-[#8A8A9E]">
          <Sparkles className="inline w-3 h-3 mr-1" />
          Datos demo pre-cargados con tu workspace
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
