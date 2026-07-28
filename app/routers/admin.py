from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import get_pool
from auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# ---------- категории ----------
class CategoryIn(BaseModel):
    name: str
    slug: str


@router.get("/categories")
async def list_categories():
    pool = get_pool()
    rows = await pool.fetch("SELECT id, name, slug FROM categories ORDER BY name")
    return [dict(r) for r in rows]


@router.post("/categories", status_code=201)
async def create_category(data: CategoryIn):
    pool = get_pool()
    try:
        row = await pool.fetchrow(
            "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug",
            data.name,
            data.slug,
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Категория с таким slug уже существует")
    return dict(row)


@router.delete("/categories/{category_id}", status_code=204)
async def delete_category(category_id: int):
    pool = get_pool()
    in_use = await pool.fetchval("SELECT COUNT(*) FROM products WHERE category_id = $1", category_id)
    if in_use:
        raise HTTPException(status_code=400, detail="Нельзя удалить категорию, в которой есть товары")
    await pool.execute("DELETE FROM categories WHERE id = $1", category_id)


# ---------- товары ----------
class ProductIn(BaseModel):
    category_id: int
    name: str
    slug: str
    description: str = ""
    price_cents: int
    unit: str = "шт"
    image_url: str = ""
    stock: int = 0


@router.get("/products")
async def list_products():
    pool = get_pool()
    rows = await pool.fetch(
        """
        SELECT p.id, p.name, p.slug, p.description, p.price_cents, p.unit, p.image_url, p.stock,
               c.name AS category_name, c.slug AS category_slug, p.category_id
        FROM products p JOIN categories c ON c.id = p.category_id
        ORDER BY p.name
        """
    )
    return [dict(r) for r in rows]


@router.post("/products", status_code=201)
async def create_product(data: ProductIn):
    pool = get_pool()
    try:
        row = await pool.fetchrow(
            """
            INSERT INTO products (category_id, name, slug, description, price_cents, unit, image_url, stock)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
            """,
            data.category_id, data.name, data.slug, data.description,
            data.price_cents, data.unit, data.image_url, data.stock,
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Товар с таким slug уже существует или категория не найдена")
    return {"id": row["id"]}


@router.put("/products/{product_id}")
async def update_product(product_id: int, data: ProductIn):
    pool = get_pool()
    result = await pool.execute(
        """
        UPDATE products SET category_id=$1, name=$2, slug=$3, description=$4,
               price_cents=$5, unit=$6, image_url=$7, stock=$8
        WHERE id=$9
        """,
        data.category_id, data.name, data.slug, data.description,
        data.price_cents, data.unit, data.image_url, data.stock, product_id,
    )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Товар не найден")
    return {"ok": True}


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int):
    pool = get_pool()
    await pool.execute("DELETE FROM products WHERE id = $1", product_id)


# ---------- заказы ----------
ALLOWED_STATUSES = {"new", "processing", "done", "cancelled"}


class OrderStatusIn(BaseModel):
    status: str


@router.get("/orders")
async def list_orders(status: Optional[str] = None):
    pool = get_pool()
    if status:
        rows = await pool.fetch(
            "SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC", status
        )
    else:
        rows = await pool.fetch("SELECT * FROM orders ORDER BY created_at DESC")
    return [dict(r) for r in rows]


@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: int, data: OrderStatusIn):
    if data.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Статус должен быть одним из {sorted(ALLOWED_STATUSES)}")
    pool = get_pool()
    result = await pool.execute("UPDATE orders SET status = $1 WHERE id = $2", data.status, order_id)
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return {"ok": True}
