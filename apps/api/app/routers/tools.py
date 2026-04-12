from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Optional
from app.database import get_db
from app.middleware.auth import get_current_user, require_admin
from app.models.user import User
from app.models.tool import Tool
from app.models.category import Category
from app.schemas.tool import ToolCreate, ToolUpdate, ToolResponse

router = APIRouter()

@router.get("/", response_model=list[ToolResponse])
async def list_tools(category_id: Optional[UUID] = None, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    query = select(Tool).where(Tool.company_id == current_user.company_id, Tool.is_active == True)
    if category_id:
        query = query.where(Tool.category_id == category_id)
    result = await db.execute(query.order_by(Tool.name))
    return result.scalars().all()

@router.post("/", response_model=ToolResponse)
async def create_tool(data: ToolCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    # Verify category is trackable
    cat_result = await db.execute(select(Category).where(Category.id == data.category_id, Category.company_id == admin.company_id))
    category = cat_result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.type != "trackable":
        raise HTTPException(status_code=400, detail="Tools can only be added to trackable categories")

    tool = Tool(company_id=admin.company_id, **data.model_dump())
    db.add(tool)
    await db.commit()
    await db.refresh(tool)
    return tool

@router.put("/{tool_id}", response_model=ToolResponse)
async def update_tool(tool_id: UUID, data: ToolUpdate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tool).where(Tool.id == tool_id, Tool.company_id == admin.company_id))
    tool = result.scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tool, field, value)
    await db.commit()
    await db.refresh(tool)
    return tool

@router.delete("/{tool_id}")
async def deactivate_tool(tool_id: UUID, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tool).where(Tool.id == tool_id, Tool.company_id == admin.company_id))
    tool = result.scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    tool.is_active = False
    await db.commit()
    return {"status": "deactivated"}

@router.post("/{tool_id}/icon")
async def upload_icon(tool_id: UUID, file: UploadFile = File(...), admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tool).where(Tool.id == tool_id, Tool.company_id == admin.company_id))
    tool = result.scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    # TODO: Upload to Supabase Storage and set tool.icon_url
    return {"status": "icon uploaded"}
