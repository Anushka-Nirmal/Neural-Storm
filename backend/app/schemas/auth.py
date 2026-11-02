from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password with minimum 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    preferred_language: str = Field(default="en", max_length=20)
    phone_number: Optional[str] = Field(default=None, max_length=20)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RoleInfo(BaseModel):
    role: str
    department_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    preferred_language: str
    phone_number: Optional[str] = None
    account_status: str
    roles: List[RoleInfo] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    preferred_language: Optional[str] = Field(default=None, max_length=20)
    phone_number: Optional[str] = Field(default=None, max_length=20)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
