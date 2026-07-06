// LEVOND — 12 languages translation map
export const LANGS = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

const dict = {
  es: {
    nav: { product: 'Producto', modules: 'Módulos', industries: 'Industrias', pricing: 'Precios', signIn: 'Iniciar sesión', tryFree: 'Probar gratis' },
    hero: {
      badge: 'NUEVO — Edición 2026',
      title_a: 'Toda tu operación.',
      title_b: 'Un solo ERP-CRM.',
      title_c: 'Potenciado por IA.',
      subtitle: 'CRM, Ventas, POS para Restaurante y Retail, Inventario multi-almacén, Viajes, Marketing y mucho más — conectados nativamente por inteligencia artificial.',
      ctaPrimary: 'Comenzar gratis',
      ctaSecondary: 'Ver demo en vivo',
      proof: 'Sin tarjeta de crédito · Configurado en 3 minutos',
    },
    marquee: 'Diseñado para restaurantes, retailers, agencias de viajes, servicios profesionales y manufactura',
    modules: {
      eyebrow: 'ECOSISTEMA UNIFICADO',
      title: 'Todo tu negocio en un solo lugar',
      subtitle: 'Olvida tener 8 aplicaciones distintas. LEVOND unifica cada operación con una experiencia consistente y datos sincronizados en tiempo real.',
      items: {
        crm: { title: 'CRM Inteligente', desc: 'Leads, pipeline visual, automatizaciones de seguimiento, scoring con IA y vista 360º del cliente.' },
        sales: { title: 'Ventas & Cotizaciones', desc: 'Propuestas con editor visual, firmas digitales, conversión a factura en un clic.' },
        pos_restaurant: { title: 'POS Restaurante', desc: 'Mesas visuales, comandas, KDS de cocina, división de cuentas, propinas y modificadores.' },
        pos_retail: { title: 'POS Retail', desc: 'Caja con código de barras, devoluciones, descuentos, fidelización y cierre de turno.' },
        inventory: { title: 'Inventario Multi-almacén', desc: 'Stock en tiempo real, lotes y series, transferencias, alertas de mínimo, valoración FIFO.' },
        travel: { title: 'Agencia de Viajes', desc: 'Itinerarios, vuelos, hoteles, comisiones y propuestas multimedia para clientes.' },
        marketing: { title: 'Marketing & Mailbox', desc: 'Campañas email, segmentación, automatizaciones, bandeja unificada WhatsApp/correo.' },
        webstudio: { title: 'Web Studio', desc: 'Constructor web sin código integrado, con productos del catálogo y SEO automático.' },
        ai: { title: 'Asistente IA Nativo', desc: 'Analiza documentos, redacta correos, programa tareas y ejecuta flujos por comando de voz o texto.' },
      },
    },
    industries: {
      eyebrow: 'PARA TODA INDUSTRIA',
      title: 'Hecho para tu vertical',
      items: ['Restaurantes', 'Retail & Tiendas', 'Agencias de viajes', 'Servicios profesionales', 'Manufactura ligera', 'eCommerce'],
    },
    ai: {
      eyebrow: 'IA NATIVA, NO ATORNILLADA',
      title: 'La inteligencia que opera tu negocio',
      subtitle: 'No es un chatbot pegado encima. La IA de LEVOND lee, decide y ejecuta sobre tus datos reales.',
      bullets: [
        'Resume hilos de correo y crea tareas automáticamente',
        'Genera cotizaciones a partir de una conversación',
        'Detecta clientes en riesgo y propone acciones',
        'Reportes diarios automatizados con insights accionables',
      ],
    },
    pricing: {
      eyebrow: 'PRECIOS TRANSPARENTES',
      title: 'Un plan para cada etapa',
      subtitle: 'Empieza gratis. Escala cuando lo necesites.',
      monthly: 'Mensual', yearly: 'Anual', save: 'Ahorra 20%', currency: 'USD', perMonth: '/mes', cta: 'Empezar', ctaPro: 'Probar Pro',
      plans: {
        starter: { name: 'Starter', price: '0', desc: 'Para emprendedores que empiezan', features: ['1 usuario', 'CRM básico', 'Catálogo limitado', '1 idioma'] },
        pro: { name: 'Pro', price: '49', desc: 'Para PYMEs en crecimiento', features: ['10 usuarios', 'Todos los módulos', 'IA con 5,000 consultas', '12 idiomas', 'POS incluido'] },
        business: { name: 'Business', price: '149', desc: 'Para equipos medianos', features: ['50 usuarios', 'Multi-empresa', 'IA ilimitada', 'API y webhooks', 'Soporte prioritario'] },
        enterprise: { name: 'Enterprise', price: 'Custom', desc: 'Para grandes operaciones', features: ['Usuarios ilimitados', 'On-premise opcional', 'SSO + auditoría', 'SLA 99.99%', 'CSM dedicado'] },
      },
    },
    cta: { title: '¿Listo para unificar tu operación?', subtitle: 'Comienza hoy. Sin tarjeta, sin instalaciones, sin curvas de aprendizaje eternas.', primary: 'Crear cuenta gratis', secondary: 'Hablar con ventas' },
    footer: { tagline: 'El sistema operativo inteligente de tu empresa.', product: 'Producto', company: 'Compañía', legal: 'Legal', rights: 'Todos los derechos reservados' },
    auth: {
      login: { title: 'Bienvenido de vuelta', subtitle: 'Accede a tu workspace LEVOND', email: 'Correo electrónico', password: 'Contraseña', forgot: '¿Olvidaste tu contraseña?', submit: 'Iniciar sesión', noAccount: '¿No tienes cuenta?', signup: 'Regístrate gratis', demo: 'Probar con cuenta demo' },
      signup: { title: 'Crea tu workspace', subtitle: 'Empieza en 60 segundos. Sin tarjeta.', name: 'Tu nombre', company: 'Nombre de tu empresa', email: 'Correo electrónico', password: 'Contraseña', submit: 'Crear cuenta', haveAccount: '¿Ya tienes cuenta?', signin: 'Inicia sesión' },
    },
    dash: {
      brand: 'LEVOND',
      tagline: 'Command Center',
      menu: { home: 'Inicio', crm: 'CRM', pos_restaurant: 'POS Restaurante', pos_retail: 'POS Retail', inventory: 'Inventario', travel: 'Viajes', settings: 'Configuración' },
      home: { greeting: 'Hola', welcome: 'Bienvenido a tu Command Center', kpis: { revenue: 'Ingresos del mes', orders: 'Pedidos', customers: 'Clientes activos', stock: 'Productos en stock' }, recent: 'Actividad reciente', quick: 'Acciones rápidas' },
      logout: 'Cerrar sesión',
      common: { new: 'Nuevo', search: 'Buscar...', save: 'Guardar', cancel: 'Cancelar', edit: 'Editar', delete: 'Eliminar', loading: 'Cargando...', empty: 'Aún no hay datos', name: 'Nombre', total: 'Total', status: 'Estado', actions: 'Acciones', confirm: 'Confirmar' },
      crm: { title: 'CRM', leads: 'Leads', clients: 'Clientes', pipeline: 'Pipeline', stages: ['Nuevo', 'Contactado', 'Calificado', 'Ganado', 'Perdido'], addLead: 'Nuevo lead', leadName: 'Nombre del contacto', leadEmail: 'Email', leadPhone: 'Teléfono', leadValue: 'Valor estimado', leadStage: 'Etapa' },
      pos_r: { title: 'POS Restaurante', tables: 'Mesas', table: 'Mesa', free: 'Libre', occupied: 'Ocupada', openTable: 'Abrir mesa', closeTable: 'Cobrar y cerrar', addItem: 'Añadir producto', orderTotal: 'Total cuenta', menu: 'Menú', kitchen: 'Cocina', empty_order: 'Esta mesa no tiene productos' },
      pos_x: { title: 'POS Retail', cart: 'Carrito', addToCart: 'Añadir', checkout: 'Cobrar', subtotal: 'Subtotal', tax: 'Impuestos (19%)', total: 'Total', empty: 'El carrito está vacío', received: 'Cobrado', paid: '¡Venta registrada!' },
      inv: { title: 'Inventario', products: 'Productos', warehouses: 'Almacenes', stock: 'Stock', addProduct: 'Nuevo producto', name: 'Nombre', sku: 'SKU', price: 'Precio', category: 'Categoría' },
      travel: { title: 'Viajes', bookings: 'Reservas', addBooking: 'Nueva reserva', traveler: 'Viajero', destination: 'Destino', dates: 'Fechas', amount: 'Monto', status: 'Estado' },
    },
  },
  en: {
    nav: { product: 'Product', modules: 'Modules', industries: 'Industries', pricing: 'Pricing', signIn: 'Sign in', tryFree: 'Try for free' },
    hero: {
      badge: 'NEW — 2026 Edition',
      title_a: 'Your entire operation.',
      title_b: 'One ERP-CRM.',
      title_c: 'Powered by AI.',
      subtitle: 'CRM, Sales, POS for Restaurant & Retail, multi-warehouse Inventory, Travel, Marketing and more — natively connected by AI.',
      ctaPrimary: 'Start free',
      ctaSecondary: 'Watch live demo',
      proof: 'No credit card · Set up in 3 minutes',
    },
    marquee: 'Built for restaurants, retailers, travel agencies, professional services and light manufacturing',
    modules: {
      eyebrow: 'UNIFIED ECOSYSTEM',
      title: 'Your entire business in one place',
      subtitle: 'Stop juggling 8 different apps. LEVOND unifies every operation with one consistent UX and real-time synced data.',
      items: {
        crm: { title: 'Smart CRM', desc: 'Leads, visual pipeline, follow-up automations, AI scoring and 360° customer view.' },
        sales: { title: 'Sales & Quotes', desc: 'Proposals with visual editor, digital signatures, one-click conversion to invoice.' },
        pos_restaurant: { title: 'Restaurant POS', desc: 'Visual tables, orders, kitchen display, bill splitting, tips and modifiers.' },
        pos_retail: { title: 'Retail POS', desc: 'Barcode checkout, returns, discounts, loyalty and shift closing.' },
        inventory: { title: 'Multi-warehouse Inventory', desc: 'Real-time stock, lots & serials, transfers, min alerts, FIFO valuation.' },
        travel: { title: 'Travel Agency', desc: 'Itineraries, flights, hotels, commissions and multimedia client proposals.' },
        marketing: { title: 'Marketing & Mailbox', desc: 'Email campaigns, segmentation, automations, unified WhatsApp/email inbox.' },
        webstudio: { title: 'Web Studio', desc: 'No-code website builder with catalog products and automatic SEO.' },
        ai: { title: 'Native AI Assistant', desc: 'Reads documents, drafts emails, schedules tasks and executes flows by voice or text.' },
      },
    },
    industries: {
      eyebrow: 'BUILT FOR EVERY VERTICAL',
      title: 'Made for your industry',
      items: ['Restaurants', 'Retail & Shops', 'Travel agencies', 'Professional services', 'Light manufacturing', 'eCommerce'],
    },
    ai: {
      eyebrow: 'AI NATIVE, NOT BOLTED-ON',
      title: 'Intelligence that runs your business',
      subtitle: 'Not a chatbot stuck on top. LEVOND AI reads, decides and executes on your real data.',
      bullets: [
        'Summarizes email threads and creates tasks automatically',
        'Generates quotes from a conversation',
        'Detects at-risk customers and proposes actions',
        'Automated daily reports with actionable insights',
      ],
    },
    pricing: {
      eyebrow: 'TRANSPARENT PRICING', title: 'One plan for every stage', subtitle: 'Start free. Scale when you need to.',
      monthly: 'Monthly', yearly: 'Yearly', save: 'Save 20%', currency: 'USD', perMonth: '/mo', cta: 'Get started', ctaPro: 'Try Pro',
      plans: {
        starter: { name: 'Starter', price: '0', desc: 'For founders getting started', features: ['1 user', 'Basic CRM', 'Limited catalog', '1 language'] },
        pro: { name: 'Pro', price: '49', desc: 'For growing SMBs', features: ['10 users', 'All modules', 'AI with 5,000 queries', '12 languages', 'POS included'] },
        business: { name: 'Business', price: '149', desc: 'For mid-size teams', features: ['50 users', 'Multi-company', 'Unlimited AI', 'API & webhooks', 'Priority support'] },
        enterprise: { name: 'Enterprise', price: 'Custom', desc: 'For large operations', features: ['Unlimited users', 'Optional on-prem', 'SSO + audit', '99.99% SLA', 'Dedicated CSM'] },
      },
    },
    cta: { title: 'Ready to unify your operations?', subtitle: 'Start today. No card, no installs, no endless learning curves.', primary: 'Create free account', secondary: 'Talk to sales' },
    footer: { tagline: 'The intelligent operating system of your company.', product: 'Product', company: 'Company', legal: 'Legal', rights: 'All rights reserved' },
    auth: {
      login: { title: 'Welcome back', subtitle: 'Access your LEVOND workspace', email: 'Email', password: 'Password', forgot: 'Forgot password?', submit: 'Sign in', noAccount: 'No account?', signup: 'Sign up free', demo: 'Try with demo account' },
      signup: { title: 'Create your workspace', subtitle: 'Get started in 60 seconds. No card.', name: 'Your name', company: 'Company name', email: 'Email', password: 'Password', submit: 'Create account', haveAccount: 'Already have an account?', signin: 'Sign in' },
    },
    dash: {
      brand: 'LEVOND', tagline: 'Command Center',
      menu: { home: 'Home', crm: 'CRM', pos_restaurant: 'Restaurant POS', pos_retail: 'Retail POS', inventory: 'Inventory', travel: 'Travel', settings: 'Settings' },
      home: { greeting: 'Hello', welcome: 'Welcome to your Command Center', kpis: { revenue: 'Monthly revenue', orders: 'Orders', customers: 'Active customers', stock: 'Products in stock' }, recent: 'Recent activity', quick: 'Quick actions' },
      logout: 'Sign out',
      common: { new: 'New', search: 'Search...', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', loading: 'Loading...', empty: 'No data yet', name: 'Name', total: 'Total', status: 'Status', actions: 'Actions', confirm: 'Confirm' },
      crm: { title: 'CRM', leads: 'Leads', clients: 'Clients', pipeline: 'Pipeline', stages: ['New', 'Contacted', 'Qualified', 'Won', 'Lost'], addLead: 'New lead', leadName: 'Contact name', leadEmail: 'Email', leadPhone: 'Phone', leadValue: 'Estimated value', leadStage: 'Stage' },
      pos_r: { title: 'Restaurant POS', tables: 'Tables', table: 'Table', free: 'Free', occupied: 'Busy', openTable: 'Open table', closeTable: 'Charge & close', addItem: 'Add item', orderTotal: 'Bill total', menu: 'Menu', kitchen: 'Kitchen', empty_order: 'This table has no items' },
      pos_x: { title: 'Retail POS', cart: 'Cart', addToCart: 'Add', checkout: 'Checkout', subtotal: 'Subtotal', tax: 'Tax (19%)', total: 'Total', empty: 'Cart is empty', received: 'Charged', paid: 'Sale recorded!' },
      inv: { title: 'Inventory', products: 'Products', warehouses: 'Warehouses', stock: 'Stock', addProduct: 'New product', name: 'Name', sku: 'SKU', price: 'Price', category: 'Category' },
      travel: { title: 'Travel', bookings: 'Bookings', addBooking: 'New booking', traveler: 'Traveler', destination: 'Destination', dates: 'Dates', amount: 'Amount', status: 'Status' },
    },
  },
};

const fallback = (override) => ({ ...dict.en, ...override });

dict.pt = fallback({ hero: { ...dict.en.hero, title_a: 'Toda a sua operação.', title_b: 'Um único ERP-CRM.', title_c: 'Impulsionado por IA.', ctaPrimary: 'Começar grátis', ctaSecondary: 'Ver demonstração', subtitle: 'CRM, Vendas, POS para Restaurante e Varejo, Estoque, Viagens, Marketing e mais — conectados nativamente por IA.', proof: 'Sem cartão · Configurado em 3 minutos' }, nav: { ...dict.en.nav, signIn: 'Entrar', tryFree: 'Experimentar grátis', product: 'Produto', modules: 'Módulos', industries: 'Indústrias', pricing: 'Preços' } });
dict.fr = fallback({ hero: { ...dict.en.hero, title_a: 'Toute votre activité.', title_b: 'Un seul ERP-CRM.', title_c: 'Propulsé par l\'IA.', ctaPrimary: 'Commencer gratuitement', ctaSecondary: 'Voir la démo', subtitle: 'CRM, Ventes, POS Restaurant et Détail, Stock multi-entrepôts, Voyages, Marketing — connectés par IA native.', proof: 'Sans carte · Configuré en 3 minutes' }, nav: { ...dict.en.nav, signIn: 'Connexion', tryFree: 'Essai gratuit', product: 'Produit', modules: 'Modules', industries: 'Industries', pricing: 'Tarifs' } });
dict.de = fallback({ hero: { ...dict.en.hero, title_a: 'Ihr gesamter Betrieb.', title_b: 'Ein ERP-CRM.', title_c: 'Mit KI verbunden.', ctaPrimary: 'Kostenlos starten', ctaSecondary: 'Demo ansehen', subtitle: 'CRM, Vertrieb, POS Restaurant & Retail, Multi-Lager-Inventar, Reisen, Marketing — verbunden durch native KI.', proof: 'Keine Karte · In 3 Minuten eingerichtet' }, nav: { ...dict.en.nav, signIn: 'Anmelden', tryFree: 'Kostenlos testen', product: 'Produkt', modules: 'Module', industries: 'Branchen', pricing: 'Preise' } });
dict.it = fallback({ hero: { ...dict.en.hero, title_a: 'Tutta la tua operatività.', title_b: 'Un solo ERP-CRM.', title_c: 'Potenziato dall\'IA.', ctaPrimary: 'Inizia gratis', ctaSecondary: 'Guarda la demo', subtitle: 'CRM, Vendite, POS Ristorante e Retail, Magazzino multi-deposito, Viaggi, Marketing — connessi da IA nativa.', proof: 'Senza carta · Configurato in 3 minuti' }, nav: { ...dict.en.nav, signIn: 'Accedi', tryFree: 'Prova gratis', product: 'Prodotto', modules: 'Moduli', industries: 'Settori', pricing: 'Prezzi' } });
dict.zh = fallback({ hero: { ...dict.en.hero, title_a: '您的全部业务。', title_b: '一个 ERP-CRM。', title_c: 'AI 驱动。', ctaPrimary: '免费开始', ctaSecondary: '观看演示', subtitle: 'CRM、销售、餐厅及零售 POS、多仓库库存、旅游、营销，由原生 AI 连接。', proof: '无需信用卡 · 3 分钟设置' }, nav: { ...dict.en.nav, signIn: '登录', tryFree: '免费试用', product: '产品', modules: '模块', industries: '行业', pricing: '价格' } });
dict.ja = fallback({ hero: { ...dict.en.hero, title_a: '事業のすべて。', title_b: '1つのERP-CRM。', title_c: 'AIで動く。', ctaPrimary: '無料で始める', ctaSecondary: 'デモを見る', subtitle: 'CRM、販売、レストラン・小売POS、マルチ倉庫在庫、旅行、マーケティングをネイティブAIで接続。', proof: 'クレジットカード不要 · 3分でセットアップ' }, nav: { ...dict.en.nav, signIn: 'ログイン', tryFree: '無料で試す', product: '製品', modules: 'モジュール', industries: '業界', pricing: '料金' } });
dict.ko = fallback({ hero: { ...dict.en.hero, title_a: '전체 비즈니스.', title_b: '하나의 ERP-CRM.', title_c: 'AI로 작동.', ctaPrimary: '무료로 시작', ctaSecondary: '데모 보기', subtitle: 'CRM, 영업, 레스토랑/리테일 POS, 멀티 창고 재고, 여행, 마케팅 — 네이티브 AI로 연결.', proof: '카드 불필요 · 3분 설정' }, nav: { ...dict.en.nav, signIn: '로그인', tryFree: '무료 체험', product: '제품', modules: '모듈', industries: '산업', pricing: '요금제' } });
dict.ar = fallback({ hero: { ...dict.en.hero, title_a: 'كل عملياتك.', title_b: 'ERP-CRM واحد.', title_c: 'مدعوم بالذكاء الاصطناعي.', ctaPrimary: 'ابدأ مجانًا', ctaSecondary: 'شاهد العرض', subtitle: 'CRM والمبيعات و POS للمطاعم والتجزئة والمخزون والسفر والتسويق — موصولة بذكاء اصطناعي أصلي.', proof: 'بدون بطاقة · يُعد في 3 دقائق' }, nav: { ...dict.en.nav, signIn: 'تسجيل الدخول', tryFree: 'جرّب مجاناً', product: 'المنتج', modules: 'الوحدات', industries: 'الصناعات', pricing: 'الأسعار' } });
dict.ru = fallback({ hero: { ...dict.en.hero, title_a: 'Вся ваша работа.', title_b: 'Один ERP-CRM.', title_c: 'На базе ИИ.', ctaPrimary: 'Начать бесплатно', ctaSecondary: 'Смотреть демо', subtitle: 'CRM, продажи, POS для ресторанов и ритейла, мульти-складской учёт, путешествия, маркетинг — нативно связано ИИ.', proof: 'Без карты · Настройка за 3 минуты' }, nav: { ...dict.en.nav, signIn: 'Войти', tryFree: 'Попробовать', product: 'Продукт', modules: 'Модули', industries: 'Индустрии', pricing: 'Цены' } });
dict.nl = fallback({ hero: { ...dict.en.hero, title_a: 'Je hele bedrijf.', title_b: 'Eén ERP-CRM.', title_c: 'Aangedreven door AI.', ctaPrimary: 'Gratis beginnen', ctaSecondary: 'Demo bekijken', subtitle: 'CRM, Sales, POS voor Restaurant en Retail, multi-magazijn voorraad, reizen, marketing — verbonden door native AI.', proof: 'Geen creditcard · In 3 minuten klaar' }, nav: { ...dict.en.nav, signIn: 'Inloggen', tryFree: 'Gratis proberen', product: 'Product', modules: 'Modules', industries: 'Sectoren', pricing: 'Prijzen' } });

export const translations = dict;
export const getDir = (code) => (code === 'ar' ? 'rtl' : 'ltr');
