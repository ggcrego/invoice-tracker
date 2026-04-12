import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="employee")
    approver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    slack_user_id = Column(String(50))
    avatar_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="users")
    approver = relationship("User", remote_side=[id], backref="team_members")
    invoices_submitted = relationship("Invoice", foreign_keys="Invoice.submitted_by", back_populates="submitter")
    invoices_approved = relationship("Invoice", foreign_keys="Invoice.approved_by", back_populates="approver_user")
