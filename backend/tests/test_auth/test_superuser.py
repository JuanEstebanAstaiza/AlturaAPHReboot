import pytest


@pytest.mark.anyio
async def test_superuser_dashboard(client):
    """Superuser can access dashboard analytics."""
    # First login
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]

    # Get dashboard
    response = await client.get("/api/superuser/dashboard", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert "total_tenants" in data
    assert "active_tenants" in data
    assert "total_users" in data
    assert "total_revenue" in data
    assert "subscriptions_by_plan" in data


@pytest.mark.anyio
async def test_superuser_list_tenants(client):
    """Superuser can list all tenants."""
    # First login
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]

    # List tenants
    response = await client.get("/api/superuser/tenants", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.anyio
async def test_superuser_audit_logs(client):
    """Superuser can access global audit logs."""
    # First login
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]

    # Get audit logs
    response = await client.get("/api/superuser/audit", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200


@pytest.mark.anyio
async def test_admin_cannot_access_superuser(client):
    """Admin cannot access superuser endpoints."""
    # First login as admin
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]

    # Try to access superuser dashboard
    response = await client.get("/api/superuser/dashboard", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 403
