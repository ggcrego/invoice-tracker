from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceApproval

router = APIRouter()

@router.get("/pending")
async def get_pending_approvals(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get IDs of users who report to current user
    team_result = await db.execute(
        select(User.id).where(User.approver_id == current_user.id, User.is_active == True)
    )
    team_ids = [row[0] for row in team_result.all()]
    if not team_ids:
        return []
    result = await db.execute(
        select(Invoice)
        .where(Invoice.submitted_by.in_(team_ids), Invoice.status == "pending_approval")
        .order_by(Invoice.created_at.desc())
    )
    return result.scalars().all()

@router.get("/history")
async def get_approval_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Invoice)
        .where(Invoice.approved_by == current_user.id)
        .order_by(Invoice.approved_at.desc())
    )
    return result.scalars().all()

@router.put("/{invoice_id}")
async def approve_or_reject(invoice_id: UUID, data: InvoiceApproval, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Verify this user is the approver for the submitter
    submitter_result = await db.execute(select(User).where(User.id == invoice.submitted_by))
    submitter = submitter_result.scalar_one_or_none()
    if not submitter or submitter.approver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this invoice")

    if invoice.status != "pending_approval":
        raise HTTPException(status_code=400, detail="Invoice is not pending approval")

    if data.action == "approve":
        invoice.status = "pending_reimbursement"
    elif data.action == "reject":
        invoice.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    invoice.approved_by = current_user.id
    invoice.approved_at = datetime.utcnow()
    invoice.approval_comment = data.comment
    await db.commit()
    return {"status": invoice.status}
