import { AlertTriangle, CheckCircle, ShieldAlert, AlertCircle } from "lucide-react";

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export default function RiskBadge({ level, showIcon = true, className = "" }: { level: RiskLevel | string, showIcon?: boolean, className?: string }) {
  const normalizedLevel = level.toLowerCase() as RiskLevel;
  
  const config = {
    low: {
      colors: "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
      label: "Low Risk",
      icon: CheckCircle
    },
    medium: {
      colors: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
      label: "Moderate",
      icon: AlertCircle
    },
    high: {
      colors: "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50",
      label: "High Risk",
      icon: AlertTriangle
    },
    critical: {
      colors: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
      label: "Critical",
      icon: ShieldAlert
    }
  };

  const current = config[normalizedLevel] || config.medium;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${current.colors} ${className}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {current.label}
    </span>
  );
}
