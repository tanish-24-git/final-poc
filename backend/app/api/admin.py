from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.content import ContentSubmission
from app.schemas.content import ContentListResponse, ContentApprovalRequest
from app.services.audit_service import AuditService
from typing import List
from uuid import UUID

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/content", response_model=List[ContentListResponse])
async def list_content(
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """List all content submissions"""
    try:
        submissions = db.query(ContentSubmission).order_by(
            ContentSubmission.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        return submissions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/content/{submission_id}")
async def get_content_detail(
    submission_id: UUID,
    db: Session = Depends(get_db)
):
    """Get detailed compliance report for content"""
    try:
        submission = db.query(ContentSubmission).filter(
            ContentSubmission.submission_id == submission_id
        ).first()
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "submission_id": submission.submission_id,
            "input_type": submission.input_type.value,
            "input_reference": submission.input_reference,
            "final_content": submission.final_content,
            "compliance_status": submission.compliance_status.value,
            "rules_triggered": submission.rules_triggered,
            "approval_status": submission.approval_status,
            "approved_by": submission.approved_by,
            "created_at": submission.created_at,
            "updated_at": submission.updated_at
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/content/{submission_id}/approve")
async def approve_content(
    submission_id: UUID,
    request: ContentApprovalRequest,
    db: Session = Depends(get_db)
):
    """Approve content (admin action)"""
    try:
        submission = db.query(ContentSubmission).filter(
            ContentSubmission.submission_id == submission_id
        ).first()
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Update approval status
        submission.approval_status = request.status
        submission.approved_by = request.admin_id
        
        db.commit()
        
        # Audit log
        AuditService.log_action(
            db,
            action_type=f"content_{request.status}",
            actor_id=request.admin_id,
            resource_type="content",
            resource_id=submission_id,
            decision_summary=request.notes or f"Content {request.status}"
        )
        
        return {"message": f"Content {request.status} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/content/{submission_id}/reject")
async def reject_content(
    submission_id: UUID,
    request: ContentApprovalRequest,
    db: Session = Depends(get_db)
):
    """Reject content (admin action)"""
    try:
        # Use same logic as approve but with "rejected" status
        request.status = "rejected"
        return await approve_content(submission_id, request, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
