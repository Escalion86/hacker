#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <WiFi.h>
#include <esp_wifi.h>
#include <esp_coexist.h>

#include <Wire.h>
#include <U8g2lib.h>

#include <driver/usb_serial_jtag.h> // usb_serial_jtag_is_connected() — хост по SOF

// ============================================================
//  OLED SSD1306 128x32 (тот же, что в CO2-датчике), I2C 0x3C
//  XIAO ESP32-C6: SDA=D4 (GPIO22), SCL=D5 (GPIO23)
// ============================================================
U8G2_SSD1306_128X32_UNIVISION_F_HW_I2C u8g2(U8G2_R2, /* reset = */ U8X8_PIN_NONE); // R2 = перевёрнуто на 180°
bool displayOk = false;

// ============================================================
//  Батарея, делители 1:2 (по два резистора 200 кОм, официальная схема Seeed):
//   A0 = шина BAT+ на плате (ПОСЛЕ тумблера)   -> BAT+ пяток -> R -> A0 -> R -> GND
//   A2 = плюс батареи (ДО тумблера)            -> "+" батареи -> R -> A2 -> R -> GND
//  Тумблер замкнут  => A0 == A2 (одна точка).
//  Тумблер разомкнут + USB => A0 «висит» на заряднике (SGM40567, лимит 120мА,
//  шина проседает под нагрузкой), A2 показывает реальную батарею.
// ============================================================
#define VBAT_PIN A0         // шина (после тумблера)
#define VBATT_SIDE_PIN A2   // батарея (до тумблера)
#define VBAT_DIVIDER 2.0f
float vbatV = 0.0f;     // реальное напряжение батареи (A2)
float vbusV = 0.0f;     // напряжение шины BAT+ (A0)
int batPct = 0;
bool hasBattery = false;
bool toggleClosed = false;  // батарея подключена к шине (тумблер замкнут)

// USB/VBUS: делитель 1:2 от пина 5V (два резистора 200кОм): 5V -> R -> A1 -> R -> GND.
// Дополнительно — резервный детект USB-хоста по SOF (работает с ПК без делителя).
#define VBUS_PIN A1
#define VBUS_DIVIDER 2.0f
bool usbConnected = false;

// Timer
unsigned long previousMillis = 0;
unsigned long previousMillisforWifiSpots =0;
unsigned long interval = 60000;
unsigned long lastDisplayUpdate = 0;

const uint8_t networkCount = 12;
uint8_t macs[12][6];
uint8_t packet[12][160];
// Samsung/One UI scanners dwell longest on 1, 6, 11 -> group fake APs there.
// Grouped order also minimizes esp_wifi_set_channel() calls per sweep.
const uint8_t apChannel[networkCount] = {1, 1, 1, 1, 6, 6, 6, 6, 11, 11, 11, 11};
int ssidLen = 0;

BLEServer* pServer = NULL;
BLECharacteristic* pDeviceStatusCharacteristic = NULL;
BLECharacteristic* pWifiSpotsListCharacteristic = NULL;
BLECharacteristic* pSpotNameCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
bool wifiSpotsSended = false;
String ssid = "";
const int maxSafeSsidLen = 78;

const char* ACK_START = "ACK_START";
const char* ACK_STOP = "ACK_STOP";
const char* NACK_UNSUPPORTED_VERSION = "NACK_UNSUPPORTED_VERSION";
const char* NACK_INVALID_PAYLOAD = "NACK_INVALID_PAYLOAD";
const char* NACK_INVALID_COMMAND = "NACK_INVALID_COMMAND";
const char* NACK_SSID_TOO_LONG = "NACK_SSID_TOO_LONG";

const int ledPin = 15; // XIAO ESP32-C6: встроенный пользовательский LED = GPIO15

#define SERVICE_UUID        "19b10000-e8f2-537e-4f6c-d104768a1214"
#define WiFi_SPOTS_LIST_CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"
#define SPOT_NAME_CHARACTERISTIC_UUID "19b10002-e8f2-537e-4f6c-d104768a1214"
#define DEVICE_STATUS_CHARACTERISTIC_UUID "19b10003-e8f2-537e-4f6c-d104768a1214"

// --- Радио: при зарядке (USB + тумблер вкл) BLE и WiFi полностью выключены ---
bool chargeRadiosOff = false;

