import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import User, Rule
from app.models.user import UserRole
from app.models.rule import RuleCategory, RuleSeverity
from app.providers.gemini_provider import GeminiProvider
from app.providers.pinecone_provider import PineconeProvider
import uuid


async def seed_database():
    """Seed database with initial users and rules"""
    
    print("🌱 Starting database seeding...")
    
    # Create tables
    print("📋 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("✅ Database already seeded, skipping...")
            return
        
        # Create 3 users
        print("👥 Creating users...")
        users = [
            User(
                username="agent_user",
                role=UserRole.AGENT
            ),
            User(
                username="admin_user",
                role=UserRole.ADMIN
            ),
            User(
                username="super_admin_user",
                role=UserRole.SUPER_ADMIN
            )
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        print(f"✅ Created {len(users)} users")
        
        # Get super_admin for rule creation
        super_admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
        
        # Create 5 seed rules
        print("📏 Creating rules...")
        seed_rules = [
            {
                "rule_text": "Insurance products must not use terms like 'guaranteed returns' or 'assured returns' without explicit regulatory approval.",
                "category": RuleCategory.IRDAI,
                "severity": RuleSeverity.HIGH
            },
            {
                "rule_text": "All insurance policy terms must include clear disclosure of exclusions and limitations in plain language.",
                "category": RuleCategory.IRDAI,
                "severity": RuleSeverity.HIGH
            },
            {
                "rule_text": "Marketing content must use the company's official brand colors and approved logo variants only.",
                "category": RuleCategory.BRAND,
                "severity": RuleSeverity.MEDIUM
            },
            {
                "rule_text": "Product descriptions must never include competitor comparisons or disparaging remarks about other companies.",
                "category": RuleCategory.BRAND,
                "severity": RuleSeverity.MEDIUM
            },
            {
                "rule_text": "Web content must include primary keywords in H1 tags and meta descriptions should not exceed 160 characters.",
                "category": RuleCategory.SEO,
                "severity": RuleSeverity.LOW
            }
        ]
        
        created_rules = []
        for rule_data in seed_rules:
            rule = Rule(
                rule_text=rule_data["rule_text"],
                category=rule_data["category"],
                severity=rule_data["severity"],
                version=1,
                is_active=True,
                created_by=super_admin.user_id
            )
            db.add(rule)
            created_rules.append(rule)
        
        db.commit()
        print(f"✅ Created {len(created_rules)} rules")
        
        # Create embeddings and store in Pinecone
        print("🔮 Creating rule embeddings for Pinecone...")
        llm_provider = GeminiProvider()
        vector_provider = PineconeProvider()
        
        vectors = []
        for rule in created_rules:
            db.refresh(rule)  # Ensure we have the rule_id
            
            # Create embedding
            embedding = await llm_provider.create_embedding(rule.rule_text)
            
            vectors.append({
                "id": str(rule.rule_id),
                "values": embedding,
                "metadata": {
                    "rule_text": rule.rule_text,
                    "category": rule.category.value,
                    "severity": rule.severity.value,
                    "version": rule.version,
                    "is_active": rule.is_active
                }
            })
        
        # Upsert to Pinecone
        await vector_provider.upsert(vectors, namespace="rules")
        print(f"✅ Stored {len(vectors)} embeddings in Pinecone")
        
        print("🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
