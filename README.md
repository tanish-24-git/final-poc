# Compliance AI POC

Enterprise-grade Compliance-First AI Content Generation & Validation POC with strict role separation and deterministic rule enforcement.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- API keys configured in `.env` file

### Run the Application

```bash
docker-compose up -d
```

This will:
1. Start PostgreSQL database
2. Start FastAPI backend (runs seed script automatically)
3. Start React frontend

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Default Users (created by seed script)

- Agent: `agent_user`
- Admin: `admin_user`  
- Super Admin: `super_admin_user`

## Architecture

### Backend (FastAPI + PostgreSQL + Pinecone)
- `/backend/app/models/` - SQLAlchemy ORM models
- `/backend/app/providers/` - Cloud-swappable LLM & vector DB abstractions
- `/backend/app/services/` - Business logic (rule management, content generation, compliance checking)
- `/backend/app/api/` - FastAPI endpoints (agent, admin, super_admin)

### Frontend (React + TypeScript + Vite)
- `/frontend/src/components/` - React components by role
- `/frontend/src/pages/` - Page components
- `/frontend/src/services/` - API client
- `/frontend/src/types/` - TypeScript definitions

## Key Features

✅ **Rule-First Architecture** - Rules override AI outputs  
✅ **Duplicate Detection** - SQL exact match + Pinecone semantic similarity  
✅ **Immutable Versioning** - All rule updates create new versions  
✅ **Token-Based Chunking** - Preserves legal meaning in documents  
✅ **Audit Trail** - Every action logged  
✅ **Cloud-Swappable** - Provider abstraction for easy migration

## Technology Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **LLMs**: Gemini / Groq (swappable)
- **Vector DB**: Pinecone (swappable to OpenSearch)
- **Frontend**: React, TypeScript, Vite
- **Deployment**: Docker Compose

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

## Production Considerations

This is a POC. For production:
- Add proper authentication (OAuth/JWT)
- Implement rate limiting
- Add comprehensive logging
- Set up monitoring and alerting
- Configure CORS properly
- Use managed database services
- Implement proper secret management
