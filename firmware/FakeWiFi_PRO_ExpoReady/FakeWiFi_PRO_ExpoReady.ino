#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <WiFi.h>
#include <esp_wifi.h>
#include <cstring>

// BLE UUIDs (must match app)
#define SERVICE_UUID "19b10000-e8f2-537e-4f6c-d104768a1214"
#define WIFI_SPOTS_LIST_CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"
#define SPOT_NAME_CHARACTERISTIC_UUID "19b10002-e8f2-537e-4f6c-d104768a1214"
#define DEVICE_STATUS_CHARACTERISTIC_UUID "19b10003-e8f2-537e-4f6c-d104768a1214"

// Device constants
static const char *DEVICE_NAME = "Hacker";
static const int PROTOCOL_VERSION = 1;
static const uint8_t NETWORK_COUNT = 12;
static const size_t PACKET_BUFFER_SIZE = 128;
static const int LED_PIN = 2;
static const int DEFAULT_DURATION_MIN = 3;
static const uint8_t MAX_VISIBLE_SSID_LEN = 32;

// Safety limits for payload
static const size_t MAX_FAKE_SSID_LEN = 60;      // conservative bound for 128-byte packet
static const size_t MAX_WIFI_LIST_PAYLOAD = 180; // BLE notify payload cap

// Runtime state
BLEServer *pServer = nullptr;
BLECharacteristic *pDeviceStatusCharacteristic = nullptr;
BLECharacteristic *pWifiSpotsListCharacteristic = nullptr;
BLECharacteristic *pSpotNameCharacteristic = nullptr;

bool deviceConnected = false;
bool wifiSpotsSent = false;

char currentSsid[MAX_VISIBLE_SSID_LEN + 1] = {0};
int ssidLen = 0;
unsigned long spamStartedAtMs = 0;
unsigned long spamDurationMs = DEFAULT_DURATION_MIN * 60000UL;
unsigned long wifiScanStartedAtMs = 0;

uint8_t macs[NETWORK_COUNT][6];
uint8_t packet[NETWORK_COUNT][PACKET_BUFFER_SIZE];

void notifyStatus(const String &statusText) {
  pDeviceStatusCharacteristic->setValue(statusText.c_str());
  if (deviceConnected) {
    pDeviceStatusCharacteristic->notify();
  }
}

void stopSpam() {
  currentSsid[0] = '\0';
  ssidLen = 0;
  digitalWrite(LED_PIN, LOW);
  notifyStatus("Трансляция не ведется");
}

const char *findJsonField(const char *json, const char *field) {
  char pattern[32];
  snprintf(pattern, sizeof(pattern), "\"%s\":", field);
  return strstr(json, pattern);
}

bool parseJsonIntField(const char *json, const char *field, int &outValue) {
  const char *fieldPos = findJsonField(json, field);
  if (!fieldPos) return false;
  const char *valuePos = fieldPos + strlen(field) + 3; // "<field>":
  char *endPtr = nullptr;
  long parsed = strtol(valuePos, &endPtr, 10);
  if (endPtr == valuePos) return false;
  outValue = static_cast<int>(parsed);
  return true;
}

bool parseJsonBoolField(const char *json, const char *field, bool &outValue) {
  const char *fieldPos = findJsonField(json, field);
  if (!fieldPos) return false;
  const char *valuePos = fieldPos + strlen(field) + 3; // "<field>":
  if (strncmp(valuePos, "true", 4) == 0) {
    outValue = true;
    return true;
  }
  if (strncmp(valuePos, "false", 5) == 0) {
    outValue = false;
    return true;
  }
  return false;
}

bool parseJsonStringField(const char *json, const char *field, char *outValue, size_t outSize) {
  if (!outValue || outSize == 0) return false;
  const char *fieldPos = findJsonField(json, field);
  if (!fieldPos) return false;
  const char *valuePos = fieldPos + strlen(field) + 3; // "<field>":
  if (*valuePos != '"') return false;
  valuePos++;
  const char *endQuote = strchr(valuePos, '"');
  if (!endQuote) return false;
  size_t len = static_cast<size_t>(endQuote - valuePos);
  if (len >= outSize) return false;
  memcpy(outValue, valuePos, len);
  outValue[len] = '\0';
  return true;
}

