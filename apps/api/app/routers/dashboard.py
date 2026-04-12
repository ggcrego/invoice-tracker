from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.database import get_db
from app.middleware.auth import get_current_user, require_admin
from app.models.user import User
from app.models.invoice import Invoice

router = APIRouter()

@router.get("/employee")
async def employee_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Total spend this month
    spend_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.amount), 0))
        .where(
            Invoice.submitted_by == current_user.id,
            Invoice.created_at >= month_start,
            Invoice.status.in_(["approved", "pending_reimbursement", "reimbursed"]),
        )
    )
    monthly_spend = float(spend_result.scalar())

    # Status counts
    status_result = await db.execute(
        select(Invoice.status, func.count(Invoice.id))
        .where(Invoice.submitted_by == current_user.id)
        .group_by(Invoice.status)
    )
    status_counts = {row[0]: row[1] for row in status_result.all()}

    # Active subscriptions
    subs_result = await db.execute(
        select(Invoice)
        .where(
            Invoice.submitted_by == current_user.id,
            Invoice.is_recurring == True,
            Invoice.status.in_(["approved", "pending_reimbursement", "reimbursed"]),
        )
        .order_by(Invoice.created_at.desc())
    )
    active_subs = subs_result.scalars().all()

    return {
        "monthly_spend": monthly_spend,
        "status_counts": status_counts,
        "active_subscriptions": active_subs,
    }

@router.get("/admin")
async def admin_dashboard(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    company_id = admin.company_id

    # Total invoices
    total_result = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.company_id == company_id)
    )
    total_invoices = total_result.scalar()

    # GST compliance rate
    compliant_result = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.company_id == company_id, Invoice.is_gst_compliant == True)
    )
    compliant_count = compliant_result.scalar()
    compliance_rate = (compliant_count / total_invoices * 100) if total_invoices > 0 else 0

    # Pending counts
    pending_approval = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.company_id == company_id, Invoice.status == "pending_approval")
    )
    pending_reimburse = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.company_id == company_id, Invoice.status == "pending_reimbursement")
    )

    return {
        "total_invoices": total_invoices,
        "gst_compliance_rate": round(compliance_rate, 1),
        "pending_approvals": pending_approval.scalar(),
        "pending_reimbursements": pending_reimburse.scalar(),
    }
