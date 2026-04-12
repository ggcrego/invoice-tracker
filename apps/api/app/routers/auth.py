from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.user import RegisterRequest, UserResponse
from app.services.auth import register_company_and_admin

router = APIRouter()

@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already exists")

    company, user = await register_company_and_admin(
        db=db,
        company_name=request.company_name,
        full_name=request.full_name,
        email=request.email,
        supabase_user_id=request.supabase_user_id,
    )
    return {"company_id": str(company.id), "user_id": str(user.id)}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if user has team members
    result = await db.execute(
        select(exists().where(User.approver_id == current_user.id, User.is_active == True))
    )
    has_team = result.scalar()

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "company_id": str(current_user.company_id),
        "approver_id": str(current_user.approver_id) if current_user.approver_id else None,
        "has_team_members": has_team,
    }
