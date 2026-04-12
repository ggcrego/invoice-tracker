from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class CompanyCreate(BaseModel):
    name: str
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    logo_url: Optional[str] = None

class GSTUpdate(BaseModel):
    gstin: Optional[str] = None
    gst_state_code: Optional[str] = None
    pan: Optional[str] = None

class CompanyResponse(BaseModel):
    id: UUID
    name: str
    address: Optional[str]
    gstin: Optional[str]
    gst_state_code: Optional[str]
    pan: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    logo_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
