from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class CategoryCreate(BaseModel):
    name: str
    type: str  # 'trackable' or 'simple'
    gst_reminder_enabled: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    gst_reminder_enabled: Optional[bool] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    type: str
    gst_reminder_enabled: bool
    is_active: bool
    display_order: int
    created_at: datetime

    class Config:
        from_attributes = True
