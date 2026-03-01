# AGENTS.md

## Проект в 2 строках
- Это приложение-симулятор экрана настроек телефона для шоу/иллюзий: оператор запускает «трансляцию», и на телефонах появляются множественные Wi-Fi SSID с заданным текстом.
- Текущая реализация: Web (CRA + Recoil + Tailwind) + ESP32 прошивка через BLE (Web Bluetooth API).

## Важные ограничения
- Web Bluetooth работает не во всех браузерах/платформах; iOS Safari не поддерживает сценарий полноценно.
- У проекта есть легальные/этические риски при использовании radio spam; любое применение должно быть только в разрешенных условиях.

## Где что находится
- Веб-приложение: `src/`
- Мобильное приложение (Expo): `mobile/`
- BLE-логика приложения: `src/App.js`
- BLE-абстракция Expo (текущий stub): `mobile/src/services/ble/bleService.js`
- Экран настроек оператора: `src/pages/SettingsPage.js`
- Основной экран под код доступа Fert: `src/pages/fertVlad.js`
- Карта «доступ-код -> набор экранов»: `src/accessCodes.js`
- Глобальное состояние: `src/state/*.js`
- Хранилище настроек Expo (AsyncStorage): `mobile/src/state/settingsStorage.js`
- Прошивка ESP32: `d:/Arduino/FakeWiFi_PRO/FakeWiFi_PRO.ino`

## Текущая архитектура приложения
- Стек: React 18 + Recoil + Tailwind + framer-motion, без react-router (навигация через `page` state + `localStorage.startPage`).
- Авторизация/профиль: через `accessCode` в `localStorage`, затем выбор персонализированного набора страниц из `accessCodes`.
- BLE в `App.js`:
  - Подключение вручную: `navigator.bluetooth.requestDevice({ filters: [{ name: "Hacker" }] })`
  - Автопоиск paired девайсов: `navigator.bluetooth.getDevices()` + `watchAdvertisements()`
  - Основные UUID:
    - Service: `19b10000-e8f2-537e-4f6c-d104768a1214`
    - WiFi list notify/read: `19b10001-e8f2-537e-4f6c-d104768a1214`
    - Spot name write: `19b10002-e8f2-537e-4f6c-d104768a1214`
    - Device status notify/read: `19b10003-e8f2-537e-4f6c-d104768a1214`

## Протокол app -> firmware (критично)
- В `writeOnCharacteristic` приложение пишет строку формата:
  - `<minutesBeforeStop><optionalDot><payload>`
  - пример: `3.PREDICTION`
- В прошивке parsing сейчас делается так:
  - `interval = command.substring(0,1).toInt() * 60000;`
  - `ssid = command.substring(1);`
- Следствия:
  - Поддерживается только 1 цифра минут (0-9), `10` воспринимается как `1`.
  - Протокол не versioned, нет checksum/ack/error кода.

## Главные проблемы (текущее состояние)
1. Нестабильный коннект BLE:
- Много глобальных переменных в `App.js` (`bleDevice`, `bleServer`, `bleServiceFound`, ...), сложное восстановление состояния.
- `afterConnectDevice(...).catch(...)` вызывает `disconnectDevice()` и `autoConnectDevice()` рекурсивно, что может приводить к каскаду переподключений.
- Используются разные стратегии (requestDevice и getDevices/watchAdvertisements) без единой state-machine.

2. Слабый контракт связи app <-> firmware:
- На запись нет подтверждения доставки/принятия команды.
- Нет структурированного ответа об ошибках устройства.
- Формат одной строкой быстро ломается при росте требований.

3. Технический долг в UI-слое:
- 6 почти дублирующих страниц (`escalion/denjoker/enkD83Js/fertVlad/...`) с повторяющейся логикой запуска/остановки.
- Много настроек через `localStorage` без схемы и миграций.

## Прошивка ESP32: замеченные риски
- Синтаксическая ошибка: пропущена `;` после
  - `pDeviceStatusCharacteristic->addDescriptor(new BLE2902())`
- Тайминг-проверка для отправки списка сетей выглядит ошибочной:
  - `if (previousMillisforWifiSpots - currentMillis <= 3000)`
  - логически ожидается `currentMillis - previousMillisforWifiSpots <= 3000`.
- Размер буфера пакета ограничен `packet[12][128]`, но длина SSID не валидируется перед записью в пакет.
- Каналы/пакеты формируются «вручную»; отсутствует защита от некорректных входных данных.

## Как сейчас запускается
- `npm start` — dev
- `npm run build` — production bundle (через `react-app-rewired`)

## Что смотреть первым делом при потере контекста
1. `src/App.js` — вся BLE-жизнь приложения.
2. `src/pages/SettingsPage.js` — настройки, влияющие на протокол и поведение.
3. `src/pages/fertVlad.js` — UX сценарий запуска/остановки «трансляции».
4. `src/accessCodes.js` — какие страницы вообще доступны по коду.
5. `d:/Arduino/FakeWiFi_PRO/FakeWiFi_PRO.ino` — обработка команды и BLE advertising.

## Целевое направление
- Перевод приложения на React Native Expo.
- Отказ от Web Bluetooth в пользу нативного BLE слоя (с предсказуемой поддержкой Android/iOS).
- Новый явный протокол команд: структурированный payload + ACK/NACK + версия протокола.

## Текущее состояние Expo (на 1 марта 2026)
- Создан отдельный проект `mobile/` на Expo SDK 55.
- Добавлены экраны:
  - `mobile/src/screens/ControlScreen.js`
  - `mobile/src/screens/SettingsScreen.js`
- Добавлен контекст и персист настроек через AsyncStorage:
  - `mobile/src/state/SettingsContext.js`
  - `mobile/src/state/settingsStorage.js`
- Добавлен BLE-сервис на `react-native-ble-plx`:
  - `mobile/src/services/ble/bleService.js`
- В `mobile/app.json` добавлены BLE plugin/permissions.
- Для реального BLE нужен `Development Build` (в Expo Go BLE-подключение ограничено).
- Проверка состояния проекта: `npx expo-doctor` проходит (17/17).

## Перед любыми изменениями
- Сначала зафиксировать контракт BLE (команды, ответы, таймауты, retry-policy).
- Затем вынести BLE в отдельный сервис/слой (state machine), UI не должен напрямую управлять reconnect.
- Только после стабилизации контракта переносить экраны на Expo.
