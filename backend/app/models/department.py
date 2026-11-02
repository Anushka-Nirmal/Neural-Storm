from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, utc_now


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    jurisdiction = Column(String(100), default="State/National", nullable=False)
    contact_email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    officers = relationship("UserRole", back_populates="department")
    complaints = relationship("Complaint", back_populates="assigned_department", foreign_keys="Complaint.assigned_department_id")
    category_mappings = relationship("CategoryDepartmentMapping", back_populates="department")


class ComplaintCategory(Base):
    __tablename__ = "complaint_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    parent_category_id = Column(String(36), ForeignKey("complaint_categories.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    mappings = relationship("CategoryDepartmentMapping", back_populates="category", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="category")


class CategoryDepartmentMapping(Base):
    __tablename__ = "category_department_mappings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category_id = Column(String(36), ForeignKey("complaint_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    jurisdiction = Column(String(100), default="Default", nullable=False)
    routing_rank = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    category = relationship("ComplaintCategory", back_populates="mappings")
    department = relationship("Department", back_populates="category_mappings")
