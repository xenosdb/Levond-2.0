import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-300 ${
            scrolled ? 'glass-card-strong shadow-[0_8px_32px_rgba(124,92,255,0.10)]' : 'glass-card'
          }`}
        >
          <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] animate-pulse-orb" />
              <div className="absolute inset-0.5 rounded-[10px] bg-white flex items-center justify-center">
                <span className="font-display font-black text-[#7C5CFF] text-lg leading-none">L</span>
              </div>
            </div>
            <span className="font-display font-black tracking-tight text-xl text-[#0F0F13] group-hover:text-[#7C5CFF] transition-colors">
              LEVOND
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { key: 'product', href: '#hero' },
              { key: 'modules', href: '#modules' },
              { key: 'industries', href: '#industries' },
              { key: 'pricing', href: '#pricing' },
            ].map((it) => (
              <a
                key={it.key}
                href={it.href}
                data-testid={`navbar-link-${it.key}`}
                className="px-4 py-2 text-sm font-semibold text-[#5F5F6B] hover:text-[#0F0F13] rounded-full hover:bg-[#7C5CFF]/5 transition-all"
              >
                {t.nav[it.key]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/login"
              data-testid="navbar-signin"
              className="hidden md:inline-flex px-4 py-2 text-sm font-bold text-[#0F0F13] hover:text-[#7C5CFF] transition-colors"
            >
              {t.nav.signIn}
            </Link>
            <Link
              to="/signup"
              data-testid="navbar-try-free"
              className="inline-flex items-center gap-1.5 bg-[#0F0F13] hover:bg-[#7C5CFF] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-[0_4px_12px_rgba(15,15,19,0.15)] hover:shadow-[0_8px_24px_rgba(124,92,255,0.35)]"
            >
              {t.nav.tryFree}
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
