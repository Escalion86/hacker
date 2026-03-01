#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <WiFi.h>
#include <esp_wifi.h>

// BLE UUIDs (must match app)
#define SERVICE_UUID "19b10000-e8f2-537e-4f6c-d104768a1214"
#define WIFI_SPOTS_LIST_CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"
#define SPOT_NAME_CHARACTERISTIC_UUID "19b10002-e8f2-537e-4f6c-d104768a1214"
#define DEVICE_STATUS_CHARACTERISTIC_UUID "19b10003-e8f2-537e-4f6c-d104768a1214"

// Device constants
static const char *DEVICE_NAME = "Hacker";
static const uint8_t NETWORK_COUNT = 12;
static const size_t PACKET_BUFFER_SIZE = 128;
static const int LED_PIN = 2;
static const int DEFAULT_DURATION_MIN = 3;

// Safety limits for payload
static const size_t MAX_FAKE_SSID_LEN = 60;      // conservative bound for 128-byte packet
static const size_t MAX_WIFI_LIST_PAYLOAD = 180; // BLE notify payload cap

// Runtime state
BLEServer *pServer = nullptr;
BLECharacteristic *pDeviceStatusCharacteristic = nullptr;
BLECharacteristic *pWifiSpotsListCharacteristic = nullptr;
BLECharacteristic *pSpotNameCharacteristic = nullptr;

bool deviceConnected = false;
bool oldDeviceConnected = false;
bool wifiSpotsSent = false;

String ssid = "";
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
  ssid = "";
  ssidLen = 0;
  digitalWrite(LED_PIN, LOW);
  notifyStatus("Трансляция не ведется");
}

bool parseLegacyCommand(const String &command, unsigned long &durationMs, String &targetSsid) {
  // Legacy format supported by current app:
  //   <minutes><optionalDot><ssid>
  // Examples: "3.Hacked", "10Prediction"
  // Stop command: single space " "

  if (command.length() == 0 || command == " ") {
    durationMs = 0;
    targetSsid = "";
    return true;
  }

  int pos = 0;
  while (pos < command.length() && isDigit(command[pos])) {
    pos++;
  }

  int minutes = DEFAULT_DURATION_MIN;
  if (pos > 0) {
    minutes = command.substring(0, pos).toInt();
    if (minutes <= 0) {
      minutes = DEFAULT_DURATION_MIN;
    }
  }

  String parsedSsid = command.substring(pos);
  if (parsedSsid.length() == 0) {
    // If command had no suffix, we treat it as invalid start payload.
    return false;
  }

  if (parsedSsid.length() > static_cast<int>(MAX_FAKE_SSID_LEN)) {
    parsedSsid = parsedSsid.substring(0, MAX_FAKE_SSID_LEN);
  }

  durationMs = static_cast<unsigned long>(minutes) * 60000UL;
  targetSsid = parsedSsid;
  return true;
}

void preparePackets(const String &targetSsid) {
  ssid = targetSsid;
  ssidLen = ssid.length();

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

    packet[j][37] = ssidLen + j;
    int packetLength = 38;

    for (int i = 0; i < ssidLen; i++) {
      packet[j][packetLength + i] = ssid[i];
    }
    packetLength += ssidLen;

    if (j > 0) {
      for (int i = 0; i < j; i++) {
        packet[j][packetLength + i] = 0x20; // space
      }
      packetLength += j;
    }

    packet[j][packetLength] = j + 1; // channel
  }
}

void sendBeacon(uint8_t channel) {
  esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
  int j = channel - 1;

  // Randomize source MAC to create multiple AP identities
  packet[j][10] = packet[j][16] = random(256);
  packet[j][11] = packet[j][17] = random(256);
  packet[j][12] = packet[j][18] = random(256);
  packet[j][13] = packet[j][19] = random(256);
  packet[j][14] = packet[j][20] = random(256);
  packet[j][15] = packet[j][21] = random(256);

  int packetSize = 39 + ssidLen + j;
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
      return;
    }

    unsigned long parsedDurationMs = 0;
    String parsedSsid = "";
    bool parsed = parseLegacyCommand(command, parsedDurationMs, parsedSsid);

    if (!parsed) {
      notifyStatus("Ошибка команды");
      return;
    }

    if (parsedSsid.length() == 0) {
      stopSpam();
      return;
    }

    spamDurationMs = parsedDurationMs;
    spamStartedAtMs = millis();
    preparePackets(parsedSsid);

    digitalWrite(LED_PIN, HIGH);
    notifyStatus("Идет трансляция: " + ssid);
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
    for (int j = 0; j < 6; j++) {
      macs[i][j] = random(256);
    }
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
  if (deviceConnected && ssid.length() == 0 && !wifiSpotsSent) {
    unsigned long now = millis();
    if (now - wifiScanStartedAtMs <= 3000UL) {
      String spots = buildWifiListPayload();
      pWifiSpotsListCharacteristic->setValue(spots.c_str());
      pWifiSpotsListCharacteristic->notify();
      wifiSpotsSent = true;
    }
  }

  // Restart advertising after disconnect.
  if (!deviceConnected && oldDeviceConnected) {
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  // Spam beacons while active.
  if (ssid.length() > 0) {
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
