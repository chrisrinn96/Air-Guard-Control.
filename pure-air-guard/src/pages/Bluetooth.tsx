import { useState } from "react";
import Layout from "../components/Layout";
import { useBluetoothSensors } from "../context/BluetoothSensorsContext";
import { useUserTier } from "../context/UserTierContext";
import LockedFeature from "../components/LockedFeature";
import {
  Bluetooth as BluetoothIcon, RefreshCw, AlertCircle, X, Pencil, CheckCircle2,
  Droplets, ThermometerSun, Wifi, WifiOff, Battery, ArrowUpCircle, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

function SensorCard({ sensor }: { sensor: ReturnType<typeof useBluetoothSensors>["sensors"][number] }) {
  const { disconnectSensor, updateNickname } = useBluetoothSensors();
  const [editing, setEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(sensor.nickname);

  const saveNickname = () => {
    if (nicknameInput.trim()) {
      updateNickname(sensor.id, nicknameInput.trim());
    }
    setEditing(false);
  };

  const humidityColor = sensor.humidity == null ? "text-muted-foreground"
    : sensor.humidity > 70 ? "text-red-500"
    : sensor.humidity > 60 ? "text-amber-500"
    : "text-emerald-500";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-card border border-border rounded-2xl shadow-md overflow-hidden"
    >
      <div className={`px-5 py-3 flex items-center justify-between border-b border-border ${sensor.connected ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-muted/30"}`}>
        <div className="flex items-center gap-2">
          {sensor.connected
            ? <Wifi className="w-4 h-4 text-emerald-500" />
            : <WifiOff className="w-4 h-4 text-muted-foreground" />}
          <span className="text-xs font-semibold text-muted-foreground">{sensor.connected ? "Connected" : "Disconnected"}</span>
        </div>
        <button
          onClick={() => disconnectSensor(sensor.id)}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
          title="Remove sensor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nicknameInput}
                  onChange={e => setNicknameInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveNickname()}
                  className="text-base font-bold bg-background border border-primary rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full"
                />
                <button onClick={saveNickname} className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-base truncate">{sensor.nickname}</h3>
                <button onClick={() => { setNicknameInput(sensor.nickname); setEditing(true); }} className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground truncate">{sensor.name}</p>
          </div>
          {sensor.battery != null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2 shrink-0">
              <Battery className="w-3.5 h-3.5" />
              <span>{sensor.battery}%</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-xl p-3 text-center">
            <Droplets className={`w-5 h-5 mx-auto mb-1.5 ${humidityColor}`} />
            <p className={`text-2xl font-display font-bold ${humidityColor}`}>
              {sensor.humidity != null ? `${sensor.humidity.toFixed(1)}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Humidity</p>
          </div>
          <div className="bg-muted/40 rounded-xl p-3 text-center">
            <ThermometerSun className="w-5 h-5 mx-auto mb-1.5 text-amber-500" />
            <p className="text-2xl font-display font-bold text-foreground">
              {sensor.temperature != null ? `${sensor.temperature.toFixed(1)}°` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Temperature</p>
          </div>
        </div>

        {sensor.lastUpdated && (
          <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
            Updated {formatDistanceToNow(sensor.lastUpdated, { addSuffix: true })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Bluetooth() {
  const { sensors, isScanning, scanError, connectSensor, clearError } = useBluetoothSensors();
  const { config, tier } = useUserTier();
  const connectedCount = sensors.filter(s => s.connected).length;
  const atLimit = connectedCount >= config.maxSensors;

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BluetoothIcon className="w-7 h-7 text-blue-500" />
          <h1 className="text-3xl font-display font-bold text-foreground">Bluetooth Sensors</h1>
        </div>
        <p className="text-muted-foreground">Connect BLE humidity & temperature sensors for live automated tracking.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{connectedCount}</span>
            {" / "}
            <span className="font-semibold text-foreground">{config.maxSensors === Infinity ? "∞" : config.maxSensors}</span>
            {" sensors connected"}
          </span>
          {atLimit && tier < 4 && (
            <Link href="/account">
              <div className="inline-flex items-center gap-1.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-200 transition-colors">
                <ArrowUpCircle className="w-3.5 h-3.5" />
                Upgrade for more
              </div>
            </Link>
          )}
        </div>

        <button
          onClick={connectSensor}
          disabled={isScanning || atLimit}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
        >
          {isScanning ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning...</>
          ) : (
            <><Plus className="w-4 h-4" /> Add Sensor</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {scanError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-300">{scanError}</p>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {sensors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
          <AnimatePresence>
            {sensors.map(s => <SensorCard key={s.id} sensor={s} />)}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-dashed border-border rounded-3xl p-12 text-center mb-8"
        >
          <div className="relative inline-flex mb-6">
            {isScanning && (
              <>
                <motion.div animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full border-2 border-blue-400" />
                <motion.div animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                  className="absolute inset-0 rounded-full border-2 border-blue-300" />
              </>
            )}
            <div className="p-5 bg-blue-500/10 rounded-full">
              <BluetoothIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">{isScanning ? "Scanning for devices..." : "No Sensors Connected"}</h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {isScanning
              ? "Select your device from the browser Bluetooth picker."
              : "Click 'Add Sensor' to pair a BLE humidity sensor. Compatible with Environmental Sensing (UUID 0x181A) and Govee devices."}
          </p>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">Compatible Devices & How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Supported Hardware</p>
            <ul className="space-y-2 text-sm text-foreground">
              {["Govee H5075 / H5051 / H5052 Thermo-Hygrometer", "Inkbird IBS-TH2 Sensor", "Generic BLE Environmental Sensing (UUID 0x181A)", "PAG-Sensor (Pure Air Guard branded)"].map(d => (
                <li key={d} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Pairing Steps</p>
            <ol className="space-y-2 text-sm text-foreground">
              {[
                "Power on your BLE sensor (LED blinks blue)",
                "Click 'Add Sensor' and grant browser Bluetooth permissions",
                "Select your device from the browser popup",
                "Live data streams automatically — rename the sensor to match its location",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> Web Bluetooth requires Chrome or Edge on desktop. It is not available in Firefox or Safari. Bluetooth must be enabled on your device.
        </div>
      </div>
    </Layout>
  );
}
