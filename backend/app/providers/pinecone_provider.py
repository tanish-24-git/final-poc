from pinecone import Pinecone, ServerlessSpec
from app.providers.vector_provider import VectorProvider
from app.core.config import settings
from typing import List, Dict, Optional
import asyncio


class PineconeProvider(VectorProvider):
    """Pinecone vector database implementation"""
    
    def __init__(self):
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX
        
        # Get or create index
        try:
            self.index = self.pc.Index(
                name=self.index_name,
                host=settings.PINECONE_HOST
            )
        except Exception as e:
            raise Exception(f"Failed to connect to Pinecone index: {str(e)}")
    
    async def upsert(
        self,
        vectors: List[Dict],
        namespace: Optional[str] = None
    ):
        """Upsert vectors to Pinecone"""
        try:
            # Format vectors for Pinecone
            formatted_vectors = []
            for v in vectors:
                formatted_vectors.append({
                    "id": str(v["id"]),
                    "values": v["values"],
                    "metadata": v.get("metadata", {})
                })
            
            # Upsert in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.index.upsert(
                    vectors=formatted_vectors,
                    namespace=namespace or ""
                )
            )
        except Exception as e:
            raise Exception(f"Pinecone upsert failed: {str(e)}")
    
    async def query(
        self,
        vector: List[float],
        top_k: int = 10,
        filter: Optional[Dict] = None,
        namespace: Optional[str] = None
    ) -> List[Dict]:
        """Query Pinecone for similar vectors"""
        try:
            # Query in thread pool
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: self.index.query(
                    vector=vector,
                    top_k=top_k,
                    filter=filter,
                    namespace=namespace or "",
                    include_metadata=True
                )
            )
            
            # Format results
            formatted_results = []
            for match in results.get("matches", []):
                formatted_results.append({
                    "id": match["id"],
                    "score": match["score"],
                    "metadata": match.get("metadata", {})
                })
            
            return formatted_results
        except Exception as e:
            raise Exception(f"Pinecone query failed: {str(e)}")
    
    async def delete(
        self,
        ids: List[str],
        namespace: Optional[str] = None
    ):
        """Delete vectors from Pinecone"""
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.index.delete(
                    ids=[str(id) for id in ids],
                    namespace=namespace or ""
                )
            )
        except Exception as e:
            raise Exception(f"Pinecone delete failed: {str(e)}")
