from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    full_name: str
    role: str = "employee"

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    company_id: UUID
    approver_id: Optional[UUID]
    slack_user_id: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    has_team_members: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class RegisterRequest(BaseModel):
    company_name: str
    full_name: str
    email: str
    supabase_user_id: str

class TeamAssignment(BaseModel):
    employee_id: UUID
    approver_id: Optional[UUID] = None