bool buildBroadcastSsid(const char *base, bool dot, char *out, size_t outSize) {
  if (!base || !out || outSize == 0) return false;
  if (!dot) {
    size_t len = strnlen(base, outSize);
    if (len >= outSize) return false;
    memcpy(out, base, len);
    out[len] = '\0';
    return true;
  }
  if (outSize < 2) return false;
  out[0] = '.';
  size_t baseLen = strnlen(base, outSize - 1);
  if (baseLen + 1 >= outSize) return false;
  memcpy(out + 1, base, baseLen);
  out[baseLen + 1] = '\0';
  return true;
}

void fillValidRandomMac(uint8_t outMac[6]) {
  for (int i = 0; i < 6; i++) {
    outMac[i] = random(256);
  }
  // Locally administered unicast MAC:
  // bit0=0 (unicast), bit1=1 (locally administered)
  outMac[0] = (outMac[0] & 0xFE) | 0x02;
}

void preparePackets(const char *targetSsid, int targetSsidLen) {
  ssidLen = targetSsidLen;
  memcpy(currentSsid, targetSsid, static_cast<size_t>(ssidLen));
  currentSsid[ssidLen] = '\0';

  for (int j = 0; j < NETWORK_COUNT; j++) {
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

    int suffixSpaces = j;
    if (ssidLen + suffixSpaces > MAX_VISIBLE_SSID_LEN) {
      suffixSpaces = MAX_VISIBLE_SSID_LEN - ssidLen;
      if (suffixSpaces < 0) {
        suffixSpaces = 0;
      }
    }

    packet[j][37] = ssidLen + suffixSpaces;
    int packetLength = 38;

    for (int i = 0; i < ssidLen; i++) {
      packet[j][packetLength + i] = targetSsid[i];
    }
    packetLength += ssidLen;

    if (suffixSpaces > 0) {
      for (int i = 0; i < suffixSpaces; i++) {
        packet[j][packetLength + i] = 0x20; // space
      }
      packetLength += suffixSpaces;
    }

    // DS Parameter Set IE: [id=3][len=1][channel]
    packet[j][packetLength] = 0x03;
    packet[j][packetLength + 1] = 0x01;
    packet[j][packetLength + 2] = j + 1;
  }
}

void sendBeacon(uint8_t channel) {
  esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
  int j = channel - 1;

  int suffixSpaces = j;
  if (ssidLen + suffixSpaces > MAX_VISIBLE_SSID_LEN) {
    suffixSpaces = MAX_VISIBLE_SSID_LEN - ssidLen;
    if (suffixSpaces < 0) {
      suffixSpaces = 0;
    }
  }
  int packetSize = 41 + ssidLen + suffixSpaces;
  if (packetSize > static_cast<int>(PACKET_BUFFER_SIZE)) {
    packetSize = PACKET_BUFFER_SIZE;
  }

  esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false);
  esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false);
  esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false);
}

