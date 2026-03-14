# Hacker 2.0 Config Server (MongoDB)

Backend для динамической загрузки экранов по access code.

## Что умеет
- `GET /api/show-config?code=...` для мобильного приложения
- хранение access-code только в hash виде (без plaintext)
- привязка кода к версии конфигурации
- админ API с `x-admin-key`
- встроенная админ-страница `/admin/`

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
- `CORS_ORIGIN=https://your-domain.example`

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
npm run seed -- demo-code
```

Это создаст тестовый конфиг и привязанный к нему тестовый код.

## 4. Публичный API

### `GET /api/show-config?code=demo-code`

Успех (`200`):
```json
{
  "schemaVersion": 1,
  "version": "2026-03-14.1",
  "updatedAt": "2026-03-14T10:45:00.000Z",
  "profile": {
    "id": "demo-code",
    "displayName": "Demo User"
  },
  "templateId": "onePlus",
  "templateName": "One Plus",
  "payload": {
    "operatorProfile": {
      "fullName": "Demo User",
      "avatarUrl": "https://example.com/avatar.png"
    },
    "templateMeta": {
      "title": "One Plus"
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
  "version": "2026-03-14.1",
  "templateId": "onePlus",
  "templateName": "One Plus",
  "profile": { "id": "demo-code", "displayName": "Demo User" },
  "payload": {
    "operatorProfile": {
      "fullName": "Demo User",
      "avatarUrl": "https://example.com/avatar.png"
    },
    "templateMeta": {
      "title": "One Plus"
    }
  }
}
```

### Создать код
`POST /api/admin/access-codes`
```json
{
  "code": "demo-code",
  "configId": "OBJECT_ID_FROM_CONFIG"
}
```

### Привязать существующий код к новому конфигу
`POST /api/admin/access-codes/bind`
```json
{
  "code": "demo-code",
  "configId": "OBJECT_ID_FROM_CONFIG"
}
```

### Отозвать код
`POST /api/admin/access-codes/revoke`
```json
{
  "code": "demo-code"
}
```

### Обновить ФИО/аватар по accessCodeId или code
`POST /api/admin/operator-profile`
```json
{
  "accessCodeId": "OBJECT_ID_FROM_ACCESS_CODES",
  "fullName": "Demo User Updated",
  "avatarUrl": "https://example.com/new-avatar.png",
  "templateTitle": "One Plus"
}
```

### Список кодов
`GET /api/admin/access-codes`

## 6. Встроенная мини-админка
- URL: `https://your-domain.example/admin/`
- Вверху страницы нужно ввести `ADMIN_API_KEY`.
- Ключевые действия:
  - создать конфиг и автоматически привязать code
  - обновить профиль пользователя через dropdown
  - посмотреть список активных кодов

## 7. Подключение мобильного приложения
В `mobile/.env`:
```bash
EXPO_PUBLIC_CONFIG_API_BASE_URL=https://your-domain.example/api
```

## Безопасность (минимум)
- используйте длинные `ADMIN_API_KEY` и `ACCESS_CODE_PEPPER`
- ограничьте доступ к `/api/admin/*` по IP (через reverse proxy)
- не логируйте plaintext access-codes
