import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_superuser_dashboard_real_data(client):
    """Superuser dashboard returns real data from DB."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/superuser/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_tenants"] >= 2  # At least Conjunto Altah + Torres del Parque
    assert data["active_tenants"] >= 2
    assert data["total_users"] >= 3
    assert data["total_revenue"] > 0
    assert "professional" in data["subscriptions_by_plan"]
    assert "basic" in data["subscriptions_by_plan"]


@pytest.mark.anyio
async def test_superuser_list_tenants(client):
    """Superuser lists all tenants from DB."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/superuser/tenants", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4  # 4 tenants in seed data


@pytest.mark.anyio
async def test_superuser_tenant_detail(client):
    """Superuser gets tenant detail with plan info."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/superuser/tenants/1", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_name"] == "Conjunto Altah"
    assert data["plan"] == "professional"
    assert data["total_units"] == 120


@pytest.mark.anyio
async def test_superuser_tenant_users(client):
    """Superuser gets users for a tenant."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/superuser/tenants/1/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # admin + resident


@pytest.mark.anyio
async def test_superuser_analytics_usage(client):
    """Superuser gets usage analytics for a tenant."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/superuser/analytics/usage?tenant_id=1", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_id"] == 1
    assert data["tenant_name"] == "Conjunto Altah"
    assert data["residents_count"] >= 1


@pytest.mark.anyio
async def test_superuser_revenue(client):
    """Superuser gets revenue data."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/superuser/analytics/revenue", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_revenue"] > 0
    assert "professional" in data["by_plan"]
    assert "basic" in data["by_plan"]


@pytest.mark.anyio
async def test_admin_get_tenant(client):
    """Admin gets tenant detail."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/tenants/1", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_name"] == "Conjunto Altah"


@pytest.mark.anyio
async def test_admin_get_tenant_admins(client):
    """Superuser gets admins for a tenant."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/superuser/tenants/1/admins", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
