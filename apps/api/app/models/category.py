import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("company_id", "name"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    gst_reminder_enabled = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="categories")
    tools = relationship("Tool", back_populates="category")
    invoices = relationship("Invoice", back_populates="category")
