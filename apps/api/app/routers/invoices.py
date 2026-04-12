from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from decimal import Decimal
from datetime import date, datetime
from typing import Optional

from app.database import get_db
from app.middleware.auth import get_current_user, require_admin
from app.models.user import User
from app.models.invoice import Invoice
from app.models.category import Category
from app.services.ocr import check_gstin_on_invoice
from app.services.invoice import upload_invoice_file

router = APIRouter()

@router.post("/")
async def create_invoice(
    category_id: UUID = Form(...),
    tool_id: Optional[UUID] = Form(None),
    amount: Decimal = Form(...),
    invoice_date: date = Form(...),
    description: Optional[str] = Form(None),
    is_recurring: bool = Form(False),
    billing_cycle: Optional[str] = Form(None),
    bill_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate category
    cat_result = await db.execute(
        select(Category).where(Category.id == category_id, Category.company_id == current_user.company_id)
    )
    category = cat_result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.type == "trackable" and not tool_id:
        raise HTTPException(status_code=400, detail="Tool selection required for this category")

    # Upload file
    file_url, file_name = await upload_invoice_file(bill_file, current_user.company_id)

    # OCR check (best effort)
    is_compliant, gst_amount = False, None
    try:
        from sqlalchemy import select as sel
        from app.models.company import Company
        comp_result = await db.execute(sel(Company).where(Company.id == current_user.company_id))
        company = comp_result.scalar_one_or_none()
        if company and company.gstin:
            is_compliant, gst_amount = await check_gstin_on_invoice(file_url, company.gstin)
    except Exception:
        pass  # OCR failure shouldn't block submission

    # Determine initial status
    initial_status = "pending_approval" if current_user.approver_id else "pending_reimbursement"

    invoice = Invoice(
        company_id=current_user.company_id,
        submitted_by=current_user.id,
        category_id=category_id,
        tool_id=tool_id,
        amount=amount,
        invoice_date=invoice_date,
        description=description,
        bill_file_url=file_url,
        bill_file_name=file_name,
        is_gst_compliant=is_compliant,
        gst_amount=gst_amount,
        is_recurring=is_recurring,
        billing_cycle=billing_cycle,
        status=initial_status,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice

@router.get("/my")
async def get_my_invoices(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Invoice).where(Invoice.submitted_by == current_user.id).order_by(Invoice.created_at.desc())
    )
    return result.scalars().all()

@router.get("/all")
async def get_all_invoices(
    status: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Invoice).where(Invoice.company_id == admin.company_id)
    if status:
        query = query.where(Invoice.status == status)
    result = await db.execute(query.order_by(Invoice.created_at.desc()))
    return result.scalars().all()

@router.get("/{invoice_id}")
async def get_invoice(invoice_id: UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    # Check access
    if invoice.submitted_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return invoice

@router.put("/{invoice_id}/reimburse")
async def mark_reimbursed(invoice_id: UUID, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id, Invoice.company_id == admin.company_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status not in ("approved", "pending_reimbursement"):
        raise HTTPException(status_code=400, detail="Invoice cannot be reimbursed in current status")
    invoice.status = "reimbursed"
    invoice.reimbursed_at = datetime.utcnow()
    await db.commit()
    return {"status": "reimbursed"}
