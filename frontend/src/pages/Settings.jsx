import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Palette, Users, Database, Download, Save, Plus, Trash2, UploadCloud,
  ShieldCheck, Check, Loader2, KeyRound,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { companyApi } from '@/lib/api';

const HEADING = "'Playfair Display', ui-serif, Georgia, serif";

const ROLES = [
  { id: 'admin', label: 'Administrador' },
  { id: 'manager', label: 'Gerente' },
  { id: 'agent', label: 'Agente' },
  { id: 'finance', label: 'Finanzas' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'viewer', label: 'Solo lectura' },
];

const TABS = [
  { id: 'brand', label: 'Marca', icon: Palette },
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'data', label: 'Datos', icon: Database },
];

const Settings = () => {
  const { tenant, setTenant, user } = useAuth();
  const [tab, setTab] = useState('brand');
  const fileRef = useRef(null);
  const [brand, setBrand] = useState({ company: '', primary_color: '#7C3AED', secondary_color: '#FFD700', logo: '', address: '', phone: '' });
  const [savingBrand, setSavingBrand] = useState(false);
  const [savedBrand, setSavedBrand] = useState(false);

  const [team, setTeam] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'agent' });
  const [lastPwd, setLastPwd] = useState(null);
  const [exporting, setExporting] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (tenant) setBrand({
      company: tenant.name || '', primary_color: tenant.primary_color || '#7C3AED',
      secondary_color: tenant.secondary_color || '#FFD700', logo: tenant.logo || '',
      address: tenant.address || '', phone: tenant.phone || '',
    });
  }, [tenant]);

  const loadTeam = () => companyApi.team().then(setTeam).catch(() => {});
  useEffect(() => { loadTeam(); }, []);

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBrand((b) => ({ ...b, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveBrand = async () => {
    setSavingBrand(true); setSavedBrand(false);
    try {
      const res = await companyApi.updateBranding(brand);
      setTenant(res.tenant);
      setSavedBrand(true); setTimeout(() => setSavedBrand(false), 2000);
    } catch (e) { alert(e?.response?.data?.detail || 'Error al guardar'); }
    finally { setSavingBrand(false); }
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.email) return;
    try {
      const res = await companyApi.addMember(newMember);
      setLastPwd(res.user);
      setNewMember({ name: '', email: '', role: 'agent' });
      loadTeam();
    } catch (e) { alert(e?.response?.data?.detail || 'Error'); }
  };

  const removeMember = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    await companyApi.removeMember(id); loadTeam();
  };

  const changeRole = async (id, role) => { await companyApi.updateMember(id, { role }); loadTeam(); };

  const exportDb = async () => {
    setExporting(true);
    try {
      const data = await companyApi.exportDb();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaos-${(tenant?.name || 'export').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e?.response?.data?.detail || 'Error al exportar'); }
    finally { setExporting(false); }
  };

  return (
    <div className="max-w-4xl" data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0F0F13]" style={{ fontFamily: HEADING }}>Empresa y ajustes</h1>
        <p className="text-[#5F5F6B] mt-1">Personaliza tu marca, gestiona tu equipo y exporta tu base de datos.</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-black/8">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`settings-tab-${t.id}`}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all ${
              tab === t.id ? 'border-[color:var(--brand-primary,#7C3AED)] text-[#0F0F13]' : 'border-transparent text-[#8A8A9E] hover:text-[#0F0F13]'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {!isAdmin && <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 mb-6">Solo administradores pueden editar estos ajustes.</div>}

      {/* BRAND */}
      {tab === 'brand' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card title="Identidad" icon={Building2}>
            <L label="Nombre de la agencia">
              <input data-testid="set-company" value={brand.company} onChange={(e) => setBrand({ ...brand, company: e.target.value })} className={inp} />
            </L>
            <div className="grid grid-cols-2 gap-4">
              <L label="Teléfono"><input data-testid="set-phone" value={brand.phone} onChange={(e) => setBrand({ ...brand, phone: e.target.value })} className={inp} /></L>
              <L label="Dirección"><input data-testid="set-address" value={brand.address} onChange={(e) => setBrand({ ...brand, address: e.target.value })} className={inp} /></L>
            </div>
          </Card>

          <Card title="Colores de marca" icon={Palette}>
            <div className="flex items-center gap-6">
              <ColorField label="Primario" value={brand.primary_color} onChange={(v) => setBrand({ ...brand, primary_color: v })} testid="set-primary" />
              <ColorField label="Secundario" value={brand.secondary_color} onChange={(v) => setBrand({ ...brand, secondary_color: v })} testid="set-secondary" />
              <div className="flex-1 h-16 rounded-xl" style={{ background: `linear-gradient(90deg, ${brand.primary_color}, ${brand.secondary_color})` }} />
            </div>
          </Card>

          <Card title="Logotipo" icon={UploadCloud}>
            <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} className="hidden" data-testid="set-logo-input" />
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-xl border-2 border-dashed border-black/12 bg-white flex items-center justify-center overflow-hidden">
                {brand.logo ? <img src={brand.logo} alt="logo" className="max-h-full max-w-full object-contain p-2" /> : <UploadCloud className="w-6 h-6 text-[#8A8A9E]" />}
              </div>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} data-testid="set-logo-btn" className="px-4 py-2 rounded-lg border border-black/12 text-sm font-bold hover:bg-black/5">Subir logo</button>
                {brand.logo && <button onClick={() => setBrand({ ...brand, logo: '' })} className="px-4 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50">Quitar</button>}
              </div>
            </div>
          </Card>

          <button onClick={saveBrand} disabled={savingBrand || !isAdmin} data-testid="set-save-brand"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white disabled:opacity-50"
            style={{ background: `linear-gradient(90deg, ${brand.primary_color}, ${brand.secondary_color})` }}>
            {savingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : savedBrand ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedBrand ? 'Guardado' : 'Guardar cambios'}
          </button>
        </motion.div>
      )}

      {/* TEAM */}
      {tab === 'team' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {lastPwd && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3" data-testid="new-member-cred">
              <KeyRound className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-emerald-800">Usuario creado: {lastPwd.name}</p>
                <p className="text-emerald-700 font-mono">{lastPwd.email} · Contraseña: <b>{lastPwd.temp_password}</b></p>
                <p className="text-emerald-600 text-xs mt-1">Comparte estas credenciales de forma segura.</p>
              </div>
            </div>
          )}
          <Card title="Agregar miembro" icon={Plus}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Nombre" data-testid="team-new-name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className={inp} />
              <input placeholder="Email" type="email" data-testid="team-new-email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} className={inp} />
              <select value={newMember.role} data-testid="team-new-role" onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} className={inp}>
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <button onClick={addMember} disabled={!isAdmin} data-testid="team-add-btn" className="px-4 py-2.5 rounded-lg font-bold text-white disabled:opacity-50" style={{ background: 'var(--brand-primary,#7C3AED)' }}>Agregar</button>
            </div>
          </Card>

          <Card title={`Miembros (${team.length})`} icon={Users}>
            <div className="space-y-2">
              {team.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-black/8" data-testid="team-row">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black" style={{ background: 'var(--brand-primary,#7C3AED)' }}>{m.name?.[0]?.toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#0F0F13] truncate">{m.name} {m.id === user.id && <span className="text-[10px] text-[#8A8A9E]">(tú)</span>}</p>
                    <p className="text-xs text-[#8A8A9E] truncate">{m.email}</p>
                  </div>
                  <select value={m.role} disabled={!isAdmin || m.id === user.id} onChange={(e) => changeRole(m.id, e.target.value)} className="px-2 py-1.5 rounded-lg border border-black/10 text-sm bg-white">
                    {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                  {isAdmin && m.id !== user.id && <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* DATA */}
      {tab === 'data' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card title="Exportar base de datos" icon={Database}>
            <p className="text-sm text-[#5F5F6B] mb-4">
              Descarga toda la información de tu empresa (contactos, reservas, facturas, ventas, contabilidad y más) en un archivo JSON portable.
              Tu base de datos está <b>aislada por empresa</b> — solo exportas tus propios datos.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0B0710] text-white mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Formato <b>LEAOS-1.0</b> · Compatible con reimportación futura.</span>
            </div>
            <button onClick={exportDb} disabled={exporting || !isAdmin} data-testid="export-db-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white disabled:opacity-50"
              style={{ background: `linear-gradient(90deg, var(--brand-primary,#7C3AED), var(--brand-secondary,#FFD700))` }}>
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar mi base de datos
            </button>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const inp = "w-full px-4 py-2.5 rounded-lg border border-black/10 bg-white text-sm focus:outline-none focus:border-[color:var(--brand-primary,#7C3AED)]";

const Card = ({ title, icon: Icon, children }) => (
  <div className="p-6 rounded-2xl bg-white border border-black/8 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-[color:var(--brand-primary,#7C3AED)]" />
      <h3 className="font-bold text-[#0F0F13]">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const L = ({ label, children }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5F6B] mb-1.5 block">{label}</label>
    {children}
  </div>
);

const ColorField = ({ label, value, onChange, testid }) => (
  <div className="flex items-center gap-2">
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="w-11 h-11 rounded-lg border border-black/10 cursor-pointer" />
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">{label}</p>
      <p className="text-xs font-mono text-[#0F0F13]">{value}</p>
    </div>
  </div>
);

export default Settings;
