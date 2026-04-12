from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.database import get_db
from app.middleware.auth import get_current_user, require_admin
from app.models.user import User
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter()

@router.get("/", response_model=list[CategoryResponse])
async def list_categories(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category)
        .where(Category.company_id == current_user.company_id, Category.is_active == True)
        .order_by(Category.display_order)
    )
    return result.scalars().all()

@router.post("/", response_model=CategoryResponse)
async def create_category(data: CategoryCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    category = Category(company_id=admin.company_id, **data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: UUID, data: CategoryUpdate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id, Category.company_id == admin.company_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/{category_id}")
async def archive_category(category_id: UUID, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id, Category.company_id == admin.company_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.is_active = False
    await db.commit()
    return {"status": "archived"}
