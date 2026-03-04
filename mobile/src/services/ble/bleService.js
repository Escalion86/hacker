import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { fromByteArray, toByteArray } from 'base64-js';
import {
  ACK,
  BLE_UUIDS,
  NACK_PREFIX,
  ERROR_CODES,
  buildV1StartCommand,
  buildV1StopCommand,
} from './protocol';
export { BLE_UUIDS } from './protocol';

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
    this.disconnectPromise = null;
    this.scanPromise = null;
    this.lastDisconnectAt = 0;
    this.onDiagnostics = new Set();
    this.diagnostics = [];
    this.bluetoothState = 'Unknown';
    this.onBluetoothState = new Set();
    this.bluetoothStateSub = this.manager.onStateChange((nextState) => {
      this.bluetoothState = nextState;
      this.onBluetoothState.forEach((listener) => listener(nextState));
    }, true);
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

  subscribeDiagnostics(listener) {
    this.onDiagnostics.add(listener);
    listener(this.diagnostics);
    return () => {
      this.onDiagnostics.delete(listener);
    };
  }

  subscribeBluetoothState(listener) {
    this.onBluetoothState.add(listener);
    listener(this.bluetoothState);
    return () => {
      this.onBluetoothState.delete(listener);
    };
  }

  isBluetoothPoweredOn() {
    return this.bluetoothState === 'PoweredOn';
  }

  emitDiagnostics() {
    this.onDiagnostics.forEach((listener) => listener(this.diagnostics));
  }

  logDiagnostic(event, details = '') {
    const stamp = new Date().toISOString().slice(11, 19);
    const line = details ? `${stamp} ${event}: ${details}` : `${stamp} ${event}`;
    this.diagnostics = [line, ...this.diagnostics].slice(0, 20);
    this.emitDiagnostics();
  }

  emitStatus(nextStatus) {
    this.status = nextStatus;
    this.onStatus.forEach((listener) => listener(nextStatus));
    this.logDiagnostic('status', nextStatus);
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
      const granted =
        scan === PermissionsAndroid.RESULTS.GRANTED &&
        connect === PermissionsAndroid.RESULTS.GRANTED &&
        fineLocation === PermissionsAndroid.RESULTS.GRANTED;
      this.logDiagnostic('permissions', granted ? 'granted' : 'denied');
      return granted;
    }

    const location = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    const granted = location === PermissionsAndroid.RESULTS.GRANTED;
    this.logDiagnostic('permissions', granted ? 'granted' : 'denied');
    return granted;
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
    if (this.scanPromise) {
      await this.scanPromise;
    }

    this.scanPromise = new Promise((resolve, reject) => {
      this.logDiagnostic('scan_start', uuids ? 'service-filtered' : 'name/service fallback');
      let settled = false;

      const finishResolve = (device) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        try {
          this.manager.stopDeviceScan();
        } catch {}
        resolve(device);
      };

      const finishReject = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        try {
          this.manager.stopDeviceScan();
        } catch {}
        reject(error);
      };

      const timeout = setTimeout(() => {
        this.logDiagnostic('scan_timeout', `${timeoutMs}ms`);
        finishResolve(null);
      }, timeoutMs);

      try {
        this.manager.stopDeviceScan();
      } catch {}

      this.manager.startDeviceScan(uuids, { allowDuplicates: false }, (error, device) => {
        if (error) {
          finishReject(error);
          return;
        }
        if (!device) return;
        if (matchDevice(device)) {
          this.logDiagnostic('scan_match', device?.name || device?.localName || device?.id || 'unknown');
          finishResolve(device);
        }
      });
    });

    try {
      return await this.scanPromise;
    } finally {
      this.scanPromise = null;
    }
  }

  async scanForDevice(timeoutMs = 12000) {
    const targetName = this.normalize(BLE_UUIDS.deviceName);
    const targetService = this.normalize(BLE_UUIDS.service);

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

    const runScanWithRetry = async () => {
      for (let attempt = 1; attempt <= 4; attempt += 1) {
        try {
          const found = await this.scanPhase({
            timeoutMs,
            uuids: null,
            matchDevice: (device) => matchedByName(device) || matchedByService(device),
          });
          if (found) {
            return found;
          }
        } catch (error) {
          const message = String(error?.message || '').toLowerCase();
          if (!message.includes('cannot start scanning operation')) {
            throw error;
          }
          this.logDiagnostic('scan_retry_after_error', `cannot start scanning operation, attempt=${attempt + 1}`);
        }

        if (attempt < 4) {
          try {
            this.manager.stopDeviceScan();
          } catch {}
          await this.sleep(350 * attempt);
        }
      }
      return null;
    };

    const device = await runScanWithRetry();
    if (device) return device;

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
    this.logDiagnostic('reconnect_by_id', deviceId);
    try {
      const connected = await this.manager.connectToDevice(deviceId, {
        timeout: 2500,
        autoConnect: false,
      });
      this.logDiagnostic('reconnect_by_id_ok', deviceId);
      return connected;
    } catch {
      this.logDiagnostic('reconnect_by_id_fail', deviceId);
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
      this.logDiagnostic('device_disconnected', readyDevice.id);
      this.clearMonitors();
      this.device = null;
      this.emitConnection(false);
      this.emitStatus('Отключено');
      this.emitSpots([]);
    });
  }

  setupMonitors(device) {
    const isExpectedMonitorCancel = (error) => {
      const message = String(error?.message || '').toLowerCase();
      return message.includes('operation was cancelled');
    };

    const statusMonitor = device.monitorCharacteristicForService(
      BLE_UUIDS.service,
      BLE_UUIDS.deviceStatus,
      (error, characteristic) => {
        if (error) {
          if (isExpectedMonitorCancel(error)) {
            this.logDiagnostic('monitor_cancelled', 'status');
            return;
          }
          this.emitStatus(`Ошибка статуса: ${error.message || 'unknown'}`);
          return;
        }
        const decoded = this.decodeBase64Utf8(characteristic?.value);
        if (decoded) {
          if (decoded === ACK.start) {
            this.emitStatus('Команда start подтверждена');
            return;
          }
          if (decoded === ACK.stop) {
            this.emitStatus('Трансляция остановлена');
            return;
          }
          if (decoded === ERROR_CODES.unsupportedVersion) {
            this.emitStatus('Ошибка: версия протокола не поддерживается');
            return;
          }
          if (decoded === ERROR_CODES.invalidPayload) {
            this.emitStatus('Ошибка: некорректный payload');
            return;
          }
          if (decoded === ERROR_CODES.invalidCommand) {
            this.emitStatus('Ошибка: неизвестная команда');
            return;
          }
          if (decoded === ERROR_CODES.ssidTooLong) {
            this.emitStatus('Ошибка: SSID слишком длинный');
            return;
          }
          if (decoded.startsWith(NACK_PREFIX)) {
            this.emitStatus('Ошибка команды устройства');
            return;
          }
          this.emitStatus(decoded);
        }
      }
    );

    const spotsMonitor = device.monitorCharacteristicForService(
      BLE_UUIDS.service,
      BLE_UUIDS.wifiSpotsList,
      (error, characteristic) => {
        if (error) {
          if (isExpectedMonitorCancel(error)) {
            this.logDiagnostic('monitor_cancelled', 'spots');
          }
          return;
        }
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
    if (this.disconnectPromise) {
      await this.disconnectPromise;
    }
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
    this.logDiagnostic('connect_request');

    const elapsedAfterDisconnect = Date.now() - this.lastDisconnectAt;
    if (this.lastDisconnectAt > 0 && elapsedAfterDisconnect < 500) {
      this.logDiagnostic('connect_wait_after_disconnect', `${500 - elapsedAfterDisconnect}ms`);
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
      this.logDiagnostic('connect_to_device', scannedDevice.id);
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
    if (this.disconnectPromise) {
      return this.disconnectPromise;
    }

    this.disconnectPromise = this.disconnectInternal();
    try {
      return await this.disconnectPromise;
    } finally {
      this.disconnectPromise = null;
    }
  }

  async disconnectInternal() {
    this.logDiagnostic('disconnect_request');
    this.emitConnection(false);
    this.emitStatus('Отключено');
    this.emitSpots([]);

    this.manager.stopDeviceScan();
    this.clearMonitors();
    if (this.device) {
      this.lastDeviceId = this.device.id;
      try {
        await this.writeCommand(buildV1StopCommand());
        this.logDiagnostic('stop_before_disconnect', 'sent');
      } catch {}
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
    const payload = buildV1StartCommand({ ssid, dot, minutes });
    this.logDiagnostic('cmd_start', payload);
    await this.writeCommand(payload);
  }

  async sendStop() {
    const payload = buildV1StopCommand();
    this.logDiagnostic('cmd_stop');
    await this.writeCommand(payload);
  }

  isConnected() {
    return this.connected;
  }
}

const bleService = new BleService();

export default bleService;
