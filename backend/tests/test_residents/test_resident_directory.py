import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_admin_get_resident_directory(client):
    """Admin gets resident directory for current tenant."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/residents", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.anyio
async def test_admin_get_resident_profile(client):
    """Admin gets resident profile."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/residents/3", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Maria Residente"
    assert data["tenant_name"] == "Conjunto Altah"


@pytest.mark.anyio
async def test_resident_my_access(client):
    """Resident gets their property access list."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "resident@altah.com",
        "password": "Resident2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/auth/my-access", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["tenant_name"] == "Conjunto Altah"


@pytest.mark.anyio
async def test_admin_get_towers(client):
    """Admin gets towers for current tenant."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/units/towers", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # Torre A + Torre B


@pytest.mark.anyio
async def test_admin_get_units(client):
    """Admin gets all units for current tenant."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/units", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 6  # 6 units for Conjunto Altah


@pytest.mark.anyio
async def test_admin_get_unit_detail(client):
    """Admin gets unit detail."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/units/1", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["name_code"] == "A-101"
    assert data["tenant_id"] == 1


@pytest.mark.anyio
async def test_admin_get_tower_detail(client):
    """Admin gets tower detail."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    token = login_resp.json()["access_token"]
    response = await client.get("/api/units/towers/1", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Torre A"
    assert data["tenant_id"] == 1
