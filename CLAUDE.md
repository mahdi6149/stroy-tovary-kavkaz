# CLAUDE.md

## Деплой

### Куда деплоим
- VPS: `138.16.226.68` (пользователь `root`)
- Путь проекта на сервере: `/opt/app`
- Домен: `__DOMAIN__` — реального домена нет, используется nip.io (`<IP через дефисы>.nip.io`), который резолвится в IP сервера. Caddy получает для него настоящий сертификат Let's Encrypt. Если позже появится свой домен — просто заменить `DOMAIN` в `.env` на него и перезапустить `caddy` (`docker compose up -d caddy`), сертификат перевыпустится автоматически.

### О приложении
Интернет-магазин стройматериалов: каталог по категориям, поиск, корзина (хранится в localStorage браузера), оформление заказа без регистрации (имя/телефон/адрес → создаётся запись в `orders`+`order_items`).

Есть админ-панель на `/admin` (защищена паролем): управление товарами (добавить/изменить/удалить), категориями (добавить/удалить, нельзя удалить непустую), заказами (просмотр, смена статуса new → processing → done/cancelled). Работает через отдельные `/api/admin/*` эндпоинты с bearer-токеном.

На витрине есть переключатель светлой/тёмной темы (иконка 🌙/☀️ в шапке, сохраняется в localStorage) и плавающая кнопка перехода в Telegram в правом нижнем углу. Ссылка на Telegram задаётся в `frontend/src/config.js` (`TELEGRAM_URL`) — поменять на реальный юзернейм/бота магазина и пересобрать образ `web`.

При создании заказа бэкенд отправляет уведомление в Telegram (владельцу магазина) через Bot API — имя, телефон, адрес, состав заказа и сумма. Настраивается через `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` в `.env` (см. таблицу переменных ниже). Если не заданы — уведомления просто не отправляются, заказ всё равно сохраняется.

Стек: **React** (фронтенд, Vite → статика на nginx) + **Python/FastAPI** (бэкенд, `asyncpg`) + **PostgreSQL**.

### Сервисы в docker-compose.yml
| Сервис | Образ | Роль |
|---|---|---|
| `app` | `ghcr.io/mahdi6149/stroy-tovary-kavkaz-app` (билдится из `./app`, Python 3.12 + FastAPI + uvicorn) | API: `/api/categories`, `/api/products`, `/api/orders`, `/health`, Swagger на `/docs` |
| `web` | `ghcr.io/mahdi6149/stroy-tovary-kavkaz-web` (билдится из `./frontend`, Vite → nginx) | React-витрина (каталог, корзина, оформление заказа) |
| `db` | `postgres:16-alpine` | база данных, при первом старте применяет `app/db/init.sql` (схема + сид каталога) |
| `caddy` | `caddy:2-alpine` | reverse-proxy: `/api/*` → `app`, всё остальное → `web`; автоматический HTTPS (Let's Encrypt) |

### Env-переменные
Источник правды по переменным — `app/.env.example`. Реальные значения лежат **только** в `/opt/app/.env` на VPS (не в git, не в GitHub Secrets).

| Переменная | Назначение |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | доступ к БД |
| `DATABASE_URL` | строка подключения (собирается в compose из POSTGRES_*, читается FastAPI-приложением) |
| `ADMIN_PASSWORD` | пароль для входа в `/admin` |
| `ADMIN_TOKEN` | секретный токен сессии админки (выдаётся после логина, сгенерировать: `openssl rand -hex 24`) |
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather — только на сервере, никогда во фронтенде |
| `TELEGRAM_CHAT_ID` | ID чата/группы, куда бот шлёт уведомления о новых заказах |
| `DOMAIN` | домен для Caddy |
| `ACME_EMAIL` | email для Let's Encrypt |

GitHub Secrets (репозиторий → Settings → Secrets → Actions), используются только для доставки, не для приложения:
- `VPS_HOST` — IP сервера
- `VPS_USER` — `root`
- `VPS_SSH_KEY` — приватный ключ CI (публичная часть — в `~/.ssh/authorized_keys` на VPS)

`GHCR_PAT` в GitHub Secrets не хранится — используется один раз на VPS для `docker login ghcr.io` при первичной настройке.

### Как выкатывается
1. `git push` в `main`.
2. Actions (`.github/workflows/deploy.yml`) билдит образ `app` из `./app`, пушит в `ghcr.io/mahdi6149/stroy-tovary-kavkaz-app:latest` (через встроенный `GITHUB_TOKEN`, PAT не нужен).
3. Actions по SSH (ключ `VPS_SSH_KEY`) заходит на VPS и в `/opt/app` выполняет:
   ```
   docker compose pull
   docker compose up -d
   docker image prune -f
   ```
   Workflow сам ничего не знает про `.env` — он уже лежит на сервере и подхватывается через `env_file`.

### Как поменять существующую переменную
1. Зайти на VPS: `ssh root@138.16.226.68`
2. Отредактировать `/opt/app/.env`
3. Перезапустить: `cd /opt/app && docker compose up -d`
   (пересборка образа не нужна, только рестарт контейнеров, которые её читают)

### Как добавить новую переменную
1. Добавить её в `app/.env.example` в репозитории (документация) и использовать в коде через `process.env.NAME`.
2. Добавить значение в `/opt/app/.env` на VPS вручную (`ssh` + `nano .env`).
3. Если переменная нужна и `db`/`caddy`, а не только `app` — прописать в `docker-compose.yml` в секции нужного сервиса.
4. `git push` — новый образ подхватит переменную из `.env` при следующем деплое (или сразу `docker compose up -d` на VPS, если код менять не нужно).
5. Обновить эту секцию CLAUDE.md.

### Логи
```
ssh root@138.16.226.68
cd /opt/app
docker compose logs -f app
docker compose logs -f caddy
docker compose logs -f db
```

### Откат
Быстрый откат на предыдущий образ по SHA коммита (Actions тегирует каждый билд `:<sha>` в дополнение к `:latest`):
```
ssh root@138.16.226.68
cd /opt/app
docker compose pull   # если нужно
sed -i 's#:latest#:<нужный_sha>#' docker-compose.yml   # временно
docker compose up -d
```
Либо просто `git revert` проблемного коммита в `main` и запушить — Actions выкатит рабочую версию заново.
