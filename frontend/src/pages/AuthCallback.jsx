import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const BASE = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [err, setErr] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || '';
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { setErr('Sesión no encontrada'); setTimeout(() => nav('/login'), 1500); return; }
    const sid = m[1];
    (async () => {
      try {
        const { data } = await axios.post(`${BASE}/api/auth/google/exchange`, { session_id: sid, tenant_type: 'travel' });
        localStorage.setItem('levond_token', data.token);
        if (refresh) await refresh();
        window.location.replace('/app/travel');
      } catch (e) {
        setErr(e?.response?.data?.detail || 'Error al iniciar sesión con Google');
        setTimeout(() => nav('/travel/signup'), 2000);
      }
    })();
  }, [nav, refresh]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#08070C] text-white gap-4" data-testid="auth-callback">
      <Loader2 className="w-8 h-8 animate-spin text-[#FFB042]" />
      <div className="text-sm font-bold uppercase tracking-widest text-white/70">{err || 'Autenticando…'}</div>
    </div>
  );
};

export default AuthCallback;
