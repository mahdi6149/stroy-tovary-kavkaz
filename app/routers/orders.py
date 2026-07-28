from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from db import get_pool
from telegram import notify_new_order

router = APIRouter(prefix="/api/orders", tags=["orders"])


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class OrderIn(BaseModel):
    customer_name: str
    phone: str
    address: str
    comment: str = ""
    items: List[OrderItemIn]


@router.post("", status_code=201)
async def create_order(order: OrderIn):
    if not order.items:
        raise HTTPException(status_code=400, detail="Добавьте товары в заказ")

    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            total = 0
            resolved_items = []

            for item in order.items:
                product = await conn.fetchrow(
                    "SELECT id, name, price_cents FROM products WHERE id = $1",
                    item.product_id,
                )
                if not product:
                    raise HTTPException(
                        status_code=400, detail=f"Товар #{item.product_id} не найден"
                    )
                total += product["price_cents"] * item.quantity
                resolved_items.append((product, item.quantity))

            order_row = await conn.fetchrow(
                """
                INSERT INTO orders (customer_name, phone, address, comment, total_cents)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, created_at
                """,
                order.customer_name,
                order.phone,
                order.address,
                order.comment,
                total,
            )
            order_id = order_row["id"]

            for product, quantity in resolved_items:
                await conn.execute(
                    """
                    INSERT INTO order_items (order_id, product_id, product_name, price_cents, quantity)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    order_id,
                    product["id"],
                    product["name"],
                    product["price_cents"],
                    quantity,
                )

    await notify_new_order(
        order_id=order_id,
        customer_name=order.customer_name,
        phone=order.phone,
        address=order.address,
        comment=order.comment,
        items=[
            {"name": product["name"], "price_cents": product["price_cents"], "quantity": quantity}
            for product, quantity in resolved_items
        ],
        total_cents=total,
    )

    return {"id": order_id, "total_cents": total, "created_at": order_row["created_at"]}


@router.get("/{order_id}")
async def get_order(order_id: int):
    pool = get_pool()
    order_row = await pool.fetchrow("SELECT * FROM orders WHERE id = $1", order_id)
    if not order_row:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    items = await pool.fetch("SELECT * FROM order_items WHERE order_id = $1", order_id)
    return {**dict(order_row), "items": [dict(i) for i in items]}
