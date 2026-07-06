"""LEVOND Travel Partners — Independent agency module.
Proposals + Public viewer + Bookings + Catalog (hotels, attractions, airlines).
"""
import os, uuid, secrets
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

def now_iso(): return datetime.now(timezone.utc).isoformat()
def gen_code(): return secrets.token_urlsafe(8).replace("_","").replace("-","")[:10].upper()

class ItineraryDayIn(BaseModel):
    day: int
    date: Optional[str] = ""
    title: str
    description: Optional[str] = ""

class TProposalItemIn(BaseModel):
    kind: str  # hotel | flight | attraction | transport | extra
    name: str
    description: Optional[str] = ""
    qty: int = 1
    unit_price: float = 0
    supplier: Optional[str] = ""

class TProposalIn(BaseModel):
    contact_id: Optional[str] = ""
    contact_name: str
    destination: str
    start_date: str
    end_date: str
    travelers: int = 1
    currency: str = "USD"
    items: List[TProposalItemIn] = []
    itinerary: List[ItineraryDayIn] = []
    markup_pct: float = 0
    notes: Optional[str] = ""

class HotelIn(BaseModel):
    name: str
    city: str
    stars: int = 3
    room_type: Optional[str] = "Standard"
    price_per_night: float = 0
    supplier: Optional[str] = ""

class AttractionIn(BaseModel):
    name: str
    city: str
    category: Optional[str] = "General"
    price: float = 0
    duration_hours: Optional[float] = 2

class AirlineIn(BaseModel):
    name: str
    code: Optional[str] = ""
    origin: str
    destination: str
    price: float = 0

