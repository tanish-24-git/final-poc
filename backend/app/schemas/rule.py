from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.rule import RuleCategory, RuleSeverity


class RuleCreate(BaseModel):
    """Schema for creating a new rule"""
    rule_text: str = Field(..., min_length=10, description="Rule text content")
    category: RuleCategory
    severity: RuleSeverity


class RuleUpdate(BaseModel):
    """Schema for updating a rule (creates new version)"""
    rule_text: Optional[str] = None
    category: Optional[RuleCategory] = None
    severity: Optional[RuleSeverity] = None


class RuleResponse(BaseModel):
    """Schema for rule response"""
    rule_id: UUID
    rule_text: str
    category: RuleCategory
    severity: RuleSeverity
    is_active: bool
    version: int
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DuplicateCheckRequest(BaseModel):
    """Schema for duplicate detection request"""
    rule_text: str


class DuplicateMatch(BaseModel):
    """Schema for duplicate match result"""
    rule_id: UUID
    rule_text: str
    similarity_score: float
    match_type: str  # "exact" or "semantic"


class DuplicateCheckResponse(BaseModel):
    """Schema for duplicate detection response"""
    is_duplicate: bool
    matches: List[DuplicateMatch]
