# COMPLIANCE LLM FOR CONTENT GENERATION
## Fully Automated, Rule-First, Enterprise AI Architecture (No Human-in-the-Loop)

---

## 1. PRODUCT VISION

The **Compliance LLM for Content Generation** is an enterprise-grade AI system designed to **generate insurance and fintech marketing content that is compliant by design**, without relying on post-generation manual review.

The system embeds **IRDAI regulations, internal brand rules, and SEO constraints directly into the content generation workflow**, ensuring:
- Faster content turnaround
- Reduced compliance risk
- Elimination of manual compliance dependency
- Predictable, auditable AI behavior

This system is built for **large regulated organizations (e.g., Bajaj Finserv)** where compliance accuracy and auditability are non-negotiable.

---

## 2. CORE DESIGN PRINCIPLES

### 2.1 Rule-First Architecture
- Deterministic compliance rules are evaluated **before, during, and after AI generation**
- Rules always override probabilistic AI outputs
- Cold-start safe: system works even with zero historical data

### 2.2 Compliance-by-Design Content Generation
- AI is constrained at generation time, not corrected later
- Prevents non-compliant language from being generated

### 2.3 Parallel Intelligence (Safe AI)
- Multiple intelligence sources run in parallel:
  - Rule Engine (deterministic)
  - Generator LLM (language)
  - Reviewer LLM (strict validation)
- No single component has decision authority

### 2.4 Deterministic Decision Aggregation
- Final decisions are made by deterministic logic
- AI models provide signals, not verdicts

### 2.5 Explainability & Auditability
- Every output is traceable to:
  - Rules applied
  - Regulatory clauses retrieved
  - Model decisions
- Suitable for regulatory audits

---

## 3. COMPLETE END-TO-END WORKFLOW

```
User Prompt / Uploaded Document
        ↓
Preprocessing & Intent Classification
        ↓
Compliance Rule Loading (IRDAI / Brand / SEO)
        ↓
Prompt Enhancement (Compliance-Aware)
        ↓
RAG (Regulatory Retrieval using Titan Embeddings)
        ↓
LLM Content Generation (AWS Bedrock)
        ↓
Strict AI Compliance Review (Second LLM)
        ↓
Deterministic Rule Re-Validation
        ↓
Decision Aggregation Engine
        ↓
Final Compliant Content + Compliance Report
```

---

## 4. INPUT MODES SUPPORTED

### 4.1 Prompt-Based Content Generation
- User enters a natural language prompt
- Example:
  > "Create a marketing paragraph for a Term Life Insurance plan"

### 4.2 Uploaded Content Compliance Check
- User uploads:
  - PDF
  - DOCX
  - Markdown
- Existing content is validated using the same compliance pipeline

---

## 5. PREPROCESSING & INTENT UNDERSTANDING

### 5.1 Text Normalization
- Whitespace cleanup
- Preserve:
  - Numbers
  - Percentages
  - Currency values
  - Legal negations (not / subject to)

### 5.2 Intent & Risk Classification
- Content type detection:
  - Marketing
  - Sales
  - Informational
- Marketing content is automatically classified as **high-risk**

### 5.3 Product Context Extraction
- Policy type (Term, Health, ULIP)
- Jurisdiction (India – IRDAI)

---

## 6. COMPLIANCE RULE ENGINE

### 6.1 Rule Sources
- IRDAI regulations
- Internal brand guidelines
- SEO & disclosure rules

### 6.2 Rule Types
- **Hard rules**: mandatory, cannot be violated
- **Soft rules**: stylistic or risk-based

### 6.3 Rule Examples
- No guaranteed returns language
- Mandatory disclaimer inclusion
- Benefits must be conditional

Rules are loaded **before generation** and enforced **after generation**.

---

## 7. PROMPT ENHANCER (COMPLIANCE-AWARE)

### Purpose
Transforms weak or unsafe user prompts into **strong, compliance-safe prompts**.

### Example

User Prompt:
```
Create a marketing paragraph for a term insurance plan
```

Enhanced Prompt:
```
Generate a professional marketing paragraph for a Term Life Insurance product in India.
Constraints:
- Do not claim guaranteed returns
- State that benefits are subject to policy terms
- Include a mandatory disclaimer
Tone: Professional, clear, consumer-friendly
```

The Prompt Enhancer does **not approve content** — it only improves input quality.

---

## 8. ADVANCED DOCUMENT CHUNKING & TOKENIZATION

### 8.1 Supported Document Types
- PDF (digital & scanned via OCR)
- DOCX / DOC
- Markdown (MD)
- HTML / Text

Each document type is first converted into a **lossless, structured intermediate representation**.

---

### 8.2 Structure-Aware Parsing (Before Chunking)

The system does **not** blindly split text. It first understands document structure:

- Headers / sub-headers (H1–H4)
- Sections & sub-sections
- Paragraph boundaries
- Bullet lists & tables
- Disclaimers & footnotes