def build_router(db, get_current, get_current_optional=None):
    router = APIRouter(prefix="/api/travel", tags=["travel"])

    def _totals(items, markup):
        sub = sum(i["unit_price"] * i["qty"] for i in items)
        m = sub * (markup / 100.0)
        total = round(sub + m, 2)
        return round(sub, 2), round(m, 2), total

    # ---- Proposals ----
    @router.get("/proposals")
    async def list_proposals(user=Depends(get_current)):
        items = await db.travel_proposals.find({"tenant_id": user['tenant_id']}, {"_id": 0}).sort("created_at", -1).to_list(500)
        return items

    @router.post("/proposals")
    async def create_proposal(data: TProposalIn, user=Depends(get_current)):
        items = [i.model_dump() for i in data.items]
        sub, markup_amt, total = _totals(items, data.markup_pct)
        prop = {
            "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
            "code": gen_code(),
            **data.model_dump(exclude={"items"}),
            "items": items,
            "subtotal": sub, "markup_amount": markup_amt, "total": total,
            "status": "draft",  # draft | sent | accepted | rejected | booked
            "public_views": 0,
            "created_at": now_iso(),
        }
        await db.travel_proposals.insert_one(prop); prop.pop('_id', None)
        return prop

    @router.patch("/proposals/{pid}")
    async def update_proposal(pid: str, data: Dict[str, Any], user=Depends(get_current)):
        data.pop('id', None); data.pop('tenant_id', None); data.pop('code', None)
        if 'items' in data or 'markup_pct' in data:
            p = await db.travel_proposals.find_one({"id": pid, "tenant_id": user['tenant_id']}, {"_id": 0})
            if p:
                items = data.get('items', p.get('items', []))
                mk = data.get('markup_pct', p.get('markup_pct', 0))
                sub, ma, total = _totals(items, mk)
                data.update({"subtotal": sub, "markup_amount": ma, "total": total})
        await db.travel_proposals.update_one({"id": pid, "tenant_id": user['tenant_id']}, {"$set": data})
        return {"ok": True}

    @router.post("/proposals/{pid}/send")
    async def send_proposal(pid: str, user=Depends(get_current)):
        await db.travel_proposals.update_one({"id": pid, "tenant_id": user['tenant_id']}, {"$set": {"status": "sent", "sent_at": now_iso()}})
        p = await db.travel_proposals.find_one({"id": pid, "tenant_id": user['tenant_id']}, {"_id": 0})
        return {"ok": True, "public_url": f"/p/{p['code']}"}

    @router.delete("/proposals/{pid}")
    async def delete_proposal(pid: str, user=Depends(get_current)):
        await db.travel_proposals.delete_one({"id": pid, "tenant_id": user['tenant_id']})
        return {"ok": True}

    # ---- Sales Intelligence: 360° signals + conversion probability + agent recs ----
    def _days_until(date_str):
        if not date_str: return None
        try:
            from datetime import datetime as _dt
            return (_dt.strptime(str(date_str)[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)).days
        except Exception:
            return None

    def _days_until_bday(bd):
        if not bd: return None
        try:
            from datetime import datetime as _dt
            b = _dt.strptime(str(bd)[:10], "%Y-%m-%d"); t = datetime.now(timezone.utc).date()
            nxt = b.replace(year=t.year).date()
            if nxt < t: nxt = b.replace(year=t.year + 1).date()
            return (nxt - t).days
        except Exception:
            return None

    @router.get("/proposals/{pid}/intelligence")
    async def proposal_intelligence(pid: str, user=Depends(get_current)):
        tid = user['tenant_id']
        prop = await db.travel_proposals.find_one({"id": pid, "tenant_id": tid}, {"_id": 0})
        if not prop:
            raise HTTPException(404, "Proposal not found")
        name = prop.get("contact_name", "")
        rx = {"$regex": f"^{name}$", "$options": "i"} if name else "__none__"
        contact = None
        if prop.get("contact_id"):
            contact = await db.contacts.find_one({"id": prop["contact_id"], "tenant_id": tid}, {"_id": 0})
        if not contact and name:
            contact = await db.contacts.find_one({"tenant_id": tid, "name": rx}, {"_id": 0})
        bookings = await db.travel_bookings.find({"tenant_id": tid, "traveler": rx}, {"_id": 0}).to_list(500)
        proposals = await db.travel_proposals.find({"tenant_id": tid, "contact_name": rx}, {"_id": 0}).to_list(500)
        interactions = await db.contact_interactions.find({"tenant_id": tid, "contact_id": (contact or {}).get("id", "__x")}, {"_id": 0}).sort("created_at", -1).to_list(50)

        revenue = sum(float(b.get("amount", 0) or 0) for b in bookings)
        n_bookings = len(bookings)
        accepted = [p for p in proposals if p.get("status") in ("accepted", "booked")]
        rejected = [p for p in proposals if p.get("status") == "rejected"]
        dest_count = {}
        for b in bookings:
            d = (b.get("destination") or "").strip()
            if d: dest_count[d] = dest_count.get(d, 0) + 1
        fav_dest = sorted(dest_count.items(), key=lambda x: -x[1])
        avg_budget = round(revenue / n_bookings, 0) if n_bookings else round(float(prop.get("total", 0) or 0), 0)
        last_int = interactions[0]["created_at"] if interactions else None
        pax = prop.get("travelers", 1)
        vip = bool((contact or {}).get("vip")) or n_bookings >= 2 or revenue >= 5000
        loyalty = "Platino" if revenue >= 15000 else "Oro" if revenue >= 5000 else "Plata" if n_bookings >= 1 else "Nuevo"

        # ---- Deterministic conversion probability ----
        score = 30
        if n_bookings >= 1: score += 15
        if n_bookings >= 3: score += 8
        if vip: score += 10
        if accepted: score += min(15, len(accepted) * 7)
        if rejected: score -= min(15, len(rejected) * 8)
        mk = float(prop.get("markup_pct", 0) or 0)
        if mk <= 10: score += 10
        elif mk <= 20: score += 4
        else: score -= 5
        di = _days_until(max((str(b.get("start_date") or "") for b in bookings), default="")) if bookings else None
        if di is not None and di < -270: score -= 12          # inactive
        if last_int is not None: score += 6                   # recent engagement
        if prop.get("public_views", 0) > 0: score += 6        # opened the proposal
        prob = max(5, min(97, round(score)))

        # ---- Signals (360°) ----
        signals = []
        if n_bookings == 0: signals.append({"icon": "sparkle", "label": "Primera compra", "tone": "info"})
        if vip: signals.append({"icon": "star", "label": "Cliente VIP", "tone": "gold"})
        if n_bookings >= 2: signals.append({"icon": "repeat", "label": f"Cliente frecuente · {n_bookings} viajes", "tone": "purple"})
        bd = _days_until_bday((contact or {}).get("birthday"))
        if bd is not None and bd <= 30: signals.append({"icon": "cake", "label": f"Cumpleaños en {bd}d", "tone": "pink"})
        pex = _days_until((contact or {}).get("passport_expiry"))
        if pex is not None and pex <= 180: signals.append({"icon": "passport", "label": f"Pasaporte vence en {pex}d", "tone": "red" if pex <= 60 else "amber"})
        vex = _days_until((contact or {}).get("visa_expiry"))
        if vex is not None and vex <= 120: signals.append({"icon": "visa", "label": f"Visa vence en {vex}d", "tone": "red" if vex <= 45 else "amber"})
        signals.append({"icon": "money", "label": f"Presupuesto promedio ${int(avg_budget):,}", "tone": "green"})
        if fav_dest: signals.append({"icon": "map", "label": "Destinos favoritos: " + ", ".join(d for d, _ in fav_dest[:3]), "tone": "blue"})
        signals.append({"icon": "loyalty", "label": f"Fidelidad: {loyalty}", "tone": "purple"})
        if last_int: signals.append({"icon": "clock", "label": "Última interacción registrada", "tone": "gray"})

        # ---- Consolidated agent recommendations (single voice = Azumi) ----
        recs = []
        for d, cnt in fav_dest:
            if cnt >= 2:
                near = {"Cancún": "Riviera Maya", "Miami": "Orlando", "Madrid": "Barcelona", "París": "Roma"}.get(d)
                recs.append(f"Ha viajado a {d} {cnt} veces." + (f" Podría interesarle {near}." if near else " Ofrece un destino similar."))
        if pax and pax >= 4:
            recs.append(f"Viaja con {pax} personas. Recomiendo paquetes familiares y habitaciones conectadas.")
        if vip:
            recs.append("Cliente VIP con historial premium: alta probabilidad de aceptar un upgrade de hotel o categoría.")
        if pex is not None and pex <= 180:
            recs.append("Avisar sobre renovación de pasaporte antes de confirmar la venta.")
        if bd is not None and bd <= 30:
            recs.append("Cumpleaños próximo: añade un detalle de cortesía o descuento de fidelidad para cerrar.")
        if mk > 20:
            recs.append(f"El markup ({mk:.0f}%) es alto para este perfil; considera un descuento <10% para acelerar el cierre.")
        if not recs:
            recs.append("Perfil estándar. Refuerza el valor del itinerario y propone un próximo paso claro.")

        # ---- Push an opportunity to the Intelligence Inbox (dedup per proposal) ----
        try:
            if prob >= 80 or vip:
                exists = await db.intelligence.find_one({"tenant_id": tid, "dedup_key": f"proposal_hot:{pid}", "status": {"$in": ["new", "snoozed", "approved"]}})
                if not exists:
                    await db.intelligence.insert_one({
                        "id": str(uuid.uuid4()), "tenant_id": tid, "day": datetime.now(timezone.utc).date().isoformat(),
                        "agent": "SALES", "type": "opportunity", "priority": "high",
                        "title": f"Alta probabilidad de cierre · {name} ({prob}%)",
                        "message": f"Propuesta {prop.get('code','')} a {prop.get('destination','')}. {recs[0]}",
                        "dedup_key": f"proposal_hot:{pid}",
                        "actions": ["approve", "execute", "snooze", "dismiss", "automate"],
                        "meta": {"proposal_id": pid, "contact_name": name}, "status": "new",
                        "auto_suggest": False, "created_at": now_iso(),
                    })
        except Exception:
            pass

        return {
            "contact_id": (contact or {}).get("id"),
            "contact": contact,
            "conversion_probability": prob,
            "loyalty": loyalty,
            "signals": signals,
            "recommendations": recs,
            "stats": {"revenue": round(revenue, 2), "bookings": n_bookings, "proposals": len(proposals),
                      "accepted": len(accepted), "avg_budget": int(avg_budget)},
        }

    @router.post("/proposals/{pid}/accept")
    async def accept_proposal(pid: str, user=Depends(get_current)):
        """Advisor-side acceptance → creates a synced booking (Dashboard/Map/Calendar/CRM) + activity."""
        tid = user['tenant_id']
        p = await db.travel_proposals.find_one({"id": pid, "tenant_id": tid}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Proposal not found")
        booking = {
            "id": str(uuid.uuid4()), "tenant_id": tid, "code": gen_code(),
            "traveler": p.get("contact_name", ""), "destination": p.get("destination", ""),
            "start_date": p.get("start_date", ""), "end_date": p.get("end_date", ""),
            "amount": p.get("total", 0), "status": "confirmed", "pax": p.get("travelers", 1),
            "origin": "Miami", "hotel": next((i["name"] for i in p.get("items", []) if i.get("kind") == "hotel"), ""),
            "proposal_number": p.get("code", ""), "proposal_id": pid,
            "currency": p.get("currency", "USD"), "created_at": now_iso(),
        }
        await db.travel_bookings.insert_one(booking); booking.pop("_id", None)
        await db.travel_proposals.update_one({"id": pid, "tenant_id": tid}, {"$set": {"status": "booked", "booking_code": booking["code"], "accepted_at": now_iso()}})
        return {"ok": True, "booking": booking}

    # ---- Public proposal viewer (no auth) ----
    @router.get("/public/{code}")
    async def public_view(code: str):
        p = await db.travel_proposals.find_one({"code": code}, {"_id": 0})
        if not p: raise HTTPException(404, "Proposal not found")
        await db.travel_proposals.update_one({"code": code}, {"$inc": {"public_views": 1}})
        # Fetch agency (tenant) name for branding
        tenant = await db.tenants.find_one({"id": p["tenant_id"]}, {"_id": 0, "name": 1}) or {}
        p["agency_name"] = tenant.get("name", "Agencia")
        return p

    @router.post("/public/{code}/decision")
    async def public_decision(code: str, body: Dict[str, Any]):
        decision = body.get("decision")  # accepted | rejected
        comment = body.get("comment", "")
        if decision not in ("accepted", "rejected"):
            raise HTTPException(400, "Invalid decision")
        p = await db.travel_proposals.find_one({"code": code}, {"_id": 0})
        if not p: raise HTTPException(404, "Not found")
        await db.travel_proposals.update_one(
            {"code": code},
            {"$set": {"status": decision, "decided_at": now_iso(), "client_comment": comment}}
        )
        # If accepted → auto-create booking
        if decision == "accepted":
            booking = {
                "id": str(uuid.uuid4()), "tenant_id": p["tenant_id"],
                "code": "BK-" + gen_code()[:8],
                "proposal_id": p["id"], "proposal_code": p["code"],
                "contact_name": p["contact_name"], "destination": p["destination"],
                "start_date": p["start_date"], "end_date": p["end_date"],
                "travelers": p["travelers"], "total": p["total"], "currency": p["currency"],
                "status": "confirmed", "created_at": now_iso(),
            }
            await db.travel_bookings2.insert_one(booking)
            await db.travel_proposals.update_one({"code": code}, {"$set": {"status": "booked", "booking_code": booking["code"]}})
        return {"ok": True}

    # ---- Bookings ----
    @router.get("/bookings")
    async def list_bookings(user=Depends(get_current)):
        items = await db.travel_bookings2.find({"tenant_id": user['tenant_id']}, {"_id": 0}).sort("created_at", -1).to_list(500)
        return items

    @router.delete("/bookings/{bid}")
    async def delete_booking(bid: str, user=Depends(get_current)):
        await db.travel_bookings2.delete_one({"id": bid, "tenant_id": user['tenant_id']})
        return {"ok": True}

    # ---- Catalog ----
    for entity, model in [("hotels", HotelIn), ("attractions", AttractionIn), ("airlines", AirlineIn)]:
        coll = f"travel_{entity}"

        def _make_list(coll_name):
            async def _list(user=Depends(get_current)):
                items = await db[coll_name].find({"tenant_id": user['tenant_id']}, {"_id": 0}).sort("name", 1).to_list(500)
                return items
            return _list

        def _make_create(coll_name, M):
            async def _create(data: M, user=Depends(get_current)):
                item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
                await db[coll_name].insert_one(item); item.pop('_id', None)
                return item
            return _create

        def _make_delete(coll_name):
            async def _delete(iid: str, user=Depends(get_current)):
                await db[coll_name].delete_one({"id": iid, "tenant_id": user['tenant_id']})
                return {"ok": True}
            return _delete

        router.get(f"/catalog/{entity}")(_make_list(coll))
        router.post(f"/catalog/{entity}")(_make_create(coll, model))
        router.delete(f"/catalog/{entity}/{{iid}}")(_make_delete(coll))

    return router

async def seed_travel(db, tenant_id: str):
    """Seed 2 hotels, 2 attractions, 2 airlines, 1 draft proposal."""
    now = now_iso()
    seed = [
        ("travel_hotels", [
            {"name": "Grand Palace Madrid", "city": "Madrid", "stars": 5, "room_type": "Suite Deluxe", "price_per_night": 380, "supplier": "Booking"},
            {"name": "Riviera Barcelona", "city": "Barcelona", "stars": 4, "room_type": "Doble Superior", "price_per_night": 220, "supplier": "Expedia"},
        ]),
        ("travel_attractions", [
            {"name": "Sagrada Familia Skip-the-Line", "city": "Barcelona", "category": "Cultural", "price": 45, "duration_hours": 2},
            {"name": "Tour Retiro + Prado", "city": "Madrid", "category": "Cultural", "price": 65, "duration_hours": 4},
        ]),
        ("travel_airlines", [
            {"name": "Iberia", "code": "IB", "origin": "MEX", "destination": "MAD", "price": 780},
            {"name": "Air Europa", "code": "UX", "origin": "MEX", "destination": "MAD", "price": 720},
        ]),
    ]
    for coll, items in seed:
        for it in items:
            await db[coll].insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **it, "created_at": now})
    # Sample proposal
    prop = {
        "id": str(uuid.uuid4()), "tenant_id": tenant_id, "code": gen_code(),
        "contact_id": "", "contact_name": "Familia González",
        "destination": "Madrid + Barcelona", "start_date": "2026-04-10", "end_date": "2026-04-18",
        "travelers": 4, "currency": "USD",
        "items": [
            {"kind": "flight", "name": "MEX → MAD (Iberia)", "description": "Vuelo directo", "qty": 4, "unit_price": 780, "supplier": "Iberia"},
            {"kind": "hotel", "name": "Grand Palace Madrid", "description": "4 noches, Suite Deluxe", "qty": 4, "unit_price": 380, "supplier": "Booking"},
            {"kind": "hotel", "name": "Riviera Barcelona", "description": "4 noches, Doble Superior", "qty": 4, "unit_price": 220, "supplier": "Expedia"},
            {"kind": "attraction", "name": "Sagrada Familia Skip-the-Line", "qty": 4, "unit_price": 45, "supplier": ""},
        ],
        "itinerary": [
            {"day": 1, "date": "2026-04-10", "title": "Llegada a Madrid", "description": "Check-in en Grand Palace"},
            {"day": 4, "date": "2026-04-13", "title": "Traslado a Barcelona", "description": "Tren AVE"},
            {"day": 5, "date": "2026-04-14", "title": "Sagrada Familia", "description": "Tour guiado"},
        ],
        "markup_pct": 15, "notes": "Incluye traslados aeropuerto",
        "status": "draft", "public_views": 0,
        "created_at": now,
    }
    sub = sum(i["unit_price"] * i["qty"] for i in prop["items"])
    ma = sub * 0.15
    prop.update({"subtotal": round(sub, 2), "markup_amount": round(ma, 2), "total": round(sub + ma, 2)})
    await db.travel_proposals.insert_one(prop)