String buildWifiListPayload() {
  int n = WiFi.scanNetworks();
  if (n <= 0) {
    return "";
  }

  String out = "";
  for (int i = 0; i < n; i++) {
    String name = WiFi.SSID(i);
    if (name.length() == 0) {
      continue;
    }

    String candidate = (out.length() == 0) ? name : (out + "||" + name);
    if (candidate.length() > static_cast<int>(MAX_WIFI_LIST_PAYLOAD)) {
      break;
    }
    out = candidate;
  }

  return out;
}

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    deviceConnected = true;
    wifiSpotsSent = false;
    wifiScanStartedAtMs = millis();
    notifyStatus("Трансляция не ведется");
  }

  void onDisconnect(BLEServer *server) override {
    deviceConnected = false;
    wifiSpotsSent = false;
    wifiScanStartedAtMs = 0;
    stopSpam();
    server->startAdvertising();
    notifyStatus("Отключено");
  }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *spotNameChar) override {
    if (!deviceConnected) {
      return;
    }

    String command = spotNameChar->getValue();
    if (command.length() == 0) {
      notifyStatus("NACK_INVALID_PAYLOAD");
      return;
    }

    const char *payload = command.c_str();
    int version = 0;
    char cmd[16] = {0};

    if (!parseJsonIntField(payload, "v", version)) {
      notifyStatus("NACK_INVALID_PAYLOAD");
      return;
    }
    if (version != PROTOCOL_VERSION) {
      notifyStatus("NACK_UNSUPPORTED_VERSION");
      return;
    }
    if (!parseJsonStringField(payload, "cmd", cmd, sizeof(cmd))) {
      notifyStatus("NACK_INVALID_PAYLOAD");
      return;
    }

    if (strcmp(cmd, "stop") == 0) {
      notifyStatus("ACK_STOP");
      stopSpam();
      return;
    }

    if (strcmp(cmd, "start") != 0) {
      notifyStatus("NACK_INVALID_COMMAND");
      return;
    }

    char parsedSsid[MAX_FAKE_SSID_LEN + 1] = {0};
    int parsedDurationMin = DEFAULT_DURATION_MIN;
    bool parsedDot = false;

    if (!parseJsonStringField(payload, "ssid", parsedSsid, sizeof(parsedSsid))) {
      notifyStatus("NACK_INVALID_PAYLOAD");
      return;
    }
    parseJsonIntField(payload, "durationMin", parsedDurationMin);
    parseJsonBoolField(payload, "dot", parsedDot);

    char broadcastSsid[MAX_VISIBLE_SSID_LEN + 1] = {0};
    if (!buildBroadcastSsid(parsedSsid, parsedDot, broadcastSsid, sizeof(broadcastSsid))) {
      notifyStatus("NACK_INVALID_PAYLOAD");
      return;
    }
    size_t broadcastLen = strnlen(broadcastSsid, sizeof(broadcastSsid));
    if (broadcastLen == 0) {
      notifyStatus("NACK_INVALID_PAYLOAD");
      return;
    }
    if (
        broadcastLen > static_cast<size_t>(MAX_FAKE_SSID_LEN) ||
        broadcastLen > static_cast<size_t>(MAX_VISIBLE_SSID_LEN)
    ) {
      notifyStatus("NACK_SSID_TOO_LONG");
      return;
    }
    if (parsedDurationMin <= 0) {
      parsedDurationMin = DEFAULT_DURATION_MIN;
    }

    notifyStatus("ACK_START");
    spamDurationMs = static_cast<unsigned long>(parsedDurationMin) * 60000UL;
    spamStartedAtMs = millis();
    preparePackets(broadcastSsid, static_cast<int>(broadcastLen));

    digitalWrite(LED_PIN, HIGH);
    notifyStatus(String("Идет трансляция: ") + String(currentSsid));
  }
};

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Prepare radio for both scan and raw beacon tx
  WiFi.mode(WIFI_MODE_APSTA);
  esp_wifi_set_promiscuous(true);

  randomSeed(esp_random());
  for (int i = 0; i < NETWORK_COUNT; i++) {
    fillValidRandomMac(macs[i]);
  }

  BLEDevice::init(DEVICE_NAME);

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(BLEUUID(SERVICE_UUID));

  pDeviceStatusCharacteristic = pService->createCharacteristic(
      BLEUUID(DEVICE_STATUS_CHARACTERISTIC_UUID),
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);

  pWifiSpotsListCharacteristic = pService->createCharacteristic(
      BLEUUID(WIFI_SPOTS_LIST_CHARACTERISTIC_UUID),
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);

  pSpotNameCharacteristic = pService->createCharacteristic(
      BLEUUID(SPOT_NAME_CHARACTERISTIC_UUID),
      BLECharacteristic::PROPERTY_WRITE);

  pSpotNameCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  pDeviceStatusCharacteristic->addDescriptor(new BLE2902());
  pWifiSpotsListCharacteristic->addDescriptor(new BLE2902());
  pSpotNameCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x00);
  BLEDevice::startAdvertising();

  notifyStatus("Отключено");
}

void loop() {
  // On initial connect: send nearby Wi-Fi list once within 3 seconds.
  if (deviceConnected && ssidLen == 0 && !wifiSpotsSent) {
    unsigned long now = millis();
    if (now - wifiScanStartedAtMs <= 3000UL) {
      String spots = buildWifiListPayload();
      pWifiSpotsListCharacteristic->setValue(spots.c_str());
      pWifiSpotsListCharacteristic->notify();
      wifiSpotsSent = true;
    }
  }

  // Spam beacons while active.
  if (ssidLen > 0) {
    unsigned long now = millis();
    if (now - spamStartedAtMs <= spamDurationMs) {
      uint8_t channel = 1;
      for (int i = 0; i < NETWORK_COUNT; i++) {
        sendBeacon(channel);
        channel++;
        if (channel > 12) {
          channel = 1;
        }
      }
    } else {
      stopSpam();
    }
  }
}
