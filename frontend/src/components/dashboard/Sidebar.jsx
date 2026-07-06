import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut, ChevronDown, Clock, Check, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_CATEGORIES } from '@/config/apps';

const Sidebar = () => {
  const { lang } = useLanguage();
  const { user, tenant, logout } = useAuth();
  const L = (obj) => obj[lang] || obj.es || obj.en;

  const [openCats, setOpenCats] = useState(() => {
    // Only categories that have at least one live/partial app open by default
    const initial = {};
    APP_CATEGORIES.forEach((c) => {
      initial[c.id] = c.apps.some((a) => a.status === 'live' || a.status === 'partial');
    });
    return initial;
  });

  const toggle = (id) => setOpenCats((s) => ({ ...s, [id]: !s[id] }));

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white/60 backdrop-blur-xl border-r border-[#7C5CFF]/10 z-40" data-testid="sidebar">
      <div className="p-5 pb-3 flex-shrink-0">
        <NavLink to="/app" className="flex items-center gap-2.5">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042]" />
            <div className="absolute inset-0.5 rounded-[10px] bg-white flex items-center justify-center">
              <span className="font-display font-black text-[#7C5CFF] text-lg leading-none">L</span>
            </div>
          </div>
          <div>
            <div className="font-display font-black text-lg tracking-tight text-[#0F0F13] leading-none">LEVOND</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A8A9E] mt-1">Travel OS</div>
          </div>
        </NavLink>

        <div className="mt-4 glass-card rounded-xl px-3 py-2 flex items-center gap-2.5" data-testid="sidebar-tenant">
          {tenant?.logo ? (
            <img src={tenant.logo} alt="" className="w-8 h-8 rounded-lg object-contain bg-white flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, var(--brand-primary,#7C5CFF), var(--brand-secondary,#FFB042))` }} />
          )}
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A9E]">Workspace</div>
            <div className="font-display font-bold text-sm text-[#0F0F13] truncate">{tenant?.name || '—'}</div>
          </div>
        </div>
      </div>

      {/* Nav scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <NavLink
          to="/app" end
          data-testid="sidebar-link-home"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-2 ${
              isActive ? 'bg-[#7C5CFF] text-white shadow-[0_4px_12px_rgba(124,92,255,0.35)]' : 'text-[#5F5F6B] hover:bg-[#7C5CFF]/8 hover:text-[#0F0F13]'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={2.2} />
          {lang === 'en' ? 'Home' : 'Inicio'}
        </NavLink>

        {APP_CATEGORIES.map((cat) => {
          const isOpen = openCats[cat.id];
          const liveApps = cat.apps.filter((a) => a.status === 'live' || a.status === 'partial');
          const hasLive = liveApps.length > 0;

          return (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => toggle(cat.id)}
                data-testid={`sidebar-cat-${cat.id}`}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8A9E] hover:text-[#0F0F13] transition-colors group"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.accent }} />
                  {L(cat.title)}
                  {hasLive && <span className="ml-1 text-[9px] font-bold text-emerald-600">·{liveApps.length}</span>}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {cat.apps.map((app) => {
                    const isLive = app.status === 'live' || app.status === 'partial';
                    const routeTo = app.route || `/app/${app.id}`;
                    const content = (
                      <>
                        <app.Icon className="w-4 h-4" strokeWidth={2.2} style={isLive ? {} : { opacity: 0.5 }} />
                        <span className="flex-1 truncate">{lang === 'en' ? app.en : app.name}</span>
                        {app.status === 'soon' && <Clock className="w-3 h-3 text-[#8A8A9E]" />}
                        {app.status === 'live' && <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />}
                      </>
                    );
                    return (
                      <NavLink
                        key={app.id} to={routeTo}
                        data-testid={`sidebar-app-${app.id}`}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                            isActive ? 'bg-[#7C5CFF]/10 text-[#7C5CFF]' : (isLive ? 'text-[#0F0F13] hover:bg-[#7C5CFF]/8' : 'text-[#8A8A9E] hover:bg-black/5')
                          }`
                        }
                      >
                        {content}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#7C5CFF]/10 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center text-white font-display font-black text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm text-[#0F0F13] truncate">{user?.name || '—'}</div>
            <div className="text-[11px] text-[#8A8A9E] truncate">{user?.email || ''}</div>
          </div>
        </div>
        <NavLink
          to="/app/settings" data-testid="sidebar-link-settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold mb-1 transition-all ${
              isActive ? 'bg-[#7C5CFF]/10 text-[#7C5CFF]' : 'text-[#5F5F6B] hover:bg-[#7C5CFF]/8 hover:text-[#0F0F13]'
            }`
          }
        >
          <Settings className="w-3.5 h-3.5" />
          {lang === 'en' ? 'Company & Settings' : 'Empresa y ajustes'}
        </NavLink>
        <button
          onClick={logout} data-testid="sidebar-logout"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#5F5F6B] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          {lang === 'en' ? 'Sign out' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
