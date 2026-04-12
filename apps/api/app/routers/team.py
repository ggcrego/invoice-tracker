from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.user import TeamAssignment

router = APIRouter()

@router.get("/members")
async def list_members(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.company_id == admin.company_id, User.is_active == True).order_by(User.full_name)
    )
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "approver_id": str(u.approver_id) if u.approver_id else None,
        }
        for u in users
    ]

@router.put("/assign")
async def assign_approver(data: TeamAssignment, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == data.employee_id, User.company_id == admin.company_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if data.approver_id:
        # Prevent circular references
        approver_result = await db.execute(select(User).where(User.id == data.approver_id, User.company_id == admin.company_id))
        approver = approver_result.scalar_one_or_none()
        if not approver:
            raise HTTPException(status_code=404, detail="Approver not found")
        if approver.approver_id == data.employee_id:
            raise HTTPException(status_code=400, detail="Circular reference: approver already reports to this employee")

    employee.approver_id = data.approver_id
    await db.commit()
    return {"status": "assigned"}
