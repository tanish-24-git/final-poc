from abc import ABC, abstractmethod
from typing import List, Dict, Optional


class VectorProvider(ABC):
    """Abstract base class for vector database providers
    
    This abstraction allows swapping between Pinecone, OpenSearch, ChromaDB, etc.
    without changing business logic.
    """
    
    @abstractmethod
    async def upsert(
        self,
        vectors: List[Dict],
        namespace: Optional[str] = None
    ):
        """Upsert vectors into the database
        
        Args:
            vectors: List of dicts with 'id', 'values', and 'metadata' keys
            namespace: Optional namespace for organizing vectors
        """
        pass
    
    @abstractmethod
    async def query(
        self,
        vector: List[float],
        top_k: int = 10,
        filter: Optional[Dict] = None,
        namespace: Optional[str] = None
    ) -> List[Dict]:
        """Query similar vectors
        
        Args:
            vector: Query vector
            top_k: Number of results to return
            filter: Metadata filter
            namespace: Optional namespace
            
        Returns:
            List of dicts with 'id', 'score', and 'metadata' keys
        """
        pass
    
    @abstractmethod
    async def delete(
        self,
        ids: List[str],
        namespace: Optional[str] = None
    ):
        """Delete vectors by ID
        
        Args:
            ids: List of vector IDs to delete
            namespace: Optional namespace
        """
        pass