This preserves **semantic meaning**, which is critical for compliance.

---

### 8.3 Compliance-Safe Text Normalization

Before chunking, the text is normalized with **domain safety rules**:

- Preserve:
  - Financial terms (IRR, NAV, CAGR)
  - Percentages & currency values
  - Dates & durations
  - Legal negations ("not", "subject to", "may")
  - Short forms & abbreviations (ULIP, IRDAI, T&C)

- Avoid:
  - Expanding abbreviations incorrectly
  - Removing disclaimers
  - Changing legal phrasing

This prevents semantic drift.

---

### 8.4 Hierarchical Chunking Strategy (Header → Paragraph → Token)

Chunking happens in **three controlled layers**:

#### Layer 1: Header-Based Chunking
- Split document by major headers
- Ensures each chunk belongs to a clear logical section

#### Layer 2: Paragraph-Level Chunking
- Within each header section:
  - Paragraph boundaries preserved
  - Sentences are not arbitrarily broken

#### Layer 3: Token-Based Chunking (Final Safety Layer)
- Each paragraph chunk is tokenized using **model-internal tokenizers (BPE / WordPiece)**
- Chunks are resized to stay within safe token limits (e.g., 800–1000 tokens)
- Overlap applied (10–15%) to preserve context continuity

---

### 8.5 Clause Integrity Guarantees

The system enforces **clause-preserving rules**:
- No chunk breaks in the middle of:
  - Legal clauses
  - Disclaimer statements
  - Benefit-condition pairs

If a clause exceeds token limits:
- It is split only at **semantic breakpoints**
- Metadata links the split parts together

---

### 8.6 Metadata-Enriched Chunk Representation

Each chunk is stored with rich metadata:

```json
{
  "chunk_id": "uuid",
  "text": "...",
  "source_doc": "uploaded_brochure.pdf",
  "header_path": "Benefits > Coverage",
  "page_range": "3–4",
  "token_count": 742,
  "contains_disclaimer": true,
  "risk_category": "high"
}
```

This metadata is critical for:
- Explainability
- Audit trails
- Precise violation mapping

---

### 8.7 Tokenization Strategy

- Uses **model-native tokenization** (no custom token definitions)
- Supports multiple LLMs without mismatch
- Token counts tracked per chunk for:
  - Cost estimation
  - Safe prompt construction

Manual tokenization is intentionally avoided to reduce errors.

---

### 8.8 Chunk Usage in the Pipeline

The same chunks are reused across the system:

- **RAG** → Clause-level regulatory grounding
- **Compliance Review** → Exact violation localization
- **Explainability** → "Which clause violated which rule"

This ensures consistency across generation, validation, and reporting.

---

## 9. RAG – REGULATORY GROUNDING

### 8.1 Knowledge Base
- IRDAI circulars
- Regulatory guidelines

### 8.2 Embeddings
- AWS Bedrock – Titan Text Embeddings
- Clause-level vector encoding

### 8.3 Vector Database
- Amazon OpenSearch (vector search)
- Hybrid retrieval (semantic + keyword)

### 8.4 Context Injection
- Retrieved clauses injected into generation prompt

---

## 9. MULTI-MODEL SYSTEM

### 9.1 Model A – Content Generator
- AWS Bedrock (Claude / Llama)
- Generates compliant marketing content
- Optimized for language quality

### 9.2 Model B – Strict Compliance Reviewer
- AWS Bedrock or local model
- Reviews generated content only
- Conservative, zero-tolerance prompts
- Flags even borderline violations

Models do **not** communicate directly. The backend orchestrates all interactions.

---

## 10. COMPLIANCE DECISION ENGINE

### 10.1 Deterministic Arbitration Logic

Decision rules:
- If any hard rule violation → Reject
- If soft rule violations → Auto-fix or annotate
- Else → Approve

### 10.2 Auto-Fix Capabilities
- Disclaimer insertion
- Safer phrasing suggestions

AI never self-approves; final decision is rule-driven.

---

## 11. FINAL OUTPUT TO USER

User receives:
- Final compliant content
- Compliance status
- Rules checked
- Reviewer notes

Example:
```json
{
  "status": "approved",
  "rules_checked": ["IRDAI-3.4", "IRDAI-5.1"],
  "notes": "Mandatory disclaimer added"
}
```

---

## 12. OBSERVABILITY & GOVERNANCE

- Full prompt logs
- Rules applied per request
- Models invoked
- Token usage & cost tracking
- Versioned rule snapshots

This ensures:
- Audit readiness
- Rollback safety
- Regulatory traceability

---

## 13. AWS ARCHITECTURE MAPPING

| Layer | AWS Service |
|-----|------------|
LLM Inference | AWS Bedrock |
Embeddings | Titan (Bedrock) |
Vector DB | Amazon OpenSearch |
Backend | EC2 / ECS |
Database | Amazon RDS (PostgreSQL) |
Storage | Amazon S3 |
Monitoring | CloudWatch |

