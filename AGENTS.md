# AGENTS.md

## Проект в 2 строках
- Это приложение-симулятор экрана настроек телефона для шоу/иллюзий: оператор запускает «трансляцию», и на телефонах появляются множественные Wi-Fi SSID с заданным текстом.
- Текущая реализация: Web (CRA + Recoil + Tailwind) + Expo Mobile (React Native, SDK 55) + backend конфигов на Node.js/MongoDB.

## Важные ограничения
- Web Bluetooth работает не во всех браузерах/платформах; iOS Safari сценарий не поддерживает полноценно.
- Для BLE в Expo нужен Development Build (в Expo Go BLE ограничен).
- Есть легальные/этические риски radio-spam: использовать только в разрешенных условиях.

## Где что находится
- Веб-приложение: `src/`
- Мобильное приложение (Expo): `mobile/`
- Backend конфигов: `server/`
- BLE-сервис Expo: `mobile/src/services/ble/bleService.js`
- Загрузка/валидация удаленной конфигурации: `mobile/src/services/config/`
- Операторские экраны Expo:
  - `mobile/src/screens/ControlScreen.js`
  - `mobile/src/screens/SettingsScreen.js`
  - `mobile/src/screens/ShowSettingsScreen.js`
- Экраны-шаблоны телефонов (Expo): `mobile/src/screens/show/phoneModels/`
  - `samsungOneUi8/`
  - `onePlus/`
  - `huawei/`
- Общая логика Wi-Fi трансляции для шаблонов: `mobile/src/screens/show/shared/useWifiBroadcastFlow.js`
- Карта профилей/моделей: `mobile/src/show/accessProfiles.js`
- Карта шаблонов: `mobile/src/show/templates.js`
- Хранилище настроек Expo (AsyncStorage): `mobile/src/state/settingsStorage.js`
- Прошивка ESP32: `d:/Arduino/FakeWiFi_PRO/FakeWiFi_PRO.ino`

## Текущая модель UI (Expo)
- Логика строится не вокруг конкретных пользователей, а вокруг моделей телефонов (`samsungOneUi8`, `onePlus`, `huawei`).
- Пользовательские данные (имя/аватар) приходят из backend-конфига и подставляются в шаблон модели.
- `ShowSettingsScreen` определяет модель (`settings.phoneModel` или fallback по access-code) и рендерит соответствующий `*ModelShowScreen`.

## Backend конфиги и админка
- Публичный endpoint: `GET /api/show-config?code=...`
- Админ API: `server/src/routes/admin.js` (через `x-admin-key`)
- Мини-админка: `server/public/admin/`
  - `index.html` + `admin.js` (inline-скрипт убран ради CSP)
  - Упрощенное создание: «создать конфиг и привязать code»
  - Редактирование профиля через dropdown пользователей

## Памятка по размещению страниц (важно)
- Прод деплой сейчас `server-only`: корневой `public/` не публикуется на сервере.
- Любые новые статические страницы/лендинги/флешеры размещать в `server/public/<route>/`.
- Любые бинарники/статические ассеты для этих страниц размещать в `server/public/...`.
- Маршруты раздачи добавлять в `server/src/app.js` через `app.use('/route', express.static(...))`.
- Проверка после деплоя: страница и ее файлы должны открываться по прямым URL (например `/flash/`, `/flash/manifest.json`, `/firmware/...`).

## Протокол app -> firmware (критично)
- В web-версии команда пишется строкой формата `<minutesBeforeStop><optionalDot><payload>`.
- В прошивке parsing по-прежнему опирается на первый символ для минут.
- Ограничение: минуты 0-9 (двузначные значения требуют доработки контракта).

## Главные риски/долг
1. BLE state management в web-части (`src/App.js`) остается сложным и хрупким.
2. Контракт app <-> firmware не versioned, без ACK/NACK и структурированных ошибок.
3. Прошивка ESP32 требует ревизии валидации входных данных и таймингов.

## Как запускать
- Web: `npm start`
- Web build: `npm run build`
- Server: `cd server && npm start`
- Expo doctor: `cd mobile && npx expo-doctor`
- Android APK (release): `cd mobile/android && .\gradlew.bat assembleRelease`

## Что смотреть первым при потере контекста
1. `mobile/src/screens/ShowSettingsScreen.js`
2. `mobile/src/screens/show/shared/useWifiBroadcastFlow.js`
3. `mobile/src/services/config/configSchema.js`
4. `mobile/src/show/templates.js`
5. `server/src/routes/admin.js`
6. `server/public/admin/admin.js`

## Перед любыми изменениями
- Сначала фиксировать контракт BLE (команды, ответы, retry/timeout).
- Изменения UI шаблонов делать модельно-ориентированно (не хардкодить пользователя).
- Проверять совместимость для всех моделей: Samsung OneUi 8, One Plus, Huawei.
