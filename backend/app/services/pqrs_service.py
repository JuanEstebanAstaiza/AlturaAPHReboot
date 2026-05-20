from typing import Optional
from sqlalchemy import text
from app.config import Settings
from app.core.constants import SUBSCRIPTION_PLANS
from app.core.exceptions import PQRSError, UserNotFoundError, FeatureNotAvailableError
from app.repositories.pqrs_repository import PQRSTicketRepository


class PQRSService:
    """Business logic for PQRS module."""

    def __init__(self, settings: Settings):
        self.settings = settings

    def validate_feature(self, tenant_plan: str, feature: str = "pqrs"):
        plan = SUBSCRIPTION_PLANS.get(tenant_plan)
        if not plan or not plan.get("features", {}).get(feature, False):
            raise FeatureNotAvailableError(feature, plan.get("code", tenant_plan) if plan else tenant_plan)

    def create_ticket(
        self, user_id: int, tenant_id: int, tenant_plan: str,
        pqrs_type: str, priority: str, title: str, description: str,
        db,
    ):
        self.validate_feature(tenant_plan)

        repo = PQRSTicketRepository(db)

        # Generate ticket number
        ticket_number = repo.generate_ticket_number(tenant_id)

        # Auto-route: lookup category for default assignment
        assigned_to = repo.get_auto_route(tenant_id, pqrs_type)

        # Create ticket
        ticket = repo.create_ticket(
            ticket_number=ticket_number,
            tenant_id=tenant_id,
            type=pqrs_type,
            priority=priority,
            title=title,
            description=description,
            created_by=user_id,
            assigned_to=assigned_to,
        )

        # Log audit event
        self._log_audit(db, user_id, tenant_id, "pqrs_ticket_created", {
            "ticket_id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "type": pqrs_type,
        })

        return self._ticket_to_dict(ticket)

    def get_ticket(self, ticket_id: int, tenant_id: int, db):
        repo = PQRSTicketRepository(db)
        ticket = repo.get_ticket(ticket_id, tenant_id)
        if not ticket:
            raise PQRSError(f"PQRS ticket {ticket_id} not found")
        return self._ticket_to_dict(ticket)

    def list_tickets(
        self, tenant_id: int, tenant_plan: str,
        status: Optional[str] = None, priority: Optional[str] = None,
        type: Optional[str] = None, assigned_to: Optional[int] = None,
        search: Optional[str] = None, limit: int = 50, offset: int = 0,
        db=None,
    ):
        self.validate_feature(tenant_plan)
        repo = PQRSTicketRepository(db)
        tickets = repo.list_tickets(
            tenant_id=tenant_id, status=status, priority=priority,
            type=type, assigned_to=assigned_to, search=search,
            limit=limit, offset=offset,
        )
        return [self._ticket_list_to_dict(t) for t in tickets]

    def update_ticket(
        self, ticket_id: int, tenant_id: int, user_id: int,
        status: Optional[str] = None, priority: Optional[str] = None,
        assigned_to: Optional[int] = None, db=None,
    ):
        repo = PQRSTicketRepository(db)
        ticket = repo.update_ticket(
            ticket_id=ticket_id, tenant_id=tenant_id,
            status=status, priority=priority, assigned_to=assigned_to,
        )
        if not ticket:
            raise PQRSError(f"PQRS ticket {ticket_id} not found")

        self._log_audit(db, user_id, tenant_id, "pqrs_ticket_updated", {
            "ticket_id": ticket.id,
            "changes": {k: v for k, v in {"status": status, "priority": priority, "assigned_to": assigned_to}.items() if v is not None},
        })

        return self._ticket_to_dict(ticket)

    def update_status(
        self, ticket_id: int, tenant_id: int, user_id: int,
        new_status: str, db=None,
    ):
        return self.update_ticket(ticket_id, tenant_id, user_id, status=new_status, db=db)

    def assign_ticket(
        self, ticket_id: int, tenant_id: int, user_id: int,
        target_user_id: int, db=None,
    ):
        # Validate target user exists
        user_repo = __import__("app.repositories.user_repository", fromlist=["UserRepository"]).UserRepository(db)
        target = user_repo.find_by_id(target_user_id)
        if not target:
            raise UserNotFoundError(target_user_id)

        return self.update_ticket(ticket_id, tenant_id, user_id, assigned_to=target_user_id, db=db)

    def get_comments(self, ticket_id: int, tenant_id: int, db):
        repo = PQRSTicketRepository(db)
        comments = repo.get_comments(ticket_id, tenant_id)
        return [self._comment_to_dict(c) for c in comments]

    def add_comment(
        self, ticket_id: int, tenant_id: int, user_id: int,
        message: str, db=None,
    ):
        # Validate ticket exists and user has permission
        repo = PQRSTicketRepository(db)
        ticket = repo.get_ticket(ticket_id, tenant_id)
        if not ticket:
            raise PQRSError(f"PQRS ticket {ticket_id} not found")

        # All users can comment on any ticket in their tenant

        comment = repo.add_comment(ticket_id, user_id, message)
        self._log_audit(db, user_id, tenant_id, "pqrs_comment_added", {
            "ticket_id": ticket_id,
        })
        return self._comment_to_dict(comment)

    def get_attachments(self, ticket_id: int, tenant_id: int, db):
        repo = PQRSTicketRepository(db)
        attachments = repo.get_attachments(ticket_id, tenant_id)
        return [self._attachment_to_dict(a) for a in attachments]

    def get_stats(self, tenant_id: int, db):
        repo = PQRSTicketRepository(db)
        stats = repo.get_stats(tenant_id)
        return {
            "tenant_id": stats.tenant_id,
            "total_tickets": stats.total_tickets,
            "open_count": stats.open_count,
            "in_progress_count": stats.in_progress_count,
            "escalated_count": stats.escalated_count,
            "closed_count": stats.closed_count,
            "by_type": stats.by_type,
            "by_priority": stats.by_priority,
            "by_status": stats.by_status,
        }

    def get_categories(self, tenant_id: int, db):
        repo = PQRSTicketRepository(db)
        categories = repo.get_categories(tenant_id)
        return [self._category_to_dict(c) for c in categories]

    def create_category(
        self, tenant_id: int, admin_id: int, name: str,
        pqrs_type: str, default_assigned_user_id: Optional[int],
        escalation_timeout_hours: int, db=None,
    ):
        repo = PQRSTicketRepository(db)
        category = repo.create_category(
            tenant_id=tenant_id, name=name, pqrs_type=pqrs_type,
            default_assigned_user_id=default_assigned_user_id,
            escalation_timeout_hours=escalation_timeout_hours,
        )
        self._log_audit(db, admin_id, tenant_id, "pqrs_category_created", {
            "category_id": category.id,
            "name": name,
        })
        return self._category_to_dict(category)

    def check_escalations(self, tenant_id: int, db):
        repo = PQRSTicketRepository(db)
        overdue_ids = repo.get_open_tickets_overdue(tenant_id, 48)
        if not overdue_ids:
            return 0
        count = repo.bulk_escalate(overdue_ids)
        if count > 0:
            self._log_audit(db, 0, tenant_id, "pqrs_escalations_auto", {
                "escalated_count": count,
                "ticket_ids": overdue_ids,
            })
        return count

    def _ticket_to_dict(self, ticket) -> dict:
        return {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "tenant_id": ticket.tenant_id,
            "type": ticket.type,
            "status": ticket.status,
            "priority": ticket.priority,
            "title": ticket.title,
            "description": ticket.description,
            "created_by": ticket.created_by,
            "created_by_name": ticket.created_by_name,
            "assigned_to": ticket.assigned_to,
            "assigned_to_name": ticket.assigned_to_name,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at,
            "closed_at": ticket.closed_at,
        }

    def _ticket_list_to_dict(self, ticket) -> dict:
        return {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "type": ticket.type,
            "status": ticket.status,
            "priority": ticket.priority,
            "title": ticket.title,
            "created_by_name": ticket.created_by_name,
            "assigned_to_name": ticket.assigned_to_name,
            "created_at": ticket.created_at,
        }

    def _comment_to_dict(self, comment) -> dict:
        return {
            "id": comment.id,
            "ticket_id": comment.ticket_id,
            "user_id": comment.user_id,
            "user_name": comment.user_name,
            "message": comment.message,
            "created_at": comment.created_at,
        }

    def _attachment_to_dict(self, attachment) -> dict:
        return {
            "id": attachment.id,
            "ticket_id": attachment.ticket_id,
            "file_name": attachment.file_name,
            "file_type": attachment.file_type,
            "file_size": attachment.file_size,
            "uploaded_by": attachment.uploaded_by,
            "uploaded_by_name": attachment.uploaded_by_name,
            "uploaded_at": attachment.uploaded_at,
        }

    def _category_to_dict(self, category) -> dict:
        return {
            "id": category.id,
            "tenant_id": category.tenant_id,
            "name": category.name,
            "pqrs_type": category.pqrs_type,
            "default_assigned_user_id": category.default_assigned_user_id,
            "escalation_timeout_hours": category.escalation_timeout_hours,
            "created_at": category.created_at,
        }

    def _log_audit(self, db, user_id: int, tenant_id: int, action: str, details: dict):
        """Log an audit event for PQRS operations."""
        try:
            db.execute(
                text("""INSERT INTO audit_logs (user_id, tenant_id, action, details)
                       VALUES (:user_id, :tenant_id, :action, :details_json)"""),
                {
                    "user_id": user_id,
                    "tenant_id": tenant_id,
                    "action": action,
                    "details_json": str(details),
                },
            )
        except Exception:
            pass  # Audit logging should not break PQRS operations
