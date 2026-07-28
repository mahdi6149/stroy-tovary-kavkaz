from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from db import get_pool

router = APIRouter(prefix="/api/products", tags=["products"])

PRODUCT_FIELDS = """
    p.id, p.name, p.slug, p.description, p.price_cents, p.unit, p.image_url, p.stock,
    c.name AS category_name, c.slug AS category_slug
"""


@router.get("")
async def list_products(category: Optional[str] = None, search: Optional[str] = None):
    pool = get_pool()
    conditions = []
    params = []

    if category:
        params.append(category)
        conditions.append(f"c.slug = ${len(params)}")
    if search:
        params.append(f"%{search}%")
        conditions.append(f"p.name ILIKE ${len(params)}")

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    rows = await pool.fetch(
        f"""
        SELECT {PRODUCT_FIELDS}
        FROM products p
        JOIN categories c ON c.id = p.category_id
        {where}
        ORDER BY p.name
        """,
        *params,
    )
    return [dict(r) for r in rows]


@router.get("/{slug}")
async def get_product(slug: str):
    pool = get_pool()
    row = await pool.fetchrow(
        f"""
        SELECT {PRODUCT_FIELDS}
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.slug = $1
        """,
        slug,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return dict(row)
