from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ToolCreate(BaseModel):
    name: str
    category_id: UUID
    website_url: Optional[str] = None

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[UUID] = None
    website_url: Optional[str] = None
    is_active: Optional[bool] = None

class ToolResponse(BaseModel):
    id: UUID
    name: str
    category_id: UUID
    company_id: UUID
    icon_url: Optional[str]
    website_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
