import { useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import LockedFeature from "../components/LockedFeature";
import { useGetReadings, useCreateReading, useGetRooms } from "@workspace/api-client-react/src/generated/api";
import { useQueryClient } from "@tanstack/react-query";
import { getGetReadingsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react/src/generated/api";
import { useUserTier } from "../context/UserTierContext";
import { Plus, Activity, Bluetooth, User, Server, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Readings() {
  const queryClient = useQueryClient();
  const { data: readings, isLoading } = useGetReadings();
  const { data: rooms } = useGetRooms();
  const createMutation = useCreateReading();
  const { config } = useUserTier();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    humidity: "",
    temperature: "",
    source: "manual" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        roomId: parseInt(formData.roomId),
        humidity: parseFloat(formData.humidity),
        temperature: parseFloat(formData.temperature),
        source: formData.source,
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReadingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        setIsAddModalOpen(false);
        setFormData({ roomId: "", humidity: "", temperature: "", source: "manual" });
      },
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "bluetooth": return <Bluetooth className="w-4 h-4 text-blue-500" />;
      case "api": return <Server className="w-4 h-4 text-purple-500" />;
      default: return <User className="w-4 h-4 text-emerald-500" />;
    }
  };

  if (!config.showHistory) {
    return (
      <Layout>
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Sensor Readings</h1>
          <p className="text-muted-foreground mt-1">Historical log of humidity and temperature data.</p>
        </div>
        <LockedFeature requiredTier={2} featureName="Reading History" className="min-h-[400px] bg-card border border-border rounded-2xl">
          <div className="h-64 bg-muted/20 rounded-2xl" />
        </LockedFeature>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Sensor Readings</h1>
          <p className="text-muted-foreground mt-1">Historical log of humidity and temperature data.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-5 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Manual Entry
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border font-semibold">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Humidity</th>
                <th className="px-6 py-4">Temperature</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading readings...</p>
                  </td>
                </tr>
              ) : readings?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-base">No readings recorded yet.</p>
                  </td>
                </tr>
              ) : (
                readings?.map((reading) => (
                  <tr key={reading.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(reading.recordedAt), "MMM d, yyyy • HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{reading.roomName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[60px] bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${reading.humidity > 65 ? "bg-orange-500" : "bg-teal-500"}`}
                            style={{ width: `${Math.min(reading.humidity, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold">{reading.humidity}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{reading.temperature}°C</td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 text-xs font-medium capitalize border border-border">
                        {getSourceIcon(reading.source)}
                        {reading.source}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        reading.mouldRiskScore > 70 ? "bg-red-100 text-red-700 dark:bg-red-900/50" :
                        reading.mouldRiskScore > 40 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50"
                      }`}>
                        {reading.mouldRiskScore.toFixed(0)}/100
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Manual Reading Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Select Room</label>
            <select
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={formData.roomId}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
            >
              <option value="" disabled>Choose a room...</option>
              {rooms?.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Humidity (%)</label>
              <input
                type="number" step="0.1" min="0" max="100" required
                placeholder="e.g. 55.5"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.humidity}
                onChange={e => setFormData({ ...formData, humidity: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Temperature (°C)</label>
              <input
                type="number" step="0.1" required
                placeholder="e.g. 21.0"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.temperature}
                onChange={e => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-200 dark:border-blue-800 flex items-start gap-3">
            <Activity className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Manual readings will immediately update the room's risk score and may trigger alerts if thresholds are exceeded.</p>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-border">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || !formData.roomId} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 shadow-md transition-all disabled:opacity-50">
              {createMutation.isPending ? "Saving..." : "Save Reading"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
