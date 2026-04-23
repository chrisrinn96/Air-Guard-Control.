export interface SensorDevice {
  id: string;
  deviceId: string;
  name: string;
  nickname: string;
  humidity: number | null;
  temperature: number | null;
  battery: number | null;
  rssi: number | null;
  connected: boolean;
  lastUpdated: Date | null;
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
}

export type SensorCallback = (id: string, humidity: number | null, temperature: number | null, battery?: number | null) => void;

const ENV_SENSING_UUID = 0x181a;
const GOVEE_SERVICE_UUID = "0000ec88-0000-1000-8000-00805f9b34fb";
const HUMIDITY_CHAR_UUID = 0x2a6f;
const TEMPERATURE_CHAR_UUID = 0x2a6e;
const BATTERY_CHAR_UUID = 0x2a19;

function parseHumidity(value: DataView): number {
  return value.getUint16(0, true) / 100;
}

function parseTemperature(value: DataView): number {
  return value.getInt16(0, true) / 100;
}

export class BluetoothService {
  private callbacks: SensorCallback[] = [];

  onData(cb: SensorCallback) {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter(c => c !== cb);
    };
  }

  private emit(id: string, humidity: number | null, temperature: number | null, battery?: number | null) {
    this.callbacks.forEach(cb => cb(id, humidity, temperature, battery));
  }

  isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  async scanAndConnect(): Promise<SensorDevice> {
    if (!this.isSupported()) {
      throw new Error("Web Bluetooth API is not supported in this browser. Please use Chrome or Edge on a desktop.");
    }

    let device: BluetoothDevice;
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [ENV_SENSING_UUID] },
          { services: [GOVEE_SERVICE_UUID] },
          { namePrefix: "GVH" },
          { namePrefix: "PAG" },
          { namePrefix: "Govee" },
          { namePrefix: "Inkbird" },
          { namePrefix: "SHT" },
        ],
        optionalServices: [ENV_SENSING_UUID, GOVEE_SERVICE_UUID, BATTERY_CHAR_UUID, 0x180f],
      });
    } catch (err: any) {
      if (err?.name === "NotFoundError" || err?.message?.includes("cancelled") || err?.message?.includes("User cancelled")) {
        throw new Error("CANCELLED");
      }
      if (err?.name === "SecurityError") {
        throw new Error("Bluetooth permission was denied. Please allow Bluetooth access and try again.");
      }
      throw new Error(err?.message || "Failed to scan for Bluetooth devices.");
    }

    const sensorId = device.id || crypto.randomUUID();

    const sensor: SensorDevice = {
      id: sensorId,
      deviceId: device.id,
      name: device.name || "Unknown Sensor",
      nickname: device.name || "Sensor",
      humidity: null,
      temperature: null,
      battery: null,
      rssi: null,
      connected: false,
      lastUpdated: null,
      device,
      server: null,
    };

    try {
      const server = await device.gatt!.connect();
      sensor.server = server;
      sensor.connected = true;

      await this.subscribeToCharacteristics(sensor);

      device.addEventListener("gattserverdisconnected", () => {
        sensor.connected = false;
        sensor.server = null;
        this.emit(sensorId, sensor.humidity, sensor.temperature, sensor.battery);
      });
    } catch (err: any) {
      sensor.connected = false;
    }

    return sensor;
  }

  private async subscribeToCharacteristics(sensor: SensorDevice) {
    if (!sensor.server) return;

    const trySubscribe = async (serviceUuid: BluetoothServiceUUID, charUuid: BluetoothCharacteristicUUID, handler: (value: DataView) => void) => {
      try {
        const service = await sensor.server!.getPrimaryService(serviceUuid);
        const char = await service.getCharacteristic(charUuid);

        const readAndNotify = async () => {
          try {
            const value = await char.readValue();
            handler(value);
          } catch (_) {}
        };

        await readAndNotify();

        try {
          await char.startNotifications();
          char.addEventListener("characteristicvaluechanged", (e) => {
            const target = e.target as BluetoothRemoteGATTCharacteristic;
            if (target.value) handler(target.value);
          });
        } catch (_) {
          setInterval(readAndNotify, 5000);
        }
      } catch (_) {}
    };

    const sensorId = sensor.id;

    await trySubscribe(ENV_SENSING_UUID, HUMIDITY_CHAR_UUID, (value) => {
      sensor.humidity = parseHumidity(value);
      sensor.lastUpdated = new Date();
      this.emit(sensorId, sensor.humidity, sensor.temperature, sensor.battery);
    });

    await trySubscribe(ENV_SENSING_UUID, TEMPERATURE_CHAR_UUID, (value) => {
      sensor.temperature = parseTemperature(value);
      sensor.lastUpdated = new Date();
      this.emit(sensorId, sensor.humidity, sensor.temperature, sensor.battery);
    });

    await trySubscribe(0x180f, BATTERY_CHAR_UUID, (value) => {
      sensor.battery = value.getUint8(0);
      this.emit(sensorId, sensor.humidity, sensor.temperature, sensor.battery);
    });
  }

  async disconnect(sensor: SensorDevice) {
    try {
      if (sensor.server && sensor.device?.gatt?.connected) {
        sensor.device.gatt.disconnect();
      }
    } catch (_) {}
    sensor.connected = false;
    sensor.server = null;
  }
}

export const bluetoothService = new BluetoothService();
