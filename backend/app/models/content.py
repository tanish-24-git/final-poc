from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
import enum
from app.database import Base


class InputType(str, enum.Enum):
    """Content input type"""
    PROMPT = "prompt"
    DOCUMENT = "document"


class ComplianceStatus(str, enum.Enum):
    """Compliance status enumeration"""
    COMPLIANT = "compliant"
    VIOLATIONS = "violations"
    PENDING = "pending"


class ContentSubmission(Base):
    """Content submission model with compliance tracking"""
    __tablename__ = "content_submissions"
    
    submission_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    
    # Input data
    input_type = Column(Enum(InputType), nullable=False)
    input_reference = Column(Text, nullable=False)  # Original prompt or filename
    
    # Generated/processed content
    final_content = Column(Text)
    
    # Compliance tracking
    compliance_status = Column(Enum(ComplianceStatus), nullable=False, default=ComplianceStatus.PENDING)
    rules_triggered = Column(JSONB)  # List of {rule_id, severity, status: "triggered"|"violated"}
    
    # Admin approval
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    approval_status = Column(String(20), nullable=True)  # "approved" or "rejected"
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ContentSubmission {self.submission_id} ({self.compliance_status.value})>"
