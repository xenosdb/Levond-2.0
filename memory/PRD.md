
## Update (2026-07-06) — Travel CRM replacement
- Replaced the old ERP lead-CRM with the Levond Travel OS **Kanban Pipeline CRM** (ported from user's `levond-travel-os.zip`, originally Vite+TS+Supabase → reimplemented in React JS + FastAPI + Mongo).
- New CRM (`/app/crm`, `src/pages/TravelCRM.jsx`): 6-stage drag-and-drop pipeline (lead→quote→followup→closing→won→lost), stat cards, Lead dialog, Tasks tab with **AI stage-automations** (moving a lead auto-creates follow-up tasks with due/remind dates & priority).
- Old CRM (`Modules.jsx > CRM`) removed from routing (dead code kept in file). Sidebar "CRM Travel" now points to `/app/crm`.
- AI section (Nexus/Azumi) left fully intact.
- Backend: extended `LeadIn` (title/contact_*/stage/estimated_value/destination/pax/source/position…), added `crm_tasks` collection + endpoints (`/api/crm/tasks` GET/POST/PATCH/DELETE + `/bulk`), added crm_tasks to export, reseeded demo leads in travel-pipeline format.
- Verified: signup→seed leads (4, correct stages), create lead, bulk task automation, task list — all pass via curl. Frontend compiles clean.

## Update (2026-07-06 #2) — Conversión a Levond Travel OS (quitar ERP)
- El usuario aclaró: el sistema es una AGENCIA DE VIAJES; los módulos ERP (Mantenimiento, Compras, Inventario, Almacenes, Contabilidad, POS Restaurante/Retail, Ventas, Facturación) NO pertenecen y se eliminaron de la navegación.
- Reescrito `config/apps.js` con la estructura EXACTA del ZIP (AppSidebar): grupos Azumi (Azumi AI, Hub Analítico, Insights), Operación (Clientes, Pipeline & Tareas, Mailbox, Call Center, Catálogo, Integraciones), Ventas (Reservas, Propuestas), Marketing (Glitch/Image Studio, Rendimiento, Calendario, Biblioteca), Web Studio, Empresa (Configuración, Reportes, Uso).
- `App.js`: rutas ERP eliminadas; solo Travel OS (contacts=Clientes, crm=Pipeline, travel=Reservas, nexus=Azumi, settings). Catch-all `:module` → nueva página `ComingSoon.jsx` para módulos aún no construidos.
- Sidebar: branding "Command Center" → "Travel OS"; módulos "soon" ahora navegables a ComingSoon.
- IA: la app ya usa "Azumi" en UI (no hay texto "Axion" visible; único "axion" es un nombre de archivo de asset no visible).
- Verificado: frontend compila limpio (200), sin errores. CRM Pipeline (del ZIP) intacto en /app/crm.

### Pendiente (backlog Travel OS — módulos grandes, construir iterativamente)
- Dashboard analítico (KPIs viajes, Bookings Trend, Top Destinations, Revenue Chart, World Map).
- Mailbox, Call Center, Catálogo/Proveedores, Integraciones, Reportes, Uso, Marketing/Glitch Studio, Web Studio.
- Clientes: ficha 360° del viajero (hoy usa Contacts existente).
- Si el usuario comparte el screenshot del CRM original (tema oscuro), ajustar el CRM a ese look exacto.

## Update (2026-07-06 #3) — Dashboard Operativo + ClientsWorldMap + Dark mode
- Portado EXACTO desde el ZIP (Travel OS): `airportCoords.js` (coords + haversine/interpolate/bearing) y la lógica de fases del viaje (`lib/journey.js`: scheduled→pre_departure→outbound_flight→at_destination→return_flight→completed, progreso de vuelo, posiciones).
- `ClientsWorldMap.jsx` (react-leaflet@5 + leaflet, instalados): mapa mundial estilo FlightRadar SIN APIs externas. Aviones rotados por bearing animándose cada 15s, avión en aeropuerto origen en pre_departure, rutas (sólidas en vuelo / punteadas), hoteles activos al llegar a destino, tooltips con cliente/pax/paquete/vuelo/fechas/días restantes.
- `pages/Dashboard.jsx` = Centro de Operaciones (nuevo home `/app`): KPIs (viajes activos, en vuelo, en destino, facturación) + mapa + Calendario de reservas confirmadas (click → modal de detalle completo) + Actividad. TODO desde una sola fuente: `travel_bookings` → Reserva/CRM/Calendario/Dashboard/Mapa sincronizados.
- Dark/Light: `ThemeContext` + botón "Modo oscuro/claro" en sidebar (tailwind darkMode:'class').
- Backend: `BookingIn` extendido (pax, origin, hotel, departure_at, return_at, proposal_number); seed de 4 reservas con fechas relativas a "ahora" para demostrar fases en vivo. AppLauncher movido a `/app/apps`.
- VERIFICADO runtime (headless chromium propio): Dashboard render, leaflet + 3 aviones, 4 reservas en calendario, modal de detalle abre, 0 errores de página.
