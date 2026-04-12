import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Tool(Base):
    __tablename__ = "tools"
    __table_args__ = (UniqueConstraint("company_id", "name"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    icon_url = Column(Text)
    website_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", back_populates="tools")
    company = relationship("Company", back_populates="tools")
    invoices = relationship("Invoice", back_populates="tool")
