# СтройМаркет

Интернет-магазин стройматериалов. React (Vite) + Python/FastAPI + PostgreSQL, за Caddy (reverse-proxy с автоматическим HTTPS).

## Локальный запуск

Нужен Docker и docker compose.

1. Скопировать пример env-файла и заполнить:
   ```
   cp app/.env.example .env
   ```
   Для локального теста можно оставить `DOMAIN=:80` — Caddy отдаст сайт по обычному http://localhost без HTTPS.

2. Запустить:
   ```
   docker compose up -d --build
   ```
   Флаг `--build` нужен только локально (образы ещё не в ghcr.io). На проде используется `docker compose pull && docker compose up -d`.

3. Открыть http://localhost — витрина. API — http://localhost/api/products, документация Swagger — контейнер `app` слушает `/docs` изнутри сети (наружу через Caddy не выведено, при необходимости добавить в Caddyfile).

## Структура

- `app/` — бэкенд (FastAPI), `app/db/init.sql` — схема + сид каталога
- `frontend/` — React-витрина (Vite)
- `caddy/Caddyfile` — reverse-proxy
- `docker-compose.yml` — все сервисы для продакшена
- `.github/workflows/deploy.yml` — CI: билд образов → ghcr.io → деплой на VPS по SSH
- `setup-vps.sh` — разовый скрипт первоначальной настройки VPS (нужно вручную подставить значения — см. плейсхолдеры `__..._​__` внутри)
- `CLAUDE.md` — подробности по деплою: где что лежит, как менять переменные, смотреть логи, откатываться

## Деплой на VPS

Полная инструкция — в `CLAUDE.md`, раздел «Деплой». Коротко: нужен IP сервера, GitHub-репозиторий, email для Let's Encrypt и GitHub PAT для `docker login ghcr.io` на сервере (см. историю переписки с Claude — там пошагово).
