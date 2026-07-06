import React from 'react';
import { Search, Bell } from 'lucide-react';
import LanguageSwitcher from '@/components/landing/LanguageSwitcher';

const Topbar = ({ title, subtitle, right = null }) => {
  return (
    <div className="flex items-center justify-between mb-8" data-testid="dashboard-topbar">
      <div>
        <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight text-[#0F0F13]" data-testid="topbar-title">{title}</h1>
        {subtitle && <p className="text-[#5F5F6B] mt-1 text-sm md:text-base">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <button className="glass-card w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all" data-testid="topbar-search">
          <Search className="w-4 h-4 text-[#5F5F6B]" />
        </button>
        <button className="glass-card w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all relative" data-testid="topbar-notifications">
          <Bell className="w-4 h-4 text-[#5F5F6B]" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#FFB042]" />
        </button>
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default Topbar;
