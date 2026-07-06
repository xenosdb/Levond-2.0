import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Palette, ImageIcon, MapPin, Users, Check, ArrowRight, ArrowLeft,
  Sparkles, Trash2, Plus, UploadCloud, SkipForward, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { companyApi } from '@/lib/api';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";
const BODY = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";

const PALETTES = [
  { name: 'Amatista Real', primary: '#7C3AED', secondary: '#FFD700' },
  { name: 'Océano Profundo', primary: '#0EA5E9', secondary: '#F97316' },
  { name: 'Bosque Esmeralda', primary: '#10B981', secondary: '#FACC15' },
  { name: 'Carmesí Elegante', primary: '#E11D48', secondary: '#0F172A' },
  { name: 'Índigo Nocturno', primary: '#4F46E5', secondary: '#22D3EE' },
  { name: 'Terracota Cálido', primary: '#EA580C', secondary: '#065F46' },
  { name: 'Grafito Oro', primary: '#1F2937', secondary: '#D4AF37' },
  { name: 'Rosa Vanguardia', primary: '#DB2777', secondary: '#7C3AED' },
];

const ROLES = [
  { id: 'admin', label: 'Administrador' },
  { id: 'manager', label: 'Gerente' },
  { id: 'agent', label: 'Agente de viajes' },
  { id: 'finance', label: 'Finanzas' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'viewer', label: 'Solo lectura' },
];

const STEPS = [
  { icon: Building2, title: 'Tu agencia', sub: 'Nombre e identidad de tu negocio' },
  { icon: Palette, title: 'Colores de marca', sub: 'Elige tu identidad visual' },
  { icon: ImageIcon, title: 'Logotipo', sub: 'Sube el logo de tu empresa' },
  { icon: MapPin, title: 'Dirección', sub: 'Ubicación y contacto' },
  { icon: Users, title: 'Tu equipo', sub: 'Crea usuarios y asigna roles' },
];

