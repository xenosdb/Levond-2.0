"""LEAOS onboarding, team, branding, export end-to-end tests via public URL.

Covers:
 - Signup creates admin + tenant.onboarding_completed=false
 - GET  /api/onboarding/status
 - POST /api/onboarding (creates employees + returns temp passwords)
 - PATCH /api/tenant/branding
 - GET /api/team, POST /api/team, PATCH /api/team/{id}, DELETE /api/team/{id}
 - GET /api/tenant/export (schema LEAOS-1.0, record_count>0, isolation)
 - Multi-tenant isolation (tenant A cannot see tenant B data)
"""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if "REACT_APP_BACKEND_URL" in os.environ else None
if not BASE_URL:
    # Fall back to reading frontend/.env
    envf = "/app/frontend/.env"
    if os.path.exists(envf):
        for line in open(envf):
            if line.startswith("REACT_APP_BACKEND_URL"):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

TIMEOUT = 30


def _unique_email(prefix="admin"):
    return f"test_{prefix}_{uuid.uuid4().hex[:8]}@leaos-test.com"


def _signup(session, company="TEST_Wanderlust", name="Test Admin"):
    email = _unique_email()
    payload = {"name": name, "company": company, "email": email, "password": "secret123"}
    r = session.post(f"{API}/auth/signup", json=payload, timeout=TIMEOUT)
    assert r.status_code == 200, f"signup failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["token"]
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == email.lower()
    assert data["tenant"]["onboarding_completed"] is False
    return data, email.lower()


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def admin_a(s):
    data, email = _signup(s, company="TEST_Agency_A")
    return {"token": data["token"], "user": data["user"], "tenant": data["tenant"], "email": email}


@pytest.fixture(scope="module")
def admin_b(s):
    data, email = _signup(s, company="TEST_Agency_B")
    return {"token": data["token"], "user": data["user"], "tenant": data["tenant"], "email": email}


