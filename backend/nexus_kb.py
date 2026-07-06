"""LEVOND Nexus — Knowledge base + function-calling registry.
Ultra-lean: 7 KBs consolidadas + keyword search + whitelist of executable actions."""
import re, uuid
from datetime import datetime, timezone

# ---------- KBs consolidadas (extraídas y condensadas de Axiora + ERP domain) ----------
KB = {
    "business": [
        "CRM Pipeline: leads → contactados → calificados → ganados/perdidos. Un lead calificado tiene presupuesto, autoridad, necesidad y timing (BANT). Priorizar leads con score alto y última actividad reciente.",
        "Ciclo de venta B2B: 5-30 días típico PYME, 60-180 días enterprise. KPIs clave: velocity (deals/mes), avg deal size, win rate, sales cycle length.",
        "Cotización profesional incluye: número único, fecha, validez (15-30 días), cliente completo, líneas con SKU/desc/qty/precio/subtotal, IVA discriminado, total, términos de pago, notas.",
        "Orden de compra a proveedor: incluye vendor, items, cantidades, precio pactado, fecha entrega esperada. Al recibir mercancía se aumenta el stock automáticamente.",
        "Follow-up regla: contactar leads en <24h aumenta conversión 9x. Usar templates personalizados con nombre, empresa y contexto de la última interacción.",
    ],
    "accounting": [
        "Partida doble: cada asiento tiene débitos = créditos. Activos aumentan por débito, pasivos y patrimonio por crédito.",
        "Cobro de factura: Débito Caja/Bancos (1000/1100) | Crédito Ingresos por ventas (4000) + IVA por pagar (2100).",
        "Compra a proveedor: Débito Inventario (1500) + IVA por acreditar | Crédito Cuentas por pagar (2000).",
        "Pago a proveedor: Débito Cuentas por pagar | Crédito Bancos.",
        "IVA 19% (España, Colombia): base × 0.19. Diferencia entre IVA cobrado y IVA pagado = IVA a declarar mensual/bimestral según jurisdicción.",
        "Plan de cuentas mínimo: 1xxx activos, 2xxx pasivos, 3xxx patrimonio, 4xxx ingresos, 5xxx gastos. Codificar de forma jerárquica.",
    ],
    "inventory": [
        "Multi-almacén: cada producto tiene stock por warehouse. Transferencias mueven stock entre bodegas sin afectar cantidad total.",
        "Alertas de mínimo: cuando stock < punto de reorden, generar OC al proveedor preferido automáticamente.",
        "Valoración FIFO: primero en entrar, primero en salir. Costo de venta = costo del lote más antiguo disponible.",
        "Lotes y series: usar para trazabilidad (alimentos, farmacia, electrónica). Cada movimiento registra el lote afectado.",
        "Kardex: registro de todos los movimientos por producto (entrada, salida, ajuste, transferencia) con fecha y saldo resultante.",
    ],
    "ops": [
        "POS Restaurante: flujo mesa → comanda → cocina (KDS) → servido → cobro. División de cuenta útil para grupos. Propina opcional 10-15%.",
        "POS Retail: escaneo código de barras → carrito → descuentos → método de pago → factura o ticket. Devoluciones dentro de 7-30 días con nota crédito.",
        "Kitchen Display System (KDS): órdenes en tiempo real por estación (fría/caliente/bar). Estados: pending, preparing, ready, served.",
        "Cierre de caja: contar efectivo físico + reporte de tarjetas + ajuste de diferencias. Reportar al final de cada turno.",
    ],
    "services": [
        "Agencia de viajes: reserva incluye viajero, destino, fechas, vuelos, hotel, actividades. Comisión típica 8-15% del total.",
        "Proyectos: dividir en tareas kanban (todo → in_progress → review → done). Timesheets registran horas por tarea para facturación por horas.",
        "Mantenimiento preventivo: programado según calendario o uso (ej. cada 500 horas de operación). Correctivo: cuando ocurre la falla.",
        "OT (orden de trabajo): equipo afectado, técnico asignado, descripción, tiempo estimado. Al cerrar se registra tiempo real y refacciones usadas.",
    ],
    "communication": [
        "Email de seguimiento efectivo: asunto corto (<60 chars), personalizado con nombre, contexto de conversación previa, propuesta de próximo paso claro, firma con datos de contacto.",
        "Recordatorio de pago: tono profesional no agresivo. Incluir número de factura, monto, fecha vencimiento, métodos de pago disponibles.",
        "WhatsApp Business: mensajes de <500 caracteres, incluir emoji contextual, CTA claro. Respeta horarios (9am-8pm zona del cliente).",
        "Redacción B2B: activa (no pasiva), viñetas para escaneabilidad, cifras concretas, máximo 3 párrafos por email.",
    ],
    "levond": [
        "LEVOND es un ERP-CRM multi-tenant construido en 2026. Cada tenant tiene su workspace aislado con datos propios.",
        "Módulos live: CRM, Contactos, Ventas, Facturación, Compras, POS Restaurante, POS Retail, Inventario, Almacenes, Contabilidad, Proyectos, Citas, Mantenimiento, Viajes, Nexus AI.",
        "Nexus es el orquestador AI con consejo de 6 agentes: SALVO (ventas), FINA (contabilidad), KAI (inventario), RIO (POS), VEGA (servicios), IRIS (comunicación).",
        "Auto-asientos: al marcar factura como pagada, FINA genera el asiento contable con partida doble automáticamente (Débito Caja / Crédito Ingresos + IVA).",
        "Idiomas soportados: 12 (ES, EN, PT, FR, DE, IT, ZH, JA, KO, AR, RU, NL). Los agentes responden en el idioma del usuario detectado.",
    ],
}

