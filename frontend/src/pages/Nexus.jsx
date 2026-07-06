import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, ThumbsUp, ThumbsDown, X, MessageSquare, Plus, Zap, Paperclip, FileText, Trash2, Bell, BarChart3, TrendingUp, Check } from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { nexusApi } from '@/lib/nexus';

const AGENT_COLORS = {
  NEXUS: '#7C5CFF', SALVO: '#7C5CFF', FINA: '#FFB042',
  KAI: '#8B5CF6', RIO: '#FF6B6B', VEGA: '#3B82F6', IRIS: '#EC4899',
};
const AGENT_EMOJI = {
  NEXUS: '🌌', SALVO: '💰', FINA: '📊', KAI: '📦', RIO: '🍽️', VEGA: '✈️', IRIS: '💬',
};

const Nexus = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [forceAgent, setForceAgent] = useState(null);
  const [lastAgent, setLastAgent] = useState('NEXUS');
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  const T = lang === 'en'
    ? { title: 'Azumi', sub: 'Your AI council', placeholder: 'Ask Azumi anything…', new: 'New chat', hint1: 'Try asking:', suggestions: ['Create an invoice for Acme', 'Show me my top leads', 'How do I record a journal entry?', 'What products are low in stock?'] }
    : { title: 'Azumi', sub: 'Tu consejo de IA', placeholder: 'Pregúntale a Azumi…', new: 'Nueva conversación', hint1: 'Prueba con:', suggestions: ['Crea una factura para Acme', 'Muéstrame mis mejores leads', '¿Cómo registro un asiento contable?', '¿Qué productos tienen stock bajo?'] };

  useEffect(() => {
    nexusApi.agents().then(setAgents).catch(() => {});
    nexusApi.sessions().then(setSessions).catch(() => {});
    // Auto-generate proactive insights on mount
    nexusApi.generateProactive().then((r) => setInsights(r.items || [])).catch(() => {});
    nexusApi.metrics().then(setMetrics).catch(() => {});
  }, []);

  const dismissInsight = async (id) => {
    await nexusApi.dismiss(id);
    setInsights((i) => i.filter((x) => x.id !== id));
  };
  const askAboutInsight = (ins) => {
    setActiveSession(null); setMessages([]); setDocs([]);
    setTimeout(() => send(ins.message), 100);
  };

  useEffect(() => {
    if (activeSession) {
      nexusApi.getSession(activeSession).then((s) => setMessages(s.messages || []));
      nexusApi.listDocs(activeSession).then(setDocs).catch(() => setDocs([]));
    } else { setMessages([]); setDocs([]); }
  }, [activeSession]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput(''); setLoading(true);
    // Optimistic
    setMessages((m) => [...m, { id: 'tmp-' + Date.now(), role: 'user', content: msg, ts: new Date().toISOString() }]);
    try {
      const r = await nexusApi.chat(msg, activeSession, forceAgent);
      setActiveSession(r.session_id);
      setLastAgent(r.agent.id);
      setMessages((m) => [
        ...m.filter((x) => !x.id?.startsWith('tmp-')),
        r.user_message,
        r.assistant_message,
      ]);
      nexusApi.sessions().then(setSessions).catch(() => {});
    } catch (e) {
      setMessages((m) => [...m, { id: 'err-' + Date.now(), role: 'assistant', agent: 'NEXUS', content: `⚠️ Error: ${e?.response?.data?.detail || e.message}`, ts: new Date().toISOString() }]);
    } finally {
      setLoading(false); setForceAgent(null);
    }
  };

  const rate = async (mid, rating) => {
    try { await nexusApi.feedback(mid, rating); } catch {}
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await nexusApi.uploadDoc(file, activeSession);
      setActiveSession(r.session_id);
      setDocs((d) => [r.document, ...d]);
    } catch (err) {
      alert('Error subiendo documento: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeDoc = async (id) => {
    await nexusApi.deleteDoc(id);
    setDocs((d) => d.filter((x) => x.id !== id));
  };

  const startNew = () => { setActiveSession(null); setMessages([]); setDocs([]); setForceAgent(null); };

  return (
    <div>
      <Topbar title={T.title} subtitle={T.sub} right={
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMetrics(!showMetrics)} data-testid="nexus-toggle-metrics"
            className="glass-card w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all">
            <BarChart3 className="w-4 h-4 text-[#7C5CFF]" />
          </button>
          <button onClick={startNew} data-testid="nexus-new-chat"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F0F13] hover:bg-[#7C5CFF] text-white font-bold text-sm transition-all">
            <Plus className="w-4 h-4" />{T.new}
          </button>
        </div>
      } />

      {/* Insights + metrics banner */}
      {insights.length > 0 && (
        <div className="mb-4 space-y-2" data-testid="nexus-insights">
          {insights.map((ins) => (
            <motion.div key={ins.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-3.5 flex items-center gap-3 group" data-testid={`insight-${ins.id}`}>
              <div className="w-9 h-9 rounded-xl bg-[#FFB042]/20 text-[#B27200] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">{ins.agent}</span>
                  <span className="font-display font-black text-sm text-[#0F0F13]">{ins.title}</span>
                </div>
                <div className="text-sm text-[#5F5F6B] mt-0.5">{ins.message}</div>
              </div>
              <button onClick={() => askAboutInsight(ins)} data-testid={`insight-ask-${ins.id}`}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#7C5CFF] hover:bg-[#6A4BE5] text-white">
                {lang === 'en' ? 'Ask' : 'Consultar'}
              </button>
              <button onClick={() => dismissInsight(ins.id)} data-testid={`insight-dismiss-${ins.id}`}
                className="text-[#8A8A9E] hover:text-red-500"><X className="w-4 h-4" /></button>
            </motion.div>
          ))}
        </div>
      )}
      {showMetrics && metrics && (
        <div className="mb-5 glass-card-strong rounded-2xl p-5" data-testid="nexus-metrics">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C5CFF] mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> {lang === 'en' ? 'Azumi performance' : 'Rendimiento Azumi'}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: lang === 'en' ? 'Sessions' : 'Sesiones', value: metrics.sessions },
              { label: lang === 'en' ? 'Messages' : 'Mensajes', value: metrics.assistant_messages },
              { label: lang === 'en' ? 'Feedback score' : 'Score feedback', value: metrics.feedback_score != null ? metrics.feedback_score + '%' : '—' },
              { label: lang === 'en' ? 'Actions rate' : 'Acciones OK', value: metrics.useful_actions_rate != null ? metrics.useful_actions_rate + '%' : '—' },
            ].map((k, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-3">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A9E]">{k.label}</div>
                <div className="font-display font-black text-2xl text-[#0F0F13] mt-0.5">{k.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E]">{lang === 'en' ? 'Agent usage' : 'Uso por agente'}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.entries(metrics.agent_usage || {}).map(([a, n]) => (
              <span key={a} className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#7C5CFF]/10 text-[#7C5CFF]">
                {AGENT_EMOJI[a]} {a}: {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Sessions sidebar */}
        <aside className="lg:col-span-3 space-y-2 max-h-[75vh] overflow-auto" data-testid="nexus-sessions">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A8A9E] px-1 mb-1">{lang === 'en' ? 'Recent' : 'Recientes'}</div>
          {sessions.map((s) => (
            <button key={s.id} onClick={() => setActiveSession(s.id)}
              data-testid={`nexus-session-${s.id}`}
              className={`w-full text-left p-3 rounded-xl text-sm transition-all ${activeSession === s.id ? 'bg-[#7C5CFF] text-white' : 'bg-white/60 hover:bg-white text-[#0F0F13]'}`}>
              <div className="font-bold truncate">{s.preview || (lang === 'en' ? 'New chat' : 'Nueva conversación')}</div>
              <div className={`text-[10px] mt-0.5 ${activeSession === s.id ? 'text-white/70' : 'text-[#8A8A9E]'}`}>{s.message_count} msg</div>
            </button>
          ))}
          {sessions.length === 0 && <div className="text-xs text-[#8A8A9E] italic px-1">{lang === 'en' ? 'No conversations yet' : 'Aún sin conversaciones'}</div>}
        </aside>

        {/* Chat main */}
        <div className="lg:col-span-6 glass-card-strong rounded-3xl p-5 flex flex-col h-[75vh]" data-testid="nexus-chat">
          {/* Header con agente activo */}
          <div className="flex items-center justify-between pb-3 border-b border-[#7C5CFF]/10 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `${AGENT_COLORS[lastAgent]}22` }}>
                {AGENT_EMOJI[lastAgent]}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="font-display font-black text-sm text-[#0F0F13]">{agents.find((a) => a.id === lastAgent)?.name || 'Azumi'}</div>
                <div className="text-[10px] font-bold text-[#8A8A9E]">{agents.find((a) => a.id === lastAgent)?.role || ''}</div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#8A8A9E]">Claude Sonnet 4.5</div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1" data-testid="nexus-messages">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#FFB042] flex items-center justify-center mb-4 animate-pulse-orb">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="font-display font-black text-xl text-[#0F0F13]">Hola {user?.name?.split(' ')[0] || ''} 👋</div>
                <div className="text-sm text-[#5F5F6B] mt-1">{lang === 'en' ? "I'm Azumi. I have a council of 6 specialized agents. How can I help?" : 'Soy Azumi. Tengo un consejo de 6 agentes especializados. ¿En qué te ayudo?'}</div>
                <div className="mt-6 w-full max-w-md">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A9E] mb-2">{T.hint1}</div>
                  <div className="space-y-1.5">
                    {T.suggestions.map((s, i) => (
                      <button key={i} onClick={() => send(s)} data-testid={`nexus-suggest-${i}`}
                        className="w-full text-left px-3 py-2 rounded-xl bg-white/60 hover:bg-white text-sm text-[#0F0F13] transition-all border border-[#7C5CFF]/10 hover:border-[#7C5CFF]/40">
                        <Zap className="inline w-3.5 h-3.5 text-[#FFB042] mr-2" />{s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`} data-testid={`msg-${m.id}`}>
                <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-[#7C5CFF] text-white' : 'bg-white/90 text-[#0F0F13] border border-[#7C5CFF]/10'} rounded-2xl px-4 py-2.5`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: AGENT_COLORS[m.agent] || '#7C5CFF' }}>
                      <span>{AGENT_EMOJI[m.agent]}</span>
                      <span>{m.agent}</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  {m.action_result && (
                    <div className={`mt-2 text-[11px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 ${m.action_result.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`} data-testid={`action-result-${m.id}`}>
                      {m.action_result.ok ? '✓ Acción ejecutada' : '✗ Acción falló'}: {m.action_result.type || m.action_result.error}
                    </div>
                  )}
                  {m.role === 'assistant' && !m.id?.startsWith('err-') && (
                    <div className="flex items-center gap-1 mt-2 opacity-60 hover:opacity-100 transition-opacity">
                      <button onClick={() => rate(m.id, 1)} data-testid={`msg-up-${m.id}`} className="p-1 hover:text-emerald-600"><ThumbsUp className="w-3 h-3" /></button>
                      <button onClick={() => rate(m.id, -1)} data-testid={`msg-down-${m.id}`} className="p-1 hover:text-red-500"><ThumbsDown className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/90 border border-[#7C5CFF]/10 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-3 pt-3 border-t border-[#7C5CFF]/10">
            {docs.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5" data-testid="nexus-docs-list">
                {docs.map((d) => (
                  <span key={d.id} className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#7C5CFF]/10 text-[#7C5CFF] px-2 py-1 rounded-full max-w-[220px]">
                    <FileText className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{d.filename}</span>
                    <button onClick={() => removeDoc(d.id)} data-testid={`doc-remove-${d.id}`} className="hover:text-red-600 flex-shrink-0"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            {forceAgent && (
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="text-[#8A8A9E]">{lang === 'en' ? 'Asking' : 'Preguntando a'}:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#7C5CFF] font-bold">
                  {AGENT_EMOJI[forceAgent]} {forceAgent}
                  <button onClick={() => setForceAgent(null)} className="ml-0.5"><X className="w-3 h-3" /></button>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" onChange={upload} className="hidden" accept=".pdf,.docx,.txt,.md,.csv,.json,.xml,.html" data-testid="nexus-file-input" />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="nexus-attach"
                title={lang === 'en' ? 'Attach document' : 'Adjuntar documento'}
                className="w-11 h-11 rounded-2xl bg-white/70 border border-[#7C5CFF]/15 hover:border-[#7C5CFF]/40 hover:bg-white text-[#7C5CFF] disabled:opacity-40 flex items-center justify-center transition-all">
                <Paperclip className={`w-4 h-4 ${uploading ? 'animate-pulse' : ''}`} />
              </button>
              <input
                data-testid="nexus-input"
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder={T.placeholder} disabled={loading}
                className="flex-1 px-4 py-3 bg-white/80 border border-[#7C5CFF]/15 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50"
              />
              <button onClick={() => send()} disabled={loading || !input.trim()} data-testid="nexus-send"
                className="w-11 h-11 rounded-2xl bg-[#7C5CFF] hover:bg-[#6A4BE5] disabled:opacity-40 text-white flex items-center justify-center transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Agents panel */}
        <aside className="lg:col-span-3 space-y-2 max-h-[75vh] overflow-auto" data-testid="nexus-agents">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A8A9E] px-1 mb-1">{lang === 'en' ? 'Council' : 'Consejo'}</div>
          {agents.map((a) => (
            <button key={a.id} onClick={() => setForceAgent(a.id === forceAgent ? null : a.id)}
              data-testid={`agent-card-${a.id}`}
              className={`w-full text-left p-3 rounded-2xl transition-all border ${forceAgent === a.id ? 'border-[#7C5CFF] bg-[#7C5CFF]/8' : 'border-[#7C5CFF]/10 bg-white/60 hover:border-[#7C5CFF]/30'}`}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${a.color}18` }}>{a.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-sm text-[#0F0F13]">{a.name}</div>
                  <div className="text-[10px] text-[#8A8A9E] truncate">{a.role}</div>
                </div>
              </div>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default Nexus;
