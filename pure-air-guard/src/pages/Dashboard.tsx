import { useGetDashboardSummary, useGetRooms, useGetReadings } from "@workspace/api-client-react/src/generated/api";
import Layout from "../components/Layout";
import { useUserTier } from "../context/UserTierContext";
import { useBluetoothSensors } from "../context/BluetoothSensorsContext";
import LockedFeature from "../components/LockedFeature";
import RiskBadge from "../components/RiskBadge";
import {
  Droplets, ThermometerSun, AlertOctagon, Home as HomeIcon, Wind,
  Bluetooth, ArrowUpCircle, Bell, BellOff
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { format, subHours, isAfter } from "date-fns";

function AdBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl p-3 mb-6 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-10 bg-slate-400/30 rounded-lg flex items-center justify-center text-xs text-slate-500 font-semibold">AD</div>
        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sponsored — Pure Air Guard Premium</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upgrade to remove ads and unlock all features</p>
        </div>
      </div>
      <Link href="/account">
        <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors shrink-0">
          <ArrowUpCircle className="w-3.5 h-3.5" />
          Upgrade
        </div>
      </Link>
    </motion.div>
  );
}

function HumidityChart({ readings }: { readings: any[] }) {
  const cutoff = subHours(new Date(), 24);
  const chartData = readings
    .filter(r => isAfter(new Date(r.recordedAt), cutoff))
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-30)
    .map(r => ({
      time: format(new Date(r.recordedAt), "HH:mm"),
      humidity: r.humidity,
      room: r.roomName,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No readings in the last 24 hours
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
        <Tooltip
          contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem", fontSize: 12 }}
          labelStyle={{ fontWeight: "bold" }}
        />
        <ReferenceLine y={70} stroke="#f97316" strokeDasharray="4 4" label={{ value: "High Risk 70%", fontSize: 10, fill: "#f97316" }} />
        <Line type="monotone" dataKey="humidity" stroke="#14b8a6" strokeWidth={2} dot={false} name="Humidity %" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SensorLiveCard({ sensor }: { sensor: { nickname: string; humidity: number | null; temperature: number | null; connected: boolean } }) {
  const humidityColor = sensor.humidity == null ? "text-muted-foreground"
    : sensor.humidity > 70 ? "text-red-500"
    : sensor.humidity > 60 ? "text-amber-500"
    : "text-emerald-500";

  return (
    <div className={`bg-card rounded-2xl border p-4 shadow-sm flex flex-col items-center text-center ${sensor.connected ? "border-emerald-300 dark:border-emerald-700" : "border-border opacity-60"}`}>
      <div className="flex items-center gap-1.5 mb-3">
        <Bluetooth className="w-3.5 h-3.5 text-blue-500" />
        <p className="text-xs font-semibold text-foreground truncate max-w-[100px]">{sensor.nickname}</p>
      </div>
      <p className={`text-2xl font-display font-bold ${humidityColor}`}>
        {sensor.humidity != null ? `${sensor.humidity.toFixed(1)}%` : "—"}
      </p>
      <p className="text-xs text-muted-foreground">Humidity</p>
      <p className="text-base font-semibold text-foreground mt-1">
        {sensor.temperature != null ? `${sensor.temperature.toFixed(1)}°C` : "—"}
      </p>
      <p className="text-xs text-muted-foreground">Temp</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: rooms, isLoading: loadingRooms } = useGetRooms();
  const { data: readings } = useGetReadings({ limit: 100 });
  const { config, tier, mouldAlertsEnabled, setMouldAlertsEnabled } = useUserTier();
  const { sensors, connectSensor } = useBluetoothSensors();

  if (loadingSummary || loadingRooms) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  const stats = [
    { title: "Total Monitored Rooms", value: summary?.totalRooms || 0, icon: HomeIcon, lightColor: "bg-blue-500/10 text-blue-600", alert: false },
    { title: "Active Risk Alerts", value: summary?.activeAlerts || 0, icon: AlertOctagon, lightColor: "bg-red-500/10 text-red-600", alert: (summary?.activeAlerts || 0) > 0 },
    { title: "Average Humidity", value: `${summary?.avgHumidity?.toFixed(1) || 0}%`, icon: Droplets, lightColor: "bg-teal-500/10 text-teal-600", alert: false },
    { title: "Average Temperature", value: `${summary?.avgTemperature?.toFixed(1) || 0}°C`, icon: ThermometerSun, lightColor: "bg-amber-500/10 text-amber-600", alert: false },
  ];

  return (
    <Layout>
      {config.showAds && <AdBanner />}

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Environment Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor indoor air quality and prevent mould growth across all properties.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-lg shadow-black/5 border border-border hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h3 className={`text-3xl font-display font-bold ${stat.alert ? "text-destructive" : "text-foreground"}`}>
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.lightColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bluetooth live sensor cards */}
      {sensors.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold flex items-center gap-2">
              <Bluetooth className="w-5 h-5 text-blue-500" />
              Live Sensors
            </h2>
            <Link href="/bluetooth">
              <span className="text-sm text-primary hover:underline cursor-pointer">Manage</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {sensors.map(s => <SensorLiveCard key={s.id} sensor={s} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-gradient-to-br from-primary to-accent rounded-3xl p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-6">
                <Wind className="w-4 h-4" /> System Healthy
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Overall Mould Risk is Low</h2>
              <p className="text-white/80 max-w-md text-lg">
                Your properties are maintaining ideal humidity levels. Keep ventilation active during showers and cooking.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/rooms">
                <div className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 hover:scale-105 transition-all shadow-lg cursor-pointer">
                  View All Rooms
                </div>
              </Link>
              <Link href="/recommendations">
                <div className="px-6 py-3 bg-black/20 backdrop-blur-md text-white border border-white/30 font-semibold rounded-xl hover:bg-black/30 transition-all cursor-pointer hidden sm:block">
                  Prevention Tips
                </div>
              </Link>
              {sensors.length === 0 && (
                <div
                  onClick={connectSensor}
                  className="px-6 py-3 bg-blue-500/30 backdrop-blur-md text-white border border-blue-400/40 font-semibold rounded-xl hover:bg-blue-500/50 transition-all cursor-pointer hidden sm:flex items-center gap-2"
                >
                  <Bluetooth className="w-4 h-4" /> Add Sensor
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Room Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-3xl p-6 shadow-lg shadow-black/5 border border-border flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold">Room Status</h3>
            <Link href="/rooms">
              <span className="text-sm text-primary hover:underline cursor-pointer">View All</span>
            </Link>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {rooms?.slice(0, 5).map((room) => (
              <div key={room.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors border border-border/50">
                <div>
                  <p className="font-semibold text-sm">{room.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{room.type.replace("_", " ")}</p>
                </div>
                <RiskBadge level={room.mouldRiskLevel} showIcon={false} />
              </div>
            ))}
            {(!rooms || rooms.length === 0) && (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <HomeIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p>No rooms monitored yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Humidity chart (Tier 2+) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {config.showHumidityChart ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-sm"
            >
              <h3 className="font-display font-bold text-lg mb-4">24-Hour Humidity Trend</h3>
              <div className="h-52">
                <HumidityChart readings={readings || []} />
              </div>
            </motion.div>
          ) : (
            <LockedFeature requiredTier={2} featureName="24-Hour Humidity Chart" className="h-48 bg-card border border-border rounded-2xl" />
          )}
        </div>

        {/* Mould Alert toggle (Tier 3+) */}
        <div>
          {config.showMouldAlerts ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
                  {mouldAlertsEnabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
                  Mould Alerts
                </h3>
                <p className="text-sm text-muted-foreground">Receive push notifications when humidity exceeds safe thresholds.</p>
              </div>
              <div className="flex items-center justify-between mt-4 p-4 bg-muted/40 rounded-xl">
                <span className="font-medium text-sm">{mouldAlertsEnabled ? "Notifications ON" : "Notifications OFF"}</span>
                <button
                  onClick={() => setMouldAlertsEnabled(!mouldAlertsEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${mouldAlertsEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${mouldAlertsEnabled ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </motion.div>
          ) : (
            <LockedFeature requiredTier={3} featureName="Mould Push Alerts" className="bg-card border border-border rounded-2xl h-full" />
          )}
        </div>
      </div>
    </Layout>
  );
}
