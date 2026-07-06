"""
LEVOND AI Operating System — Intelligence Inbox (Bandeja de Inteligencia).
Specialized agents observe tenant data and produce classified, prioritized items
with quick actions + learning + automation suggestions. Reuses the existing
multi-agent identities and runs from the same proactive scheduler.
"""
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends

# Generating agents (specialized) — surfaced on each inbox item
AGENT_META = {
    "AZUMI":     {"label": "Azumi",       "role": "Directora IA / CRM",      "color": "#E6C875"},
    "TRAVEL":    {"label": "Travel AI",   "role": "Viajes & Reservas",        "color": "#3B82F6"},
    "MARKETING": {"label": "Marketing AI","role": "Campañas & Fidelización",  "color": "#EC4899"},
    "FINANCE":   {"label": "Finance AI",  "role": "Finanzas & Cobros",        "color": "#F59E0B"},
    "SALES":     {"label": "Sales AI",    "role": "Pipeline & Leads",         "color": "#7C5CFF"},
    "OPS":       {"label": "Ops AI",      "role": "Operaciones & Riesgos",    "color": "#10B981"},
}

PRIORITY_RANK = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}

def _now():
    return datetime.now(timezone.utc)

def _iso():
    return _now().isoformat()

def _days_until(date_str: str):
    """Days from now until date_str (YYYY-MM-DD or ISO). None if unparseable."""
    if not date_str:
        return None
    try:
        s = str(date_str)[:10]
        d = datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        return (d - _now()).days
    except Exception:
        return None

def _days_until_birthday(birthday: str):
    """Days until next birthday from a YYYY-MM-DD (year ignored)."""
    if not birthday:
        return None
    try:
        b = datetime.strptime(str(birthday)[:10], "%Y-%m-%d")
        today = _now().date()
        nxt = b.replace(year=today.year).date()
        if nxt < today:
            nxt = b.replace(year=today.year + 1).date()
        return (nxt - today).days
    except Exception:
        return None


