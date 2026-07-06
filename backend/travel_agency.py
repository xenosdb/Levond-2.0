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
