import os
import httpx

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")


async def notify_new_order(order_id: int, customer_name: str, phone: str, address: str,
                            comment: str, items: list, total_cents: int) -> None:
    """Шлёт уведомление в Telegram о новом заказе. Ошибки не пробрасываются наружу —
    если Telegram недоступен или не настроен, заказ всё равно должен сохраниться."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return

    items_text = "\n".join(
        f"  • {item['name']} × {item['quantity']} — {item['price_cents'] * item['quantity'] / 100:.0f} ₽"
        for item in items
    )
    text = (
        f"🧱 Новый заказ №{order_id}\n\n"
        f"Имя: {customer_name}\n"
        f"Телефон: {phone}\n"
        f"Адрес: {address}\n"
        + (f"Комментарий: {comment}\n" if comment else "")
        + f"\nСостав заказа:\n{items_text}\n\n"
        f"Итого: {total_cents / 100:.0f} ₽"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": text})
    except Exception:
        # Не роняем заказ, если Telegram недоступен — просто молча пропускаем.
        pass