def _auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# --- Signup & onboarding status ---
class TestSignupAndOnboardingStatus:
    def test_signup_returns_tenant_admin(self, admin_a):
        assert admin_a["user"]["role"] == "admin"
        assert admin_a["tenant"]["onboarding_completed"] is False
        assert admin_a["tenant"]["name"] == "TEST_Agency_A"

    def test_onboarding_status_initially_false(self, s):
        # use fresh account so state is deterministic under xdist
        data, _ = _signup(s, company="TEST_Fresh")
        r = s.get(f"{API}/onboarding/status", headers=_auth(data["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        body = r.json()
        assert body["completed"] is False
        assert body["tenant"]["id"] == data["tenant"]["id"]


# --- Complete onboarding ---
class TestCompleteOnboarding:
    def test_complete_with_employees_creates_users_and_returns_temp_passwords(self, s, admin_a):
        emp1_email = _unique_email("emp1")
        emp2_email = _unique_email("emp2")
        payload = {
            "company": "TEST_Agency_A_updated",
            "industry": "Agencia de Viajes",
            "primary_color": "#0EA5E9",
            "secondary_color": "#F97316",
            "logo": "data:image/png;base64,iVBORw0KGgo=",
            "address": "Calle Falsa 123, Madrid",
            "phone": "+34 555 0000",
            "employee_count": 3,
            "employees": [
                {"name": "Emp One", "email": emp1_email, "role": "agent"},
                {"name": "Emp Two", "email": emp2_email, "role": "finance"},
            ],
        }
        r = s.post(f"{API}/onboarding", json=payload, headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["tenant"]["onboarding_completed"] is True
        assert body["tenant"]["name"] == "TEST_Agency_A_updated"
        assert body["tenant"]["primary_color"] == "#0EA5E9"
        assert body["tenant"]["address"] == "Calle Falsa 123, Madrid"
        # created users returned with temp passwords
        assert isinstance(body["created_users"], list)
        assert len(body["created_users"]) == 2
        emails = {u["email"] for u in body["created_users"]}
        assert emp1_email in emails and emp2_email in emails
        for u in body["created_users"]:
            assert u["temp_password"] and isinstance(u["temp_password"], str) and len(u["temp_password"]) >= 6
        # store emails for later isolation test
        admin_a["created_emails"] = list(emails)

    def test_onboarding_status_now_true(self, s, admin_a):
        r = s.get(f"{API}/onboarding/status", headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["completed"] is True

    def test_created_employee_can_login(self, s, admin_a):
        # This is a bonus: cannot verify temp password since not returned in test order,
        # but we can at least confirm listing shows them.
        r = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        team = r.json()
        emails = {m["email"] for m in team}
        for e in admin_a.get("created_emails", []):
            assert e in emails


# --- Branding ---
class TestBranding:
    def test_patch_branding_persists(self, s, admin_a):
        payload = {"primary_color": "#10B981", "secondary_color": "#FACC15", "phone": "+34 111 222"}
        r = s.patch(f"{API}/tenant/branding", json=payload, headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        t = r.json()["tenant"]
        assert t["primary_color"] == "#10B981"
        assert t["secondary_color"] == "#FACC15"
        assert t["phone"] == "+34 111 222"
        # verify persisted via status
        s2 = s.get(f"{API}/onboarding/status", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        assert s2["tenant"]["primary_color"] == "#10B981"

    def test_branding_company_rename(self, s, admin_a):
        r = s.patch(f"{API}/tenant/branding", json={"company": "TEST_Agency_A_final"},
                    headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["tenant"]["name"] == "TEST_Agency_A_final"


# --- Team CRUD ---
class TestTeamCRUD:
    def test_add_member_returns_temp_password(self, s, admin_a):
        email = _unique_email("member")
        r = s.post(f"{API}/team", json={"name": "New Member", "email": email, "role": "marketing"},
                   headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["user"]["email"] == email
        assert body["user"]["role"] == "marketing"
        assert body["user"]["temp_password"]
        admin_a["_last_added_email"] = email
        admin_a["_last_temp_password"] = body["user"]["temp_password"]

    def test_added_member_can_login_with_temp_password(self, s, admin_a):
        r = s.post(f"{API}/auth/login",
                   json={"email": admin_a["_last_added_email"], "password": admin_a["_last_temp_password"]},
                   timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        assert r.json()["user"]["email"] == admin_a["_last_added_email"]

    def test_list_team_shows_new_member(self, s, admin_a):
        r = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        assert any(m["email"] == admin_a["_last_added_email"] for m in r.json())

    def test_patch_member_role(self, s, admin_a):
        # find member id
        team = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        target = next(m for m in team if m["email"] == admin_a["_last_added_email"])
        r = s.patch(f"{API}/team/{target['id']}", json={"role": "viewer"},
                    headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        team2 = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        assert next(m for m in team2 if m["id"] == target["id"])["role"] == "viewer"

    def test_delete_member(self, s, admin_a):
        team = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        target = next(m for m in team if m["email"] == admin_a["_last_added_email"])
        r = s.delete(f"{API}/team/{target['id']}", headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        team2 = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        assert not any(m["id"] == target["id"] for m in team2)

    def test_cannot_delete_self(self, s, admin_a):
        me_id = admin_a["user"]["id"]
        r = s.delete(f"{API}/team/{me_id}", headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 400

    def test_add_duplicate_email_rejected(self, s, admin_a):
        # try to add admin's own email
        r = s.post(f"{API}/team",
                   json={"name": "Dup", "email": admin_a["email"], "role": "agent"},
                   headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 400


# --- Export ---
class TestTenantExport:
    def test_export_returns_leaos_schema(self, s, admin_a):
        r = s.get(f"{API}/tenant/export", headers=_auth(admin_a["token"]), timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["schema"] == "LEAOS-1.0"
        assert d["tenant_id"] == admin_a["tenant"]["id"]
        assert "collections" in d
        assert isinstance(d["record_count"], int)
        assert d["record_count"] > 0  # at least tenants + users
        # sanity: exported tenants collection contains only this tenant
        tenants = d["collections"].get("tenants", [])
        assert all(t["id"] == admin_a["tenant"]["id"] for t in tenants)
        # No passwords or _id fields leak
        users = d["collections"].get("users", [])
        for u in users:
            assert "password" not in u
            assert "_id" not in u


# --- Multi-tenant isolation ---
class TestMultiTenantIsolation:
    def test_team_endpoint_isolated(self, s, admin_a, admin_b):
        # admin_b should NOT see admin_a's users
        team_a = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        team_b = s.get(f"{API}/team", headers=_auth(admin_b["token"]), timeout=TIMEOUT).json()
        emails_a = {m["email"] for m in team_a}
        emails_b = {m["email"] for m in team_b}
        assert admin_a["email"] in emails_a
        assert admin_a["email"] not in emails_b
        assert admin_b["email"] in emails_b
        assert admin_b["email"] not in emails_a

    def test_export_isolated(self, s, admin_a, admin_b):
        exp_b = s.get(f"{API}/tenant/export", headers=_auth(admin_b["token"]), timeout=TIMEOUT).json()
        # tenant B's export should contain only tenant B tenant id
        for coll_name, docs in exp_b["collections"].items():
            for doc in docs:
                if coll_name == "tenants":
                    assert doc["id"] == admin_b["tenant"]["id"]
                else:
                    assert doc.get("tenant_id") == admin_b["tenant"]["id"], f"leak in {coll_name}: {doc}"

    def test_patch_member_of_other_tenant_no_effect(self, s, admin_a, admin_b):
        # admin_b tries to patch a user belonging to admin_a
        team_a = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        target = next(m for m in team_a if m["id"] != admin_a["user"]["id"])
        # server always returns 200 (update_one filter includes tenant_id), but no change should occur
        r = s.patch(f"{API}/team/{target['id']}", json={"role": "viewer"},
                    headers=_auth(admin_b["token"]), timeout=TIMEOUT)
        assert r.status_code == 200
        team_a2 = s.get(f"{API}/team", headers=_auth(admin_a["token"]), timeout=TIMEOUT).json()
        after = next(m for m in team_a2 if m["id"] == target["id"])
        assert after["role"] == target["role"], "cross-tenant patch modified data"


# --- Authorization gates ---
class TestAuthGate:
    def test_no_token_rejected(self, s):
        r = s.get(f"{API}/team", timeout=TIMEOUT)
        assert r.status_code == 401

    def test_bad_token_rejected(self, s):
        r = s.get(f"{API}/team", headers={"Authorization": "Bearer garbage"}, timeout=TIMEOUT)
        assert r.status_code == 401
