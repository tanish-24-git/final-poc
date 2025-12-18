from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.database import Base


class RuleCategory(str, enum.Enum):
    """Rule category enumeration"""
    IRDAI = "IRDAI"
    BRAND = "Brand"
    SEO = "SEO"


class RuleSeverity(str, enum.Enum):
    """Rule severity enumeration"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Rule(Base):
    """Rule model with versioning and categorization"""
    __tablename__ = "rules"
    
    rule_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_text = Column(Text, nullable=False)
    category = Column(Enum(RuleCategory), nullable=False)
    severity = Column(Enum(RuleSeverity), nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    version = Column(Integer, nullable=False, default=1)
    
    # Audit fields
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint on rule_text to prevent exact duplicates
    __table_args__ = (
        UniqueConstraint('rule_text', 'version', name='uq_rule_text_version'),
    )
    
    def __repr__(self):
        return f"<Rule {self.category.value} v{self.version} ({'active' if self.is_active else 'inactive'})>"