---

## 14. COSTING (SUMMARY)

- Estimated cost: **~$21 per 1000 API calls**
- Cost includes:
  - Prompt enhancement
  - Content generation
  - Strict AI review
  - RAG retrieval
  - Backend orchestration

This cost is **economically viable** for large fintech organizations.

---

## 15. WHY THIS ARCHITECTURE WORKS FOR FINTECH

- Eliminates manual compliance bottlenecks
- Reduces regulatory risk
- Ensures explainability
- Scales predictably
- Aligns with AWS enterprise AI best practices

---

## 16. DETAILED COST CALCULATION (FOR UNDERSTANDING)

This section explains **where money is actually spent**, why each component costs what it costs, and how pricing scales.

---

### 16.1 Cost Assumptions (Baseline)

- 1 API request = 1 content generation OR 1 uploaded document analysis
- Average prompt size after enhancement: ~1,500 tokens
- Average generated output: ~800 tokens
- Reviewer model input: ~1,200 tokens
- Region: AWS ap-south-1
- Models accessed via AWS Bedrock
- Vector DB: Amazon OpenSearch (Serverless)

---

### 16.2 Cost Breakdown Per 1,000 Requests

#### A. Prompt Enhancer (Light LLM Usage)
- Purpose: restructure user prompt safely
- Token usage per request: ~400 tokens total
- Cost per 1,000 requests: **~$1.2**

Why cost is low:
- Small prompts
- Short outputs

---

#### B. Content Generation LLM (Primary Cost Driver)
- Model: Claude / Llama via Bedrock
- Input tokens: ~1.5M
- Output tokens: ~0.8M
- Cost per 1,000 requests: **~$11.0**

This is the main cost because:
- Generation is language-heavy
- Longer outputs

---

#### C. Strict Compliance Reviewer LLM
- Model: Same or separate Bedrock model
- Input tokens: ~1.2M
- Output tokens: ~0.2M (JSON only)
- Cost per 1,000 requests: **~$5.0**

Why reviewer is cheaper than generator:
- Short outputs
- Structured format

---

#### D. Embeddings for RAG (Titan)
- Query embeddings per request
- Avg tokens embedded: ~800
- Cost per 1,000 requests: **~$1.5**

Note:
- Regulatory documents are embedded once
- This cost is amortized

---

#### E. Vector Database (Amazon OpenSearch)
- Similarity search + metadata filtering
- Storage amortized
- Cost per 1,000 requests: **~$0.8**

---

#### F. Backend Compute & Orchestration
- FastAPI services
- Rule engine
- Decision aggregation
- Cost per 1,000 requests: **~$1.2**

---

#### G. Storage, Logging & Monitoring
- S3 (documents + logs)
- RDS (rules, audit data)
- CloudWatch logs
- Cost per 1,000 requests: **~$0.5**

---

### 16.3 Total Cost Summary

| Component | Cost (USD) |
|--------|------------|
Prompt Enhancer | $1.2 |
Content Generator | $11.0 |
Compliance Reviewer | $5.0 |
Embeddings (RAG) | $1.5 |
Vector DB | $0.8 |
Backend Compute | $1.2 |
Storage & Logs | $0.5 |
| **TOTAL** | **~$21.2 / 1000 requests** |

---

### 16.4 Cost Per Request
- ~$0.021 per request
- ~₹1.7 per request (approx)

This is **economically negligible** for large fintechs.

---

### 16.5 Cost Optimization Levers (Important)

The system is designed to reduce cost over time:

- Skip reviewer model for low-risk prompts
- Cache enhanced prompts
- Reuse embeddings
- Rules-only short circuit
- Use smaller models for reviewer

Optimized cost range:
- **$14–16 per 1,000 requests**

---

## 17. SCALING & VOLUME THINKING

Example:
- 100,000 requests/month → ~$2,100/month
- 1M requests/month → ~$21,000/month

For a company with ₹1L+ crore revenue, this is **operationally insignificant**.

---

## 18. WHY THIS DESIGN IS USED IN ENTERPRISE AI

- Rules provide determinism
- LLMs provide language intelligence
- Chunking preserves legal meaning
- Vector DB ensures grounding
- AWS provides governance & scale

This is **how real compliance AI systems are built**.

---

## 19. FINAL MENTAL MODEL (FOR YOU)

Think of the system as:

- **Rules** → Law
- **Chunking** → Legal document structure
- **LLMs** → Junior analysts
- **Decision engine** → Compliance officer
- **AWS** → Secure infrastructure

---

## 20. FINAL TAKEAWAY

> This system demonstrates how compliant financial content can be generated automatically by embedding regulatory intelligence into preprocessing, chunking, prompting, retrieval, and validation — with predictable cost and full auditability.

This document is intentionally detailed to build understanding and can be simplified later for external presentation.

