
import asyncio
import os
import sys

# Add the parent directory to sys.path to resolve imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.providers.pinecone_provider import PineconeProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider
from app.core.config import settings

async def verify_pinecone():
    print("Initializing providers...")
    
    # Initialize embedding provider (needed to create query vector)
    if settings.DEFAULT_LLM_PROVIDER == "gemini":
        llm = GeminiProvider()
    else:
        llm = GroqProvider()
        
    print(f"Using LLM Provider: {settings.DEFAULT_LLM_PROVIDER}")
    
    # Initialize Pinecone provider
    pinecone = PineconeProvider()
    
    # The rule text to verify
    rule_text = "Insurance marketing content must clearly state that all policy benefits are subject to specific exclusions, limitations, and terms and conditions. The disclosure must be written in plain, consumer-friendly language and must not be hidden or implied."
    
    print(f"\nVerifying rule: {rule_text[:50]}...")
    
    # 1. Generate embedding for the rule text
    print("Generating embedding...")
    embedding = await llm.create_embedding(rule_text)
    
    # 2. Query Pinecone
    print("Querying Pinecone...")
    results = await pinecone.query(
        vector=embedding,
        top_k=5,
        namespace="rules" # Ensure namespace matches what is used in RuleService (usually empty or "rules")
    )
    
    # 3. Check results
    found = False
    print("\nResults:")
    for match in results:
        print(f"- ID: {match['id']}, Score: {match['score']}")
        # Check metadata if available, though RuleService might store just ID or text in metadata
        if match.get('metadata'):
            print(f"  Metadata: {match['metadata']}")
            if match['metadata'].get('text') == rule_text:  # Assuming text is stored in metadata
                found = True
        
        # Also check purely by high similarity score (e.g. > 0.99 for exact match)
        if match['score'] > 0.99:
             found = True

    if found:
        print("\nSUCCESS: Rule found in Pinecone!")
    else:
        print("\nWARNING: Rule NOT explicitly found (no exact text match in metadata or score < 0.99).")

if __name__ == "__main__":
    asyncio.run(verify_pinecone())
