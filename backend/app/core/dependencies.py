from typing import List, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

security_scheme = HTTPBearer(auto_error=False)


class AuthenticatedUserContext:
    def __init__(self, user: User, roles: List[UserRole]):
        self.user = user
        self.roles = roles
        self.primary_role = roles[0].role if roles else "citizen"
        self.department_id = roles[0].department_id if roles else None

    @property
    def id(self) -> str:
        return self.user.id

    @property
    def email(self) -> str:
        return self.user.email

    @property
    def full_name(self) -> str:
        return self.user.full_name

    def has_role(self, *role_names: str) -> bool:
        return any(r.role in role_names for r in self.roles)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
    db: Session = Depends(get_db),
) -> AuthenticatedUserContext:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is suspended or inactive",
        )

    roles = db.query(UserRole).filter(UserRole.user_id == user.id).all()
    return AuthenticatedUserContext(user=user, roles=roles)


def require_roles(*allowed_roles: str):
    def role_checker(
        current_user: AuthenticatedUserContext = Depends(get_current_user),
    ) -> AuthenticatedUserContext:
        if not current_user.has_role(*allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role in: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


# Convenient role dependencies
require_citizen = require_roles("citizen", "system_admin")
require_department_staff = require_roles("department_officer", "department_head", "system_admin")
require_department_head = require_roles("department_head", "system_admin")
require_admin = require_roles("system_admin")
