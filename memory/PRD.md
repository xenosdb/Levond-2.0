
## Update (2026-07-06) — Travel CRM replacement
- Replaced the old ERP lead-CRM with the Levond Travel OS **Kanban Pipeline CRM** (ported from user's `levond-travel-os.zip`, originally Vite+TS+Supabase → reimplemented in React JS + FastAPI + Mongo).
- New CRM (`/app/crm`, `src/pages/TravelCRM.jsx`): 6-stage drag-and-drop pipeline (lead→quote→followup→closing→won→lost), stat cards, Lead dialog, Tasks tab with **AI stage-automations** (moving a lead auto-creates follow-up tasks with due/remind dates & priority).
- Old CRM (`Modules.jsx > CRM`) removed from routing (dead code kept in file). Sidebar "CRM Travel" now points to `/app/crm`.
- AI section (Nexus/Azumi) left fully intact.
- Backend: extended `LeadIn` (title/contact_*/stage/estimated_value/destination/pax/source/position…), added `crm_tasks` collection + endpoints (`/api/crm/tasks` GET/POST/PATCH/DELETE + `/bulk`), added crm_tasks to export, reseeded demo leads in travel-pipeline format.
- Verified: signup→seed leads (4, correct stages), create lead, bulk task automation, task list — all pass via curl. Frontend compiles clean.
