# Hacker 2.0 Config Server (MongoDB)

Готовый backend для динамической загрузки экранов по access code.

## Что умеет
- `GET /api/show-config?code=...` для мобильного приложения
- коды доступа в MongoDB (храним только hash, не plaintext)
- привязка кода к версии конфигурации
- админ API с `x-admin-key`
- rate limit на публичный API

## 1. Установка
```bash
cd server
npm install
cp .env.example .env
```

Заполните `.env`:
- `MONGODB_URI`
- `ADMIN_API_KEY`
- `ACCESS_CODE_PEPPER`
- `CORS_ORIGIN=https://hacker20.escalion.ru`

## 2. Запуск
```bash
npm start
```

Проверка:
```bash
curl http://127.0.0.1:8080/api/health
```

## 3. Seed стартовых данных
```bash
npm run seed -- escalion
```

Это создаст:
- конфиг `templateId=escalion`
- код `escalion` (hashed) привязанный к этому конфигу

Для профиля Fert:
```bash
npm run seed -- fertVlad
```
Создаст конфиг `templateId=fertVlad` с `templateName=One Plus`.

## 4. Публичный API

### `GET /api/show-config?code=escalion`

Успех (`200`):
```json
{
  "schemaVersion": 1,
  "version": "2026-03-04.1",
  "updatedAt": "2026-03-04T10:45:00.000Z",
  "profile": {
    "id": "escalion",
    "displayName": "Алексей Белинский"
  },
  "templateId": "escalion",
  "templateName": "Samsung OneUi 8",
  "payload": {
    "operatorProfile": {
      "fullName": "Алексей Белинский",
      "avatarUrl": "https://..."
    },
    "templateMeta": {
      "title": "Samsung OneUi 8"
    }
  }
}
```

## 5. Админ API
Во всех запросах:
- header: `x-admin-key: <ADMIN_API_KEY>`

### Создать конфиг
`POST /api/admin/configs`
```json
{
  "schemaVersion": 1,
  "version": "2026-03-05.1",
  "templateId": "escalion",
  "profile": { "id": "escalion", "displayName": "Алексей Белинский" },
  "payload": {}
}
```

### Создать код
`POST /api/admin/access-codes`
```json
{
  "code": "my-secret-code",
  "configId": "OBJECT_ID_FROM_CONFIG"
}
```

### Привязать существующий код к новому конфигу
`POST /api/admin/access-codes/bind`
```json
{
  "code": "my-secret-code",
  "configId": "OBJECT_ID_FROM_CONFIG"
}
```

### Отозвать код
`POST /api/admin/access-codes/revoke`
```json
{
  "code": "my-secret-code"
}
```

### Обновить ФИО/аватар по коду (без Mongo)
`POST /api/admin/operator-profile`
```json
{
  "code": "escalion",
  "fullName": "Алексей Белинский",
  "avatarUrl": "https://hacker20.escalion.ru/static/alex.jpg",
  "templateTitle": "Samsung OneUi 8"
}
```

### Список кодов
`GET /api/admin/access-codes`

## 6. Деплой на `hacker20.escalion.ru`

### DNS
- создайте `A` запись:
  - `hacker20.escalion.ru -> <IP вашего VPS>`

### Reverse proxy (Nginx)
Пример конфига:
```nginx
server {
  listen 80;
  server_name hacker20.escalion.ru;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### SSL
```bash
sudo certbot --nginx -d hacker20.escalion.ru
```

### PM2 (опционально)
```bash
npm i -g pm2
pm2 start src/index.js --name hacker20-api
pm2 save
pm2 startup
```

## 7. Подключение мобильного приложения
В `mobile/.env`:
```bash
EXPO_PUBLIC_CONFIG_API_BASE_URL=https://hacker20.escalion.ru/api
```

## 8. Встроенная мини-админка
- URL: `https://hacker20.escalion.ru/admin/`
- Вверху страницы вставьте `ADMIN_API_KEY`.
- Доступные действия:
  - обновление ФИО/аватара по коду
  - создание `ShowConfig`
  - создание `AccessCode`
  - просмотр списка кодов

## Безопасность (минимум)
- используйте длинные `ADMIN_API_KEY` и `ACCESS_CODE_PEPPER`
- ограничьте доступ к админ API по IP (через Nginx)
- не логируйте plaintext коды доступа