void ensureWifiOn() {
  if (WiFi.getMode() != WIFI_AP) {
    WiFi.mode(WIFI_AP);
    delay(300); // дать драйверу стартануть перед esp_wifi_80211_tx
  }
}

void ensureWifiOff() {
  if (WiFi.getMode() != WIFI_OFF) {
    WiFi.mode(WIFI_OFF);
  }
}

// ---------------- Батарея ----------------
float readBatteryVoltage(int pin) {
  uint32_t sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogReadMilliVolts(pin);
  }
  return (sum / 16.0f / 1000.0f) * VBAT_DIVIDER;
}

int batteryPercent(float v) {
  // Кусочно-линейная аппроксимация разряда Li-Po
  static const float ptsV[] = {4.20, 4.05, 3.95, 3.85, 3.75, 3.65, 3.55, 3.40, 3.20, 3.00};
  static const int   ptsP[] = { 100,   90,   80,   65,   50,   35,   20,   10,    3,    0};
  const int n = 10;
  if (v >= ptsV[0]) return 100;
  if (v <= ptsV[n - 1]) return 0;
  for (int i = 0; i < n - 1; i++) {
    if (v <= ptsV[i] && v > ptsV[i + 1]) {
      float t = (ptsV[i] - v) / (ptsV[i] - ptsV[i + 1]);
      return ptsP[i + 1] + (int)((ptsP[i] - ptsP[i + 1]) * (1.0f - t));
    }
  }
  return 0;
}

void updateBatteryState() {
  vbatV = readBatteryVoltage(VBATT_SIDE_PIN);
  vbusV = readBatteryVoltage(VBAT_PIN);
  hasBattery = (vbatV >= 2.0f);
  if (hasBattery) {
    batPct = batteryPercent(vbatV);
    // Тумблер замкнут: шина и батарея — одна точка (±0.25В на разброс делителей)
    toggleClosed = (vbusV >= vbatV - 0.25f) && (vbusV <= vbatV + 0.25f);
  } else {
    toggleClosed = false;
  }
}

void updateUsbState() {
  // 1) Надёжно: делитель от 5V на A1 — любой зарядник/пауэрбанк/ПК.
  //    5В -> 2.5В на ADC; без кабеля A1 притянут к GND -> ~0В.
  uint32_t sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogReadMilliVolts(VBUS_PIN);
  }
  float vbus = (sum / 16.0f / 1000.0f) * VBUS_DIVIDER;
  // 2) Резервно: USB-хост (SOF-пакеты) — сработает с ПК даже без делителя
  usbConnected = (vbus >= 2.2f) || usb_serial_jtag_is_connected();
}

// ---------------- Дисплей ----------------
void drawBatteryIcon(int x, int y, int pct) {
  // Контур батареи 20x10 + выступ
  u8g2.drawFrame(x, y, 20, 10);
  u8g2.drawBox(x + 20, y + 3, 2, 4);
  if (pct > 0) {
    int fill = (18 * pct) / 100;
    if (fill < 1) fill = 1;
    u8g2.drawBox(x + 1, y + 1, fill, 8);
  }
}

// Масти: 0=S(пики), 1=H(червы), 2=C(трефы), 3=D(бубны) — битмапы 8x8
static const uint8_t suitBitmaps[4][8] = {
  {0b00011000, 0b00111100, 0b01111110, 0b11111111, 0b11111111, 0b01111110, 0b00011000, 0b00111100}, // ♠
  {0b01100110, 0b11111111, 0b11111111, 0b11111111, 0b01111110, 0b00111100, 0b00011000, 0b00000000}, // ♥
  {0b00111100, 0b01111110, 0b01111110, 0b00011000, 0b00011000, 0b00111100, 0b01111110, 0b00111100}, // ♣
  {0b00011000, 0b00111100, 0b01111110, 0b11111111, 0b11111111, 0b01111110, 0b00111100, 0b00011000}, // ♦
};

