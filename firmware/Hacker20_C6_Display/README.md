# Hacker20_C6_Display — прошивка «Hacker 2.0 с дисплеем - Stable» (Seeed XIAO ESP32-C6)

Дисплейная версия FakeWiFi PRO: база (BLE + инжекция фейковых WiFi-биконов, coex-фиксы) + OLED SSD1306 128x32 + индикация батареи и зарядки. Распространяется через hacker20.escalion.ru/flash как вариант «Hacker 2.0 с дисплеем - Stable» для Seeed XIAO ESP32-C6.

## Железо
- Плата: Seeed XIAO ESP32-C6
- OLED SSD1306 128x32 (I2C): SDA = D4 (GPIO22), SCL = D5 (GPIO23); поворот U8G2_R2 (экран перевёрнут)
- Делители напряжения 1:2 (по 2×200 кОм, официальная схема Seeed):
  - A0 = шина BAT+ на плате (ПОСЛЕ тумблера)
  - A2 = плюс батареи (ДО тумблера) — реальное напряжение батареи
  - A1 = детект USB 5V (VBUS)
- Батарея: Li-Po ~300 мА·ч; тумблер рвёт плюс батареи
- Зарядный чип платы: SGM40567-4.2XG/TR, ток заряда 120 мА (задан R10 = 200 кОм)

## Сборка (на VPS)
```bash
arduino-cli compile --fqbn "esp32:esp32:XIAO_ESP32C6:PartitionScheme=huge_app" \
  /home/apps/hacker20/firmware/Hacker20_C6_Display --output-dir /tmp/hacker_display_build/out
```
Зависимости на VPS: ядро esp32 3.3.11 в `~/.arduino15/packages` (НЕ удалять), библиотека U8g2 в `~/Arduino/libraries/U8g2` (ставилась вручную — см. wiki: downloads.arduino.cc 403).

## Деплой на сайт прошивальщика
Бинарники кладутся в `/home/apps/hacker20/server/public/firmware/Hacker 2.0 с дисплеем - Stable (C6)/`:
| файл | откуда | offset |
|---|---|---|
| bootloader.bin | из out/ | 0 |
| partitions.bin | из out/ | 32768 |
| boot_app0.bin | `~/.arduino15/.../esp32/3.3.11/tools/partitions/boot_app0.bin` | 57344 |
| firmware.bin | из out/ | 65536 |
плюс meta.json (label «Hacker 2.0 с дисплеем - Stable», chipFamily ESP32-C6). Затем `pm2 restart hacker20`.
Бинарники в public/firmware в git НЕ трекаются. Бэкапы версий — в `/home/alex/firmware-backups/`.

## Экран
- Строка 1: батарейка слева (иконка+заполнение); при зарядке — молния + %; USB есть, а батареи на шине нет (тумблер выкл) — перечёркнутая молния; таймер до конца трансляции — справа вверху
- Строка 2: «ожидание» / «Подключено» / трансляция (иконка Wi-Fi + имя; карта вида 7H/AS/10D = ранг + битмап масти ♠♥♣♦)
- Энергосбережение: WiFi включается только на время трансляции/скана; delay(50) в холостом цикле
- ⚠️ Эксперимент: при зарядке (USB + тумблер вкл) BLE/WiFi принудительно выключаются — решено вернуть работу радио при зарядке (задача в wiki: hacker20-falsh.md)
