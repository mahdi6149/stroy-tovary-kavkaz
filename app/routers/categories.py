from fastapi import APIRouter
from db import get_pool

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("")
async def list_categories():
    pool = get_pool()
    rows = await pool.fetch("SELECT id, name, slug FROM categories ORDER BY name")
    return [dict(r) for r in rows]
