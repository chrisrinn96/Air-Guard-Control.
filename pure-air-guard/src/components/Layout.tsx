import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Home, Activity, Bell, ClipboardCheck, Lightbulb,
  Bluetooth, Menu, X, Wind, Shield, UserCircle, Lock, ShoppingBag,
  MapPin, ChevronDown, Plus, Building2
} from "lucide-react";
import { useGetAlerts } from "@workspace/api-client-react/src/generated/api";
import { useUserTier } from "../context/UserTierContext";
import { useProperty } from "../context/PropertyContext";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

const TIER_BADGE: Record<number, { label: string; color: string }> = {
  1: { label: "Free", color: "bg-slate-500/20 text-slate-400" },
  2: { label: "Affordable", color: "bg-blue-500/20 text-blue-400" },
  3: { label: "Exclusive", color: "bg-purple-500/20 text-purple-400" },
  4: { label: "Landlord", color: "bg-amber-500/20 text-amber-400" },
};

function PropertySwitcher() {
  const { properties, activeProperty, setActiveProperty } = useProperty();
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 pb-3">
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-sidebar-accent/60 border border-white/10 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all text-sm"
        >
          <MapPin className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="flex-1 text-left font-medium truncate min-w-0">
            {activeProperty ? activeProperty.name : "No property selected"}
          </span>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1 z-50 bg-sidebar border border-sidebar-border rounded-xl shadow-2xl overflow-hidden"
            >
              {properties.length === 0 ? (
                <div className="px-4 py-3 text-xs text-sidebar-foreground/50 text-center">No properties added yet</div>
              ) : (
                properties.map(prop => (
                  <button
                    key={prop.id}
                    onClick={() => { setActiveProperty(prop.id); setOpen(false); }}
                    className={`w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-sidebar-accent transition-colors text-sm ${activeProperty?.id === prop.id ? "bg-sidebar-accent" : ""}`}
                  >
                    <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${activeProperty?.id === prop.id ? "text-amber-400" : "text-sidebar-foreground/40"}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-sidebar-foreground truncate">{prop.name}</p>
                      <p className="text-xs text-sidebar-foreground/50 truncate">{prop.address}</p>
                    </div>
                  </button>
                ))
              )}
              <Link href="/account">
                <div
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary border-t border-sidebar-border hover:bg-sidebar-accent transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Manage Properties</span>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {activeProperty && (
        <p className="text-[10px] text-sidebar-foreground/40 mt-1.5 ml-1 truncate">{activeProperty.address}{activeProperty.postcode ? `, ${activeProperty.postcode}` : ""}</p>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: alerts } = useGetAlerts({ status: "active" });
  const { tier, config } = useUserTier();

  const activeAlertCount = alerts?.length || 0;
  const badge = TIER_BADGE[tier];

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, locked: false },
    { name: "Rooms", href: "/rooms", icon: Home, locked: false },
    { name: "Readings", href: "/readings", icon: Activity, locked: !config.showHistory, lockedTier: 2 as const },
    { name: "Alerts", href: "/alerts", icon: Bell, badge: activeAlertCount > 0 ? activeAlertCount : undefined, locked: false },
    { name: "Inspections", href: "/inspections", icon: ClipboardCheck, locked: false },
    { name: "Sensors", href: "/bluetooth", icon: Bluetooth, locked: false },
    { name: "Advice", href: "/advice", icon: Lightbulb, locked: false },
    { name: "Shop", href: "/shop", icon: ShoppingBag, locked: false },
    { name: "Prevention Tips", href: "/recommendations", icon: Lightbulb, locked: false },
    ...(config.showCompliance
      ? [{ name: "Compliance", href: "/compliance", icon: Shield, locked: false }]
      : [{ name: "Compliance", href: "/account", icon: Shield, locked: true, lockedTier: 4 as const }]),
  ];

  const visibleNavItems = navItems.filter(item => item.name !== "Prevention Tips");

  const SidebarContent = () => (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className="fixed md:static inset-y-0 left-0 z-40 w-[260px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-[100dvh]"
    >
      <div className="hidden md:flex items-center gap-3 p-6 font-display font-bold text-xl tracking-wide">
        <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg shadow-primary/20">
          <Wind className="w-6 h-6 text-white" />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Pure Air Guard</span>
      </div>

      {config.showCompliance && <PropertySwitcher />}

      <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-3 ml-2">Menu</div>
        {visibleNavItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          if (item.locked) {
            return (
              <Link key={item.name} href="/account">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sidebar-foreground/35 hover:text-sidebar-foreground/55 transition-all group">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded-md uppercase">
                    T{(item as any).lockedTier}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${isActive ? "bg-primary text-white font-medium shadow-md shadow-primary/20" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {(item as any).badge !== undefined && (
                  <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {(item as any).badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        <Link href="/account">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all group">
            <UserCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-none mb-0.5">Subscription</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badge.color}`}>
                Tier {tier} – {badge.label}
              </span>
            </div>
          </div>
        </Link>
        <div className="bg-sidebar-accent/50 p-3 rounded-xl border border-white/5">
          <p className="text-xs text-sidebar-foreground/60 mb-1.5">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">All Sensors Online</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      <header className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground z-50">
        <div className="flex items-center gap-2 font-display font-bold text-lg tracking-wide">
          <div className="p-1.5 bg-primary rounded-lg">
            <Wind className="w-5 h-5 text-white" />
          </div>
          Pure Air Guard
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-sidebar-foreground/80 hover:text-white transition-colors">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <AnimatePresence>
        {(isMobileMenuOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) && <SidebarContent />}
      </AnimatePresence>

      <main className="flex-1 h-[100dvh] overflow-y-auto bg-background/50 relative">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
