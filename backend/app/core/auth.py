from jose import JWTError, jwt
from app.config import get_settings

settings = get_settings()


def create_token(sub: str) -> str:
    import time
    payload = {"sub": sub, "exp": int(time.time()) + 86400 * 7}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None
