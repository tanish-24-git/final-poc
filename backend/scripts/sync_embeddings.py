import asyncio
import sys
import os
import traceback

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Rule
from app.providers.gemini_provider import GeminiProvider
from app.providers.pinecone_provider import PineconeProvider

async def sync_embeddings():
    """Sync all rule embeddings from DB to Pinecone"""
    print("🔄 Starting embedding sync...")
    
    db = SessionLocal()
    
    try:
        # Get all rules
        rules = db.query(Rule).filter(Rule.is_active == True).all()
        print(f"📋 Found {len(rules)} active rules in database")
        
        if not rules:
            print("⚠️ No rules found to sync")
            return

        # Initialize providers
        print("🔌 Initializing providers...")
        llm_provider = GeminiProvider()
        vector_provider = PineconeProvider()
        
        print(f"🤖 Using Embedding Model: {llm_provider.embedding_model}")
        print(f"🌲 Using Pinecone Index: {vector_provider.index_name}")
        
        vectors = []
        failed_count = 0
        
        # Process in batches of 10 to avoid hitting rate limits too hard
        batch_size = 10
        total_batches = (len(rules) + batch_size - 1) // batch_size
        
        for i in range(0, len(rules), batch_size):
            batch = rules[i : i + batch_size]
            current_batch_num = (i // batch_size) + 1
            print(f"📦 Processing batch {current_batch_num}/{total_batches} ({len(batch)} rules)...")
            
            for rule in batch:
                try:
                    # Create embedding
                    print(f"   Generating embedding for rule {rule.rule_id}...")
                    embedding = await llm_provider.create_embedding(rule.rule_text)
                    
                    vector = {
                        "id": str(rule.rule_id),
                        "values": embedding,
                        "metadata": {
                            "rule_text": rule.rule_text,
                            "category": rule.category.value,
                            "severity": rule.severity.value,
                            "version": rule.version,
                            "is_active": rule.is_active
                        }
                    }
                    vectors.append(vector)
                    print(f"   ✅ Generated embedding (dim: {len(embedding)})")
                    
                except Exception as e:
                    print(f"   ❌ Failed to generate embedding for rule {rule.rule_id}: {str(e)}")
                    failed_count += 1
            
            # Upsert batch
            if vectors:
                try:
                    print(f"   ⬆️  Upserting {len(vectors)} vectors to Pinecone...")
                    await vector_provider.upsert(vectors, namespace="rules")
                    vectors = [] # Clear buffer after upsert
                except Exception as e:
                    print(f"   ❌ Batch upsert failed: {str(e)}")
                    traceback.print_exc()

        print("\n🏁 Sync completed")
        print(f"✅ Successfully synced: {len(rules) - failed_count}")
        print(f"❌ Failed: {failed_count}")

    except Exception as e:
        print(f"❌ Fatal error during sync: {str(e)}")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(sync_embeddings())
