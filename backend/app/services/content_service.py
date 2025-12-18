from sqlalchemy.orm import Session
from app.models.content import ContentSubmission, ComplianceStatus, InputType
from app.models.rule import Rule
from app.providers.llm_provider import LLMProvider
from app.providers.vector_provider import VectorProvider
from app.services.audit_service import AuditService
from uuid import UUID
from typing import List, Dict


class ContentService:
    """Service for AI content generation with compliance checking"""
    
    def __init__(
        self,
        db: Session,
        generator_llm: LLMProvider,
        reviewer_llm: LLMProvider,
        vector_provider: VectorProvider
    ):
        self.db = db
        self.generator_llm = generator_llm
        self.reviewer_llm = reviewer_llm
        self.vector_provider = vector_provider
    
    async def generate_content(
        self,
        prompt: str,
        user_id: UUID,
        use_prompt_enhancer: bool = False
    ) -> Dict:
        """Generate compliant content from prompt
        
        Flow:
        1. Optional prompt enhancement
        2. Load active rules
        3. Retrieve regulatory context from Pinecone
        4. Generate content
        5. AI reviewer checks output
        6. Deterministic rule validation
        7. Store submission
        """
        
        # Step 1: Enhance prompt if requested
        if use_prompt_enhancer:
            prompt = await self._enhance_prompt(prompt)
        
        # Step 2: Load active rules
        active_rules = self.db.query(Rule).filter(Rule.is_active == True).all()
        
        # Step 3: Retrieve regulatory context
        regulatory_context = await self._retrieve_regulatory_context(prompt, active_rules)
        
        # Step 4: Generate content with compliance constraints
        generated_content = await self._generate_with_compliance(
            prompt, 
            active_rules, 
            regulatory_context
        )
        
        # Step 5: AI reviewer check
        review_result = await self._ai_review(generated_content, active_rules)
        
        # Step 6: Deterministic rule validation
        validation_result = self._validate_against_rules(generated_content, active_rules)
        
        # Step 7: Determine compliance status
        compliance_status, rules_triggered = self._determine_compliance_status(
            review_result,
            validation_result
        )
        
        # Step 8: Store submission
        submission = ContentSubmission(
            user_id=user_id,
            input_type=InputType.PROMPT,
            input_reference=prompt,
            final_content=generated_content,
            compliance_status=compliance_status,
            rules_triggered=rules_triggered
        )
        
        self.db.add(submission)
        self.db.commit()
        self.db.refresh(submission)
        
        # Audit log
        AuditService.log_action(
            self.db,
            action_type="content_generated",
            actor_id=user_id,
            resource_type="content",
            resource_id=submission.submission_id,
            decision_summary=f"Generated content with status: {compliance_status.value}"
        )
        
        return {
            "submission": submission,
            "rules_triggered": rules_triggered
        }
    
    async def _enhance_prompt(self, prompt: str) -> str:
        """Enhance prompt with compliance constraints"""
        enhancement_prompt = f"""Enhance this content generation prompt by adding compliance awareness.
        
Original prompt: {prompt}

Add guidance to:
- Avoid unverified claims
- Use factual language
- Include appropriate disclaimers
- Follow regulatory best practices

Return only the enhanced prompt, nothing else."""
        
        result = await self.generator_llm.generate(
            prompt=enhancement_prompt,
            system_prompt="You enhance prompts for compliance-aware content generation.",
            temperature=0.5
        )
        
        return result["content"].strip()
    
    async def _retrieve_regulatory_context(self, prompt: str, rules: List[Rule]) -> str:
        """Retrieve relevant regulatory context from Pinecone"""
        try:
            # Create embedding for prompt
            embedding = await self.generator_llm.create_embedding(prompt)
            
            # Query Pinecone for relevant rules
            results = await self.vector_provider.query(
                vector=embedding,
                top_k=5,
                filter={"is_active": True},
                namespace="rules"
            )
            
            # Format context
            context = "Relevant compliance rules:\n"
            for match in results:
                context += f"- {match['metadata'].get('rule_text', '')}\n"
            
            return context
        except Exception as e:
            print(f"Failed to retrieve regulatory context: {str(e)}")
            return ""
    
    async def _generate_with_compliance(
        self,
        prompt: str,
        rules: List[Rule],
        regulatory_context: str
    ) -> str:
        """Generate content with compliance constraints"""
        
        # Build system prompt with rules
        rules_text = "\n".join([
            f"- [{r.severity.value}] {r.rule_text}" 
            for r in rules[:10]  # Top 10 most relevant
        ])
        
        system_prompt = f"""You are a compliance-aware content generator.

STRICT REQUIREMENTS:
{rules_text}

{regulatory_context}

Rules to follow:
1. Never make unverified claims
2. Always use factual, defensible language
3. Include appropriate disclaimers
4. Avoid superlatives without evidence
5. Respect all regulatory constraints

Generate professional, compliant content."""
        
        result = await self.generator_llm.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=1500
        )
        
        return result["content"]
    
    async def _ai_review(self, content: str, rules: List[Rule]) -> Dict:
        """AI reviewer model checks content for risks"""
        
        rules_text = "\n".join([f"- {r.rule_text}" for r in rules[:15]])
        
        review_schema = {
            "compliance_issues": [
                {"rule_violated": "string", "severity": "string", "explanation": "string"}
            ],
            "risk_level": "string",  # LOW, MEDIUM, HIGH
            "recommendations": ["string"]
        }
        
        review_prompt = f"""Review this content for compliance issues.

Content:
{content}

Rules to check:
{rules_text}

Identify any violations or risks."""
        
        try:
            result = await self.reviewer_llm.generate_structured(
                prompt=review_prompt,
                system_prompt="You are a strict compliance reviewer. Flag any potential violations.",
                response_schema=review_schema
            )
            return result
        except Exception as e:
            print(f"AI review failed: {str(e)}")
            return {"compliance_issues": [], "risk_level": "UNKNOWN", "recommendations": []}
    
    def _validate_against_rules(self, content: str, rules: List[Rule]) -> Dict:
        """Deterministic rule validation using pattern matching"""
        
        violations = []
        triggered = []
        
        content_lower = content.lower()
        
        for rule in rules:
            # Simple keyword-based checking (can be enhanced with regex)
            rule_lower = rule.rule_text.lower()
            
            # Extract keywords from rule (simplified)
            if "must not" in rule_lower or "never" in rule_lower or "prohibited" in rule_lower:
                # Negative rule - check if forbidden content present
                forbidden_keywords = self._extract_keywords(rule_lower, negative=True)
                if any(kw in content_lower for kw in forbidden_keywords):
                    violations.append({
                        "rule_id": str(rule.rule_id),
                        "rule_text": rule.rule_text,
                        "category": rule.category.value,
                        "severity": rule.severity.value,
                        "status": "violated"
                    })
            else:
                # Positive rule - just mark as triggered for awareness
                triggered.append({
                    "rule_id": str(rule.rule_id),
                    "rule_text": rule.rule_text,
                    "category": rule.category.value,
                    "severity": rule.severity.value,
                    "status": "triggered"
                })
        
        return {
            "violations": violations,
            "triggered": triggered
        }
    
    def _determine_compliance_status(
        self,
        ai_review: Dict,
        validation_result: Dict
    ) -> tuple:
        """Determine final compliance status"""
        
        all_rules_triggered = []
        
        # Add violations
        all_rules_triggered.extend(validation_result.get("violations", []))
        
        # Add AI-detected issues
        for issue in ai_review.get("compliance_issues", []):
            all_rules_triggered.append({
                "rule_id": "ai_detected",
                "rule_text": issue.get("rule_violated", ""),
                "category": "AI_REVIEW",
                "severity": issue.get("severity", "MEDIUM"),
                "status": "violated"
            })
        
        # Add triggered (non-violating) rules
        all_rules_triggered.extend(validation_result.get("triggered", []))
        
        # Determine status
        has_violations = (
            len(validation_result.get("violations", [])) > 0 or
            len(ai_review.get("compliance_issues", [])) > 0
        )
        
        status = ComplianceStatus.VIOLATIONS if has_violations else ComplianceStatus.COMPLIANT
        
        return status, all_rules_triggered
    
    @staticmethod
    def _extract_keywords(rule_text: str, negative: bool = False) -> List[str]:
        """Extract keywords from rule for matching (simplified)"""
        # This is a basic implementation - can be enhanced with NLP
        stop_words = {"must", "not", "never", "should", "be", "the", "a", "an", "is", "prohibited", "forbidden"}
        words = rule_text.lower().split()
        keywords = [w.strip(".,;:!?") for w in words if w not in stop_words and len(w) > 3]
        return keywords[:5]  # Top 5 keywords
