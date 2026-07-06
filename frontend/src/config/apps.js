// LEVOND — Apps catalog (Odoo-style)
// Central source of truth for both landing catalog and internal sidebar
import {
  Users, FileText, UtensilsCrossed, ShoppingBag, Package, Plane, Megaphone, LayoutTemplate, Brain,
  Globe, ShoppingCart, MessageCircle, GraduationCap, Newspaper, MessagesSquare,
  Repeat, Key, Receipt, Calculator, FileSignature, Wallet, Table2, FolderKanban,
  Factory, TruckIcon, Wrench, ShieldCheck, GitBranch,
  UserCheck, UserPlus, PalmtreeIcon, Star, Car, Handshake,
  Mail, Send, Share2, Calendar, PartyPopper, ClipboardList,
  Headphones, Clock, Zap, CalendarClock, MapPin,
  MessageSquareText, CheckSquare, Wifi, Phone, BookOpen,
  Wand2, PlaneTakeoff
} from 'lucide-react';

// status: 'live' | 'partial' | 'soon'
export const APP_CATEGORIES = [
  {
    id: 'website',
    title: { es: 'Sitio Web', en: 'Website' },
    accent: '#10B981',
    apps: [
      { id: 'website', name: 'Sitio Web', en: 'Website', desc: { es: 'Constructor de sitios web empresariales', en: 'Business website builder' }, Icon: Globe, status: 'soon' },
      { id: 'ecommerce', name: 'Comercio electrónico', en: 'eCommerce', desc: { es: 'Vende tus productos en línea', en: 'Sell products online' }, Icon: ShoppingCart, status: 'soon' },
      { id: 'blog', name: 'Blog', en: 'Blog', desc: { es: 'Publica entradas y noticias', en: 'Publish posts and news' }, Icon: Newspaper, status: 'soon' },
      { id: 'forum', name: 'Foro', en: 'Forum', desc: { es: 'Preguntas y respuestas de la comunidad', en: 'Q&A community' }, Icon: MessagesSquare, status: 'soon' },
      { id: 'elearning', name: 'eLearning', en: 'eLearning', desc: { es: 'Gestiona y publica tus cursos', en: 'Manage and publish courses' }, Icon: GraduationCap, status: 'soon' },
      { id: 'livechat', name: 'Chat en vivo', en: 'Live Chat', desc: { es: 'Chatea con los visitantes de tu web', en: 'Chat with website visitors' }, Icon: MessageCircle, status: 'soon' },
    ],
  },
  {
    id: 'sales',
    title: { es: 'Ventas', en: 'Sales' },
    accent: '#7C5CFF',
    apps: [
      { id: 'contacts', name: 'Contactos', en: 'Contacts', desc: { es: 'Clientes y proveedores unificados', en: 'Unified customers & vendors' }, Icon: UserCheck, status: 'live', route: '/app/contacts' },
      { id: 'crm', name: 'CRM Travel', en: 'Travel CRM', desc: { es: 'Leads y clientes de tu agencia', en: 'Travel agency leads & clients' }, Icon: Users, status: 'live', route: '/app/travel' },
      { id: 'sales', name: 'Ventas', en: 'Sales', desc: { es: 'De cotizaciones a facturas', en: 'From quotes to invoices' }, Icon: FileText, status: 'soon' },
      { id: 'pos_restaurant', name: 'POS Restaurante', en: 'Restaurant POS', desc: { es: 'Mesas, comandas y cocina', en: 'Tables, orders, kitchen' }, Icon: UtensilsCrossed, status: 'live', route: '/app/restaurant' },
      { id: 'pos_retail', name: 'POS Retail', en: 'Retail POS', desc: { es: 'Caja para tiendas y comercios', en: 'Checkout for shops' }, Icon: ShoppingBag, status: 'live', route: '/app/retail' },
      { id: 'subscriptions', name: 'Suscripciones', en: 'Subscriptions', desc: { es: 'Facturas recurrentes y renovaciones', en: 'Recurring billing' }, Icon: Repeat, status: 'soon' },
      { id: 'rental', name: 'Alquiler', en: 'Rental', desc: { es: 'Contratos, entregas y devoluciones', en: 'Rental contracts' }, Icon: Key, status: 'soon' },
    ],
  },
  {
    id: 'finance',
    title: { es: 'Finanzas', en: 'Finance' },
    accent: '#FFB042',
    apps: [
      { id: 'accounting', name: 'Contabilidad', en: 'Accounting', desc: { es: 'Contabilidad financiera y analítica', en: 'Financial & analytical accounting' }, Icon: Calculator, status: 'live', route: '/app/accounting' },
      { id: 'invoicing', name: 'Facturación', en: 'Invoicing', desc: { es: 'Facturas y pagos', en: 'Invoices and payments' }, Icon: Receipt, status: 'live', route: '/app/invoicing' },
      { id: 'expenses', name: 'Gastos', en: 'Expenses', desc: { es: 'Gestiona los gastos de empleados', en: 'Employee expenses' }, Icon: Wallet, status: 'soon' },
      { id: 'documents', name: 'Documentos', en: 'Documents', desc: { es: 'Gestión de documentos', en: 'Document management' }, Icon: FileText, status: 'soon' },
      { id: 'spreadsheets', name: 'Hojas de cálculo', en: 'Spreadsheets', desc: { es: 'Hojas de cálculo colaborativas', en: 'Collaborative spreadsheets' }, Icon: Table2, status: 'soon' },
      { id: 'esign', name: 'Firma electrónica', en: 'eSign', desc: { es: 'Firma documentos en línea', en: 'Sign documents online' }, Icon: FileSignature, status: 'soon' },
    ],
  },
  {
    id: 'inventory',
    title: { es: 'Inventario y Fabricación', en: 'Inventory & Manufacturing' },
    accent: '#8B5CF6',
    apps: [
      { id: 'inventory', name: 'Inventario', en: 'Inventory', desc: { es: 'Stock, almacenes y logística', en: 'Stock, warehouses & logistics' }, Icon: Package, status: 'live', route: '/app/inventory' },
      { id: 'warehouses', name: 'Almacenes', en: 'Warehouses', desc: { es: 'Multi-almacén y transferencias', en: 'Multi-warehouse & transfers' }, Icon: Factory, status: 'live', route: '/app/warehouses' },
      { id: 'manufacturing', name: 'Manufactura', en: 'Manufacturing', desc: { es: 'Órdenes de producción y BOM', en: 'Production orders & BOM' }, Icon: Factory, status: 'soon' },
      { id: 'plm', name: 'Ciclo de vida', en: 'PLM', desc: { es: 'Gestión del ciclo de vida del producto', en: 'Product lifecycle mgmt' }, Icon: GitBranch, status: 'soon' },
      { id: 'purchases', name: 'Compras', en: 'Purchases', desc: { es: 'Órdenes de compra y proveedores', en: 'Purchase orders & vendors' }, Icon: TruckIcon, status: 'live', route: '/app/purchases' },
      { id: 'maintenance', name: 'Mantenimiento', en: 'Maintenance', desc: { es: 'Monitorea equipos y solicitudes', en: 'Equipment & work orders' }, Icon: Wrench, status: 'live', route: '/app/maintenance' },
      { id: 'quality', name: 'Calidad', en: 'Quality', desc: { es: 'Controla la calidad de tus productos', en: 'Product quality control' }, Icon: ShieldCheck, status: 'soon' },
    ],
  },
  {
    id: 'hr',
    title: { es: 'Recursos Humanos', en: 'Human Resources' },
    accent: '#EC4899',
    apps: [
      { id: 'employees', name: 'Empleados', en: 'Employees', desc: { es: 'Centraliza la información de tu equipo', en: 'Team information hub' }, Icon: UserCheck, status: 'soon' },
      { id: 'recruitment', name: 'Reclutamiento', en: 'Recruitment', desc: { es: 'Flujo de contratación', en: 'Hiring pipeline' }, Icon: UserPlus, status: 'soon' },
      { id: 'timeoff', name: 'Vacaciones', en: 'Time Off', desc: { es: 'Solicitudes de tiempo personal', en: 'Leave requests' }, Icon: PalmtreeIcon, status: 'soon' },
      { id: 'appraisals', name: 'Evaluaciones', en: 'Appraisals', desc: { es: 'Evaluación de empleados', en: 'Employee reviews' }, Icon: Star, status: 'soon' },
      { id: 'referrals', name: 'Referencias', en: 'Referrals', desc: { es: 'Programa de referidos internos', en: 'Employee referral program' }, Icon: Handshake, status: 'soon' },
      { id: 'fleet', name: 'Flotilla', en: 'Fleet', desc: { es: 'Gestión de vehículos', en: 'Vehicle management' }, Icon: Car, status: 'soon' },
    ],
  },
  {
    id: 'marketing',
    title: { es: 'Marketing', en: 'Marketing' },
    accent: '#3B82F6',
    apps: [
      { id: 'marketing_auto', name: 'Automatización de Marketing', en: 'Marketing Automation', desc: { es: 'Campañas automatizadas', en: 'Automated campaigns' }, Icon: Zap, status: 'soon' },
      { id: 'email_marketing', name: 'Marketing por Correo', en: 'Email Marketing', desc: { es: 'Diseña y envía correos', en: 'Design & send emails' }, Icon: Mail, status: 'soon' },
      { id: 'sms_marketing', name: 'Marketing por SMS', en: 'SMS Marketing', desc: { es: 'Campañas SMS', en: 'SMS campaigns' }, Icon: Send, status: 'soon' },
      { id: 'social', name: 'Redes Sociales', en: 'Social Media', desc: { es: 'Gestiona tus redes sociales', en: 'Social media manager' }, Icon: Share2, status: 'soon' },
      { id: 'events', name: 'Eventos', en: 'Events', desc: { es: 'Publica eventos y vende boletos', en: 'Publish events & sell tickets' }, Icon: PartyPopper, status: 'soon' },
      { id: 'surveys', name: 'Encuestas', en: 'Surveys', desc: { es: 'Envía encuestas y analiza respuestas', en: 'Send surveys & analyze' }, Icon: ClipboardList, status: 'soon' },
    ],
  },
  {
    id: 'services',
    title: { es: 'Servicios', en: 'Services' },
    accent: '#06B6D4',
    apps: [
      { id: 'travel', name: 'Agencia de Viajes', en: 'Travel Agency', desc: { es: 'Itinerarios, reservas y comisiones', en: 'Itineraries, bookings & commissions' }, Icon: PlaneTakeoff, status: 'live', route: '/app/travel' },
      { id: 'projects', name: 'Proyectos', en: 'Projects', desc: { es: 'Organiza y planea tus proyectos', en: 'Organize and plan projects' }, Icon: FolderKanban, status: 'live', route: '/app/projects' },
      { id: 'timesheets', name: 'Registro de Horas', en: 'Timesheets', desc: { es: 'Monitorea el tiempo en tareas', en: 'Track time on tasks' }, Icon: Clock, status: 'soon' },
      { id: 'field_service', name: 'Servicio Externo', en: 'Field Service', desc: { es: 'Programa operaciones externas', en: 'Schedule field operations' }, Icon: MapPin, status: 'soon' },
      { id: 'helpdesk', name: 'Soporte al Cliente', en: 'Helpdesk', desc: { es: 'Tickets y prioridades', en: 'Customer support tickets' }, Icon: Headphones, status: 'soon' },
      { id: 'planning', name: 'Planeación', en: 'Planning', desc: { es: 'Horarios de tus empleados', en: 'Staff scheduling' }, Icon: CalendarClock, status: 'soon' },
      { id: 'appointments', name: 'Citas', en: 'Appointments', desc: { es: 'Reuniones y agendamiento', en: 'Bookings & appointments' }, Icon: Calendar, status: 'live', route: '/app/appointments' },
    ],
  },
  {
    id: 'productivity',
    title: { es: 'Productividad', en: 'Productivity' },
    accent: '#F59E0B',
    apps: [
      { id: 'discuss', name: 'Conversaciones', en: 'Discuss', desc: { es: 'Chat, correo y canales privados', en: 'Chat, email & channels' }, Icon: MessageSquareText, status: 'soon' },
      { id: 'approvals', name: 'Aprobaciones', en: 'Approvals', desc: { es: 'Solicitudes de aprobación', en: 'Approval requests' }, Icon: CheckSquare, status: 'soon' },
      { id: 'iot', name: 'Internet de las Cosas', en: 'IoT', desc: { es: 'Modelos y asistentes IoT', en: 'IoT models & assistants' }, Icon: Wifi, status: 'soon' },
      { id: 'voip', name: 'VOIP', en: 'VoIP', desc: { es: 'Haz y recibe llamadas', en: 'Make and receive calls' }, Icon: Phone, status: 'soon' },
      { id: 'knowledge', name: 'Artículos', en: 'Knowledge', desc: { es: 'Base de conocimiento interna', en: 'Internal knowledge base' }, Icon: BookOpen, status: 'soon' },
      { id: 'ai', name: 'Azumi IA', en: 'Azumi AI', desc: { es: 'Asistente IA que ejecuta acciones', en: 'AI assistant that takes action' }, Icon: Brain, status: 'live', route: '/app/nexus' },
    ],
  },
  {
    id: 'customize',
    title: { es: 'Personalización', en: 'Customization' },
    accent: '#A855F7',
    apps: [
      { id: 'studio', name: 'Studio', en: 'Studio', desc: { es: 'Crea tus propias aplicaciones sin código', en: 'Build custom apps no-code' }, Icon: Wand2, status: 'soon' },
    ],
  },
];

// Flat list helper for sidebar / launcher
export const ALL_APPS = APP_CATEGORIES.flatMap((c) => c.apps.map((a) => ({ ...a, categoryId: c.id, categoryAccent: c.accent })));
export const LIVE_APPS = ALL_APPS.filter((a) => a.status === 'live' || a.status === 'partial');
