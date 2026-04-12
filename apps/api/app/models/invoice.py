import uuid
from sqlalchemy import Column, String, Text, Boolean, Date, DateTime, Numeric, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    tool_id = Column(UUID(as_uuid=True), ForeignKey("tools.id"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="INR")
    invoice_date = Column(Date, nullable=False)
    description = Column(Text)
    bill_file_url = Column(Text, nullable=False)
    bill_file_name = Column(String(255))
    is_gst_compliant = Column(Boolean, default=False)
    gst_amount = Column(Numeric(12, 2))
    is_recurring = Column(Boolean, default=False)
    billing_cycle = Column(String(20))
    status = Column(String(20), nullable=False, default="pending_approval")
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True))
    approval_comment = Column(Text)
    reimbursed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="invoices")
    submitter = relationship("User", foreign_keys=[submitted_by], back_populates="invoices_submitted")
    approver_user = relationship("User", foreign_keys=[approved_by], back_populates="invoices_approved")
    category = relationship("Category", back_populates="invoices")
    tool = relationship("Tool", back_populates="invoices")
