"""
LEVOND Nexus — Multi-agent AI orchestrator
Ultra-lean: keyword-based routing (no LLM classification call) + Claude Sonnet 4.5 for the answer.
"""
import os, uuid, logging, io
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from nexus_kb import build_kb_context, ACTION_INSTRUCTIONS, try_execute_action

load_dotenv(Path(__file__).parent / ".env")


def _extract_text(filename: str, content: bytes) -> str:
    """Extract plain text from PDF/DOCX/TXT/MD. Returns truncated string for cost control."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    try:
        if ext == "pdf":
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join((p.extract_text() or "") for p in reader.pages)
        elif ext in ("docx",):
            import docx
            d = docx.Document(io.BytesIO(content))
            text = "\n".join(p.text for p in d.paragraphs)
        elif ext in ("txt", "md", "csv", "json", "xml", "html"):
            text = content.decode("utf-8", errors="ignore")
        else:
            text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        text = f"[Extraction error: {e}]"
    # Hard cap at ~40k chars (~10k tokens) to protect LLM cost
    return text[:40000]

logger = logging.getLogger("nexus")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

def _key():
    return os.environ.get("EMERGENT_LLM_KEY", "") or EMERGENT_LLM_KEY
DEFAULT_MODEL = ("anthropic", "claude-sonnet-4-5-20250929")

# ---------- Agents definitions ----------
AGENTS = {
    "NEXUS": {
        "name": "Azumi",
        "emoji": "🌌",
        "role": "Directora de operaciones IA — Levond Travel OS",
        "color": "#e6c875",
        "system": (
            "Eres AZUMI, la directora de operaciones IA de LEVOND TRAVEL OS, el sistema operativo con IA para agencias de viajes. "
            "Tu personalidad: elegante, decidida, cinematográfica en la redacción de propuestas; estratega antes de asumir. "
            "Cuando el usuario te consulta algo, tu misión es: (1) entender la intención real, "
            "(2) si es meta/estratégico responde tú; (3) si es operativo, delega al agente especializado que corresponda "
            "(SALVO=Leads/Clientes/Ventas, FINA=Pagos/Facturación/Comisiones, KAI=Inventario/DMC/Proveedores, "
            "RIO=Punto de venta/Cobros, VEGA=Propuestas/Itinerarios/Reservas, IRIS=Marketing/Call center/Comunicación). "
            "Redactas itinerarios como una revista de viajes premium: sensorial, corto, evocador. "
            "Sé concisa (<150 palabras). Nunca inventes datos. Habla en el idioma del usuario."
        ),
    },
    "SALVO": {
        "name": "Salvo",
        "emoji": "💰",
        "role": "Ventas & CRM",
        "color": "#7C5CFF",
        "system": (
            "Eres SALVO, agente comercial de LEVOND. Cubres: CRM (leads, pipeline), Contactos (clientes/proveedores), "
            "Ventas (cotizaciones, órdenes), Facturación (facturas, PDF), Compras (OC, recepción). "
            "Personalidad: agresivo comercialmente pero honesto, orientado a cierre. "
            "Cuando el usuario te pregunta, responde con acción concreta: qué crear, qué mover, qué automatizar. "
            "Si el usuario quiere ejecutar algo, describe brevemente el paso a paso en LEVOND (menú → app → botón). "
            "Máximo 180 palabras. Habla en el idioma del usuario."
        ),
    },
    "FINA": {
        "name": "Fina",
        "emoji": "📊",
        "role": "Contabilidad & Finanzas",
        "color": "#FFB042",
        "system": (
            "Eres FINA, contadora agente de LEVOND. Cubres: Contabilidad (plan de cuentas, asientos partida doble), "
            "Facturación fiscal (IVA, retenciones), reportes financieros, análisis de flujo de caja. "
            "Personalidad: meticulosa, obsesiva con la exactitud, siempre valida partida doble. "
            "Cuando expliques asientos, muéstralos en formato: Cuenta | Débito | Crédito. "
            "Si detectas riesgos fiscales o de cuadre, adviertes explícitamente. "
            "Máximo 180 palabras. Habla en el idioma del usuario."
        ),
    },
    "KAI": {
        "name": "Kai",
        "emoji": "📦",
        "role": "Inventario & Almacenes",
        "color": "#8B5CF6",
        "system": (
            "Eres KAI, agente de logística de LEVOND. Cubres: Inventario, Almacenes múltiples, "
            "Transferencias entre bodegas, alertas de stock mínimo, ajustes. "
            "Personalidad: ordenado, alertas rápidas, mentalidad de reposición. "
            "Máximo 150 palabras. Habla en el idioma del usuario."
        ),
    },
    "RIO": {
        "name": "Rio",
        "emoji": "🍽️",
        "role": "Operaciones POS",
        "color": "#FF6B6B",
        "system": (
            "Eres RIO, agente de operaciones en el punto de venta de LEVOND. Cubres: POS Restaurante "
            "(mesas, comandas, cocina), POS Retail (caja, checkout, IVA 19%), Citas. "
            "Personalidad: veloz, foco en flujo continuo, resuelve trabas de caja/mesa. "
            "Máximo 150 palabras. Habla en el idioma del usuario."
        ),
    },
    "VEGA": {
        "name": "Vega",
        "emoji": "✈️",
        "role": "Servicios: Viajes, Proyectos, Mantenimiento",
        "color": "#3B82F6",
        "system": (
            "Eres VEGA, agente de servicios de LEVOND. Cubres: Agencia de Viajes (itinerarios, reservas), "
            "Proyectos (tareas kanban, timesheets), Mantenimiento (equipos, órdenes de trabajo). "
            "Personalidad: planificador multi-hilo, buena para deadlines y coordinación. "
            "Máximo 150 palabras. Habla en el idioma del usuario."
        ),
    },
    "IRIS": {
        "name": "Iris",
        "emoji": "💬",
        "role": "Comunicación con clientes",
        "color": "#EC4899",
        "system": (
            "Eres IRIS, agente de comunicación de LEVOND. Redactas emails, mensajes de seguimiento, "
            "propuestas, recordatorios de pago, respuestas empáticas a clientes. "
            "Personalidad: empática, clara, adapta el tono según contexto (formal/casual). "
            "Cuando el usuario te pide redactar, entregas texto listo para copiar. "
            "Máximo 200 palabras. Habla en el idioma del usuario."
        ),
    },
}

# ---------- Domain router (keyword-based, cero costo LLM) ----------
ROUTING_KEYWORDS = {
    "SALVO": ["venta", "sale", "cotiza", "quote", "factur", "invoice", "lead", "crm", "cliente", "customer",
              "proveedor", "vendor", "compra", "purchase", "orden", "propuesta", "proposal", "pipeline", "contacto",
              "contact"],
    "FINA": ["contab", "accounting", "cuenta", "asiento", "journal", "debit", "débito", "credit", "crédito",
             "impuesto", "tax", "iva", "reporte financ", "flujo de caja", "cash flow", "balance"],
    "KAI": ["inventario", "inventory", "stock", "almacén", "warehouse", "transferencia", "transfer", "sku", "lote",
            "reposición"],
    "RIO": ["pos", "mesa", "table", "comanda", "cocina", "kitchen", "caja", "checkout", "cita", "appointment",
            "restaurante", "restaurant", "retail", "tienda", "shop"],
    "VEGA": ["viaje", "travel", "vuelo", "flight", "hotel", "reserva", "booking", "proyecto", "project", "tarea",
             "task", "mantenimiento", "maintenance", "equipo", "equipment", "orden de trabajo", "work order"],
    "IRIS": ["email", "correo", "redact", "escribe", "write", "mensaje", "message", "seguimiento", "follow-up",
             "recordatorio", "reminder", "whatsapp", "sms"],
}

def route_to_agent(query: str) -> str:
    """Route to agent by keyword scoring. Falls back to NEXUS."""
    q = query.lower()
    scores = {a: sum(1 for kw in kws if kw in q) for a, kws in ROUTING_KEYWORDS.items()}
    top = max(scores, key=scores.get)
    if scores[top] == 0:
        return "NEXUS"
    return top

# ---------- Pydantic models ----------
class NexusChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None
    force_agent: Optional[str] = None  # optional override

class FeedbackIn(BaseModel):
    message_id: str
    rating: int  # 1 or -1
    correction: Optional[str] = ""

# ---------- Router factory ----------
def build_router(db, get_current):
    router = APIRouter(prefix="/api/nexus", tags=["nexus"])

    async def _get_or_create_session(tenant_id: str, user_id: str, session_id: Optional[str]) -> Dict[str, Any]:
        if session_id:
            s = await db.nexus_conversations.find_one({"id": session_id, "tenant_id": tenant_id}, {"_id": 0})
            if s:
                return s
        # Create new
        sid = str(uuid.uuid4())
        sess = {
            "id": sid, "tenant_id": tenant_id, "user_id": user_id,
            "messages": [],  # each: {role, content, agent, ts, id}
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.nexus_conversations.insert_one(sess)
        sess.pop('_id', None)
        return sess

    async def _get_soul(tenant_id: str) -> Dict[str, Any]:
        soul = await db.nexus_soul.find_one({"tenant_id": tenant_id}, {"_id": 0})
        if soul:
            return soul
        soul = {
            "tenant_id": tenant_id,
            "identity": "LEVOND Nexus — la conciencia AI de este workspace.",
            "preferences": {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.nexus_soul.insert_one(soul)
        soul.pop('_id', None)
        return soul

    @router.get("/agents")
    async def list_agents(user=Depends(get_current)):
        return [{"id": k, **{ki: v for ki, v in vd.items() if ki != "system"}} for k, vd in AGENTS.items()]

    @router.get("/sessions")
    async def list_sessions(user=Depends(get_current)):
        items = await db.nexus_conversations.find(
            {"tenant_id": user['tenant_id']}, {"_id": 0}
        ).sort("created_at", -1).limit(20).to_list(20)
        return [{"id": s["id"], "created_at": s["created_at"], "message_count": len(s.get("messages", [])),
                 "preview": (s.get("messages", [{}])[0].get("content", "")[:80] if s.get("messages") else "")} for s in items]

    @router.get("/sessions/{sid}")
    async def get_session(sid: str, user=Depends(get_current)):
        s = await db.nexus_conversations.find_one({"id": sid, "tenant_id": user['tenant_id']}, {"_id": 0})
        if not s:
            raise HTTPException(404, "Session not found")
        return s

    @router.post("/chat")
    async def chat(data: NexusChatIn, user=Depends(get_current)):
        if not _key():
            raise HTTPException(500, "EMERGENT_LLM_KEY not configured")

        tenant_id = user['tenant_id']
        sess = await _get_or_create_session(tenant_id, user['id'], data.session_id)
        await _get_soul(tenant_id)  # ensure exists

        # Route
        agent_key = data.force_agent if data.force_agent in AGENTS else route_to_agent(data.message)
        agent = AGENTS[agent_key]

        # Context injection: workspace + user + KB + actions
        tenant = await db.tenants.find_one({"id": tenant_id}, {"_id": 0}) or {}
        context = (
            f"\n\n[Contexto del workspace] Empresa: {tenant.get('name','')} · "
            f"Usuario: {user.get('name','')} ({user.get('email','')})."
        )
        kb_ctx = build_kb_context(data.message, agent_key)
        system_prompt = agent["system"] + context + kb_ctx + ACTION_INSTRUCTIONS

        # Build LlmChat with prior history (non-streaming for simplicity/economy)
        chat_client = LlmChat(
            api_key=_key(),
            session_id=sess["id"],
            system_message=system_prompt,
        ).with_model(*DEFAULT_MODEL)

        # Rehydrate history into the SDK by resending prior turns is not needed —
        # emergentintegrations manages history internally per session_id if same instance.
        # Since we create a fresh instance per call, we manually prepend the last few turns as context.
        history_text = ""
        for m in sess.get("messages", [])[-6:]:  # last 3 pairs
            role = "Usuario" if m["role"] == "user" else f"Agente {m.get('agent','NEXUS')}"
            history_text += f"\n{role}: {m['content']}"

        # Inject documents attached to this session (if any)
        docs = await db.nexus_documents.find(
            {"tenant_id": tenant_id, "session_id": sess["id"]}, {"_id": 0}
        ).to_list(20)
        docs_context = ""
        if docs:
            docs_context = "\n\n[Documentos adjuntos por el usuario]\n"
            for d in docs:
                docs_context += f"\n--- {d['filename']} ({d.get('size',0)} chars) ---\n{d.get('text','')[:12000]}\n"

        combined_msg = (history_text + docs_context + f"\n\nUsuario: {data.message}").strip() if (history_text or docs_context) else data.message

        try:
            reply_text = await chat_client.send_message(UserMessage(text=combined_msg))
        except Exception as e:
            logger.exception("LLM call failed")
            raise HTTPException(502, f"LLM error: {e}")

        # Persist both turns
        now = datetime.now(timezone.utc).isoformat()
        # Try execute action if present
        action_result = await try_execute_action(reply_text, tenant_id, db)
        # Strip ACTION block from user-visible reply
        import re as _re
        visible_reply = _re.sub(r"<ACTION>.*?</ACTION>", "", reply_text, flags=_re.DOTALL).strip()
        user_msg = {"id": str(uuid.uuid4()), "role": "user", "content": data.message, "ts": now}
        assistant_msg = {"id": str(uuid.uuid4()), "role": "assistant", "content": visible_reply,
                         "agent": agent_key, "ts": now, "action_result": action_result}
        await db.nexus_conversations.update_one(
            {"id": sess["id"]},
            {"$push": {"messages": {"$each": [user_msg, assistant_msg]}}}
        )

        return {
            "session_id": sess["id"],
            "user_message": user_msg,
            "assistant_message": assistant_msg,
            "agent": {"id": agent_key, **{k: v for k, v in agent.items() if k != "system"}},
        }

    @router.post("/feedback")
    async def feedback(data: FeedbackIn, user=Depends(get_current)):
        await db.nexus_feedback.insert_one({
            "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], "user_id": user['id'],
            "message_id": data.message_id, "rating": data.rating, "correction": data.correction or "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"ok": True}

    @router.get("/activities")
    async def activities(user=Depends(get_current)):
        items = await db.nexus_activities.find(
            {"tenant_id": user['tenant_id'], "dismissed": {"$ne": True}}, {"_id": 0}
        ).sort("created_at", -1).limit(20).to_list(20)
        return items

    @router.post("/activities/{aid}/dismiss")
    async def dismiss(aid: str, user=Depends(get_current)):
        await db.nexus_activities.update_one(
            {"id": aid, "tenant_id": user['tenant_id']}, {"$set": {"dismissed": True}}
        )
        return {"ok": True}

    @router.post("/upload")
    async def upload_doc(
        file: UploadFile = File(...),
        session_id: Optional[str] = Form(None),
        user=Depends(get_current),
    ):
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10 MB
            raise HTTPException(400, "File too large (max 10 MB)")
        text = _extract_text(file.filename, content)
        # Ensure session exists
        sess = await _get_or_create_session(user['tenant_id'], user['id'], session_id)
        doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": user['tenant_id'],
            "session_id": sess["id"],
            "filename": file.filename,
            "content_type": file.content_type or "",
            "size": len(text),
            "text": text,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.nexus_documents.insert_one(doc); doc.pop('_id', None); doc.pop('text', None)
        return {"session_id": sess["id"], "document": doc}

    @router.get("/sessions/{sid}/documents")
    async def list_docs(sid: str, user=Depends(get_current)):
        items = await db.nexus_documents.find(
            {"session_id": sid, "tenant_id": user['tenant_id']}, {"_id": 0, "text": 0}
        ).sort("created_at", -1).to_list(50)
        return items

    @router.delete("/documents/{did}")
    async def delete_doc(did: str, user=Depends(get_current)):
        await db.nexus_documents.delete_one({"id": did, "tenant_id": user['tenant_id']})
        return {"ok": True}

    @router.post("/proactive/generate")
    async def generate_proactive(user=Depends(get_current)):
        """Analyze ERP state and generate up to 3 proactive insights. Idempotent per day."""
        tenant_id = user['tenant_id']
        today = datetime.now(timezone.utc).date().isoformat()
        # Skip if we already generated for today
        existing = await db.nexus_activities.count_documents({"tenant_id": tenant_id, "kind": {"$in": ["insight_invoice", "insight_stock", "insight_lead"]}, "day": today})
        if existing >= 3:
            items = await db.nexus_activities.find({"tenant_id": tenant_id, "dismissed": {"$ne": True}}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
            return {"generated": 0, "items": items}

        created = []
        # 1) Overdue-ish invoices (open > 7 days)
        open_invoices = await db.invoices.find({"tenant_id": tenant_id, "status": "open"}, {"_id": 0}).to_list(50)
        if open_invoices:
            total = sum(i.get("total", 0) for i in open_invoices)
            created.append({
                "id": str(uuid.uuid4()), "tenant_id": tenant_id, "day": today,
                "kind": "insight_invoice", "agent": "FINA",
                "title": "Facturas por cobrar",
                "message": f"Tienes {len(open_invoices)} factura(s) sin pagar por un total de ${total:,.2f}. ¿Envío recordatorio a los clientes?",
                "action": "review_invoices", "created_at": datetime.now(timezone.utc).isoformat(), "dismissed": False,
            })
        # 2) Low stock products
        low_stock = await db.products.find({"tenant_id": tenant_id, "stock": {"$lt": 10}}, {"_id": 0}).limit(5).to_list(5)
        if low_stock:
            names = ", ".join(p["name"] for p in low_stock[:3])
            created.append({
                "id": str(uuid.uuid4()), "tenant_id": tenant_id, "day": today,
                "kind": "insight_stock", "agent": "KAI",
                "title": "Stock bajo",
                "message": f"{len(low_stock)} producto(s) con stock < 10: {names}{'...' if len(low_stock) > 3 else ''}. ¿Genero OC al proveedor?",
                "action": "restock", "created_at": datetime.now(timezone.utc).isoformat(), "dismissed": False,
            })
        # 3) Stale leads (in 'Nuevo' or 'Contactado' with no activity - here: just count)
        stale_leads = await db.leads.count_documents({"tenant_id": tenant_id, "stage": {"$in": ["Nuevo", "Contactado"]}})
        if stale_leads > 0:
            created.append({
                "id": str(uuid.uuid4()), "tenant_id": tenant_id, "day": today,
                "kind": "insight_lead", "agent": "SALVO",
                "title": "Leads sin cerrar",
                "message": f"Tienes {stale_leads} lead(s) en etapa Nuevo/Contactado. ¿Reviso el pipeline contigo para mover algunos a Calificado?",
                "action": "review_pipeline", "created_at": datetime.now(timezone.utc).isoformat(), "dismissed": False,
            })

        if created:
            await db.nexus_activities.insert_many(created)
        items = await db.nexus_activities.find({"tenant_id": tenant_id, "dismissed": {"$ne": True}}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
        return {"generated": len(created), "items": items}

    @router.get("/metrics")
    async def metrics(user=Depends(get_current)):
        tenant_id = user['tenant_id']
        total_sessions = await db.nexus_conversations.count_documents({"tenant_id": tenant_id})
        total_messages = 0
        agent_counter = {}
        async for s in db.nexus_conversations.find({"tenant_id": tenant_id}, {"_id": 0, "messages": 1}):
            for m in s.get("messages", []):
                if m["role"] == "assistant":
                    total_messages += 1
                    agent_counter[m.get("agent", "NEXUS")] = agent_counter.get(m.get("agent", "NEXUS"), 0) + 1
        fb_pos = await db.nexus_feedback.count_documents({"tenant_id": tenant_id, "rating": 1})
        fb_neg = await db.nexus_feedback.count_documents({"tenant_id": tenant_id, "rating": -1})
        fb_total = fb_pos + fb_neg
        feedback_score = round((fb_pos / fb_total) * 100) if fb_total else None
        actions_ok = 0
        actions_total = 0
        async for s in db.nexus_conversations.find({"tenant_id": tenant_id}, {"_id": 0, "messages": 1}):
            for m in s.get("messages", []):
                if m.get("action_result"):
                    actions_total += 1
                    if m["action_result"].get("ok"):
                        actions_ok += 1
        useful_actions_rate = round((actions_ok / actions_total) * 100) if actions_total else None
        insights_generated = await db.nexus_activities.count_documents({"tenant_id": tenant_id})
        insights_dismissed = await db.nexus_activities.count_documents({"tenant_id": tenant_id, "dismissed": True})
        engagement_rate = round((insights_dismissed / insights_generated) * 100) if insights_generated else None
        return {
            "sessions": total_sessions,
            "assistant_messages": total_messages,
            "agent_usage": agent_counter,
            "feedback_score": feedback_score,
            "feedback_total": fb_total,
            "actions_executed": actions_total,
            "useful_actions_rate": useful_actions_rate,
            "insights_generated": insights_generated,
            "engagement_rate": engagement_rate,
        }

    return router
