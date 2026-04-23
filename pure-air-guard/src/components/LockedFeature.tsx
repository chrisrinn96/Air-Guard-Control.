import { Lock, ArrowUpCircle } from "lucide-react";
import { Link } from "wouter";
import { ReactNode } from "react";
import { UserTier } from "../context/UserTierContext";

interface LockedFeatureProps {
  children?: ReactNode;
  requiredTier: UserTier;
  featureName: string;
  className?: string;
}

const tierNames: Record<UserTier, string> = {
  1: "Free",
  2: "Affordable",
  3: "Exclusive",
  4: "Landlord",
};

export default function LockedFeature({ children, requiredTier, featureName, className = "" }: LockedFeatureProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      {children && (
        <div className="pointer-events-none opacity-30 blur-[2px] select-none">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm p-6 text-center">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-3">
          <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="font-bold text-foreground mb-1">{featureName}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Requires <span className="font-semibold text-foreground">Tier {requiredTier} ({tierNames[requiredTier]})</span> or higher
        </p>
        <Link href="/account">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md">
            <ArrowUpCircle className="w-4 h-4" />
            Upgrade Plan
          </div>
        </Link>
      </div>
    </div>
  );
}

export function LockedNavItem({ featureName, requiredTier }: { featureName: string; requiredTier: UserTier }) {
  return (
    <Link href="/account">
      <div className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-all group">
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4" />
          <span className="text-sm">{featureName}</span>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md uppercase">
          T{requiredTier}
        </span>
      </div>
    </Link>
  );
}
