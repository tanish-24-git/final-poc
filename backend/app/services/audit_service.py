from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from uuid import UUID
from typing import Optional


class AuditService:
    """Service for audit logging"""
    
    @staticmethod
    def log_action(
        db: Session,
        action_type: str,
        actor_id: UUID,
        resource_type: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        decision_summary: Optional[str] = None,
        rule_version_used: Optional[int] = None
    ) -> AuditLog:
        """Log an action to audit trail"""
        
        audit_log = AuditLog(
            action_type=action_type,
            actor_id=actor_id,
            resource_type=resource_type,
            resource_id=resource_id,
            decision_summary=decision_summary,
            rule_version_used=rule_version_used
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log
