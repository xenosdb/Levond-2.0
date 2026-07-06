// LEVOND TRAVEL OS — App catalog
// Travel-agency modules only. AI assistant = Azumi.
import {
  Users, FileText, Plane, Megaphone, Brain,
  Mail, Phone, Plug, Truck, Building2, BarChart3, Activity,
  Sparkles, Kanban, CalendarCheck, Wand2, Palette, TrendingUp, CalendarDays, ImageIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

// status: 'live' | 'partial' | 'soon'
export const APP_CATEGORIES = [
  {
    id: 'azumi',
    title: { es: 'Azumi', en: 'Azumi' },
    accent: '#7C3AED',
    apps: [
      { id: 'azumi', name: 'Azumi AI', en: 'Azumi AI', desc: { es: 'Copiloto IA de tu agencia', en: 'AI copilot for your agency' }, Icon: Brain, status: 'live', route: '/app/nexus' },
      { id: 'intelligence', name: 'Hub Analítico', en: 'Analytics Hub', desc: { es: 'Análisis de negocio con IA', en: 'AI business analytics' }, Icon: Activity, status: 'soon' },
      { id: 'insights', name: 'Insights', en: 'Insights', desc: { es: 'Sugerencias proactivas de Azumi', en: 'Proactive Azumi insights' }, Icon: Sparkles, status: 'soon' },
    ],
  },
  {
    id: 'operation',
    title: { es: 'Operación', en: 'Operations' },
    accent: '#8B5CF6',
    apps: [
      { id: 'clients', name: 'Clientes', en: 'Clients', desc: { es: 'Ficha 360° del viajero', en: '360° traveler profile' }, Icon: Users, status: 'live', route: '/app/contacts' },
      { id: 'crm', name: 'Pipeline & Tareas', en: 'Pipeline & Tasks', desc: { es: 'CRM de leads con automatización IA', en: 'AI lead pipeline & tasks' }, Icon: Kanban, status: 'live', route: '/app/crm' },
      { id: 'mailbox', name: 'Mailbox', en: 'Mailbox', desc: { es: 'Conversaciones unificadas por email', en: 'Unified email inbox' }, Icon: Mail, status: 'soon' },
      { id: 'callcenter', name: 'Call Center', en: 'Call Center', desc: { es: 'Llamadas entrantes y salientes', en: 'Inbound & outbound calls' }, Icon: Phone, status: 'soon' },
      { id: 'suppliers', name: 'Catálogo', en: 'Catalog', desc: { es: 'Productos y proveedores', en: 'Products & suppliers' }, Icon: Truck, status: 'soon' },
      { id: 'integrations', name: 'Integraciones', en: 'Integrations', desc: { es: 'Conecta APIs externas', en: 'Connect external APIs' }, Icon: Plug, status: 'soon' },
    ],
  },
  {
    id: 'sales',
    title: { es: 'Ventas', en: 'Sales' },
    accent: '#EC4899',
    apps: [
      { id: 'bookings', name: 'Reservas', en: 'Bookings', desc: { es: 'Reservas confirmadas y en curso', en: 'Confirmed & ongoing bookings' }, Icon: CalendarCheck, status: 'live', route: '/app/travel' },
      { id: 'proposals', name: 'Propuestas', en: 'Proposals', desc: { es: 'Editor y envío de propuestas', en: 'Proposal editor & sending' }, Icon: FileText, status: 'soon' },
    ],
  },
  {
    id: 'marketing',
    title: { es: 'Marketing', en: 'Marketing' },
    accent: '#F59E0B',
    apps: [
      { id: 'marketing', name: 'Glitch Studio', en: 'Glitch Studio', desc: { es: 'Contenido y campañas con IA', en: 'AI content & campaigns' }, Icon: Megaphone, status: 'soon' },
      { id: 'image_studio', name: 'Image Studio', en: 'Image Studio', desc: { es: 'Genera imágenes con IA', en: 'AI image generation' }, Icon: Palette, status: 'soon' },
      { id: 'performance', name: 'Rendimiento', en: 'Performance', desc: { es: 'Métricas de campañas', en: 'Campaign metrics' }, Icon: TrendingUp, status: 'soon' },
      { id: 'calendar', name: 'Calendario', en: 'Calendar', desc: { es: 'Agenda de publicaciones', en: 'Publishing calendar' }, Icon: CalendarDays, status: 'soon' },
      { id: 'library', name: 'Biblioteca', en: 'Library', desc: { es: 'Activos creativos', en: 'Creative assets' }, Icon: ImageIcon, status: 'soon' },
    ],
  },
  {
    id: 'webstudio',
    title: { es: 'Web Studio', en: 'Web Studio' },
    accent: '#06B6D4',
    apps: [
      { id: 'web_studio', name: 'Web Studio', en: 'Web Studio', desc: { es: 'Sitios y landings con IA', en: 'AI sites & landing pages' }, Icon: Wand2, status: 'soon' },
    ],
  },
  {
    id: 'company',
    title: { es: 'Empresa', en: 'Company' },
    accent: '#64748B',
    apps: [
      { id: 'settings', name: 'Configuración', en: 'Settings', desc: { es: 'Equipo, marca y permisos', en: 'Team, brand & permissions' }, Icon: SettingsIcon, status: 'live', route: '/app/settings' },
      { id: 'reports', name: 'Reportes', en: 'Reports', desc: { es: 'Métricas de rendimiento', en: 'Performance metrics' }, Icon: BarChart3, status: 'soon' },
      { id: 'usage', name: 'Uso detallado', en: 'Usage', desc: { es: 'Consumo de la agencia', en: 'Agency usage' }, Icon: Activity, status: 'soon' },
    ],
  },
];

// Flat list helper for sidebar / launcher
export const ALL_APPS = APP_CATEGORIES.flatMap((c) => c.apps.map((a) => ({ ...a, categoryId: c.id, categoryAccent: c.accent })));
export const LIVE_APPS = ALL_APPS.filter((a) => a.status === 'live' || a.status === 'partial');
