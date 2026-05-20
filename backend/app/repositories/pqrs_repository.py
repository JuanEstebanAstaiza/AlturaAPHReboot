from dataclasses import dataclass
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


@dataclass
class PQRSTicketRecord:
    id: int
    ticket_number: str
    tenant_id: int
    type: str
    status: str
    priority: str
    title: str
    description: str
    created_by: int
    created_by_name: Optional[str]
    assigned_to: Optional[int]
    assigned_to_name: Optional[str]
    created_at: str
    updated_at: str
    closed_at: Optional[str]


@dataclass
class PQRSTicketListRecord:
    id: int
    ticket_number: str
    type: str
    status: str
    priority: str
    title: str
    created_by_name: Optional[str]
    assigned_to_name: Optional[str]
    created_at: str


@dataclass
class PQRSCommentRecord:
    id: int
    ticket_id: int
    user_id: int
    user_name: Optional[str]
    message: str
    created_at: str


@dataclass
class PQRSAttachmentRecord:
    id: int
    ticket_id: int
    file_name: str
    file_type: Optional[str]
    file_size: Optional[int]
    uploaded_by: int
    uploaded_by_name: Optional[str]
    uploaded_at: str


@dataclass
class PQRSCategoryRecord:
    id: int
    tenant_id: int
    name: str
    pqrs_type: str
    default_assigned_user_id: Optional[int]
    escalation_timeout_hours: int
    created_at: str


@dataclass
class PQRSStatsRecord:
    tenant_id: int
    total_tickets: int
    open_count: int
    in_progress_count: int
    escalated_count: int
    closed_count: int
    by_type: dict
    by_priority: dict
    by_status: dict


