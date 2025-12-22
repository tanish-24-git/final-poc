from sqlalchemy.orm import Session
from app.models.rule import Rule
from app.providers.llm_provider import LLMProvider
from app.providers.vector_provider import VectorProvider
from app.core.config import settings
from typing import List, Dict
import re


class DuplicateDetector:
    """Service for detecting duplicate rules using SQL and semantic similarity"""
    
    def __init__(
        self,
        db: Session,
        llm_provider: LLMProvider,
        vector_provider: VectorProvider
    ):
        self.db = db
        self.llm_provider = llm_provider
        self.vector_provider = vector_provider
    
    async def check_duplicates(self, rule_text: str) -> Dict:
        """Check for duplicate rules using two-phase detection
        
        Phase 1: SQL exact match (case-insensitive)
        Phase 2: Semantic similarity via Pinecone
        
        Returns:
            {
                "is_duplicate": bool,
                "matches": [{"rule_id", "rule_text", "similarity_score", "match_type"}]
            }
        """
        matches = []
        
        # Phase 1: SQL exact match
        normalized_text = self._normalize_text(rule_text)
        exact_matches = self.db.query(Rule).filter(
            Rule.rule_text.ilike(f"%{rule_text}%")
        ).all()
        
        for rule in exact_matches:
            if self._normalize_text(rule.rule_text) == normalized_text:
                matches.append({
                    "rule_id": str(rule.rule_id),
                    "rule_text": rule.rule_text,
                    "similarity_score": 1.0,
                    "match_type": "exact"
                })
        
        # Phase 2: Semantic similarity
        try:
            # Create embedding for query
            embedding = await self.llm_provider.create_embedding(rule_text)
            
            # Query Pinecone
            similar_vectors = await self.vector_provider.query(
                vector=embedding,
                top_k=5,
                filter=None,
                namespace="rules"
            )
            
            # Filter by threshold
            for match in similar_vectors:
                if match["score"] >= settings.SEMANTIC_SIMILARITY_THRESHOLD:
                    # Check if not already in exact matches
                    rule_id = match["id"]
                    if not any(m["rule_id"] == rule_id for m in matches):
                        matches.append({
                            "rule_id": rule_id,
                            "rule_text": match["metadata"].get("rule_text", ""),
                            "similarity_score": match["score"],
                            "match_type": "semantic"
                        })
        except Exception as e:
            print(f"Semantic similarity check failed: {str(e)}")
            # Continue with SQL matches only
        
        return {
            "is_duplicate": len(matches) > 0,
            "matches": matches
        }
    
    @staticmethod
    def _normalize_text(text: str) -> str:
        """Normalize text for comparison"""
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove punctuation at boundaries
        text = text.strip('.,;:!? ')
        return text
