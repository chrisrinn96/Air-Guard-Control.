import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserTier = 1 | 2 | 3 | 4;

export interface TierConfig {
  tier: UserTier;
  label: string;
  tagline: string;
  color: string;
  maxSensors: number;
  showAds: boolean;
  showHistory: boolean;
  historyDays: number;
  showMouldAlerts: boolean;
  showCompliance: boolean;
  showHumidityChart: boolean;
}

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  1: {
    tier: 1,
    label: "Free",
    tagline: "Ad-Supported",
    color: "text-slate-500",
    maxSensors: 1,
    showAds: true,
    showHistory: false,
    historyDays: 0,
    showMouldAlerts: false,
    showCompliance: false,
    showHumidityChart: false,
  },
  2: {
    tier: 2,
    label: "Affordable",
    tagline: "Standard",
    color: "text-blue-500",
    maxSensors: 3,
    showAds: false,
    showHistory: true,
    historyDays: 1,
    showMouldAlerts: false,
    showCompliance: false,
    showHumidityChart: true,
  },
  3: {
    tier: 3,
    label: "Exclusive",
    tagline: "Pro",
    color: "text-purple-500",
    maxSensors: Infinity,
    showAds: false,
    showHistory: true,
    historyDays: 30,
    showMouldAlerts: true,
    showCompliance: false,
    showHumidityChart: true,
  },
  4: {
    tier: 4,
    label: "Landlord",
    tagline: "Professional",
    color: "text-amber-500",
    maxSensors: Infinity,
    showAds: false,
    showHistory: true,
    historyDays: 365,
    showMouldAlerts: true,
    showCompliance: true,
    showHumidityChart: true,
  },
};

interface UserTierContextValue {
  tier: UserTier;
  config: TierConfig;
  setTier: (t: UserTier) => void;
  mouldAlertsEnabled: boolean;
  setMouldAlertsEnabled: (v: boolean) => void;
  canAccess: (feature: keyof TierConfig) => boolean;
}

const UserTierContext = createContext<UserTierContextValue | null>(null);

export function UserTierProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<UserTier>(() => {
    const saved = localStorage.getItem("pag_user_tier");
    const parsed = saved ? parseInt(saved) : 1;
    return (parsed >= 1 && parsed <= 4 ? parsed : 1) as UserTier;
  });

  const [mouldAlertsEnabled, setMouldAlertsEnabled] = useState(() => {
    return localStorage.getItem("pag_mould_alerts") === "true";
  });

  const setTier = (t: UserTier) => {
    setTierState(t);
    localStorage.setItem("pag_user_tier", String(t));
  };

  const handleSetMouldAlerts = (v: boolean) => {
    setMouldAlertsEnabled(v);
    localStorage.setItem("pag_mould_alerts", String(v));
  };

  const config = TIER_CONFIGS[tier];

  const canAccess = (feature: keyof TierConfig): boolean => {
    return !!config[feature];
  };

  return (
    <UserTierContext.Provider value={{ tier, config, setTier, mouldAlertsEnabled, setMouldAlertsEnabled: handleSetMouldAlerts, canAccess }}>
      {children}
    </UserTierContext.Provider>
  );
}

export function useUserTier() {
  const ctx = useContext(UserTierContext);
  if (!ctx) throw new Error("useUserTier must be used within UserTierProvider");
  return ctx;
}
