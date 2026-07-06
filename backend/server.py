"""
LEVOND ERP-CRM Backend
Single-file FastAPI app — multi-tenant, JWT auth, CRM + POS Restaurant + POS Retail + Inventory + Travel
"""
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import os, uuid, logging, bcrypt, jwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from nexus_agents import build_router as build_nexus_router
from travel_agency import build_router as build_travel_router, seed_travel

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------- Auth ----------
JWT_SECRET = os.environ.get('JWT_SECRET', 'levond-dev-secret-change-me')
JWT_ALGO = 'HS256'
JWT_EXPIRE_DAYS = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt(rounds=10)).decode()

def verify_password(p: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), hashed.encode())
    except Exception:
        return False

def create_token(user_id: str, tenant_id: str) -> str:
    payload = {
        'sub': user_id,
        'tenant_id': tenant_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# ---------- App ----------
app = FastAPI(title="LEVOND ERP-CRM API")
api = APIRouter(prefix="/api")

# ---------- Models ----------
class SignupIn(BaseModel):
    name: str
    company: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class AuthOut(BaseModel):
    token: str
    user: Dict[str, Any]
    tenant: Dict[str, Any]

class EmployeeIn(BaseModel):
    name: str
    email: EmailStr
    role: str = "agent"  # admin | manager | agent | finance | marketing | viewer
    password: Optional[str] = None

class OnboardingIn(BaseModel):
    company: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    logo: Optional[str] = None            # base64 data URL
    address: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    employee_count: Optional[int] = 0
    employees: Optional[List[EmployeeIn]] = []

class BrandingIn(BaseModel):
    company: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    logo: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class LeadIn(BaseModel):
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    value: Optional[float] = 0
    stage: Optional[str] = "Nuevo"
    notes: Optional[str] = ""

class ProductIn(BaseModel):
    name: str
    sku: Optional[str] = ""
    price: float = 0
    category: Optional[str] = "General"
    stock: int = 0
    type: Optional[str] = "retail"  # retail | restaurant | both

class TableIn(BaseModel):
    name: str
    capacity: int = 4

class OrderItemIn(BaseModel):
    product_id: str
    name: str
    price: float
    qty: int = 1

class OpenTableIn(BaseModel):
    table_id: str

class AddOrderItemIn(BaseModel):
    table_id: str
    item: OrderItemIn

class CloseTableIn(BaseModel):
    table_id: str
    payment_method: str = "cash"

class RetailSaleIn(BaseModel):
    items: List[OrderItemIn]
    payment_method: str = "cash"

class BookingIn(BaseModel):
    traveler: str
    destination: str
    start_date: str
    end_date: str
    amount: float = 0
    status: str = "pending"
    notes: Optional[str] = ""

class ContactIn(BaseModel):
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    tax_id: Optional[str] = ""
    is_customer: bool = True
    is_vendor: bool = False
    notes: Optional[str] = ""

class SalesItemIn(BaseModel):
    product_id: Optional[str] = ""
    name: str
    price: float
    qty: int = 1

class SalesOrderIn(BaseModel):
    contact_id: str
    contact_name: str
    items: List[SalesItemIn]
    notes: Optional[str] = ""

class PurchaseOrderIn(BaseModel):
    vendor_id: str
    vendor_name: str
    items: List[SalesItemIn]
    notes: Optional[str] = ""

class WarehouseIn(BaseModel):
    name: str
    code: Optional[str] = ""
    location: Optional[str] = ""

class TransferIn(BaseModel):
    product_id: str
    product_name: str
    from_warehouse_id: str
    to_warehouse_id: str
    qty: int = 1

class AccountIn(BaseModel):
    code: str
    name: str
    type: str  # asset | liability | equity | income | expense

class JournalLineIn(BaseModel):
    account_code: str
    account_name: str
    debit: float = 0
    credit: float = 0

class JournalEntryIn(BaseModel):
    date: str
    reference: Optional[str] = ""
    memo: Optional[str] = ""
    lines: List[JournalLineIn]

class ProjectIn(BaseModel):
    name: str
    client: Optional[str] = ""
    color: Optional[str] = "#7C5CFF"
    deadline: Optional[str] = ""

class TaskIn(BaseModel):
    project_id: str
    title: str
    assignee: Optional[str] = ""
    status: Optional[str] = "todo"
    deadline: Optional[str] = ""
    hours: Optional[float] = 0

class AppointmentIn(BaseModel):
    title: str
    contact_name: Optional[str] = ""
    start: str
    end: Optional[str] = ""
    notes: Optional[str] = ""
    status: Optional[str] = "scheduled"

class EquipmentIn(BaseModel):
    name: str
    category: Optional[str] = ""
    location: Optional[str] = ""
    status: Optional[str] = "operational"

class WorkOrderIn(BaseModel):
    equipment_id: str
    equipment_name: str
    type: str = "corrective"  # preventive | corrective
    description: str
    assignee: Optional[str] = ""
    status: Optional[str] = "todo"
    deadline: Optional[str] = ""

# ---------- Auth dependency ----------
async def get_current(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(401, "Missing token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload['sub']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user

def t_filter(user):
    return {"tenant_id": user['tenant_id']}

# ---------- Endpoints ----------
@api.get("/")
async def root():
    return {"name": "LEVOND ERP-CRM", "version": "2026.1"}

# ---- Auth ----
@api.post("/auth/signup", response_model=AuthOut)
async def signup(data: SignupIn):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    tenant_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    tenant = {"id": tenant_id, "name": data.company, "created_at": now_iso(), "owner_id": user_id,
              "onboarding_completed": False, "primary_color": "#7C3AED", "secondary_color": "#FFD700",
              "logo": "", "address": "", "phone": ""}
    user = {
        "id": user_id, "tenant_id": tenant_id, "name": data.name, "email": data.email.lower(),
        "password": hash_password(data.password), "role": "admin", "created_at": now_iso(),
    }
    await db.tenants.insert_one(tenant)
    await db.users.insert_one(user)
    await seed_tenant(tenant_id)
    token = create_token(user_id, tenant_id)
    user.pop('password', None); user.pop('_id', None); tenant.pop('_id', None)
    return AuthOut(token=token, user=user, tenant=tenant)

@api.post("/auth/login", response_model=AuthOut)
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user.get('password', '')):
        raise HTTPException(401, "Invalid credentials")
    tenant = await db.tenants.find_one({"id": user['tenant_id']}, {"_id": 0})
    user.pop('password', None); user.pop('_id', None)
    token = create_token(user['id'], user['tenant_id'])
    return AuthOut(token=token, user=user, tenant=tenant or {})

@api.get("/auth/me")
async def me(user=Depends(get_current)):
    tenant = await db.tenants.find_one({"id": user['tenant_id']}, {"_id": 0})
    return {"user": user, "tenant": tenant}

# ---- Onboarding / Company setup (LEAOS) ----
def require_admin(user):
    if user.get("role") not in ("admin", "manager"):
        raise HTTPException(403, "Solo administradores pueden realizar esta acción")

@api.get("/onboarding/status")
async def onboarding_status(user=Depends(get_current)):
    tenant = await db.tenants.find_one({"id": user['tenant_id']}, {"_id": 0})
    return {"completed": bool(tenant.get("onboarding_completed")), "tenant": tenant}

@api.post("/onboarding")
async def complete_onboarding(data: OnboardingIn, user=Depends(get_current)):
    require_admin(user)
    tid = user['tenant_id']
    updates = {"onboarding_completed": True, "onboarding_at": now_iso()}
    if data.company: updates["name"] = data.company
    if data.primary_color: updates["primary_color"] = data.primary_color
    if data.secondary_color: updates["secondary_color"] = data.secondary_color
    if data.logo is not None: updates["logo"] = data.logo
    if data.address is not None: updates["address"] = data.address
    if data.phone is not None: updates["phone"] = data.phone
    if data.industry: updates["industry"] = data.industry
    if data.employee_count: updates["employee_count"] = data.employee_count
    await db.tenants.update_one({"id": tid}, {"$set": updates})
    # Create employee users with roles
    created = []
    for emp in (data.employees or []):
        email = emp.email.lower()
        if await db.users.find_one({"email": email}):
            continue
        pwd = emp.password or uuid.uuid4().hex[:10]
        u = {"id": str(uuid.uuid4()), "tenant_id": tid, "name": emp.name, "email": email,
             "password": hash_password(pwd), "role": emp.role, "created_at": now_iso(), "invited": True}
        await db.users.insert_one(u)
        created.append({"name": emp.name, "email": email, "role": emp.role, "temp_password": pwd})
    await log_activity(tid, "system", f"Onboarding completado · {len(created)} usuario(s) creados")
    tenant = await db.tenants.find_one({"id": tid}, {"_id": 0})
    return {"ok": True, "tenant": tenant, "created_users": created}

@api.patch("/tenant/branding")
async def update_branding(data: BrandingIn, user=Depends(get_current)):
    require_admin(user)
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if "company" in updates:
        updates["name"] = updates.pop("company")
    if updates:
        await db.tenants.update_one({"id": user['tenant_id']}, {"$set": updates})
    tenant = await db.tenants.find_one({"id": user['tenant_id']}, {"_id": 0})
    return {"ok": True, "tenant": tenant}

# ---- Team / Users management ----
@api.get("/team")
async def list_team(user=Depends(get_current)):
    users = await db.users.find({"tenant_id": user['tenant_id']}, {"_id": 0, "password": 0}).to_list(500)
    return users

@api.post("/team")
async def add_member(emp: EmployeeIn, user=Depends(get_current)):
    require_admin(user)
    email = emp.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email ya registrado")
    pwd = emp.password or uuid.uuid4().hex[:10]
    u = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], "name": emp.name, "email": email,
         "password": hash_password(pwd), "role": emp.role, "created_at": now_iso(), "invited": True}
    await db.users.insert_one(u)
    return {"ok": True, "user": {"name": emp.name, "email": email, "role": emp.role, "temp_password": pwd}}