// Имя карты вида "7H", "AS", "10D", "KС" -> ранг + индекс масти
bool parseCardName(const String& s, String& rank, int& suitIdx) {
  if (s.length() < 2 || s.length() > 3) return false;
  int p = s.length() - 1;
  char c = s[p];
  suitIdx = (c == 'S') ? 0 : (c == 'H') ? 1 : (c == 'C') ? 2 : (c == 'D') ? 3 : -1;
  if (suitIdx < 0) return false;
  String r = s.substring(0, p);
  if (r == "A" || r == "J" || r == "Q" || r == "K" || r == "10") { rank = r; return true; }
  if (r.length() == 1 && r[0] >= '2' && r[0] <= '9') { rank = r; return true; }
  return false;
}

void drawSuitIcon(int x, int y, int suitIdx) {
  if (suitIdx >= 0 && suitIdx < 4) u8g2.drawXBMP(x, y, 8, 8, suitBitmaps[suitIdx]);
}

// Молния — иконка зарядки, 6x8
static const uint8_t boltBitmap[8] = {
  0b00010000,
  0b00011000,
  0b00111100,
  0b01111110,
  0b00111100,
  0b00011000,
  0b00001100,
  0b00000100,
};
void drawBoltIcon(int x, int y) {
  u8g2.drawXBMP(x, y, 6, 8, boltBitmap);
}

// «Зарядка НЕ идёт»: молния перечёркнута (кабель есть, а батарея отключена тумблером)
void drawNoChargeIcon(int x, int y) {
  drawBoltIcon(x, y);
  u8g2.drawLine(x + 6, y, x - 1, y + 8);
}

// Классическая иконка Wi-Fi: точка + три дуги
void drawWifiIcon(int cx, int cy) {
  u8g2.drawDisc(cx, cy, 1);
  u8g2.drawCircle(cx, cy, 2, U8G2_DRAW_UPPER_LEFT | U8G2_DRAW_UPPER_RIGHT);
  u8g2.drawCircle(cx, cy, 4, U8G2_DRAW_UPPER_LEFT | U8G2_DRAW_UPPER_RIGHT);
  u8g2.drawCircle(cx, cy, 6, U8G2_DRAW_UPPER_LEFT | U8G2_DRAW_UPPER_RIGHT);
}

void updateDisplay() {
  if (!displayOk) return;

  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x13_t_cyrillic);

  // Строка 1: батарейка слева (+ зарядка), таймер справа
  drawBatteryIcon(0, 1, hasBattery ? batPct : 0);
  bool charging = usbConnected && hasBattery && toggleClosed;
  bool noChargeUsb =
    (hasBattery && !toggleClosed)   // тумблер выкл: питание только от USB -> зарядка не идёт
    || (!hasBattery && usbConnected); // батареи нет вообще, кабель вставлен
  if (charging) {
    // Батарея на шине — идёт зарядка
    drawBoltIcon(23, 2);
    char pb[8];
    snprintf(pb, sizeof(pb), "%d%%", batPct);
    u8g2.setCursor(32, 11);
    u8g2.print(pb);
  } else if (noChargeUsb) {
    // Батарея отключена тумблером (или её нет) — зарядка не идёт
    drawNoChargeIcon(23, 2);
    u8g2.setCursor(32, 11);
    u8g2.print("USB");
  }

  if (ssid != "") {
    unsigned long elapsed = millis() - previousMillis;
    if (elapsed > interval) elapsed = interval;
    unsigned long remain = (interval - elapsed) / 1000;
    char tb[10];
    snprintf(tb, sizeof(tb), "%u:%02u", (unsigned int)(remain / 60), (unsigned int)(remain % 60));
    u8g2.setCursor(128 - u8g2.getStrWidth(tb) - 1, 11);
    u8g2.print(tb);
  }

  // Строка 2: статус
  if (ssid != "") {
    // Трансляция: иконка Wi-Fi + что транслируется
    drawWifiIcon(5, 28);
    String rank;
    int suitIdx;
    if (parseCardName(ssid, rank, suitIdx)) {
      // Карта: ранг + иконка масти
      u8g2.setCursor(14, 31);
      u8g2.print(rank);
      drawSuitIcon(14 + u8g2.getStrWidth(rank.c_str()) + 2, 21, suitIdx);
    } else {
      String name = ssid;
      if (name.length() > 19) name = name.substring(0, 19);
      u8g2.setCursor(14, 31);
      u8g2.print(name);
    }
  } else if (deviceConnected) {
    u8g2.setCursor(0, 31);
    u8g2.print("Подключено");
  } else {
    u8g2.setCursor(0, 31);
    u8g2.print("ожидание");
  }

  u8g2.sendBuffer();
}