const Onboarding = () => {
  const { user, tenant, setTenant } = useAuth();
  const nav = useNavigate();
  const fileRef = useRef(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [createdUsers, setCreatedUsers] = useState(null);
  const [form, setForm] = useState({
    company: '', industry: 'Agencia de Viajes',
    primary_color: '#7C3AED', secondary_color: '#FFD700',
    logo: '', address: '', phone: '', employee_count: 1, employees: [],
  });

  useEffect(() => {
    if (tenant) {
      setForm((f) => ({
        ...f,
        company: tenant.name || '',
        primary_color: tenant.primary_color || '#7C3AED',
        secondary_color: tenant.secondary_color || '#FFD700',
      }));
    }
  }, [tenant]);

  if (!user) return <Navigate to="/travel/signup" replace />;
  if (tenant?.onboarding_completed && !createdUsers) return <Navigate to="/app" replace />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logo', reader.result);
    reader.readAsDataURL(file);
  };

  const addEmployee = () => set('employees', [...form.employees, { name: '', email: '', role: 'agent' }]);
  const updEmployee = (i, k, v) => set('employees', form.employees.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const delEmployee = (i) => set('employees', form.employees.filter((_, idx) => idx !== i));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        employees: form.employees.filter((e) => e.name && e.email),
      };
      const res = await companyApi.completeOnboarding(payload);
      setTenant(res.tenant);
      if (res.created_users?.length) {
        setCreatedUsers(res.created_users);
      } else {
        nav('/app');
      }
    } catch (err) {
      alert(err?.response?.data?.detail || 'Error al guardar. Verifica los datos.');
    } finally {
      setSaving(false);
    }
  };

  const StepIcon = STEPS[step].icon;

  // ---- Success screen with generated credentials ----
  if (createdUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B0710]" style={{ fontFamily: BODY }} data-testid="onboarding-success">
        <div className="w-full max-w-lg text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
            style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})` }}>
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: HEADING }}>¡Todo listo!</h1>
          <p className="text-white/60 mb-8">Guarda estas credenciales de acceso para tu equipo. Solo se muestran una vez.</p>
          <div className="space-y-3 text-left mb-8">
            {createdUsers.map((u) => (
              <div key={u.email} className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="created-user-row">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">{u.name}</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white/80" style={{ background: form.primary_color + '40' }}>{u.role}</span>
                </div>
                <div className="text-sm text-white/60 font-mono">{u.email}</div>
                <div className="text-sm text-white/80 font-mono">Contraseña: <span className="text-[color:var(--brand-secondary,#FFD700)]">{u.temp_password}</span></div>
              </div>
            ))}
          </div>
          <button onClick={() => nav('/app')} data-testid="onboarding-goto-app"
            className="w-full py-3.5 rounded-full font-bold text-white inline-flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(90deg, ${form.primary_color}, ${form.secondary_color})` }}>
            Entrar a LEAOS <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: BODY }} data-testid="onboarding-page">
      {/* LEFT rail — steps */}
      <div className="hidden lg:flex lg:w-[38%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(155deg, #0B0710 0%, ${form.primary_color}22 55%, #0B0710 100%)` }}>
        <div className="absolute -top-32 -right-24 w-[30rem] h-[30rem] rounded-full blur-3xl pointer-events-none"
          style={{ background: form.secondary_color + '18' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})` }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white" style={{ fontFamily: HEADING }}>LEAOS</span>
          </div>
          <p className="text-white/40 text-[11px] uppercase tracking-[0.24em] mb-12 ml-11">Levond Enterprise AI OS</p>

          <div className="space-y-2">
            {STEPS.map((s, i) => {
              const Ic = s.icon;
              const active = i === step, done = i < step;
              return (
                <div key={s.title} className={`flex items-start gap-4 p-3 rounded-xl transition-all ${active ? 'bg-white/8' : ''}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border transition-all"
                    style={{
                      background: done || active ? `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})` : 'transparent',
                      borderColor: done || active ? 'transparent' : 'rgba(255,255,255,0.15)',
                    }}>
                    {done ? <Check className="w-4 h-4 text-white" /> : <Ic className={`w-4 h-4 ${active ? 'text-white' : 'text-white/40'}`} />}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-bold ${active || done ? 'text-white' : 'text-white/40'}`}>{s.title}</p>
                    <p className="text-[12px] text-white/35">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="relative z-10 text-white/30 text-[11px]">Orquestado por IA · Base de datos aislada por empresa</p>
      </div>

      {/* RIGHT — content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-[#FAFAF7]">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-1 lg:hidden">
            <span className="text-xs font-bold text-[#8A8A9E]">Paso {step + 1} de {STEPS.length}</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})` }}>
              <StepIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F0F13] leading-tight" style={{ fontFamily: HEADING }}>{STEPS[step].title}</h2>
              <p className="text-sm text-[#5F5F6B]">{STEPS[step].sub}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {/* STEP 0 — Company */}
              {step === 0 && (
                <div className="space-y-4">
                  <Field label="Nombre de tu agencia" testid="ob-company" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Ej. Wanderlust Travel" />
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5F6B] mb-1.5 block">Industria / Rubro</label>
                    <input data-testid="ob-industry" value={form.industry} onChange={(e) => set('industry', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[color:var(--brand-primary)]" />
                  </div>
                </div>
              )}

              {/* STEP 1 — Colors */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    {PALETTES.map((p) => {
                      const sel = form.primary_color === p.primary && form.secondary_color === p.secondary;
                      return (
                        <button key={p.name} data-testid={`palette-${p.primary}`}
                          onClick={() => { set('primary_color', p.primary); set('secondary_color', p.secondary); }}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${sel ? 'border-[#0F0F13] shadow-md' : 'border-black/8 hover:border-black/20'}`}>
                          <div className="flex gap-1.5 mb-2">
                            <span className="w-7 h-7 rounded-lg" style={{ background: p.primary }} />
                            <span className="w-7 h-7 rounded-lg" style={{ background: p.secondary }} />
                          </div>
                          <span className="text-[12px] font-semibold text-[#0F0F13]">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <ColorPick label="Primario" value={form.primary_color} onChange={(v) => set('primary_color', v)} testid="ob-primary" />
                    <ColorPick label="Secundario" value={form.secondary_color} onChange={(v) => set('secondary_color', v)} testid="ob-secondary" />
                  </div>
                </div>
              )}

              {/* STEP 2 — Logo */}
              {step === 2 && (
                <div className="space-y-4">
                  <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} className="hidden" data-testid="ob-logo-input" />
                  <button onClick={() => fileRef.current?.click()} data-testid="ob-logo-btn"
                    className="w-full aspect-[2/1] rounded-2xl border-2 border-dashed border-black/15 hover:border-[color:var(--brand-primary)] bg-white flex flex-col items-center justify-center gap-3 transition-all overflow-hidden">
                    {form.logo ? (
                      <img src={form.logo} alt="logo" className="max-h-full max-w-full object-contain p-4" />
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-[#8A8A9E]" />
                        <span className="text-sm text-[#5F5F6B] font-semibold">Sube tu logotipo (PNG, JPG, SVG)</span>
                      </>
                    )}
                  </button>
                  {form.logo && <button onClick={() => set('logo', '')} className="text-xs text-red-500 font-bold">Quitar logo</button>}
                </div>
              )}

              {/* STEP 3 — Address */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5F6B] mb-1.5 block">Dirección</label>
                    <textarea data-testid="ob-address" value={form.address} onChange={(e) => set('address', e.target.value)} rows={3}
                      placeholder="Calle, ciudad, país" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[color:var(--brand-primary)]" />
                  </div>
                  <Field label="Teléfono" testid="ob-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
                </div>
              )}

              {/* STEP 4 — Team */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5F6B] mb-1.5 block">¿Cuántos empleados tiene tu agencia?</label>
                    <input type="number" min={1} data-testid="ob-empcount" value={form.employee_count}
                      onChange={(e) => set('employee_count', parseInt(e.target.value || '1'))}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[color:var(--brand-primary)]" />
                  </div>
                  <div className="space-y-3">
                    {form.employees.map((e, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-black/8 space-y-2" data-testid={`emp-row-${i}`}>
                        <div className="flex gap-2">
                          <input placeholder="Nombre" value={e.name} onChange={(ev) => updEmployee(i, 'name', ev.target.value)} data-testid={`emp-name-${i}`}
                            className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:border-[color:var(--brand-primary)]" />
                          <button onClick={() => delEmployee(i)} className="text-red-400 hover:text-red-600 px-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <input placeholder="email@agencia.com" type="email" value={e.email} onChange={(ev) => updEmployee(i, 'email', ev.target.value)} data-testid={`emp-email-${i}`}
                          className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:border-[color:var(--brand-primary)]" />
                        <select value={e.role} onChange={(ev) => updEmployee(i, 'role', ev.target.value)} data-testid={`emp-role-${i}`}
                          className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:border-[color:var(--brand-primary)]">
                          {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <button onClick={addEmployee} data-testid="ob-add-emp"
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-black/15 hover:border-[color:var(--brand-primary)] text-sm font-bold text-[#5F5F6B] inline-flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Agregar usuario
                  </button>
                  <p className="text-[12px] text-[#8A8A9E]">Se generará una contraseña temporal para cada usuario que crees.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between mt-10">
            <button onClick={back} disabled={step === 0} data-testid="ob-back"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5F5F6B] disabled:opacity-30 hover:text-[#0F0F13]">
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
            <div className="flex items-center gap-3">
              {(step === 1 || step === 2 || step === 3) && (
                <button onClick={next} data-testid="ob-skip" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8A8A9E] hover:text-[#0F0F13]">
                  <SkipForward className="w-4 h-4" /> Saltar etapa
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={next} data-testid="ob-next"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all"
                  style={{ background: `linear-gradient(90deg, ${form.primary_color}, ${form.secondary_color})` }}>
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={finish} disabled={saving} data-testid="ob-finish"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: `linear-gradient(90deg, ${form.primary_color}, ${form.secondary_color})` }}>
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : <>Finalizar <Check className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, testid, ...rest }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5F6B] mb-1.5 block">{label}</label>
    <input data-testid={testid} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[color:var(--brand-primary)]" {...rest} />
  </div>
);

const ColorPick = ({ label, value, onChange, testid }) => (
  <div className="flex items-center gap-2">
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
      className="w-10 h-10 rounded-lg border border-black/10 cursor-pointer" />
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">{label}</p>
      <p className="text-xs font-mono text-[#0F0F13]">{value}</p>
    </div>
  </div>
);

export default Onboarding;
