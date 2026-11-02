import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple
from jose import JWTError, jwt
from app.core.config import settings

ALGORITHM = settings.JWT_ALGORITHM


def hash_password(password: str) -> str:
    """Secure password hashing using PBKDF2-HMAC-SHA256 with salt."""
    salt = secrets.token_hex(16)
    iterations = 2_000
    hash_bytes = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations
    )
    return f"pbkdf2:sha256:{iterations}${salt}${hash_bytes.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored PBKDF2 hash."""
    try:
        if not hashed_password or not hashed_password.startswith("pbkdf2:sha256:"):
            return False
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        header = parts[0]
        iterations = int(header.split(":")[2])
        salt = parts[1]
        expected_hex = parts[2]
        computed_bytes = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), iterations
        )
        return secrets.compare_digest(computed_bytes.hex(), expected_hex)
    except Exception:
        return False


def create_access_token(
    subject: str,
    role: str = "citizen",
    department_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Creates a signed JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "iat": now,
        "iss": "jansahayak-ai",
    }
    if department_id:
        to_encode["department_id"] = str(department_id)
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.SUPABASE_JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},
        )
        return payload
    except JWTError:
        return None