String decodeStringWithCyrillic(uint8_t* pData, size_t length) {
  String receivedData = "";
  for (int i = 0; i < length; i++) {
    receivedData += (char)pData[i];
  }
  
  return receivedData;
}

String extractJsonStringField(const String& json, const String& key) {
  String token = "\"" + key + "\"";
  int keyPos = json.indexOf(token);
  if (keyPos < 0) return "";

  int colonPos = json.indexOf(':', keyPos + token.length());
  if (colonPos < 0) return "";

  int firstQuote = json.indexOf('"', colonPos + 1);
  if (firstQuote < 0) return "";

  int secondQuote = firstQuote + 1;
  while (secondQuote < json.length()) {
    if (json[secondQuote] == '"' && json[secondQuote - 1] != '\\') break;
    secondQuote++;
  }
  if (secondQuote >= json.length()) return "";

  String value = json.substring(firstQuote + 1, secondQuote);
  value.replace("\\\"", "\"");
  value.replace("\\\\", "\\");
  return value;
}

bool extractJsonIntField(const String& json, const String& key, int& outValue) {
  String token = "\"" + key + "\"";
  int keyPos = json.indexOf(token);
  if (keyPos < 0) return false;

  int colonPos = json.indexOf(':', keyPos + token.length());
  if (colonPos < 0) return false;

  int start = colonPos + 1;
  while (start < json.length() && (json[start] == ' ' || json[start] == '\t')) {
    start++;
  }
  if (start >= json.length()) return false;

  int end = start;
  if (json[end] == '-') end++;
  while (end < json.length() && isDigit(json[end])) end++;
  if (end == start || (end == start + 1 && json[start] == '-')) return false;

  outValue = json.substring(start, end).toInt();
  return true;
}

void rebuildPacketsForCurrentSsid() {
  for (int j = 0; j < 12; j++) {
    packet[j][0] = 0x80;
    packet[j][1] = packet[j][2] = packet[j][3] = packet[j][29] = packet[j][30] = packet[j][31] = packet[j][33] = packet[j][36] = 0x00;
    packet[j][4] = packet[j][5] = packet[j][6] = packet[j][7] = packet[j][8] = packet[j][9] = 0xff;
    packet[j][34] = 0x01;
    packet[j][35] = 0x04;
    packet[j][22] = 0xc0;
    packet[j][23] = 0x6c;
    packet[j][24] = 0x83;
    packet[j][25] = 0x51;
    packet[j][26] = 0xf7;
    packet[j][27] = 0x8f;
    packet[j][28] = 0x0f;
    packet[j][32] = 0x32;

    packet[j][10] = packet[j][16] = macs[j][0];
    packet[j][11] = packet[j][17] = macs[j][1];
    packet[j][12] = packet[j][18] = macs[j][2];
    packet[j][13] = packet[j][19] = macs[j][3];
    packet[j][14] = packet[j][20] = macs[j][4];
    packet[j][15] = packet[j][21] = macs[j][5];

    packet[j][37] = ssidLen + j;

    int packetLength = 38;
    for (int i = 0; i < ssidLen; i++) {
      packet[j][packetLength + i] = ssid[i];
    }
    packetLength = packetLength + ssidLen;

    if (j > 0) {
      for (int i = 0; i < j; i++) {
        packet[j][packetLength + i] = 0x20; // Пробел
      }
      packetLength = packetLength + j;
    }

    packet[j][packetLength] = 0x03;      // DS Parameter Set IE (id)
    packet[j][packetLength + 1] = 0x01;  // length
    packet[j][packetLength + 2] = apChannel[j]; // real TX channel
  }
}

void stopBroadcastAndNotify() {
#if CONFIG_IDF_TARGET_ESP32C6 || CONFIG_IDF_TARGET_ESP32S3 || CONFIG_IDF_TARGET_ESP32C3
  esp_coex_preference_set(ESP_COEX_PREFER_BALANCE);
#endif
  digitalWrite(ledPin, LOW);
  ssid = "";
  ssidLen = 0;
  pDeviceStatusCharacteristic->setValue(ACK_STOP);
  pDeviceStatusCharacteristic->notify();
  updateDisplay();
  ensureWifiOff(); // WiFi нужен только во время трансляции
}

