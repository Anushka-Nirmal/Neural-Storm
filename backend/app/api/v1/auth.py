from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user, AuthenticatedUserContext
from app.models.user import User, UserRole
from app.models.notification import NotificationPreference
from app.models.audit import AuditLog
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    RoleInfo,
    ProfileUpdate,
    PasswordChange,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    # Check for existing email
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Create new user
    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        preferred_language=payload.preferred_language,
        phone_number=payload.phone_number,
        account_status="active",
    )
    db.add(user)
    db.flush()

    # Assign default "citizen" role
    user_role = UserRole(user_id=user.id, role="citizen", department_id=None)
    db.add(user_role)

    # Initialize notification preferences
    pref = NotificationPreference(
        user_id=user.id,
        email_enabled=True,
        sms_enabled=bool(payload.phone_number),
        in_app_enabled=True,
        preferred_language=payload.preferred_language,
    )
    db.add(pref)

    # Audit log
    audit = AuditLog(actor_id=user.id, action="USER_REGISTERED", entity_type="user", entity_id=user.id)
    db.add(audit)

    db.commit()
    db.refresh(user)

    # Generate JWT token
    token = create_access_token(subject=user.id, role="citizen")
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        phone_number=user.phone_number,
        account_status=user.account_status,
        roles=[RoleInfo(role="citizen", department_id=None)],
        created_at=user.created_at,
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been suspended or deactivated.",
        )

    roles = db.query(UserRole).filter(UserRole.user_id == user.id).all()
    primary_role = roles[0].role if roles else "citizen"
    dept_id = roles[0].department_id if roles else None

    token = create_access_token(subject=user.id, role=primary_role, department_id=dept_id)

    role_infos = [RoleInfo(role=r.role, department_id=r.department_id) for r in roles]
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        phone_number=user.phone_number,
        account_status=user.account_status,
        roles=role_infos,
        created_at=user.created_at,
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: AuthenticatedUserContext = Depends(get_current_user)):
    user = current_user.user
    role_infos = [RoleInfo(role=r.role, department_id=r.department_id) for r in current_user.roles]
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        phone_number=user.phone_number,
        account_status=user.account_status,
        roles=role_infos,
        created_at=user.created_at,
    )


@router.patch("/me/profile", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdate,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = current_user.user
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.preferred_language is not None:
        user.preferred_language = payload.preferred_language
    if payload.phone_number is not None:
        user.phone_number = payload.phone_number

    db.commit()
    db.refresh(user)

    role_infos = [RoleInfo(role=r.role, department_id=r.department_id) for r in current_user.roles]
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        phone_number=user.phone_number,
        account_status=user.account_status,
        roles=role_infos,
        created_at=user.created_at,
    )


@router.post("/me/change-password")
def change_password(
    payload: PasswordChange,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = current_user.user
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
