from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base


class AuditLog(Base):
    """Audit log for tracking all system actions"""
    __tablename__ = "audit_logs"
    
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Action details
    action_type = Column(String(50), nullable=False, index=True)  # e.g., "rule_created", "content_generated"
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    
    # Resource tracking
    resource_type = Column(String(50))  # e.g., "rule", "content"
    resource_id = Column(UUID(as_uuid=True))
    
    # Decision tracking
    decision_summary = Column(Text)
    rule_version_used = Column(Integer)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f"<AuditLog {self.action_type} at {self.created_at}>"