class PQRSTicketRepository:
    """Repository for PQRS operations with real DB queries."""

    def __init__(self, db: Session):
        self.db = db

    def _get_user_name(self, user_id: int) -> Optional[str]:
        result = self.db.execute(
            text("SELECT name FROM users WHERE id = :uid"),
            {"uid": user_id},
        )
        row = result.fetchone()
        return row[0] if row else None

    def _ticket_from_rows(self, ticket_row, db: Session) -> PQRSTicketRecord:
        if not ticket_row:
            return None
        return PQRSTicketRecord(
            id=ticket_row[0], ticket_number=ticket_row[1], tenant_id=ticket_row[2],
            type=ticket_row[3], status=ticket_row[4], priority=ticket_row[5],
            title=ticket_row[6], description=ticket_row[7],
            created_by=ticket_row[8], created_by_name=self._get_user_name(ticket_row[8]),
            assigned_to=ticket_row[9], assigned_to_name=self._get_user_name(ticket_row[9]) if ticket_row[9] else None,
            created_at=str(ticket_row[10]), updated_at=str(ticket_row[11]),
            closed_at=str(ticket_row[12]) if ticket_row[12] else None,
        )

    def create_ticket(
        self, ticket_number: str, tenant_id: int, type: str, priority: str,
        title: str, description: str, created_by: int, assigned_to: Optional[int],
    ) -> PQRSTicketRecord:
        result = self.db.execute(
            text("""INSERT INTO pqrs_tickets
                (ticket_number, tenant_id, type, priority, title, description, created_by, assigned_to)
                VALUES (:ticket_number, :tenant_id, :type, :priority, :title, :description, :created_by, :assigned_to)
                RETURNING id, ticket_number, tenant_id, type, status, priority, title, description,
                          created_by, assigned_to, created_at, updated_at, closed_at"""),
            {
                "ticket_number": ticket_number,
                "tenant_id": tenant_id,
                "type": type,
                "priority": priority,
                "title": title,
                "description": description,
                "created_by": created_by,
                "assigned_to": assigned_to,
            },
        )
        row = result.fetchone()
        return self._ticket_from_rows(row, self.db)

    def get_ticket(self, ticket_id: int, tenant_id: int) -> Optional[PQRSTicketRecord]:
        result = self.db.execute(
            text("""SELECT id, ticket_number, tenant_id, type, status, priority, title, description,
                          created_by, assigned_to, created_at, updated_at, closed_at
                   FROM pqrs_tickets
                   WHERE id = :tid AND tenant_id = :tenant_id"""),
            {"tid": ticket_id, "tenant_id": tenant_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return self._ticket_from_rows(row, self.db)

    def list_tickets(
        self, tenant_id: int, status: Optional[str] = None, priority: Optional[str] = None,
        type: Optional[str] = None, assigned_to: Optional[int] = None, search: Optional[str] = None,
        limit: int = 50, offset: int = 0,
    ) -> list[PQRSTicketListRecord]:
        clauses = ["t.tenant_id = :tenant_id"]
        params: dict = {"tenant_id": tenant_id, "limit": limit, "offset": offset}
        if status:
            clauses.append("t.status = :status")
            params["status"] = status
        if priority:
            clauses.append("t.priority = :priority")
            params["priority"] = priority
        if type:
            clauses.append("t.type = :type")
            params["type"] = type
        if assigned_to is not None:
            clauses.append("t.assigned_to = :assigned_to")
            params["assigned_to"] = assigned_to
        if search:
            clauses.append("(t.ticket_number ILIKE :search OR t.title ILIKE :search)")
            params["search"] = f"%{search}%"

        where = " AND ".join(clauses)
        result = self.db.execute(
            text(f"""SELECT t.id, t.ticket_number, t.type, t.status, t.priority, t.title,
                          t.created_at
                   FROM pqrs_tickets t
                   WHERE {where}
                   ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset"""),
            params,
        )
        rows = result.fetchall()
        return [
            PQRSTicketListRecord(
                id=r[0], ticket_number=r[1], type=r[2], status=r[3], priority=r[4],
                title=r[5], created_by_name=self._get_user_name(r[6]),
                assigned_to_name=self._get_user_name(r[7]) if r[7] else None,
                created_at=str(r[8]),
            )
            for r in rows
        ]

    def update_ticket(
        self, ticket_id: int, tenant_id: int, status: Optional[str] = None,
        priority: Optional[str] = None, assigned_to: Optional[int] = None,
    ) -> Optional[PQRSTicketRecord]:
        set_clauses = ["updated_at = CURRENT_TIMESTAMP"]
        params: dict = {"id": ticket_id, "tenant_id": tenant_id}
        if status:
            set_clauses.append("status = :status")
            params["status"] = status
        if priority:
            set_clauses.append("priority = :priority")
            params["priority"] = priority
        if assigned_to is not None:
            set_clauses.append("assigned_to = :assigned_to")
            params["assigned_to"] = assigned_to
        if status == "closed":
            set_clauses.append("closed_at = CURRENT_TIMESTAMP")

        result = self.db.execute(
            text(f"""UPDATE pqrs_tickets SET {', '.join(set_clauses)}
                     WHERE id = :id AND tenant_id = :tenant_id
                     RETURNING id, ticket_number, tenant_id, type, status, priority, title, description,
                               created_by, assigned_to, created_at, updated_at, closed_at"""),
            params,
        )
        row = result.fetchone()
        if not row:
            return None
        return self._ticket_from_rows(row, self.db)

    def generate_ticket_number(self, tenant_id: int) -> str:
        year_expr = text("CAST(strftime('%Y', CURRENT_TIMESTAMP) AS INTEGER)")
        result = self.db.execute(
            text(f"""SELECT COALESCE(MAX(CAST(SUBSTR(ticket_number, 5, 4) AS INTEGER)), 0)
                     FROM pqrs_tickets
                     WHERE tenant_id = :tenant_id
                     AND CAST(strftime('%Y', created_at) AS INTEGER) = {year_expr}"""),
            {"tenant_id": tenant_id},
        )
        row = result.fetchone()
        year = int(self.db.execute(text("SELECT strftime('%Y', CURRENT_TIMESTAMP)")).fetchone()[0])
        next_num = (row[0] or 0) + 1
        return f"PQR-{year}-{next_num:04d}"

    def get_comments(self, ticket_id: int, tenant_id: int) -> list[PQRSCommentRecord]:
        result = self.db.execute(
            text("""SELECT c.id, c.ticket_id, c.user_id, c.message, c.created_at
                   FROM pqrs_comments c
                   WHERE c.ticket_id = :tid AND EXISTS (
                       SELECT 1 FROM pqrs_tickets t WHERE t.id = c.ticket_id AND t.tenant_id = :tenant_id
                   )"""),
            {"tid": ticket_id, "tenant_id": tenant_id},
        )
        rows = result.fetchall()
        return [
            PQRSCommentRecord(
                id=r[0], ticket_id=r[1], user_id=r[2], user_name=self._get_user_name(r[2]),
                message=r[3], created_at=str(r[4]),
            )
            for r in rows
        ]

    def add_comment(self, ticket_id: int, user_id: int, message: str) -> PQRSCommentRecord:
        result = self.db.execute(
            text("""INSERT INTO pqrs_comments (ticket_id, user_id, message)
                   VALUES (:ticket_id, :user_id, :message)
                   RETURNING id, ticket_id, user_id, message, created_at"""),
            {"ticket_id": ticket_id, "user_id": user_id, "message": message},
        )
        row = result.fetchone()
        return PQRSCommentRecord(
            id=row[0], ticket_id=row[1], user_id=row[2], user_name=self._get_user_name(row[2]),
            message=row[3], created_at=str(row[4]),
        )

    def get_attachments(self, ticket_id: int, tenant_id: int) -> list[PQRSAttachmentRecord]:
        result = self.db.execute(
            text("""SELECT a.id, a.ticket_id, a.file_name, a.file_type, a.file_size,
                          a.uploaded_by, a.uploaded_at
                   FROM pqrs_attachments a
                   WHERE a.ticket_id = :tid AND EXISTS (
                       SELECT 1 FROM pqrs_tickets t WHERE t.id = a.ticket_id AND t.tenant_id = :tenant_id
                   )"""),
            {"tid": ticket_id, "tenant_id": tenant_id},
        )
        rows = result.fetchall()
        return [
            PQRSAttachmentRecord(
                id=r[0], ticket_id=r[1], file_name=r[2], file_type=r[3],
                file_size=r[4], uploaded_by=r[5], uploaded_by_name=self._get_user_name(r[5]),
                uploaded_at=str(r[6]),
            )
            for r in rows
        ]

    def get_stats(self, tenant_id: int) -> PQRSStatsRecord:
        result = self.db.execute(
            text("""SELECT tenant_id,
                          COUNT(*) as total_tickets,
                          COUNT(*) FILTER (WHERE status = 'open') as open_count,
                          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
                          COUNT(*) FILTER (WHERE status = 'escalated') as escalated_count,
                          COUNT(*) FILTER (WHERE status = 'closed') as closed_count
                   FROM pqrs_tickets
                   WHERE tenant_id = :tenant_id
                   GROUP BY tenant_id"""),
            {"tenant_id": tenant_id},
        )
        row = result.fetchone()
        if not row:
            return PQRSStatsRecord(tenant_id, 0, 0, 0, 0, 0, {}, {}, {})

        by_type_result = self.db.execute(
            text("""SELECT type, COUNT(*) FROM pqrs_tickets
                   WHERE tenant_id = :tenant_id GROUP BY type"""),
            {"tenant_id": tenant_id},
        )
        by_type = {r[0]: r[1] for r in by_type_result.fetchall()}

        by_priority_result = self.db.execute(
            text("""SELECT priority, COUNT(*) FROM pqrs_tickets
                   WHERE tenant_id = :tenant_id GROUP BY priority"""),
            {"tenant_id": tenant_id},
        )
        by_priority = {r[0]: r[1] for r in by_priority_result.fetchall()}

        by_status_result = self.db.execute(
            text("""SELECT status, COUNT(*) FROM pqrs_tickets
                   WHERE tenant_id = :tenant_id GROUP BY status"""),
            {"tenant_id": tenant_id},
        )
        by_status = {r[0]: r[1] for r in by_status_result.fetchall()}

        return PQRSStatsRecord(
            tenant_id=row[0], total_tickets=row[1], open_count=row[2],
            in_progress_count=row[3], escalated_count=row[4], closed_count=row[5],
            by_type=by_type, by_priority=by_priority, by_status=by_status,
        )

    def get_categories(self, tenant_id: int) -> list[PQRSCategoryRecord]:
        result = self.db.execute(
            text("""SELECT id, tenant_id, name, pqrs_type, default_assigned_user_id,
                          escalation_timeout_hours, created_at
                   FROM pqrs_categories WHERE tenant_id = :tenant_id ORDER BY name"""),
            {"tenant_id": tenant_id},
        )
        rows = result.fetchall()
        return [
            PQRSCategoryRecord(
                id=r[0], tenant_id=r[1], name=r[2], pqrs_type=r[3],
                default_assigned_user_id=r[4], escalation_timeout_hours=r[5],
                created_at=str(r[6]),
            )
            for r in rows
        ]

    def create_category(
        self, tenant_id: int, name: str, pqrs_type: str,
        default_assigned_user_id: Optional[int], escalation_timeout_hours: int,
    ) -> PQRSCategoryRecord:
        result = self.db.execute(
            text("""INSERT INTO pqrs_categories (tenant_id, name, pqrs_type, default_assigned_user_id, escalation_timeout_hours)
                   VALUES (:tenant_id, :name, :pqrs_type, :assigned_user_id, :timeout)
                   RETURNING id, tenant_id, name, pqrs_type, default_assigned_user_id, escalation_timeout_hours, created_at"""),
            {
                "tenant_id": tenant_id,
                "name": name,
                "pqrs_type": pqrs_type,
                "assigned_user_id": default_assigned_user_id,
                "timeout": escalation_timeout_hours,
            },
        )
        row = result.fetchone()
        return PQRSCategoryRecord(
            id=row[0], tenant_id=row[1], name=row[2], pqrs_type=row[3],
            default_assigned_user_id=row[4], escalation_timeout_hours=row[5],
            created_at=str(row[6]),
        )

    def get_auto_route(self, tenant_id: int, pqrs_type: str) -> Optional[int]:
        result = self.db.execute(
            text("""SELECT default_assigned_user_id FROM pqrs_categories
                   WHERE tenant_id = :tenant_id AND pqrs_type = :pqrs_type
                   ORDER BY escalation_timeout_hours ASC LIMIT 1"""),
            {"tenant_id": tenant_id, "pqrs_type": pqrs_type},
        )
        row = result.fetchone()
        return row[0]

    def get_open_tickets_overdue(self, tenant_id: int, hours: int = 48) -> list[int]:
        result = self.db.execute(
            text("""SELECT id FROM pqrs_tickets
                   WHERE tenant_id = :tenant_id AND status = 'open'
                   AND created_at < datetime('now', :hours_offset)"""),
            {"tenant_id": tenant_id, "hours_offset": f"-{hours} hours"},
        )
        return [r[0] for r in result.fetchall()]

    def bulk_escalate(self, ticket_ids: list[int]) -> int:
        if not ticket_ids:
            return 0
        placeholders = ", ".join(f":tid{i}" for i in range(len(ticket_ids)))
        params = {f"tid{i}": tid for i, tid in enumerate(ticket_ids)}
        result = self.db.execute(
            text(f"""UPDATE pqrs_tickets SET status = 'escalated', updated_at = CURRENT_TIMESTAMP
                     WHERE id IN ({placeholders}) AND status = 'open'"""),
            params,
        )
        return result.rowcount
