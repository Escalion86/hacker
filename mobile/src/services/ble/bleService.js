import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { fromByteArray, toByteArray } from 'base64-js';

export const BLE_UUIDS = {
  deviceName: 'Hacker',
  service: '19b10000-e8f2-537e-4f6c-d104768a1214',
  wifiSpotsList: '19b10001-e8f2-537e-4f6c-d104768a1214',
  spotName: '19b10002-e8f2-537e-4f6c-d104768a1214',
  deviceStatus: '19b10003-e8f2-537e-4f6c-d104768a1214',
};

class BleService {
  constructor() {
    this.manager = new BleManager();
    this.device = null;
    this.lastDeviceId = null;
    this.connected = false;
    this.status = 'Отключено';
    this.onStatus = new Set();
    this.onSpots = new Set();
    this.onConnection = new Set();
    this.monitors = [];
    this.disconnectSub = null;
    this.connectPromise = null;
    this.lastDisconnectAt = 0;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  subscribeStatus(listener) {
    this.onStatus.add(listener);
    listener(this.status);
    return () => {
      this.onStatus.delete(listener);
    };
  }

  subscribeWifiSpots(listener) {
    this.onSpots.add(listener);
    listener([]);
    return () => {
      this.onSpots.delete(listener);
    };
  }

  subscribeConnection(listener) {
    this.onConnection.add(listener);
    listener(this.connected);
    return () => {
      this.onConnection.delete(listener);
    };
  }

  emitStatus(nextStatus) {
    this.status = nextStatus;
    this.onStatus.forEach((listener) => listener(nextStatus));
  }

  emitSpots(spots) {
    this.onSpots.forEach((listener) => listener(spots));
  }

  emitConnection(nextConnection) {
    this.connected = nextConnection;
    this.onConnection.forEach((listener) => listener(nextConnection));
  }

  decodeBase64Utf8(base64Value) {
    if (!base64Value) return '';
    const bytes = toByteArray(base64Value);
    return new TextDecoder().decode(bytes);
  }

  normalize(value) {
    return (value || '').trim().toLowerCase();
  }

  encodeUtf8Base64(value) {
    const bytes = new TextEncoder().encode(value);
    return fromByteArray(bytes);
  }

  async requestPermissions() {
    if (Platform.OS !== 'android') {
      return true;
    }

    if (Platform.Version >= 31) {
      const scan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      const connect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      const fineLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return (
        scan === PermissionsAndroid.RESULTS.GRANTED &&
        connect === PermissionsAndroid.RESULTS.GRANTED &&
        fineLocation === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    const location = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return location === PermissionsAndroid.RESULTS.GRANTED;
  }

  async waitForBluetoothPoweredOn() {
    const state = await this.manager.state();
    if (state === 'PoweredOn') return true;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        subscription.remove();
        reject(new Error('Bluetooth not powered on'));
      }, 10000);

      const subscription = this.manager.onStateChange((nextState) => {
        if (nextState === 'PoweredOn') {
          clearTimeout(timeout);
          subscription.remove();
          resolve(true);
        }
      }, true);
    });
  }

  async scanPhase({ timeoutMs, uuids, matchDevice }) {
    return new Promise((resolve, reject) => {
      let settled = false;

      const finishResolve = (device) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this.manager.stopDeviceScan();
        resolve(device);
      };

      const finishReject = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this.manager.stopDeviceScan();
        reject(error);
      };

      const timeout = setTimeout(() => {
        finishResolve(null);
      }, timeoutMs);

      this.manager.startDeviceScan(
        uuids,
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            finishReject(error);
            return;
          }
          if (!device) return;
          if (matchDevice(device)) {
            finishResolve(device);
          }
        }
      );
    });
  }

  async scanForDevice(timeoutMs = 12000) {
    const targetName = this.normalize(BLE_UUIDS.deviceName);
    const targetService = this.normalize(BLE_UUIDS.service);
    const halfTimeout = Math.max(4000, Math.floor(timeoutMs / 2));

    const matchedByName = (device) => {
      const advertised = this.normalize(device?.name || device?.localName);
      return advertised.includes(targetName);
    };

    const matchedByService = (device) => {
      if (!Array.isArray(device?.serviceUUIDs)) return false;
      return device.serviceUUIDs
        .map((uuid) => this.normalize(uuid))
        .includes(targetService);
    };

    const strictDevice = await this.scanPhase({
      timeoutMs: halfTimeout,
      uuids: [BLE_UUIDS.service],
      matchDevice: (device) => matchedByName(device) || matchedByService(device),
    });
    if (strictDevice) return strictDevice;

    this.emitStatus(`Уточняющий поиск "${BLE_UUIDS.deviceName}"...`);
    const fallbackDevice = await this.scanPhase({
      timeoutMs: timeoutMs - halfTimeout,
      uuids: null,
      matchDevice: (device) => matchedByName(device) || matchedByService(device),
    });
    if (fallbackDevice) return fallbackDevice;

    throw new Error(
      'Устройство не найдено. Проверьте, что ESP32 включен, рядом и Bluetooth/геолокация включены на телефоне'
    );
  }

  clearMonitors() {
    this.monitors.forEach((subscription) => {
      try {
        subscription.remove();
      } catch {}
    });
    this.monitors = [];
  }

  async connectById(deviceId) {
    if (!deviceId) return null;
    try {
      const connected = await this.manager.connectToDevice(deviceId, {
        timeout: 2500,
        autoConnect: false,
      });
      return connected;
    } catch {
      return null;
    }
  }

  async finalizeConnectedDevice(connectedDevice) {
    const readyDevice =
      await connectedDevice.discoverAllServicesAndCharacteristics();
    const stableConnection = await this.manager.isDeviceConnected(readyDevice.id);
    if (!stableConnection) {
      throw new Error('Соединение разорвано сразу после подключения');
    }

    this.device = readyDevice;
    this.lastDeviceId = readyDevice.id;
    this.setupMonitors(readyDevice);
    this.emitConnection(true);
    this.emitStatus('Подключено');

    if (this.disconnectSub) {
      this.disconnectSub.remove();
      this.disconnectSub = null;
    }
    this.disconnectSub = this.manager.onDeviceDisconnected(readyDevice.id, () => {
      this.clearMonitors();
      this.device = null;
      this.emitConnection(false);
      this.emitStatus('Отключено');
      this.emitSpots([]);
    });
  }

  setupMonitors(device) {
    const statusMonitor = device.monitorCharacteristicForService(
      BLE_UUIDS.service,
      BLE_UUIDS.deviceStatus,
      (error, characteristic) => {
        if (error) {
          this.emitStatus(`Ошибка статуса: ${error.message || 'unknown'}`);
          return;
        }
        const decoded = this.decodeBase64Utf8(characteristic?.value);
        if (decoded) {
          this.emitStatus(decoded);
        }
      }
    );

    const spotsMonitor = device.monitorCharacteristicForService(
      BLE_UUIDS.service,
      BLE_UUIDS.wifiSpotsList,
      (error, characteristic) => {
        if (error) return;
        const decoded = this.decodeBase64Utf8(characteristic?.value);
        const spots = decoded
          .split('||')
          .map((item) => item.trim())
          .filter(Boolean);
        this.emitSpots(spots);
      }
    );

    this.monitors = [statusMonitor, spotsMonitor];
  }

  async connect() {
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.connectInternal();
    try {
      return await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  async connectInternal() {
    if (this.connected && this.device) {
      return true;
    }

    const permissionsOk = await this.requestPermissions();
    if (!permissionsOk) {
      throw new Error('Нужны Bluetooth permissions');
    }

    const elapsedAfterDisconnect = Date.now() - this.lastDisconnectAt;
    if (this.lastDisconnectAt > 0 && elapsedAfterDisconnect < 500) {
      await this.sleep(500 - elapsedAfterDisconnect);
    }

    this.manager.stopDeviceScan();
    this.emitStatus('Поиск устройства...');
    await this.waitForBluetoothPoweredOn();

    let connectedDevice = null;
    if (this.lastDeviceId) {
      this.emitStatus('Повторное подключение...');
      connectedDevice = await this.connectById(this.lastDeviceId);
      if (connectedDevice) {
        try {
          await this.finalizeConnectedDevice(connectedDevice);
          return true;
        } catch {
          this.clearMonitors();
          this.device = null;
          this.emitConnection(false);
          this.emitSpots([]);
          connectedDevice = null;
          this.emitStatus('Повторное подключение не удалось, ищу устройство...');
        }
      }
    }

    const connectFromScan = async (timeoutMs) => {
      const scannedDevice = await this.scanForDevice(timeoutMs);
      this.lastDeviceId = scannedDevice.id;
      this.emitStatus(`Подключение к ${scannedDevice.name || 'Hacker'}...`);
      return this.manager.connectToDevice(scannedDevice.id, {
        timeout: 8000,
        autoConnect: false,
      });
    };

    try {
      connectedDevice = await connectFromScan(10000);
      await this.finalizeConnectedDevice(connectedDevice);
      return true;
    } catch {
      this.emitStatus('Повтор сканирования...');
      try {
        this.manager.stopDeviceScan();
      } catch {}
      await this.sleep(800);
      connectedDevice = await connectFromScan(9000);
      await this.finalizeConnectedDevice(connectedDevice);
      return true;
    }
  }

  async disconnect() {
    this.manager.stopDeviceScan();
    this.clearMonitors();
    if (this.device) {
      this.lastDeviceId = this.device.id;
      try {
        await this.device.cancelConnection();
      } catch {}
      this.device = null;
    }
    if (this.disconnectSub) {
      this.disconnectSub.remove();
      this.disconnectSub = null;
    }
    await this.sleep(700);
    this.lastDisconnectAt = Date.now();
    this.emitConnection(false);
    this.emitStatus('Отключено');
    this.emitSpots([]);
  }

  async writeCommand(command) {
    if (!this.device) {
      throw new Error('Устройство не подключено');
    }

    const encoded = this.encodeUtf8Base64(command);
    await this.device.writeCharacteristicWithResponseForService(
      BLE_UUIDS.service,
      BLE_UUIDS.spotName,
      encoded
    );
  }

  async sendStart({ ssid, dot, minutes }) {
    const duration = Number.isFinite(Number(minutes))
      ? String(Math.max(0, Number(minutes)))
      : '3';
    const prefix = dot ? '.' : '';
    const payload = `${duration}${prefix}${ssid || 'Hacked'}`;
    await this.writeCommand(payload);
  }

  async sendStop() {
    await this.writeCommand(' ');
  }

  isConnected() {
    return this.connected;
  }
}

const bleService = new BleService();

export default bleService;
