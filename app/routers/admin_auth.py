import os
import secrets

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["admin-auth"])

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")


class LoginIn(BaseModel):
    password: str


@router.post("/login")
async def login(data: LoginIn):
    if not ADMIN_PASSWORD or not ADMIN_TOKEN:
        raise HTTPException(status_code=500, detail="Админ-доступ не настроен на сервере")
    if not secrets.compare_digest(data.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Неверный пароль")
    return {"token": ADMIN_TOKEN}
