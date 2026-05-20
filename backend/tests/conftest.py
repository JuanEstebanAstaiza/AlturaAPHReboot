import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

# Shared engine from dependencies (same pool as get_db)
from app.dependencies import _get_test_engine
engine = _get_test_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_test_schema():
    """Create all tables for testing."""
    with open("app/sql/001_core_multitenant.sql") as f:
        ddl1 = f.read()
    with open("app/sql/002_property_structure.sql") as f:
        ddl2 = f.read()
    with open("app/sql/003_residents_personal.sql") as f:
        ddl3 = f.read()
    with open("app/sql/004_pqrs.sql") as f:
        ddl4 = f.read()

    # SQLite doesn't support ENUMs — replace CREATE TYPE with no-op
    # SQLite is typeless so column type references (e.g., subscription_status) are harmless
    for t in ["subscription_status", "user_role", "pqrs_type", "pqrs_status",
              "pqrs_priority", "document_access_level", "reservation_status",
              "contract_status", "infraction_status", "visitor_status",
              "assembly_type", "assembly_status", "commitment_status"]:
        ddl1 = ddl1.replace(f"CREATE TYPE {t} AS ENUM", "-- CREATE TYPE")

    # SQLite doesn't support INET — replace with TEXT
    ddl1 = ddl1.replace("ip_address INET", "ip_address TEXT")

    # SQLite doesn't support PostgreSQL-specific types/functions
    ddl1 = ddl1.replace("TIMESTAMPTZ", "TEXT").replace("JSONB", "TEXT").replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY").replace("DEFAULT NOW()", "DEFAULT CURRENT_TIMESTAMP")
    ddl2 = ddl2.replace("TIMESTAMPTZ", "TEXT").replace("JSONB", "TEXT").replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY").replace("DEFAULT NOW()", "DEFAULT CURRENT_TIMESTAMP")
    ddl3 = ddl3.replace("TIMESTAMPTZ", "TEXT").replace("JSONB", "TEXT").replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY").replace("DEFAULT NOW()", "DEFAULT CURRENT_TIMESTAMP")
    ddl4 = ddl4.replace("TIMESTAMPTZ", "TEXT").replace("JSONB", "TEXT").replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY").replace("DEFAULT NOW()", "DEFAULT CURRENT_TIMESTAMP")

    conn = engine.connect()
    for ddl in [ddl1, ddl2, ddl3, ddl4]:
        for stmt in ddl.split(";"):
            stmt = stmt.strip()
            # Strip inline comment lines to reveal SQL beneath
            lines = [l for l in stmt.split("\n") if not l.strip().startswith("--")]
            clean = "\n".join(l for l in lines if l.strip()).strip()
            if clean:
                try:
                    conn.execute(text(clean))
                except Exception:
                    pass
    conn.commit()


def load_seed_data():
    """Load SQLite-compatible seed data."""
    with open("app/sql/seed_sqlite.sql") as f:
        sql = f.read()
    conn = engine.connect()
    for stmt in sql.split(";"):
        stmt = stmt.strip()
        # Strip comment lines to reveal SQL beneath
        lines = [l for l in stmt.split("\n") if not l.strip().startswith("--")]
        clean = "\n".join(l for l in lines if l.strip()).strip()
        if clean:
            try:
                conn.execute(text(clean))
            except Exception:
                pass
    conn.commit()


# Create schema and seed data once
create_test_schema()
load_seed_data()


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="function")
async def client():
    """Reset PQRS data between tests to avoid UNIQUE conflicts."""
    # Clear PQRS tables before test
    conn = engine.connect()
    for table in ["pqrs_tickets", "pqrs_comments", "pqrs_attachments"]:
        conn.execute(text(f"DELETE FROM {table}"))
    conn.commit()
    # Reset auto-increment if sqlite_sequence exists
    try:
        conn.execute(text("DELETE FROM sqlite_sequence WHERE name IN ('pqrs_tickets', 'pqrs_categories')"))
        conn.commit()
    except Exception:
        pass

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
