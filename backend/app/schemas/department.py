from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    jurisdiction: str = Field(default="State/National", max_length=100)
    contact_email: Optional[EmailStr] = None
    is_active: bool = True


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    jurisdiction: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    jurisdiction: str
    contact_email: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    parent_category_id: Optional[str] = None
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    parent_category_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryMappingCreate(BaseModel):
    category_id: str
    department_id: str
    jurisdiction: str = "Default"
    routing_rank: int = 1
    is_active: bool = True


class CategoryMappingResponse(BaseModel):
    id: str
    category_id: str
    department_id: str
    jurisdiction: str
    routing_rank: int
    is_active: bool
    category_name: Optional[str] = None
    department_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
