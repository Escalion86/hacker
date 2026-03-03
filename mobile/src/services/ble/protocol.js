export const BLE_UUIDS = {
  deviceName: 'Hacker',
  service: '19b10000-e8f2-537e-4f6c-d104768a1214',
  wifiSpotsList: '19b10001-e8f2-537e-4f6c-d104768a1214',
  spotName: '19b10002-e8f2-537e-4f6c-d104768a1214',
  deviceStatus: '19b10003-e8f2-537e-4f6c-d104768a1214',
};

export const PROTOCOL = {
  version: 1,
  mode: 'v1',
};

export const ACK = {
  start: 'ACK_START',
  stop: 'ACK_STOP',
};

export const NACK_PREFIX = 'NACK_';

export const ERROR_CODES = {
  unsupportedVersion: `${NACK_PREFIX}UNSUPPORTED_VERSION`,
  invalidPayload: `${NACK_PREFIX}INVALID_PAYLOAD`,
  invalidCommand: `${NACK_PREFIX}INVALID_COMMAND`,
  ssidTooLong: `${NACK_PREFIX}SSID_TOO_LONG`,
};

export function buildV1StartCommand({ ssid, dot, minutes }) {
  return JSON.stringify({
    v: PROTOCOL.version,
    cmd: 'start',
    ssid: ssid || 'Hacked',
    dot: Boolean(dot),
    durationMin: Number.isFinite(Number(minutes))
      ? Math.max(0, Number(minutes))
      : 3,
  });
}

export function buildV1StopCommand() {
  return JSON.stringify({
    v: PROTOCOL.version,
    cmd: 'stop',
  });
}