@api.patch("/team/{uid}")
async def update_member(uid: str, data: Dict[str, Any], user=Depends(get_current)):
    require_admin(user)
    data = {k: v for k, v in data.items() if k in ("name", "role")}
    await db.users.update_one({"id": uid, "tenant_id": user['tenant_id']}, {"$set": data})
    return {"ok": True}

@api.delete("/team/{uid}")
async def remove_member(uid: str, user=Depends(get_current)):
    require_admin(user)
    if uid == user["id"]:
        raise HTTPException(400, "No puedes eliminarte a ti mismo")
    await db.users.delete_one({"id": uid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Database export (portable per-tenant backup) ----
EXPORT_COLLECTIONS = [
    "tenants", "users", "leads", "products", "contacts", "restaurant_tables",
    "restaurant_orders", "retail_sales", "travel_bookings", "sales_orders", "invoices",
    "purchase_orders", "warehouses", "transfers", "accounts", "journal_entries",
    "projects", "tasks", "appointments", "equipment", "work_orders", "activity",
    "counters", "nexus_activities", "travel_partners", "travel_proposals", "travel_clients",
]

@api.get("/tenant/export")
async def export_tenant(user=Depends(get_current)):
    require_admin(user)
    tid = user['tenant_id']
    dump = {"exported_at": now_iso(), "tenant_id": tid, "schema": "LEAOS-1.0", "collections": {}}
    for coll in EXPORT_COLLECTIONS:
        q = {"id": tid} if coll == "tenants" else {"tenant_id": tid}
        proj = {"_id": 0, "password": 0} if coll == "users" else {"_id": 0}
        docs = await db[coll].find(q, proj).to_list(100000)
        if docs:
            dump["collections"][coll] = docs
    dump["record_count"] = sum(len(v) for v in dump["collections"].values())
    return dump

# ---- Google OAuth via Emergent Managed Auth ----
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api.post("/auth/google/exchange", response_model=AuthOut)
async def google_exchange(body: Dict[str, Any]):
    import httpx
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(400, "Missing session_id")
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if r.status_code != 200:
        raise HTTPException(401, "Invalid Google session")
    data = r.json()
    email = (data.get("email") or "").lower()
    if not email:
        raise HTTPException(400, "Email missing from Google session")
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture") or ""
    user = await db.users.find_one({"email": email})
    if not user:
        tenant_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        tenant = {"id": tenant_id, "name": name, "created_at": now_iso(), "owner_id": user_id, "type": body.get("tenant_type", "travel")}
        user = {
            "id": user_id, "tenant_id": tenant_id, "name": name, "email": email,
            "picture": picture, "role": "admin", "auth_provider": "google", "created_at": now_iso(),
        }
        await db.tenants.insert_one(tenant)
        await db.users.insert_one(user)
        await seed_tenant(tenant_id)
    else:
        tenant = await db.tenants.find_one({"id": user['tenant_id']}, {"_id": 0}) or {}
        if picture and not user.get("picture"):
            await db.users.update_one({"id": user["id"]}, {"$set": {"picture": picture}})
            user["picture"] = picture
    user.pop("password", None); user.pop("_id", None); tenant.pop("_id", None)
    token = create_token(user["id"], user["tenant_id"])
    return AuthOut(token=token, user=user, tenant=tenant)

# ---- Dashboard / Home ----
@api.get("/dashboard/kpis")
async def kpis(user=Depends(get_current)):
    f = t_filter(user)
    leads_count = await db.leads.count_documents(f)
    products_count = await db.products.count_documents(f)
    orders_total = 0
    async for s in db.retail_sales.find(f, {"_id": 0, "total": 1}):
        orders_total += s.get('total', 0)
    rest_total = 0
    async for o in db.restaurant_orders.find({**f, "status": "closed"}, {"_id": 0, "total": 1}):
        rest_total += o.get('total', 0)
    orders_count = await db.retail_sales.count_documents(f) + await db.restaurant_orders.count_documents({**f, "status": "closed"})
    activity = await db.activity.find(f, {"_id": 0}).sort("created_at", -1).to_list(10)
    return {
        "revenue": round(orders_total + rest_total, 2),
        "orders": orders_count,
        "customers": leads_count,
        "stock": products_count,
        "activity": activity,
    }

async def log_activity(tenant_id: str, kind: str, message: str):
    await db.activity.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, "kind": kind, "message": message, "created_at": now_iso()})