async def run_scan(db, tenant_id: str) -> list:
    """Run all specialized detectors. Idempotent per (dedup_key, day). Returns new items."""
    today = _now().date().isoformat()
    contacts = await db.contacts.find({"tenant_id": tenant_id}, {"_id": 0}).to_list(2000)
    bookings = await db.travel_bookings.find({"tenant_id": tenant_id}, {"_id": 0}).to_list(2000)
    leads = await db.leads.find({"tenant_id": tenant_id}, {"_id": 0}).to_list(2000)
    invoices = await db.invoices.find({"tenant_id": tenant_id, "status": "open"}, {"_id": 0}).to_list(500)

    # Bookings per traveler (for inactivity / VIP / multiple)
    per_traveler: Dict[str, list] = {}
    for b in bookings:
        per_traveler.setdefault((b.get("traveler") or "").strip(), []).append(b)

    candidates = []

    def add(agent, itype, priority, title, message, dedup, actions=None, meta=None):
        candidates.append({
            "agent": agent, "type": itype, "priority": priority, "title": title,
            "message": message, "dedup_key": dedup,
            "actions": actions or ["approve", "execute", "snooze", "dismiss", "automate"],
            "meta": meta or {},
        })

    # ---- TRAVEL AI: birthdays, passport/visa expiry ----
    for c in contacts:
        name = c.get("name", "Cliente")
        bd = _days_until_birthday(c.get("birthday"))
        if bd is not None and bd <= 14:
            add("TRAVEL", "birthday", "high" if bd <= 7 else "medium",
                f"{name} cumple años en {bd} día(s)",
                f"Alta probabilidad de conversión con una oferta personalizada de fidelidad. Recomiendo enviar una propuesta con descuento.",
                f"birthday:{c.get('id')}", meta={"contact_id": c.get("id"), "contact_name": name})
        pex = _days_until(c.get("passport_expiry"))
        if pex is not None and pex <= 180:
            add("TRAVEL", "passport_expiry", "critical" if pex <= 60 else "high",
                f"Pasaporte de {name} vence en {pex} día(s)",
                f"Esto podría afectar futuras reservas. Recomiendo avisar al cliente para renovar antes de vender un viaje.",
                f"passport:{c.get('id')}", meta={"contact_id": c.get("id"), "contact_name": name})
        vex = _days_until(c.get("visa_expiry"))
        if vex is not None and vex <= 120:
            add("TRAVEL", "visa_expiry", "critical" if vex <= 45 else "high",
                f"Visa de {name} vence en {vex} día(s)",
                f"Verificar vigencia antes de confirmar destinos que requieran visa.",
                f"visa:{c.get('id')}", meta={"contact_id": c.get("id"), "contact_name": name})

    # ---- SALES / MARKETING: VIP, multiple bookings, inactivity ----
    for traveler, bs in per_traveler.items():
        if not traveler:
            continue
        total = sum(float(b.get("amount", 0) or 0) for b in bs)
        if len(bs) >= 2 or total >= 5000:
            add("SALES", "vip_client", "medium",
                f"{traveler} es un cliente VIP",
                f"{len(bs)} reserva(s) por ${total:,.0f}. Recomiendo trato preferente y una propuesta exclusiva.",
                f"vip:{traveler}", meta={"traveler": traveler, "bookings": len(bs), "revenue": total})
        # Inactivity: last booking start_date older than 9 months
        last = max((str(b.get("start_date") or "") for b in bs), default="")
        di = _days_until(last)
        if di is not None and di < -270:
            add("MARKETING", "inactive_client", "medium",
                f"{traveler} lleva {abs(di)//30} meses sin reservar",
                f"Recomiendo una campaña personalizada de reactivación con una oferta a su destino favorito.",
                f"inactive:{traveler}", meta={"traveler": traveler})

    # ---- MARKETING: destination interest cluster (from leads by destination) ----
    dest_count: Dict[str, int] = {}
    for l in leads:
        d = (l.get("destination") or "").strip()
        if d:
            dest_count[d] = dest_count.get(d, 0) + 1
    for dest, n in dest_count.items():
        if n >= 3:
            add("MARKETING", "interest_cluster", "high",
                f"{n} clientes interesados en {dest}",
                f"Podríamos lanzar una campaña específica a {dest} con alta probabilidad de conversión.",
                f"cluster:{dest}", meta={"destination": dest, "count": n})

    # ---- FINANCE: overdue invoices ----
    if invoices:
        total = sum(float(i.get("total", 0) or 0) for i in invoices)
        add("FINANCE", "finance", "high",
            f"{len(invoices)} factura(s) pendientes",
            f"Total ${total:,.2f} por cobrar. Recomiendo enviar recordatorios automáticos a los clientes.",
            f"overdue_invoices:{today}", meta={"count": len(invoices), "total": total})

    # ---- SALES: stale leads ----
    stale = [l for l in leads if l.get("stage") in ("lead", "quote", "Nuevo", "Contactado")]
    if stale:
        add("SALES", "sales", "medium",
            f"{len(stale)} lead(s) sin avanzar",
            f"Hay leads estancados en el pipeline. Recomiendo revisar seguimiento y mover a la siguiente etapa.",
            f"stale_leads:{today}", meta={"count": len(stale)})

    # ---- Persist (dedup by dedup_key not already open) ----
    created = []
    for cand in candidates:
        exists = await db.intelligence.find_one({
            "tenant_id": tenant_id, "dedup_key": cand["dedup_key"],
            "status": {"$in": ["new", "snoozed", "approved"]},
        })
        if exists:
            continue
        # Learning: if user historically automated this type, mark as auto-suggested
        learned = await db.intelligence_learning.find_one({"tenant_id": tenant_id, "type": cand["type"]})
        item = {
            "id": str(uuid.uuid4()), "tenant_id": tenant_id, "day": today,
            **cand, "status": "new", "auto_suggest": bool(learned and learned.get("approvals", 0) >= 3),
            "created_at": _iso(),
        }
        created.append(item)
    if created:
        await db.intelligence.insert_many([{**c} for c in created])
        for c in created:
            c.pop("_id", None)
    return created


