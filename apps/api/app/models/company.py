import uuid
from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    gstin = Column(String(15))
    gst_state_code = Column(String(2))
    pan = Column(String(10))
    email = Column(String(255))
    phone = Column(String(15))
    logo_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    users = relationship("User", back_populates="company")
    categories = relationship("Category", back_populates="company")
    tools = relationship("Tool", back_populates="company")
    invoices = relationship("Invoice", back_populates="company")
