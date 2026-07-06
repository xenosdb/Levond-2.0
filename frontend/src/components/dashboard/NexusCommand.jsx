import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';
import { nexusApi } from '@/lib/nexus';

const AGENT_EMOJI = { NEXUS: '🌌', SALVO: '💰', FINA: '📊', KAI: '📦', RIO: '🍽️', VEGA: '✈️', IRIS: '💬' };

const NexusCommand = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setInput(''); setAnswer(null); }
  }, [open]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setLoading(true); setAnswer(null);
    try {
      const r = await nexusApi.chat(msg);
      setAnswer(r);
    } catch (e) {
      setAnswer({ error: e?.response?.data?.detail || e.message });
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setOpen(false)} data-testid="cmd-nexus-backdrop">
          <motion.div initial={{ y: -20, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-card-strong rounded-3xl shadow-[0_24px_80px_rgba(124,92,255,0.25)] overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-[#7C5CFF]/10">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <input ref={inputRef} data-testid="cmd-nexus-input"
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Pregúntale a Azumi… (Enter para enviar, Esc para cerrar)"
                disabled={loading}
                className="flex-1 bg-transparent focus:outline-none text-sm font-medium text-[#0F0F13] placeholder-[#8A8A9E]" />
              <span className="text-[10px] font-mono font-bold text-[#8A8A9E] bg-white/60 px-2 py-1 rounded">⌘K</span>
              <button onClick={() => setOpen(false)} className="text-[#8A8A9E] hover:text-[#0F0F13]"><X className="w-4 h-4" /></button>
            </div>
            {(loading || answer) && (
              <div className="p-5 max-h-[50vh] overflow-y-auto">
                {loading && (
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                    <span className="ml-2 text-xs text-[#8A8A9E] font-bold">Consultando…</span>
                  </div>
                )}
                {answer?.error && <div className="text-sm text-red-600">⚠️ {answer.error}</div>}
                {answer?.assistant_message && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#7C5CFF' }}>
                      <span>{AGENT_EMOJI[answer.agent.id]}</span>
                      <span>{answer.agent.name} · {answer.agent.role}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#0F0F13]">{answer.assistant_message.content}</div>
                    {answer.assistant_message.action_result && (
                      <div className={`mt-3 text-[11px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 ${answer.assistant_message.action_result.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {answer.assistant_message.action_result.ok ? '✓' : '✗'} {answer.assistant_message.action_result.type || answer.assistant_message.action_result.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NexusCommand;
