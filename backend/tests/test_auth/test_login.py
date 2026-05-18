import pytest


@pytest.mark.anyio
async def test_login_superuser(client):
    """Superuser can login successfully."""
    response = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["role"] == "superuser"
    assert data["name"] == "Superusuario"


@pytest.mark.anyio
async def test_login_admin(client):
    """Admin can login successfully."""
    response = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"
    assert data["name"] == "Carlos Admin"


@pytest.mark.anyio
async def test_login_resident(client):
    """Resident can login successfully."""
    response = await client.post("/api/auth/login", json={
        "email": "resident@altah.com",
        "password": "Resident2026!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "resident"
    assert data["name"] == "Maria Residente"


@pytest.mark.anyio
async def test_login_invalid_credentials(client):
    """Login with wrong password returns 401."""
    response = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "wrong_password",
    })
    assert response.status_code == 401


@pytest.mark.anyio
async def test_login_nonexistent_user(client):
    """Login with nonexistent email returns 401."""
    response = await client.post("/api/auth/login", json={
        "email": "nonexistent@aph.com",
        "password": "AnyPassword123!",
    })
    assert response.status_code == 401
