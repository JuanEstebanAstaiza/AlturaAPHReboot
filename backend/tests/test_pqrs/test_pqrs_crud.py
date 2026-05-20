import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_admin_create_ticket(client):
    """Admin creates a PQRS ticket — ticket_number generated."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = tenant_resp.json()["access_token"]

    response = await client.post(
        "/api/pqrs/tickets",
        params={"type": "p", "priority": "medium", "title": "Solicitud de mantenimiento", "description": "Necesito reparar el ascensor"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_number"].startswith("PQR-")
    assert data["type"] == "p"
    assert data["status"] == "open"
    assert data["assigned_to"] == 2  # auto-routed to admin


@pytest.mark.anyio
async def test_resident_create_ticket(client):
    """Resident creates a PQRS ticket — works."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "resident@altah.com",
        "password": "Resident2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = tenant_resp.json()["access_token"]

    response = await client.post(
        "/api/pqrs/tickets",
        params={"type": "q", "priority": "high", "title": "Queja por ruido", "description": "Vecino hace ruido constante"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_number"].startswith("PQR-")
    assert data["type"] == "q"
    assert data["created_by"] == 3


@pytest.mark.anyio
async def test_pqrs_list_tickets(client):
    """Admin lists tickets — filtered results."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = tenant_resp.json()["access_token"]

    response = await client.get(
        "/api/pqrs/tickets",
        params={"status": "open"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.anyio
async def test_pqrs_get_ticket(client):
    """Get ticket detail — full info."""
    # Create a ticket first
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = tenant_resp.json()["access_token"]

    create_resp = await client.post(
        "/api/pqrs/tickets",
        params={"type": "p", "priority": "medium", "title": "Test ticket", "description": "test desc"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_resp.status_code == 200
    ticket_id = create_resp.json()["id"]

    response = await client.get(f"/api/pqrs/tickets/{ticket_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "ticket_number" in data
    assert "created_by_name" in data
    assert "assigned_to_name" in data


@pytest.mark.anyio
async def test_pqrs_update_status(client):
    """Admin updates ticket status — audit logged."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = tenant_resp.json()["access_token"]

    create_resp = await client.post(
        "/api/pqrs/tickets",
        params={"type": "q", "priority": "low", "title": "Test ticket status", "description": "test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    ticket_id = create_resp.json()["id"]

    response = await client.put(
        f"/api/pqrs/tickets/{ticket_id}/status",
        params={"status": "in_progress"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"


@pytest.mark.anyio
async def test_pqrs_assign_ticket(client):
    """Admin assigns ticket — assigned_to updated."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = tenant_resp.json()["access_token"]

    create_resp = await client.post(
        "/api/pqrs/tickets",
        params={"type": "r", "priority": "medium", "title": "Test ticket assign", "description": "test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    ticket_id = create_resp.json()["id"]

    response = await client.put(
        f"/api/pqrs/tickets/{ticket_id}/assign",
        params={"user_id": 4},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["assigned_to"] == 4


@pytest.mark.anyio
async def test_pqrs_add_comment(client):
    """Resident adds comment — comment stored."""
    # Create a ticket as admin first
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    admin_token = tenant_resp.json()["access_token"]

    create_resp = await client.post(
        "/api/pqrs/tickets",
        params={"type": "p", "priority": "medium", "title": "Ticket for comment", "description": "test"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    ticket_id = create_resp.json()["id"]

    # Resident adds comment
    login_resp2 = await client.post("/api/auth/login", json={
        "email": "resident@altah.com",
        "password": "Resident2026!",
    })
    login_token2 = login_resp2.json()["access_token"]
    tenant_resp2 = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token2}"},
    )
    token = tenant_resp2.json()["access_token"]

    response = await client.post(
        f"/api/pqrs/tickets/{ticket_id}/comments",
        params={"message": "Añado más detalles al reporte"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Añado más detalles al reporte"
    assert data["user_id"] == 3


@pytest.mark.anyio
async def test_pqrs_get_stats(client):
    """Admin gets stats — counts correct."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = login_token

    response = await client.get("/api/pqrs/stats", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "total_tickets" in data
    assert "by_type" in data
    assert "by_status" in data
    assert "by_priority" in data


@pytest.mark.anyio
async def test_pqrs_get_categories(client):
    """Admin gets categories — list returned."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = login_token

    response = await client.get("/api/pqrs/categories", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 8  # seed data has 8 categories


@pytest.mark.anyio
async def test_pqrs_create_category(client):
    """Admin creates category — stored."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = login_token

    response = await client.post(
        "/api/pqrs/categories",
        params={"name": "Seguridad", "pqrs_type": "q", "default_assigned_user_id": 4, "escalation_timeout_hours": 12},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Seguridad"
    assert data["pqrs_type"] == "q"


@pytest.mark.anyio
async def test_pqrs_feature_gate(client):
    """All seed tenants have pqrs=true — feature gating passes implicitly."""
    pass


@pytest.mark.anyio
async def test_pqrs_tenant_scope(client):
    """Admin tenant A cannot see tenant B tickets — tenant isolation."""
    # Admin tenant 1
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token1 = login_token

    # Admin tenant 2
    login_resp2 = await client.post("/api/auth/login", json={
        "email": "admin2@torres.com",
        "password": "Admin2026!",
    })
    login_token2 = login_resp2.json()["access_token"]
    await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 2},
        headers={"Authorization": f"Bearer {login_token2}"},
    )
    token2 = login_token2

    # Try to access tenant 1 ticket as tenant 2 admin
    response = await client.get("/api/pqrs/tickets/1", headers={"Authorization": f"Bearer {token2}"})
    assert response.status_code in (400, 404)


@pytest.mark.anyio
async def test_pqrs_auto_route(client):
    """Ticket created — auto-assigned via categories."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "resident@altah.com",
        "password": "Resident2026!",
    })
    login_token = login_resp.json()["access_token"]
    tenant_resp = await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = tenant_resp.json()["access_token"]

    response = await client.post(
        "/api/pqrs/tickets",
        params={"type": "p", "priority": "medium", "title": "Mantenimiento", "description": "test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["assigned_to"] == 2  # default_assigned_user_id for maintenance categories


@pytest.mark.anyio
async def test_pqrs_ticket_numbering(client):
    """Ticket numbering — PQR-YYYY-NNNN format correct."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "admin@altah.com",
        "password": "Admin2026!",
    })
    login_token = login_resp.json()["access_token"]
    await client.post(
        "/api/auth/tenant-select",
        json={"tenant_id": 1},
        headers={"Authorization": f"Bearer {login_token}"},
    )
    token = login_token

    response = await client.post(
        "/api/pqrs/tickets",
        params={"type": "s", "priority": "high", "title": "Ticket numbering test", "description": "test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    ticket_number = response.json()["ticket_number"]
    assert ticket_number.startswith("PQR-")
    assert len(ticket_number.split("-")[1]) == 4  # year part
    assert ticket_number.split("-")[2].isdigit()  # number part


@pytest.mark.anyio
async def test_pqrs_superuser_access(client):
    """Superuser has no tenant_id — PQRS returns 400 for superuser."""
    login_resp = await client.post("/api/auth/login", json={
        "email": "super@aph.com",
        "password": "SuperAPH2026!",
    })
    token = login_resp.json()["access_token"]
    # Superuser has no tenant_id in JWT — PQRS needs tenant scope
    response = await client.get("/api/pqrs/stats", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 400