void startBroadcastFromValues(const String& nextSsid, unsigned long nextInterval) {
  ensureWifiOn(); // в простое WiFi выключен — поднимаем перед инжекцией биконов
#if CONFIG_IDF_TARGET_ESP32C6 || CONFIG_IDF_TARGET_ESP32S3 || CONFIG_IDF_TARGET_ESP32C3
  // One shared radio: let WiFi injection win airtime over the BLE link.
  esp_coex_preference_set(ESP_COEX_PREFER_WIFI);
#endif
  interval = nextInterval;
  ssid = nextSsid;
  ssidLen = ssid.length();
  digitalWrite(ledPin, HIGH);
  previousMillis = millis();
  rebuildPacketsForCurrentSsid();
  pDeviceStatusCharacteristic->setValue(ACK_START);
  pDeviceStatusCharacteristic->notify();
  updateDisplay();
}

bool parseIncomingCommand(
  const String& rawCommand,
  bool& outStart,
  bool& outStop,
  String& outSsid,
  unsigned long& outInterval,
  const char*& outError
) {
  outStart = false;
  outStop = false;
  outSsid = "";
  outInterval = 0;
  outError = NULL;

  String command = rawCommand;
  command.trim();
  if (command.length() == 0) {
    outError = NACK_INVALID_PAYLOAD;
    return false;
  }

  // v1 JSON protocol only:
  // {"v":1,"cmd":"start","ssid":"TEXT","durationMin":3}
  // {"v":1,"cmd":"stop"}
  if (!command.startsWith("{")) {
    outError = NACK_INVALID_PAYLOAD;
    return false;
  }

  int version = 0;
  if (!extractJsonIntField(command, "v", version)) {
    outError = NACK_INVALID_PAYLOAD;
    return false;
  }
  if (version != 1) {
    outError = NACK_UNSUPPORTED_VERSION;
    return false;
  }

  String cmd = extractJsonStringField(command, "cmd");
  cmd.toLowerCase();
  if (cmd == "stop") {
    outStop = true;
    return true;
  }
  if (cmd != "start") {
    outError = NACK_INVALID_COMMAND;
    return false;
  }

  String parsedSsid = extractJsonStringField(command, "ssid");
  if (parsedSsid.length() == 0) parsedSsid = "Hacked";
  if (parsedSsid.length() > maxSafeSsidLen) {
    outError = NACK_SSID_TOO_LONG;
    return false;
  }

  int durationMin = 3;
  if (extractJsonIntField(command, "durationMin", durationMin)) {
    if (durationMin < 0) durationMin = 0;
  }

  outStart = true;
  outSsid = parsedSsid;
  outInterval = (unsigned long)durationMin * 60000UL;
  return true;
}

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    wifiSpotsSended = false;
    previousMillisforWifiSpots = millis();
    pDeviceStatusCharacteristic->setValue("Трансляция не ведется");
    pDeviceStatusCharacteristic->notify();
    updateDisplay();
  }
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    wifiSpotsSended= false;
    previousMillisforWifiSpots = 0;
    pDeviceStatusCharacteristic->setValue("Отключено");
    pDeviceStatusCharacteristic->notify();
    updateDisplay();
    if (ssid == "") ensureWifiOff(); // не транслируем — WiFi не нужен
  }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pSpotNameCharacteristic) {
      if (deviceConnected) {
        if (pSpotNameCharacteristic->getValue().length() > 0) {
          String command = decodeStringWithCyrillic((uint8_t*)pSpotNameCharacteristic->getValue().c_str(), pSpotNameCharacteristic->getValue().length());
          bool isStart = false;
          bool isStop = false;
          String nextSsid = "";
          unsigned long nextInterval = 0;
          const char* errorCode = NULL;

          if (!parseIncomingCommand(command, isStart, isStop, nextSsid, nextInterval, errorCode)) {
            pDeviceStatusCharacteristic->setValue(errorCode ? errorCode : NACK_INVALID_PAYLOAD);
            pDeviceStatusCharacteristic->notify();
            return;
          }

          if (isStop) {
            stopBroadcastAndNotify();
            return;
          }

          if (isStart) {
            if (usbConnected && toggleClosed) {
              // Режим зарядки: устройство не работает, трансляции запрещены
              pDeviceStatusCharacteristic->setValue(NACK_INVALID_COMMAND);
              pDeviceStatusCharacteristic->notify();
              return;
            }
            startBroadcastFromValues(nextSsid, nextInterval);
          }
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);

  // OLED: пробуем инициализировать (устройство работает и без дисплея)
  if (u8g2.begin()) {
    displayOk = true;
    u8g2.setFlipMode(0);
  }

  // Батарея
  analogSetPinAttenuation(VBAT_PIN, ADC_11db);
  analogSetPinAttenuation(VBATT_SIDE_PIN, ADC_11db);
  analogSetPinAttenuation(VBUS_PIN, ADC_11db);
  updateBatteryState();

  // +Fake Wi-Fi (включаем только на время трансляции — экономия при зарядке)
  WiFi.mode(WIFI_OFF);
  for (int i = 0; i < 12; i++) {
    for (int j = 0; j < 6; j++) {
      macs[i][j] = random(256);
    }
    macs[i][0] = (macs[i][0] & 0xFC) | 0x02; // locally administered unicast MAC
  }

  // Create the BLE Device
  BLEDevice::init("Hacker");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  // Create the BLE Service
  // BLEService *pService = pServer->createService(SERVICE_UUID);
  BLEService *pService = pServer->createService(BLEUUID(SERVICE_UUID));
  // Create a BLE Characteristic
  pDeviceStatusCharacteristic = pService->createCharacteristic(
    BLEUUID(DEVICE_STATUS_CHARACTERISTIC_UUID),
    BLECharacteristic::PROPERTY_READ   |
    // BLECharacteristic::PROPERTY_WRITE  |
    BLECharacteristic::PROPERTY_NOTIFY |
    BLECharacteristic::PROPERTY_INDICATE
  );
  pWifiSpotsListCharacteristic = pService->createCharacteristic(
    BLEUUID(WiFi_SPOTS_LIST_CHARACTERISTIC_UUID),
    BLECharacteristic::PROPERTY_READ   |
    BLECharacteristic::PROPERTY_WRITE  |
    BLECharacteristic::PROPERTY_NOTIFY |
    BLECharacteristic::PROPERTY_INDICATE
  );
  // pWifiSpotsListCharacteristic = pService->createCharacteristic(
  //                     WiFi_SPOTS_LIST_CHARACTERISTIC_UUID,
  //                     BLECharacteristic::PROPERTY_READ   |
  //                     BLECharacteristic::PROPERTY_WRITE  |
  //                     BLECharacteristic::PROPERTY_NOTIFY |
  //                     BLECharacteristic::PROPERTY_INDICATE
  //                   );

  // Create the ON button Characteristic
  pSpotNameCharacteristic = pService->createCharacteristic(
    BLEUUID(SPOT_NAME_CHARACTERISTIC_UUID),
    BLECharacteristic::PROPERTY_WRITE
  );
  // Register the callback for the ON button characteristic
  pSpotNameCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
  // Create a BLE Descriptor
  pDeviceStatusCharacteristic->addDescriptor(new BLE2902());
  pWifiSpotsListCharacteristic->addDescriptor(new BLE2902());
  pSpotNameCharacteristic->addDescriptor(new BLE2902());
  // Start the service
  pService->start();
  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // set value to 0x00 to not advertise this parameter
  pAdvertising->setMinInterval(160);   // 100 мс — обычная реклама
  pAdvertising->setMaxInterval(160);
  BLEDevice::startAdvertising();
 // Serial.println(F("Waiting a client connection to notify..."));

  lastDisplayUpdate = millis();
  updateDisplay();
}

void loop() {
    // notify changed value
    if (deviceConnected && ssid == "" && !wifiSpotsSended) {
      unsigned long currentMillis = millis();
      if (currentMillis - previousMillisforWifiSpots <= 3000) {
        // previousMillisforWifiSpots = currentMillis;    
        // Serial.println("scan start");
        // WiFi.scanNetworks will return the number of networks found
        ensureWifiOn(); // если радио было выключено в режиме зарядки
        int n = WiFi.scanNetworks();
        // Serial.println("scan done");
        if (n == 0) {
            // Serial.println("no networks found");
            pWifiSpotsListCharacteristic->setValue("");
        } else {
          // Serial.print(n);
          // Serial.println(" networks found");
          String results = "";
          for (int i = 0; i < n; ++i) {
            if (i == 0) 
              results = WiFi.SSID(i);
            else
              results += "||" + WiFi.SSID(i);
            // Print SSID and RSSI for each network found
            // Serial.print(i + 1);
            // Serial.print(": ");
            // Serial.print(WiFi.SSID(i));
            // Serial.print(" (");
            // Serial.print(WiFi.RSSI(i));
            // Serial.print(")");
            // Serial.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN)?" ":"*");
            // delay(10);
          }
          pWifiSpotsListCharacteristic->setValue(results.c_str());
        }
        pWifiSpotsListCharacteristic->notify();
        wifiSpotsSended = true;
        // Serial.println("");
      }
        // pWifiSpotsListCharacteristic->setValue(String(value).c_str());
        // pWifiSpotsListCharacteristic->notify();
        // value++;
        // Serial.print(F("New value notified: "));
        // Serial.println(value);
        // delay(3000); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
    }
    // disconnecting
    if (!deviceConnected && oldDeviceConnected) {
      if (!chargeRadiosOff) pServer->startAdvertising(); // restart advertising (не при зарядке)
      oldDeviceConnected = deviceConnected;
    }
    // connecting
    if (deviceConnected && !oldDeviceConnected) {
      // do stuff here on connecting
      oldDeviceConnected = deviceConnected;
      // Serial.println(F("Device Connected"));
    }

  if (ssid != "") {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis <= interval) {
      for (int i = 0; i < networkCount; i++) {
        sendBeacon(i);
      }
      delay(1); // give BLE/coex air between sweeps
    } else {
#if CONFIG_IDF_TARGET_ESP32C6 || CONFIG_IDF_TARGET_ESP32S3 || CONFIG_IDF_TARGET_ESP32C3
      esp_coex_preference_set(ESP_COEX_PREFER_BALANCE);
#endif
      ssid = "";
      ssidLen = 0;
      digitalWrite(ledPin, LOW);
      updateDisplay();
      ensureWifiOff();
    }
  }

  // Раз в секунду: батарея, USB, режим радио (дисплей сам проверяет displayOk)
  unsigned long now = millis();
  if (now - lastDisplayUpdate >= 1000) {
    lastDisplayUpdate = now;
    updateBatteryState();
    updateUsbState();
    updateDisplay();

    // Зарядка = USB + тумблер вкл (батарея на шине): полностью глушим радио —
    // устройство не работает и не светится в BLE.
    // Тумблер выкл + USB: устройство работает от USB как обычно.
    bool wantCharge = usbConnected && toggleClosed;
    if (wantCharge != chargeRadiosOff) {
      chargeRadiosOff = wantCharge;
      if (wantCharge) {
        if (ssid != "") stopBroadcastAndNotify(); // гасим текущую трансляцию
        BLEDevice::getAdvertising()->stop();      // BLE полностью выключен
        ensureWifiOff();
      } else {
        BLEDevice::getAdvertising()->start();     // радио снова работает
      }
    }
  }

  // В простое не жжём CPU впустую: пауза заметно снижает потребление,
  // и зарядка от USB (лимит 120мА) перестаёт проигрывать разряду.
  // Во время трансляции паузы нет — биконам нужен плотный цикл.
  if (ssid == "") {
    delay(50);
  }
}

  void sendBeacon(uint8_t idx) {
    esp_wifi_set_channel(apChannel[idx], WIFI_SECOND_CHAN_NONE);

    int j = idx;

    // BSSID stays stable per fake AP (set once in rebuildPacketsForCurrentSsid),
    // so phone scanners can lock onto and keep each entry.

    int packetSize = 41 + ssidLen + j;  // header + SSID(+spaces) + DS IE
    for (int t = 0; t < 2; t++) {           // two passes per sweep = denser spam
      if (esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false) != ESP_OK) {
        delayMicroseconds(250);             // radio busy (BLE coex), retry once
        esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false);
      }
      delayMicroseconds(150);
    }
  }
