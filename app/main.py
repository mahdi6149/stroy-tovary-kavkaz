from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_pool, close_pool, get_pool
from routers import categories, products, orders, admin_auth, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()


app = FastAPI(title="СтройМаркет API", lifespan=lifespan)

# Фронтенд и API живут за одним доменом через Caddy,
# но на всякий случай (локальная разработка) разрешаем всё.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin_auth.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    pool = get_pool()
    await pool.fetchval("SELECT 1")
    return {"status": "ok"}