def build_router(db, get_current):
    router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])

    @router.get("")
    async def list_items(user=Depends(get_current), status: Optional[str] = "active"):
        q = {"tenant_id": user["tenant_id"]}
        if status == "active":
            q["status"] = {"$in": ["new", "snoozed", "approved"]}
        elif status and status != "all":
            q["status"] = status
        items = await db.intelligence.find(q, {"_id": 0}).to_list(500)
        items.sort(key=lambda x: (PRIORITY_RANK.get(x.get("priority"), 5), x.get("created_at", "")), reverse=False)
        # attach agent meta
        for it in items:
            it["agent_meta"] = AGENT_META.get(it.get("agent"), AGENT_META["AZUMI"])
        # summary
        counts = {}
        for it in items:
            counts[it["priority"]] = counts.get(it["priority"], 0) + 1
        return {"items": items, "counts": counts, "agents": AGENT_META}

    @router.post("/scan")
    async def scan(user=Depends(get_current)):
        created = await run_scan(db, user["tenant_id"])
        return {"generated": len(created)}

    @router.post("/{item_id}/action")
    async def act(item_id: str, body: Dict[str, Any], user=Depends(get_current)):
        action = (body or {}).get("action", "")
        item = await db.intelligence.find_one({"id": item_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
        if not item:
            return {"ok": False, "error": "not found"}
        status_map = {
            "approve": "approved", "execute": "executed", "snooze": "snoozed",
            "dismiss": "dismissed", "delegate": "delegated", "ignore": "dismissed",
            "automate": "automated",
        }
        new_status = status_map.get(action, "new")
        upd = {"status": new_status, "acted_at": _iso(), "acted_by": user["id"], "last_action": action}
        if action == "snooze":
            upd["snooze_until"] = (_now() + timedelta(days=1)).isoformat()
        await db.intelligence.update_one({"id": item_id, "tenant_id": user["tenant_id"]}, {"$set": upd})

        result = {"ok": True, "status": new_status}

        # Learning: count approvals/executions per type; suggest automation after 3
        if action in ("approve", "execute", "automate"):
            learn = await db.intelligence_learning.find_one_and_update(
                {"tenant_id": user["tenant_id"], "type": item["type"]},
                {"$inc": {"approvals": 1}, "$set": {"updated_at": _iso()}},
                upsert=True, return_document=True,
            )
            approvals = (learn or {}).get("approvals", 1)
            if action == "automate":
                await db.intelligence_automations.update_one(
                    {"tenant_id": user["tenant_id"], "type": item["type"]},
                    {"$set": {"type": item["type"], "enabled": True, "created_at": _iso(),
                              "template": {"title": item["title"], "agent": item["agent"]}}},
                    upsert=True,
                )
                result["automated"] = True
            elif approvals >= 3:
                result["suggest_automation"] = True
                result["suggest_message"] = (
                    f"He detectado que sueles aprobar '{item['title']}'. ¿Deseas automatizarlo para futuras ocasiones?"
                )
        return result

    @router.get("/automations")
    async def automations(user=Depends(get_current)):
        items = await db.intelligence_automations.find(
            {"tenant_id": user["tenant_id"], "enabled": True}, {"_id": 0}
        ).to_list(100)
        return items

    @router.delete("/automations/{aid_type}")
    async def del_automation(aid_type: str, user=Depends(get_current)):
        await db.intelligence_automations.update_one(
            {"tenant_id": user["tenant_id"], "type": aid_type}, {"$set": {"enabled": False}}
        )
        return {"ok": True}

    return router
