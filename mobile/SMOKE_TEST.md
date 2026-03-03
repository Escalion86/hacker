# Mobile BLE Smoke Test

Date baseline: 2026-03-01

## Preconditions
- ESP32 flashed with `firmware/FakeWiFi_PRO_ExpoReady/FakeWiFi_PRO_ExpoReady.ino`
- Android dev client installed from `npx expo run:android`
- Bluetooth and Location are enabled on the phone

## Core flow (repeat x10)
1. Open app and tap `Подключить`
2. Verify status becomes `Подключено`
3. Tap `Старт трансляции`
4. Verify status becomes `Идет трансляция`
5. Tap `Стоп`
6. Verify status becomes `Трансляция остановлена`
7. Tap `Отключить`
8. Tap `Подключить` again

## Edge cases
1. `connect -> start -> disconnect` without pressing stop:
   - reconnect should still work
2. Fast cycle:
   - `Подключить -> Отключить -> Подключить` with ~0.5s pause
3. Duration parsing:
   - set `minutesBeforeStop=10`, start, verify it does not auto-stop around 1 minute

## Diagnostic capture
- On failure, copy last `BLE Diagnostics` lines from Control screen:
  - `scan_start`, `scan_timeout`, `scan_match`
  - `reconnect_by_id_*`
  - `connect_to_device`
  - `device_disconnected`
