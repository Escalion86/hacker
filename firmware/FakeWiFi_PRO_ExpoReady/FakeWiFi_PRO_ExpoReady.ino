#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <WiFi.h>
#include <esp_wifi.h>

// Timer
unsigned long previousMillis = 0;
unsigned long previousMillisforWifiSpots =0;
unsigned long interval = 60000;

const uint8_t networkCount = 12;
uint8_t macs[12][6];
uint8_t packet[12][128];
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

const int ledPin = 2; // Use the appropriate GPIO pin for your setup

#define SERVICE_UUID        "19b10000-e8f2-537e-4f6c-d104768a1214"
#define WiFi_SPOTS_LIST_CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"
#define SPOT_NAME_CHARACTERISTIC_UUID "19b10002-e8f2-537e-4f6c-d104768a1214"
#define DEVICE_STATUS_CHARACTERISTIC_UUID "19b10003-e8f2-537e-4f6c-d104768a1214"

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

    packet[j][packetLength] = j + 1; // channel
  }
}

void stopBroadcastAndNotify() {
  digitalWrite(ledPin, LOW);
  ssid = "";
  ssidLen = 0;
  pDeviceStatusCharacteristic->setValue(ACK_STOP);
  pDeviceStatusCharacteristic->notify();
}

void startBroadcastFromValues(const String& nextSsid, unsigned long nextInterval) {
  interval = nextInterval;
  ssid = nextSsid;
  ssidLen = ssid.length();
  digitalWrite(ledPin, HIGH);
  previousMillis = millis();
  rebuildPacketsForCurrentSsid();
  pDeviceStatusCharacteristic->setValue(ACK_START);
  pDeviceStatusCharacteristic->notify();
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
  }
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    wifiSpotsSended= false;
    previousMillisforWifiSpots = 0;
    pDeviceStatusCharacteristic->setValue("Отключено");
    pDeviceStatusCharacteristic->notify();
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
            startBroadcastFromValues(nextSsid, nextInterval);
          }
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);

  // +Fake Wi-Fi
  WiFi.mode(WIFI_AP);
  esp_wifi_set_promiscuous(true);
  for (int i = 0; i < 12; i++) {
    for (int j = 0; j < 6; j++) {
      macs[i][j] = random(256);
    }
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
  BLEDevice::startAdvertising();
 // Serial.println(F("Waiting a client connection to notify..."));
}

void loop() {
    // notify changed value
    if (deviceConnected && ssid == "" && !wifiSpotsSended) {
      unsigned long currentMillis = millis();
      if (currentMillis - previousMillisforWifiSpots <= 3000) {
        // previousMillisforWifiSpots = currentMillis;    
        // Serial.println("scan start");
        // WiFi.scanNetworks will return the number of networks found
        int n = WiFi.scanNetworks();
        // Serial.println("scan done");
        if (n == 0) {
            // Serial.println("no networks found");
            pWifiSpotsListCharacteristic->setValue({});
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
          pWifiSpotsListCharacteristic->setValue({ results.c_str() });   
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
      // Serial.println(F("Device disconnected."));
      // delay(500); // give the bluetooth stack the chance to get things ready
      pServer->startAdvertising(); // restart advertising
      // Serial.println(F("Start advertising"));
      oldDeviceConnected = deviceConnected;
    }
    // connecting
    if (deviceConnected && !oldDeviceConnected) {
      // do stuff here on connecting
      oldDeviceConnected = deviceConnected;
      // Serial.println(F("Device Connected"));
    }

  uint8_t channel = 1;
  
  if (ssid != "") {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis <= interval) {
      for (int i = 1; i < networkCount; i++) {
        if (channel == 12) {
          channel = 1;
        } else {
          channel++;
        }
        sendBeacon(channel);
      }
    } else {
      ssid = "";
      ssidLen = 0;
      digitalWrite(ledPin, LOW);
    }
  }
}

  void sendBeacon(uint8_t channel) {
    esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);

    int j = channel - 1;

    // Set MAC Address
    packet[j][10] = packet[j][16] = random(256);
    packet[j][11] = packet[j][17] = random(256);
    packet[j][12] = packet[j][18] = random(256);
    packet[j][13] = packet[j][19] = random(256);
    packet[j][14] = packet[j][20] = random(256);
    packet[j][15] = packet[j][21] = random(256);
   
    int packetSize = 39 + ssidLen + j;  

    esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false);
    esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false);
    esp_wifi_80211_tx(WIFI_IF_AP, packet[j], packetSize, false);
    // delay(1);
  }
