import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { bluetoothService, SensorDevice } from "../services/bluetoothService";

interface BluetoothSensorsContextValue {
  sensors: SensorDevice[];
  isScanning: boolean;
  scanError: string | null;
  connectSensor: () => Promise<void>;
  disconnectSensor: (id: string) => void;
  updateNickname: (id: string, nickname: string) => void;
  clearError: () => void;
}

const BluetoothSensorsContext = createContext<BluetoothSensorsContextValue | null>(null);

const STORAGE_KEY = "pag_sensor_nicknames";

function loadNicknames(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveNicknames(nicknames: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nicknames));
}

export function BluetoothSensorsProvider({ children, maxSensors }: { children: ReactNode; maxSensors: number }) {
  const [sensors, setSensors] = useState<SensorDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = bluetoothService.onData((id, humidity, temperature, battery) => {
      setSensors(prev =>
        prev.map(s =>
          s.id === id ? { ...s, humidity, temperature, battery: battery ?? s.battery, lastUpdated: new Date() } : s
        )
      );
    });
    return unsub;
  }, []);

  const connectSensor = useCallback(async () => {
    const connected = sensors.filter(s => s.connected).length;
    if (connected >= maxSensors) {
      setScanError(`Your plan allows a maximum of ${maxSensors} sensor${maxSensors === 1 ? "" : "s"}. Upgrade your plan to connect more.`);
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const sensor = await bluetoothService.scanAndConnect();
      const nicknames = loadNicknames();
      if (nicknames[sensor.id]) {
        sensor.nickname = nicknames[sensor.id];
      }
      setSensors(prev => {
        const existing = prev.findIndex(s => s.id === sensor.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...sensor, nickname: updated[existing].nickname };
          return updated;
        }
        return [...prev, sensor];
      });
    } catch (err: any) {
      if (err?.message !== "CANCELLED") {
        setScanError(err?.message || "Failed to connect sensor.");
      }
    } finally {
      setIsScanning(false);
    }
  }, [sensors, maxSensors]);

  const disconnectSensor = useCallback((id: string) => {
    const sensor = sensors.find(s => s.id === id);
    if (sensor) {
      bluetoothService.disconnect(sensor);
      setSensors(prev => prev.filter(s => s.id !== id));
    }
  }, [sensors]);

  const updateNickname = useCallback((id: string, nickname: string) => {
    setSensors(prev =>
      prev.map(s => s.id === id ? { ...s, nickname } : s)
    );
    const nicknames = loadNicknames();
    nicknames[id] = nickname;
    saveNicknames(nicknames);
  }, []);

  const clearError = useCallback(() => setScanError(null), []);

  return (
    <BluetoothSensorsContext.Provider value={{ sensors, isScanning, scanError, connectSensor, disconnectSensor, updateNickname, clearError }}>
      {children}
    </BluetoothSensorsContext.Provider>
  );
}

export function useBluetoothSensors() {
  const ctx = useContext(BluetoothSensorsContext);
  if (!ctx) throw new Error("useBluetoothSensors must be used within BluetoothSensorsProvider");
  return ctx;
}
