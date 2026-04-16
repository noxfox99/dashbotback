# TRON GasFree Dashboard — Proxy Server

Решает CORS проблему: все запросы к GasFree API и TronGrid идут через этот сервер.

## Деплой на Railway

1. Загрузи эту папку в GitHub репозиторий
2. Зайди на railway.app → New Project → Deploy from GitHub
3. Railway автоматически запустит `node server.js`
4. Открой дашборд по выданному URL

## Локальный запуск

```bash
npm install
npm start
# Открыть http://localhost:3000
```

## Архитектура

```
Browser
  │
  ├── GET /          → public/index.html (дашборд)
  │
  ├── POST /proxy/gasfree   → open.gasfree.io  (HMAC-SHA256 подпись на сервере)
  └── POST /proxy/trongrid  → api.trongrid.io  (добавляет TRON-PRO-API-KEY)
```

## Прокси эндпоинты

### POST /proxy/gasfree
```json
{
  "gfPath":    "/api/v1/address/TQn9...",
  "method":    "GET",
  "apiKey":    "ваш_ключ",
  "apiSecret": "ваш_секрет",
  "baseUrl":   "https://open.gasfree.io/tron"
}
```

### POST /proxy/trongrid
```json
{
  "tgPath":  "/v1/accounts/TQn9.../",
  "method":  "GET",
  "apiKey":  "ваш_trongrid_ключ",
  "rpc":     "https://api.trongrid.io"
}
```

## Приватные ключи

Приватные ключи **никогда не отправляются на сервер**.
TIP-712 подпись выполняется локально в браузере через TronWeb.