# ---- CRM ----
@api.get("/crm/leads")
async def list_leads(user=Depends(get_current)):
    items = await db.leads.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.post("/crm/leads")
async def create_lead(data: LeadIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.leads.insert_one(item)
    await log_activity(user['tenant_id'], 'crm', f"Nuevo lead: {data.name}")
    item.pop('_id', None)
    return item

@api.patch("/crm/leads/{lead_id}")
async def update_lead(lead_id: str, data: Dict[str, Any], user=Depends(get_current)):
    data.pop('id', None); data.pop('tenant_id', None)
    res = await db.leads.update_one({"id": lead_id, "tenant_id": user['tenant_id']}, {"$set": data})
    if not res.matched_count:
        raise HTTPException(404, "Lead not found")
    return {"ok": True}

@api.delete("/crm/leads/{lead_id}")
async def delete_lead(lead_id: str, user=Depends(get_current)):
    await db.leads.delete_one({"id": lead_id, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Products (shared by POS Restaurant + Retail + Inventory) ----
@api.get("/products")
async def list_products(user=Depends(get_current), type: Optional[str] = None):
    q = t_filter(user)
    if type:
        q['$or'] = [{"type": type}, {"type": "both"}]
    items = await db.products.find(q, {"_id": 0}).sort("name", 1).to_list(1000)
    return items

@api.post("/products")
async def create_product(data: ProductIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.products.insert_one(item)
    item.pop('_id', None)
    return item

@api.patch("/products/{pid}")
async def update_product(pid: str, data: Dict[str, Any], user=Depends(get_current)):
    data.pop('id', None); data.pop('tenant_id', None)
    await db.products.update_one({"id": pid, "tenant_id": user['tenant_id']}, {"$set": data})
    return {"ok": True}

@api.delete("/products/{pid}")
async def delete_product(pid: str, user=Depends(get_current)):
    await db.products.delete_one({"id": pid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- POS Restaurant ----
@api.get("/restaurant/tables")
async def list_tables(user=Depends(get_current)):
    tables = await db.restaurant_tables.find(t_filter(user), {"_id": 0}).sort("name", 1).to_list(200)
    # attach active order
    for t in tables:
        order = await db.restaurant_orders.find_one({"tenant_id": user['tenant_id'], "table_id": t['id'], "status": "open"}, {"_id": 0})
        t['order'] = order
    return tables

@api.post("/restaurant/tables")
async def create_table(data: TableIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.restaurant_tables.insert_one(item)
    item.pop('_id', None)
    return item

@api.post("/restaurant/orders/open")
async def open_order(data: OpenTableIn, user=Depends(get_current)):
    existing = await db.restaurant_orders.find_one({"tenant_id": user['tenant_id'], "table_id": data.table_id, "status": "open"}, {"_id": 0})
    if existing:
        return existing
    order = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], "table_id": data.table_id, "items": [], "total": 0, "status": "open", "created_at": now_iso()}
    await db.restaurant_orders.insert_one(order)
    order.pop('_id', None)
    return order

@api.post("/restaurant/orders/add_item")
async def add_item(data: AddOrderItemIn, user=Depends(get_current)):
    order = await db.restaurant_orders.find_one({"tenant_id": user['tenant_id'], "table_id": data.table_id, "status": "open"}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not open")
    items = order.get('items', [])
    items.append(data.item.model_dump())
    total = sum(it['price'] * it['qty'] for it in items)
    await db.restaurant_orders.update_one({"id": order['id']}, {"$set": {"items": items, "total": round(total, 2)}})
    return {"ok": True, "total": round(total, 2), "items": items}

@api.post("/restaurant/orders/close")
async def close_order(data: CloseTableIn, user=Depends(get_current)):
    order = await db.restaurant_orders.find_one({"tenant_id": user['tenant_id'], "table_id": data.table_id, "status": "open"}, {"_id": 0})
    if not order:
        raise HTTPException(404, "No open order")
    await db.restaurant_orders.update_one({"id": order['id']}, {"$set": {"status": "closed", "payment_method": data.payment_method, "closed_at": now_iso()}})
    await log_activity(user['tenant_id'], 'restaurant', f"Mesa cobrada: ${order['total']}")
    return {"ok": True, "total": order['total']}

# ---- POS Retail ----
@api.get("/retail/sales")
async def list_sales(user=Depends(get_current)):
    sales = await db.retail_sales.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(100)
    return sales

@api.post("/retail/sales")
async def create_sale(data: RetailSaleIn, user=Depends(get_current)):
    subtotal = sum(it.price * it.qty for it in data.items)
    tax = round(subtotal * 0.19, 2)
    total = round(subtotal + tax, 2)
    sale = {
        "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
        "items": [it.model_dump() for it in data.items],
        "subtotal": round(subtotal, 2), "tax": tax, "total": total,
        "payment_method": data.payment_method, "created_at": now_iso(),
    }
    await db.retail_sales.insert_one(sale)
    # decrement stock
    for it in data.items:
        await db.products.update_one({"id": it.product_id, "tenant_id": user['tenant_id']}, {"$inc": {"stock": -it.qty}})
    await log_activity(user['tenant_id'], 'retail', f"Venta retail: ${total}")
    sale.pop('_id', None)
    return sale

# ---- Inventory ----
@api.post("/inventory/adjust")
async def adjust_stock(pid: str, delta: int, user=Depends(get_current)):
    await db.products.update_one({"id": pid, "tenant_id": user['tenant_id']}, {"$inc": {"stock": delta}})
    return {"ok": True}

# ---- Travel ----
@api.get("/travel/bookings")
async def list_bookings(user=Depends(get_current)):
    items = await db.travel_bookings.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.post("/travel/bookings")
async def create_booking(data: BookingIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.travel_bookings.insert_one(item)
    await log_activity(user['tenant_id'], 'travel', f"Nueva reserva: {data.destination}")
    item.pop('_id', None)
    return item

@api.delete("/travel/bookings/{bid}")
async def delete_booking(bid: str, user=Depends(get_current)):
    await db.travel_bookings.delete_one({"id": bid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Contacts (unified customers + vendors) ----
@api.get("/contacts")
async def list_contacts(user=Depends(get_current), role: Optional[str] = None):
    q = t_filter(user)
    if role == "customer": q["is_customer"] = True
    if role == "vendor": q["is_vendor"] = True
    items = await db.contacts.find(q, {"_id": 0}).sort("name", 1).to_list(1000)
    return items

@api.post("/contacts")
async def create_contact(data: ContactIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.contacts.insert_one(item); item.pop('_id', None)
    return item

@api.patch("/contacts/{cid}")
async def update_contact(cid: str, data: Dict[str, Any], user=Depends(get_current)):
    data.pop('id', None); data.pop('tenant_id', None)
    await db.contacts.update_one({"id": cid, "tenant_id": user['tenant_id']}, {"$set": data})
    return {"ok": True}

@api.delete("/contacts/{cid}")
async def delete_contact(cid: str, user=Depends(get_current)):
    await db.contacts.delete_one({"id": cid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Sales orders → Invoices ----
async def _next_seq(tenant_id: str, key: str) -> int:
    doc = await db.counters.find_one_and_update(
        {"tenant_id": tenant_id, "key": key},
        {"$inc": {"n": 1}},
        upsert=True, return_document=True,
    )
    return doc["n"] if doc else 1

def _totals(items):
    subtotal = round(sum(i["price"] * i["qty"] for i in items), 2)
    tax = round(subtotal * 0.19, 2)
    return subtotal, tax, round(subtotal + tax, 2)

@api.get("/sales")
async def list_sales_orders(user=Depends(get_current)):
    items = await db.sales_orders.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.post("/sales")
async def create_sales_order(data: SalesOrderIn, user=Depends(get_current)):
    items = [i.model_dump() for i in data.items]
    subtotal, tax, total = _totals(items)
    seq = await _next_seq(user['tenant_id'], 'sales_order')
    so = {
        "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
        "number": f"SO-{seq:05d}",
        "contact_id": data.contact_id, "contact_name": data.contact_name,
        "items": items, "subtotal": subtotal, "tax": tax, "total": total,
        "status": "draft", "notes": data.notes or "",
        "created_at": now_iso(),
    }
    await db.sales_orders.insert_one(so); so.pop('_id', None)
    await log_activity(user['tenant_id'], 'sales', f"Nueva cotización {so['number']} · ${total}")
    return so

@api.post("/sales/{sid}/confirm")
async def confirm_sales_order(sid: str, user=Depends(get_current)):
    await db.sales_orders.update_one({"id": sid, "tenant_id": user['tenant_id']}, {"$set": {"status": "confirmed", "confirmed_at": now_iso()}})
    return {"ok": True}

@api.post("/sales/{sid}/invoice")
async def convert_to_invoice(sid: str, user=Depends(get_current)):
    so = await db.sales_orders.find_one({"id": sid, "tenant_id": user['tenant_id']}, {"_id": 0})
    if not so: raise HTTPException(404, "SO not found")
    seq = await _next_seq(user['tenant_id'], 'invoice')
    inv = {
        "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
        "number": f"INV-{seq:05d}",
        "sales_order_id": sid, "sales_order_number": so.get("number"),
        "contact_id": so["contact_id"], "contact_name": so["contact_name"],
        "items": so["items"], "subtotal": so["subtotal"], "tax": so["tax"], "total": so["total"],
        "status": "open", "due_date": "",
        "created_at": now_iso(),
    }
    await db.invoices.insert_one(inv); inv.pop('_id', None)
    await db.sales_orders.update_one({"id": sid, "tenant_id": user['tenant_id']}, {"$set": {"status": "invoiced", "invoice_number": inv["number"]}})
    await log_activity(user['tenant_id'], 'invoicing', f"Factura {inv['number']} creada · ${inv['total']}")
    return inv

@api.delete("/sales/{sid}")
async def delete_sales_order(sid: str, user=Depends(get_current)):
    await db.sales_orders.delete_one({"id": sid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Invoices ----
@api.get("/invoices")
async def list_invoices(user=Depends(get_current)):
    items = await db.invoices.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.post("/invoices/{iid}/pay")
async def mark_invoice_paid(iid: str, user=Depends(get_current)):
    inv = await db.invoices.find_one({"id": iid, "tenant_id": user['tenant_id']}, {"_id": 0})
    if not inv: raise HTTPException(404, "Invoice not found")
    await db.invoices.update_one({"id": iid, "tenant_id": user['tenant_id']}, {"$set": {"status": "paid", "paid_at": now_iso()}})
    # Auto-generate accounting entry (FINA magic)
    try:
        seq = await _next_seq(user['tenant_id'], 'journal')
        lines = [
            {"account_code": "1000", "account_name": "Caja", "debit": inv["total"], "credit": 0},
            {"account_code": "4000", "account_name": "Ingresos por ventas", "debit": 0, "credit": inv["subtotal"]},
            {"account_code": "2100", "account_name": "IVA por pagar", "debit": 0, "credit": inv["tax"]},
        ]
        await db.journal_entries.insert_one({
            "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
            "number": f"JE-{seq:05d}", "date": now_iso()[:10],
            "reference": inv["number"], "memo": f"Cobro factura {inv['number']} - {inv['contact_name']}",
            "lines": lines, "total_debit": inv["total"], "total_credit": inv["total"],
            "auto_generated": True, "source": "invoice_paid",
            "created_at": now_iso(),
        })
        await log_activity(user['tenant_id'], 'accounting', f"Asiento JE-{seq:05d} auto-generado por FINA")
    except Exception as e:
        logging.warning(f"Auto-entry failed: {e}")
    await log_activity(user['tenant_id'], 'invoicing', f"Factura {inv['number']} pagada · ${inv['total']}")
    return {"ok": True}

@api.delete("/invoices/{iid}")
async def delete_invoice(iid: str, user=Depends(get_current)):
    await db.invoices.delete_one({"id": iid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Purchases ----
@api.get("/purchases")
async def list_purchases(user=Depends(get_current)):
    items = await db.purchase_orders.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.post("/purchases")
async def create_purchase(data: PurchaseOrderIn, user=Depends(get_current)):
    items = [i.model_dump() for i in data.items]
    subtotal, tax, total = _totals(items)
    seq = await _next_seq(user['tenant_id'], 'purchase_order')
    po = {
        "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
        "number": f"PO-{seq:05d}",
        "vendor_id": data.vendor_id, "vendor_name": data.vendor_name,
        "items": items, "subtotal": subtotal, "tax": tax, "total": total,
        "status": "draft", "notes": data.notes or "",
        "created_at": now_iso(),
    }
    await db.purchase_orders.insert_one(po); po.pop('_id', None)
    await log_activity(user['tenant_id'], 'purchases', f"Orden de compra {po['number']} · ${total}")
    return po

@api.post("/purchases/{pid}/receive")
async def receive_purchase(pid: str, user=Depends(get_current)):
    po = await db.purchase_orders.find_one({"id": pid, "tenant_id": user['tenant_id']}, {"_id": 0})
    if not po: raise HTTPException(404, "PO not found")
    # increment stock
    for it in po.get("items", []):
        if it.get("product_id"):
            await db.products.update_one({"id": it["product_id"], "tenant_id": user['tenant_id']}, {"$inc": {"stock": it["qty"]}})
    await db.purchase_orders.update_one({"id": pid, "tenant_id": user['tenant_id']}, {"$set": {"status": "received", "received_at": now_iso()}})
    return {"ok": True}

@api.delete("/purchases/{pid}")
async def delete_purchase(pid: str, user=Depends(get_current)):
    await db.purchase_orders.delete_one({"id": pid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Warehouses & Transfers ----
@api.get("/warehouses")
async def list_warehouses(user=Depends(get_current)):
    items = await db.warehouses.find(t_filter(user), {"_id": 0}).sort("name", 1).to_list(200)
    return items

@api.post("/warehouses")
async def create_warehouse(data: WarehouseIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.warehouses.insert_one(item); item.pop('_id', None)
    return item

@api.delete("/warehouses/{wid}")
async def delete_warehouse(wid: str, user=Depends(get_current)):
    await db.warehouses.delete_one({"id": wid, "tenant_id": user['tenant_id']})
    return {"ok": True}

@api.get("/inventory/transfers")
async def list_transfers(user=Depends(get_current)):
    items = await db.transfers.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(300)
    return items

@api.post("/inventory/transfers")
async def create_transfer(data: TransferIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.transfers.insert_one(item); item.pop('_id', None)
    await log_activity(user['tenant_id'], 'inventory', f"Transfer {data.qty}x {data.product_name}")
    return item

# ---- Accounting ----
@api.get("/accounting/accounts")
async def list_accounts(user=Depends(get_current)):
    items = await db.accounts.find(t_filter(user), {"_id": 0}).sort("code", 1).to_list(500)
    return items

@api.post("/accounting/accounts")
async def create_account(data: AccountIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.accounts.insert_one(item); item.pop('_id', None)
    return item

@api.delete("/accounting/accounts/{aid}")
async def delete_account(aid: str, user=Depends(get_current)):
    await db.accounts.delete_one({"id": aid, "tenant_id": user['tenant_id']})
    return {"ok": True}

@api.get("/accounting/entries")
async def list_entries(user=Depends(get_current)):
    items = await db.journal_entries.find(t_filter(user), {"_id": 0}).sort("date", -1).to_list(500)
    return items

@api.post("/accounting/entries")
async def create_entry(data: JournalEntryIn, user=Depends(get_current)):
    lines = [l.model_dump() for l in data.lines]
    total_debit = round(sum(l["debit"] for l in lines), 2)
    total_credit = round(sum(l["credit"] for l in lines), 2)
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(400, "Entry not balanced (debit != credit)")
    seq = await _next_seq(user['tenant_id'], 'journal')
    item = {
        "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
        "number": f"JE-{seq:05d}", "date": data.date, "reference": data.reference or "",
        "memo": data.memo or "", "lines": lines,
        "total_debit": total_debit, "total_credit": total_credit,
        "created_at": now_iso(),
    }
    await db.journal_entries.insert_one(item); item.pop('_id', None)
    return item

@api.delete("/accounting/entries/{eid}")
async def delete_entry(eid: str, user=Depends(get_current)):
    await db.journal_entries.delete_one({"id": eid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Projects & Tasks ----
@api.get("/projects")
async def list_projects(user=Depends(get_current)):
    items = await db.projects.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(200)
    for p in items:
        p["task_count"] = await db.tasks.count_documents({"tenant_id": user['tenant_id'], "project_id": p["id"]})
    return items

@api.post("/projects")
async def create_project(data: ProjectIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.projects.insert_one(item); item.pop('_id', None)
    return item

@api.delete("/projects/{pid}")
async def delete_project(pid: str, user=Depends(get_current)):
    await db.projects.delete_one({"id": pid, "tenant_id": user['tenant_id']})
    await db.tasks.delete_many({"project_id": pid, "tenant_id": user['tenant_id']})
    return {"ok": True}

@api.get("/projects/{pid}/tasks")
async def list_tasks(pid: str, user=Depends(get_current)):
    items = await db.tasks.find({"tenant_id": user['tenant_id'], "project_id": pid}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return items

@api.post("/tasks")
async def create_task(data: TaskIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.tasks.insert_one(item); item.pop('_id', None)
    return item

@api.patch("/tasks/{tid}")
async def update_task(tid: str, data: Dict[str, Any], user=Depends(get_current)):
    data.pop('id', None); data.pop('tenant_id', None)
    await db.tasks.update_one({"id": tid, "tenant_id": user['tenant_id']}, {"$set": data})
    return {"ok": True}

@api.delete("/tasks/{tid}")
async def delete_task(tid: str, user=Depends(get_current)):
    await db.tasks.delete_one({"id": tid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Appointments / Calendar ----
@api.get("/appointments")
async def list_appointments(user=Depends(get_current)):
    items = await db.appointments.find(t_filter(user), {"_id": 0}).sort("start", 1).to_list(500)
    return items

@api.post("/appointments")
async def create_appointment(data: AppointmentIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.appointments.insert_one(item); item.pop('_id', None)
    return item

@api.patch("/appointments/{aid}")
async def update_appointment(aid: str, data: Dict[str, Any], user=Depends(get_current)):
    data.pop('id', None); data.pop('tenant_id', None)
    await db.appointments.update_one({"id": aid, "tenant_id": user['tenant_id']}, {"$set": data})
    return {"ok": True}

@api.delete("/appointments/{aid}")
async def delete_appointment(aid: str, user=Depends(get_current)):
    await db.appointments.delete_one({"id": aid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---- Maintenance ----
@api.get("/maintenance/equipment")
async def list_equipment(user=Depends(get_current)):
    items = await db.equipment.find(t_filter(user), {"_id": 0}).sort("name", 1).to_list(500)
    return items

@api.post("/maintenance/equipment")
async def create_equipment(data: EquipmentIn, user=Depends(get_current)):
    item = {"id": str(uuid.uuid4()), "tenant_id": user['tenant_id'], **data.model_dump(), "created_at": now_iso()}
    await db.equipment.insert_one(item); item.pop('_id', None)
    return item

@api.delete("/maintenance/equipment/{eid}")
async def delete_equipment(eid: str, user=Depends(get_current)):
    await db.equipment.delete_one({"id": eid, "tenant_id": user['tenant_id']})
    return {"ok": True}

@api.get("/maintenance/work_orders")
async def list_work_orders(user=Depends(get_current)):
    items = await db.work_orders.find(t_filter(user), {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.post("/maintenance/work_orders")
async def create_work_order(data: WorkOrderIn, user=Depends(get_current)):
    seq = await _next_seq(user['tenant_id'], 'work_order')
    item = {
        "id": str(uuid.uuid4()), "tenant_id": user['tenant_id'],
        "number": f"WO-{seq:05d}",
        **data.model_dump(), "created_at": now_iso(),
    }
    await db.work_orders.insert_one(item); item.pop('_id', None)
    return item

@api.patch("/maintenance/work_orders/{wid}")
async def update_work_order(wid: str, data: Dict[str, Any], user=Depends(get_current)):
    data.pop('id', None); data.pop('tenant_id', None)
    await db.work_orders.update_one({"id": wid, "tenant_id": user['tenant_id']}, {"$set": data})
    return {"ok": True}

@api.delete("/maintenance/work_orders/{wid}")
async def delete_work_order(wid: str, user=Depends(get_current)):
    await db.work_orders.delete_one({"id": wid, "tenant_id": user['tenant_id']})
    return {"ok": True}

# ---------- Seed demo data ----------
async def seed_tenant(tenant_id: str):
    # Products
    sample_products = [
        # Restaurant
        {"name": "Hamburguesa Clásica", "sku": "REST-001", "price": 8.50, "category": "Burgers", "stock": 999, "type": "restaurant"},
        {"name": "Pizza Margarita", "sku": "REST-002", "price": 12.00, "category": "Pizza", "stock": 999, "type": "restaurant"},
        {"name": "Ensalada César", "sku": "REST-003", "price": 7.00, "category": "Ensaladas", "stock": 999, "type": "restaurant"},
        {"name": "Coca-Cola 350ml", "sku": "REST-004", "price": 2.50, "category": "Bebidas", "stock": 999, "type": "both"},
        {"name": "Tiramisú", "sku": "REST-005", "price": 5.50, "category": "Postres", "stock": 999, "type": "restaurant"},
        # Retail
        {"name": "Camiseta Algodón", "sku": "RET-001", "price": 19.99, "category": "Ropa", "stock": 40, "type": "retail"},
        {"name": "Audífonos Bluetooth", "sku": "RET-002", "price": 49.90, "category": "Tecnología", "stock": 15, "type": "retail"},
        {"name": "Cuaderno A5", "sku": "RET-003", "price": 4.50, "category": "Papelería", "stock": 120, "type": "retail"},
        {"name": "Botella Térmica 500ml", "sku": "RET-004", "price": 14.99, "category": "Hogar", "stock": 30, "type": "retail"},
    ]
    for p in sample_products:
        await db.products.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **p, "created_at": now_iso()})
    # Tables
    for i in range(1, 9):
        await db.restaurant_tables.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, "name": f"Mesa {i}", "capacity": 4 if i < 5 else 6, "created_at": now_iso()})
    # Leads
    leads_seed = [
        {"name": "Acme Corp", "email": "contact@acme.com", "phone": "+1 555 010", "value": 8500, "stage": "Nuevo"},
        {"name": "Globex Inc.", "email": "hello@globex.com", "phone": "+1 555 020", "value": 12000, "stage": "Contactado"},
        {"name": "Soylent Co.", "email": "info@soylent.co", "phone": "+1 555 030", "value": 4200, "stage": "Calificado"},
        {"name": "Initech LLC", "email": "ceo@initech.com", "phone": "+1 555 040", "value": 22000, "stage": "Ganado"},
    ]
    for l in leads_seed:
        await db.leads.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **l, "notes": "", "created_at": now_iso()})
    # Bookings
    bookings_seed = [
        {"traveler": "María González", "destination": "Tokio, Japón", "start_date": "2026-03-12", "end_date": "2026-03-22", "amount": 3500, "status": "confirmed", "notes": "Hotel 5★"},
        {"traveler": "Carlos Pérez", "destination": "París, Francia", "start_date": "2026-04-05", "end_date": "2026-04-10", "amount": 1800, "status": "pending", "notes": "City tour incluido"},
    ]
    for b in bookings_seed:
        await db.travel_bookings.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **b, "created_at": now_iso()})
    # Contacts seed (unified customers + vendors)
    contacts_seed = [
        {"name": "Acme Corp", "email": "billing@acme.com", "phone": "+1 555 1010", "address": "123 Main St, NY", "tax_id": "US-88-1234567", "is_customer": True, "is_vendor": False},
        {"name": "Globex Inc.", "email": "ap@globex.com", "phone": "+1 555 2020", "address": "500 Ocean Ave, LA", "tax_id": "US-77-7654321", "is_customer": True, "is_vendor": False},
        {"name": "Proveedor Alfa S.L.", "email": "ventas@alfa.es", "phone": "+34 91 111 2233", "address": "Calle Mayor 1, Madrid", "tax_id": "ES-B12345678", "is_customer": False, "is_vendor": True},
        {"name": "Distribuidora Beta", "email": "pedidos@beta.co", "phone": "+52 55 5555 6666", "address": "Reforma 100, CDMX", "tax_id": "MX-BETA980101", "is_customer": True, "is_vendor": True},
    ]
    for c in contacts_seed:
        await db.contacts.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **c, "notes": "", "created_at": now_iso()})
    # Warehouses
    for w in [{"name": "Almacén Central", "code": "WH-01", "location": "Madrid"}, {"name": "Almacén Barcelona", "code": "WH-02", "location": "Barcelona"}]:
        await db.warehouses.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **w, "created_at": now_iso()})
    # Chart of accounts (basic Spanish PGC-style)
    for a in [
        {"code": "1000", "name": "Caja", "type": "asset"},
        {"code": "1100", "name": "Bancos", "type": "asset"},
        {"code": "1200", "name": "Cuentas por cobrar", "type": "asset"},
        {"code": "1500", "name": "Inventario", "type": "asset"},
        {"code": "2000", "name": "Cuentas por pagar", "type": "liability"},
        {"code": "2100", "name": "IVA por pagar", "type": "liability"},
        {"code": "3000", "name": "Capital", "type": "equity"},
        {"code": "4000", "name": "Ingresos por ventas", "type": "income"},
        {"code": "5000", "name": "Costo de ventas", "type": "expense"},
        {"code": "5100", "name": "Gastos operativos", "type": "expense"},
    ]:
        await db.accounts.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **a, "created_at": now_iso()})
    # Sample project
    proj_id = str(uuid.uuid4())
    await db.projects.insert_one({"id": proj_id, "tenant_id": tenant_id, "name": "Lanzamiento Q1", "client": "Acme Corp", "color": "#7C5CFF", "deadline": "2026-03-31", "created_at": now_iso()})
    for tsk in [
        {"title": "Diseño de landing", "status": "done", "assignee": "María"},
        {"title": "Configurar CRM", "status": "in_progress", "assignee": "Carlos"},
        {"title": "Campaña de email", "status": "todo", "assignee": "Sofía"},
        {"title": "Reporte final", "status": "todo", "assignee": "Luis"},
    ]:
        await db.tasks.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, "project_id": proj_id, **tsk, "deadline": "", "hours": 0, "created_at": now_iso()})
    # Equipment
    for eq in [
        {"name": "Horno Rational SCC 61", "category": "Cocina", "location": "Sucursal Centro", "status": "operational"},
        {"name": "Aire acondicionado Split 24000 BTU", "category": "Climatización", "location": "Oficina", "status": "operational"},
    ]:
        await db.equipment.insert_one({"id": str(uuid.uuid4()), "tenant_id": tenant_id, **eq, "created_at": now_iso()})
    # Travel Partners seed
    try:
        await seed_travel(db, tenant_id)
    except Exception as ex:
        logging.warning(f"seed_travel failed: {ex}")
    await log_activity(tenant_id, "system", "Workspace inicializado con datos demo")
    # Auto-invoice trigger memo (accounting integration hint)
    await db.nexus_activities.insert_one({
        "id": str(uuid.uuid4()), "tenant_id": tenant_id,
        "kind": "welcome", "title": "¡Bienvenido a LEVOND!",
        "message": "Soy Nexus, tu conciencia AI. Preguntame lo que necesites o dime qué automatizar.",
        "action": "open_chat", "created_at": now_iso(), "dismissed": False,
    })

# ---------- Mount ----------
app.include_router(api)
app.include_router(build_nexus_router(db, get_current))
app.include_router(build_travel_router(db, get_current))
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ---------- Background scheduler for Nexus proactive insights ----------
scheduler = AsyncIOScheduler()

async def _proactive_job():
    """Every 2 hours: iterate tenants and refresh proactive insights."""
    try:
        tenants = await db.tenants.find({}, {"_id": 0, "id": 1}).to_list(1000)
        today = datetime.now(timezone.utc).date().isoformat()
        for t in tenants:
            tid = t["id"]
            existing = await db.nexus_activities.count_documents({
                "tenant_id": tid,
                "kind": {"$in": ["insight_invoice", "insight_stock", "insight_lead"]},
                "day": today,
            })
            if existing >= 3:
                continue
            # Same logic as endpoint (compact)
            open_invoices = await db.invoices.count_documents({"tenant_id": tid, "status": "open"})
            low_stock = await db.products.count_documents({"tenant_id": tid, "stock": {"$lt": 10}})
            stale_leads = await db.leads.count_documents({"tenant_id": tid, "stage": {"$in": ["Nuevo", "Contactado"]}})
            new_items = []
            now_iso_str = datetime.now(timezone.utc).isoformat()
            if open_invoices:
                new_items.append({"id": str(uuid.uuid4()), "tenant_id": tid, "day": today, "kind": "insight_invoice",
                                  "agent": "FINA", "title": "Facturas por cobrar",
                                  "message": f"Tienes {open_invoices} factura(s) sin pagar. ¿Envío recordatorios?",
                                  "action": "review_invoices", "created_at": now_iso_str, "dismissed": False})
            if low_stock:
                new_items.append({"id": str(uuid.uuid4()), "tenant_id": tid, "day": today, "kind": "insight_stock",
                                  "agent": "KAI", "title": "Stock bajo",
                                  "message": f"{low_stock} producto(s) con stock crítico. ¿Genero OC?",
                                  "action": "restock", "created_at": now_iso_str, "dismissed": False})
            if stale_leads:
                new_items.append({"id": str(uuid.uuid4()), "tenant_id": tid, "day": today, "kind": "insight_lead",
                                  "agent": "SALVO", "title": "Leads sin cerrar",
                                  "message": f"Tienes {stale_leads} lead(s) sin mover. ¿Revisamos el pipeline?",
                                  "action": "review_pipeline", "created_at": now_iso_str, "dismissed": False})
            if new_items:
                await db.nexus_activities.insert_many(new_items)
    except Exception as e:
        logging.warning(f"Proactive job failed: {e}")

@app.on_event("startup")
async def _startup():
    scheduler.add_job(_proactive_job, "interval", hours=2, id="nexus_proactive", replace_existing=True)
    scheduler.start()
    logging.info("Nexus proactive scheduler started (every 2h)")
