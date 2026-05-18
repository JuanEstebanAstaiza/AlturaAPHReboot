import pytest


@pytest.mark.anyio
async def test_admin_get_tenants(client):
    """Admin can get list of tenants after login."""
    # First login
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]

    # Get tenants
    response = await client.get("/api/auth/tenants", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    # Verify tenant data structure
    assert "tenant_id" in data[0]
    assert "tenant_name" in data[0]
    assert "plan" in data[0]
    assert "features" in data[0]
    assert "subscription_status" in data[0]


@pytest.mark.anyio
async def test_tenant_select(client):
    """Admin can select a tenant and get new JWT."""
    # First login
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]

    # Select tenant
    response = await client.post("/api/auth/tenant-select", json={
        "tenant_id": 1
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["tenant_id"] == 1
    assert data["plan"] == "professional"


@pytest.mark.anyio
async def test_resident_get_my_access(client):
    """Resident can get their properties after login."""
    # First login
    login_resp = await client.post("/api/auth/login", json={
        "email": "resident@altah.com",
        "password": "Resident2026!",
    })
    token = login_resp.json()["access_token"]

    # Get my access
    response = await client.get("/api/auth/my-access", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "tenant_id" in data[0]
    assert "tenant_name" in data[0]
    assert "access_type" in data[0]
