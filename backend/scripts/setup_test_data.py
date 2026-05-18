"""
Script para ejecutar seed data de prueba.
Ejecuta todos los DDL files y seed data en la base de datos.

Uso:
  python scripts/setup_test_data.py
  python scripts/setup_test_data.py --sqlite  # usa SQLite para dev
"""
import sys
import os
import subprocess
from pathlib import Path


def get_sql_files():
    """Get all DDL SQL files in order."""
    sql_dir = Path(__file__).parent.parent / "app" / "sql"
    files = sorted(sql_dir.glob("*.sql"))
    return files


def execute_sql(sql_file, use_sqlite=False):
    """Execute a SQL file against the database."""
    print(f"  Executing: {sql_file.name}")

    if use_sqlite:
        # For SQLite, we need to adapt some PostgreSQL syntax
        # Skip enum types for SQLite MVP
        content = sql_file.read_text()
        # Replace SERIAL with AUTOINCREMENT for SQLite
        content = content.replace("SERIAL", "INTEGER")
        # Skip ENUM type definitions
        lines = content.split("\n")
        filtered_lines = [l for l in lines if not l.strip().startswith("CREATE TYPE")]
        content = "\n".join(filtered_lines)
        sql_file.write_text(content)

        result = subprocess.run(
            ["sqlite3", "./aph_dev.db"],
            input=content,
            text=True,
            capture_output=True,
        )
    else:
        # PostgreSQL via psql
        result = subprocess.run(
            ["psql", "-U", "aph_user", "-d", "aph_db", "-f", str(sql_file)],
            capture_output=True,
            text=True,
        )

    if result.returncode != 0:
        print(f"  ERROR: {result.stderr}")
        return False
    return True


def main():
    use_sqlite = "--sqlite" in sys.argv

    if use_sqlite:
        print("Using SQLite for development...")
    else:
        print("Using PostgreSQL...")

    print("\nExecuting DDL files:")
    sql_files = get_sql_files()
    all_ok = True

    for sql_file in sql_files:
        if not execute_sql(sql_file, use_sqlite):
            all_ok = False
            print(f"  Failed: {sql_file.name}")
            break

    if all_ok:
        print("\nSeed data loaded successfully!")
        print("\nTest credentials:")
        print("  Superuser: super@aph.com / SuperAPH2026!")
        print("  Admin:     admin@altah.com / Admin2026!")
        print("  Resident:  resident@altah.com / Resident2026!")
        print("\nTenants:")
        print("  1. Conjunto Altah (plan Professional, 120 units)")
        print("  2. Torres del Parque (plan Basic, 45 units)")
    else:
        print("\nSeed data loading failed. Check errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
