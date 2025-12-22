from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.rule import Rule, RuleCategory, RuleSeverity
from app.providers.llm_provider import LLMProvider
from app.providers.vector_provider import VectorProvider
from app.services.audit_service import AuditService
from uuid import UUID
from typing import List, Optional
import PyPDF2
import io


class RuleService:
    """Service for rule management with versioning"""
    
    def __init__(
        self,
        db: Session,
        llm_provider: LLMProvider,
        vector_provider: VectorProvider
    ):
        self.db = db
        self.llm_provider = llm_provider
        self.vector_provider = vector_provider
    
    async def create_rule(
        self,
        rule_text: str,
        category: RuleCategory,
        severity: RuleSeverity,
        created_by: UUID
    ) -> Rule:
        """Create a new rule with version 1"""
        
        # Create rule
        rule = Rule(
            rule_text=rule_text,
            category=category,
            severity=severity,
            version=1,
            is_active=True,
            created_by=created_by
        )
        
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        
        # Create embedding and store in Pinecone
        await self._store_rule_embedding(rule)
        
        # Audit log
        AuditService.log_action(
            self.db,
            action_type="rule_created",
            actor_id=created_by,
            resource_type="rule",
            resource_id=rule.rule_id,
            decision_summary=f"Created {category.value} rule (severity: {severity.value})"
        )
        
        return rule
    
    async def update_rule(
        self,
        rule_id: UUID,
        updated_by: UUID,
        rule_text: Optional[str] = None,
        category: Optional[RuleCategory] = None,
        severity: Optional[RuleSeverity] = None
    ) -> Rule:
        """Update a rule by creating a new version (immutable versioning)"""
        
        # Get current rule
        current_rule = self.db.query(Rule).filter(Rule.rule_id == rule_id).first()
        if not current_rule:
            raise ValueError("Rule not found")
        
        # Get max version for this rule text pattern
        max_version = self.db.query(Rule).filter(
            Rule.rule_text == (rule_text or current_rule.rule_text)
        ).order_by(desc(Rule.version)).first()
        
        new_version = (max_version.version if max_version else 0) + 1
        
        # Create new version
        new_rule = Rule(
            rule_text=rule_text or current_rule.rule_text,
            category=category or current_rule.category,
            severity=severity or current_rule.severity,
            version=new_version,
            is_active=True,
            created_by=updated_by
        )
        
        # Deactivate old version
        current_rule.is_active = False
        
        self.db.add(new_rule)
        self.db.commit()
        self.db.refresh(new_rule)
        
        # Update embedding in Pinecone
        await self._store_rule_embedding(new_rule)
        
        # Audit log
        AuditService.log_action(
            self.db,
            action_type="rule_updated",
            actor_id=updated_by,
            resource_type="rule",
            resource_id=new_rule.rule_id,
            decision_summary=f"Updated rule to version {new_version}",
            rule_version_used=new_version
        )
        
        return new_rule
    
    def activate_rule(self, rule_id: UUID, actor_id: UUID) -> Rule:
        """Activate a rule"""
        rule = self.db.query(Rule).filter(Rule.rule_id == rule_id).first()
        if not rule:
            raise ValueError("Rule not found")
        
        rule.is_active = True
        self.db.commit()
        
        AuditService.log_action(
            self.db,
            action_type="rule_activated",
            actor_id=actor_id,
            resource_type="rule",
            resource_id=rule_id
        )
        
        return rule
    
    def deactivate_rule(self, rule_id: UUID, actor_id: UUID) -> Rule:
        """Deactivate a rule"""
        rule = self.db.query(Rule).filter(Rule.rule_id == rule_id).first()
        if not rule:
            raise ValueError("Rule not found")
        
        rule.is_active = False
        self.db.commit()
        
        AuditService.log_action(
            self.db,
            action_type="rule_deactivated",
            actor_id=actor_id,
            resource_type="rule",
            resource_id=rule_id
        )
        
        return rule
    
    def get_active_rules(self) -> List[Rule]:
        """Get all active rules"""
        return self.db.query(Rule).filter(Rule.is_active == True).all()
    
    def get_all_rules(self) -> List[Rule]:
        """Get all rules including inactive versions"""
        return self.db.query(Rule).order_by(desc(Rule.created_at)).all()
    
    async def extract_rules_from_pdf(
        self,
        pdf_content: bytes,
        created_by: UUID
    ) -> List[Rule]:
        """Extract rules from uploaded PDF using LLM"""
        
        # Extract text from PDF
        pdf_text = self._extract_pdf_text(pdf_content)
        
        # Use LLM to extract rules
        extraction_prompt = f"""Extract compliance rules from this regulatory document.
        
For each rule you find:
1. Extract the exact rule text
2. Classify it as IRDAI, Brand, or SEO
3. Assign severity: LOW, MEDIUM, or HIGH

Document:
{pdf_text[:4000]}  

Respond with JSON array:
[
  {{"rule_text": "...", "category": "IRDAI", "severity": "HIGH"}},
  ...
]
"""
        
        try:
            result = await self.llm_provider.generate_structured(
                prompt=extraction_prompt,
                system_prompt="You are a compliance rule extraction system. Extract clear, actionable rules.",
            )
            
            # Create rules
            created_rules = []
            for item in result:
                rule = await self.create_rule(
                    rule_text=item["rule_text"],
                    category=RuleCategory[item["category"]],
                    severity=RuleSeverity[item["severity"]],
                    created_by=created_by
                )
                created_rules.append(rule)
            
            return created_rules
            
        except Exception as e:
            raise Exception(f"Failed to extract rules from PDF: {str(e)}")
    
    async def _store_rule_embedding(self, rule: Rule):
        """Store rule embedding in Pinecone"""
        try:
            # Create embedding
            embedding = await self.llm_provider.create_embedding(rule.rule_text)
            
            # Store in Pinecone
            await self.vector_provider.upsert(
                vectors=[{
                    "id": str(rule.rule_id),
                    "values": embedding,
                    "metadata": {
                        "rule_text": rule.rule_text,
                        "category": rule.category.value,
                        "severity": rule.severity.value,
                        "version": rule.version,
                        "is_active": rule.is_active
                    }
                }],
                namespace="rules"
            )
        except Exception as e:
            print(f"Failed to store embedding for rule {rule.rule_id}: {str(e)}")
    
    @staticmethod
    def _extract_pdf_text(pdf_content: bytes) -> str:
        """Extract text from PDF bytes"""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text
        except Exception as e:
            raise Exception(f"Failed to extract PDF text: {str(e)}")
