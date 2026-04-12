from pydantic import BaseModel
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal
from typing import Optional

class InvoiceCreate(BaseModel):
    category_id: UUID
    tool_id: Optional[UUID] = None
    amount: Decimal
    invoice_date: date
    description: Optional[str] = None
    is_recurring: bool = False
    billing_cycle: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: UUID
    category_id: UUID
    tool_id: Optional[UUID]
    amount: Decimal
    currency: str
    invoice_date: date
    description: Optional[str]
    bill_file_url: str
    bill_file_name: Optional[str]
    is_gst_compliant: bool
    gst_amount: Optional[Decimal]
    is_recurring: bool
    billing_cycle: Optional[str]
    status: str
    approval_comment: Optional[str]
    created_at: datetime
    submitted_by: UUID
    submitter_name: Optional[str] = None
    category_name: Optional[str] = None
    tool_name: Optional[str] = None

    class Config:
        from_attributes = True

class InvoiceApproval(BaseModel):
    action: str  # 'approve' or 'reject'
    comment: Optional[str] = None