AGENT_KB = {
    "NEXUS": ["business", "accounting", "inventory", "ops", "services", "communication", "levond"],
    "SALVO": ["business", "communication", "levond"],
    "FINA": ["accounting", "business", "levond"],
    "KAI": ["inventory", "levond"],
    "RIO": ["ops", "levond"],
    "VEGA": ["services", "levond"],
    "IRIS": ["communication", "business", "levond"],
}

def search_kb(query: str, agent: str, top_k: int = 3) -> list:
    """Simple keyword scoring across agent's allowed KBs."""
    q_words = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 3]
    if not q_words:
        return []
    hits = []
    for kb_name in AGENT_KB.get(agent, []):
        for frag in KB.get(kb_name, []):
            frag_lower = frag.lower()
            score = sum(1 for w in q_words if w in frag_lower)
            if score > 0:
                hits.append((score, kb_name, frag))
    hits.sort(reverse=True)
    return hits[:top_k]

def build_kb_context(query: str, agent: str) -> str:
    hits = search_kb(query, agent)
    if not hits:
        return ""
    lines = ["\n\n[Conocimiento relevante (cita implícitamente en tu respuesta)]"]
    for score, kb_name, frag in hits:
        lines.append(f"• [{kb_name}] {frag}")
    return "\n".join(lines)

# ---------- Function calling / actions ----------
# Whitelist of executable actions. Agents can emit <ACTION>{"type": "...", "params": {...}}</ACTION> in reply.
ACTION_INSTRUCTIONS = (
    "\n\n[Acciones ejecutables] Si el usuario pide crear/actualizar algo concreto, "
    "termina tu respuesta con un bloque:\n<ACTION>{\"type\": \"...\", \"params\": {...}}</ACTION>\n"
    "Tipos permitidos: create_lead (name, email, phone, value, stage), "
    "create_contact (name, email, phone, is_customer, is_vendor), "
    "create_appointment (title, contact_name, start), "
    "adjust_stock (product_name, delta). "
    "No inventes datos; si te faltan datos claves pregúntalos antes de emitir la acción."
)

ACTION_RE = re.compile(r"<ACTION>\s*(\{.*?\})\s*</ACTION>", re.DOTALL)

async def try_execute_action(reply_text: str, tenant_id: str, db) -> dict | None:
    """Parse and execute action if present. Returns result dict or None."""
    import json
    m = ACTION_RE.search(reply_text)
    if not m:
        return None
    try:
        action = json.loads(m.group(1))
    except Exception:
        return {"ok": False, "error": "invalid JSON in ACTION block"}
    t = action.get("type")
    p = action.get("params", {})
    now = datetime.now(timezone.utc).isoformat()
    try:
        if t == "create_lead":
            doc = {
                "id": str(uuid.uuid4()), "tenant_id": tenant_id,
                "name": p.get("name", ""), "email": p.get("email", ""), "phone": p.get("phone", ""),
                "value": float(p.get("value", 0) or 0), "stage": p.get("stage", "Nuevo"),
                "notes": p.get("notes", ""), "created_at": now,
            }
            await db.leads.insert_one(doc)
            return {"ok": True, "type": t, "created": {"name": doc["name"], "stage": doc["stage"]}}
        if t == "create_contact":
            doc = {
                "id": str(uuid.uuid4()), "tenant_id": tenant_id,
                "name": p.get("name", ""), "email": p.get("email", ""), "phone": p.get("phone", ""),
                "address": p.get("address", ""), "tax_id": p.get("tax_id", ""),
                "is_customer": bool(p.get("is_customer", True)), "is_vendor": bool(p.get("is_vendor", False)),
                "notes": "", "created_at": now,
            }
            await db.contacts.insert_one(doc)
            return {"ok": True, "type": t, "created": {"name": doc["name"]}}
        if t == "create_appointment":
            doc = {
                "id": str(uuid.uuid4()), "tenant_id": tenant_id,
                "title": p.get("title", ""), "contact_name": p.get("contact_name", ""),
                "start": p.get("start", ""), "end": p.get("end", ""),
                "notes": p.get("notes", ""), "status": "scheduled", "created_at": now,
            }
            await db.appointments.insert_one(doc)
            return {"ok": True, "type": t, "created": {"title": doc["title"], "start": doc["start"]}}
        if t == "adjust_stock":
            pname = p.get("product_name", "")
            delta = int(p.get("delta", 0) or 0)
            prod = await db.products.find_one({"tenant_id": tenant_id, "name": {"$regex": re.escape(pname), "$options": "i"}}, {"_id": 0})
            if not prod:
                return {"ok": False, "type": t, "error": f"Product '{pname}' not found"}
            await db.products.update_one({"id": prod["id"], "tenant_id": tenant_id}, {"$inc": {"stock": delta}})
            return {"ok": True, "type": t, "product": prod["name"], "delta": delta, "new_stock": prod.get("stock", 0) + delta}
        return {"ok": False, "error": f"unknown action type: {t}"}
    except Exception as e:
        return {"ok": False, "type": t, "error": str(e)}
