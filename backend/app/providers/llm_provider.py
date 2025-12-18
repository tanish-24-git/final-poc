from abc import ABC, abstractmethod
from typing import Dict, List, Optional


class LLMProvider(ABC):
    """Abstract base class for LLM providers
    
    This abstraction allows swapping between Gemini, Groq, AWS Bedrock, etc.
    without changing business logic.
    """
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> Dict:
        """Generate text from prompt
        
        Args:
            prompt: User prompt
            system_prompt: Optional system instructions
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Dict with 'content' and 'usage' keys
        """
        pass
    
    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        response_schema: Optional[Dict] = None,
        **kwargs
    ) -> Dict:
        """Generate structured JSON output
        
        Args:
            prompt: User prompt
            system_prompt: System instructions
            response_schema: Expected JSON schema
            
        Returns:
            Dict with parsed JSON content
        """
        pass
    
    @abstractmethod
    async def create_embedding(self, text: str) -> List[float]:
        """Create text embedding
        
        Args:
            text: Text to embed
            
        Returns:
            List of float values (embedding vector)
        """
        pass
