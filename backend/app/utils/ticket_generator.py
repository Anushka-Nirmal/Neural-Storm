import datetime
import secrets
import string


def generate_ticket_id() -> str:
    """
    Generates a unique, non-sequential, human-readable ticket ID.
    Format: JSA-YYYY-XXXXXX (e.g., JSA-2026-K9M2W7)
    Uses cryptographically secure random alphanumeric characters (avoiding confusing chars like 0/O, 1/I).
    """
    year = datetime.datetime.now(datetime.timezone.utc).year
    alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    suffix = "".join(secrets.choice(alphabet) for _ in range(6))
    return f"JSA-{year}-{suffix}"
