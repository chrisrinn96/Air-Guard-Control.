import { useState } from "react";
import Layout from "../components/Layout";
import { useUserTier, TIER_CONFIGS, UserTier } from "../context/UserTierContext";
import { useProperty } from "../context/PropertyContext";
import { Check, Zap, Crown, Building2, UserCircle, Lock, Plus, MapPin, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIER_ICONS = { 1: UserCircle, 2: Zap, 3: Crown, 4: Building2 };
const TIER_COLORS = {
  1: "border-slate-300 dark:border-slate-700",
  2: "border-blue-400",
  3: "border-purple-500",
  4: "border-amber-500",
};
const TIER_ACCENT = {
  1: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  2: "bg-blue-600 text-white",
  3: "bg-purple-600 text-white",
  4: "bg-amber-500 text-white",
};
const TIER_FEATURES: Record<UserTier, string[]> = {
  1: ["Monitor up to 1 sensor", "Dashboard overview", "Manual readings", "Basic alerts", "Prevention tips", "Ad-supported"],
  2: ["Monitor up to 3 sensors", "No advertisements", "24-hour humidity chart", "Historical data (24h)", "Manual readings", "All Tier 1 features"],
  3: ["Unlimited sensors", "30-day historical data", "Mould Alert notifications", "Advanced charts", "No advertisements", "All Tier 2 features"],
  4: ["Unlimited sensors", "Multi-property switching", "365-day historical data", "Compliance reporting tab", "PDF report generation", "Legal proof documentation", "All Tier 3 features"],
};
const TIER_LOCKED: Record<UserTier, string[]> = {
  1: ["History tab", "Humidity charts", "Multiple sensors", "Mould alerts", "Compliance"],
  2: ["Unlimited sensors", "30-day history", "Mould alerts", "Compliance"],
  3: ["Compliance tab", "PDF reporting", "Multi-property", "365-day history"],
  4: [],
};

const BUNDLES = [
  {
    id: "solo",
    title: "Landlord Only",
    subtitle: "You manage the subscription",
    landlordPrice: 19.99,
    tenantTier: null,
    tenantLabel: null,
    total: 19.99,
    saving: null,
    highlight: false,
    badge: null,
  },
  {
    id: "bundle-tier1",
    title: "Landlord + Tenant (Free Tier)",
    subtitle: "Tenant stays on Free — you get a discount",
    landlordPrice: 16.99,
    tenantTier: 1,
    tenantLabel: "Tenant: Free (£0)",
    total: 16.99,
    saving: 3.00,
    highlight: false,
    badge: "Discounted",
  },
  {
    id: "bundle-tier2",
    title: "Landlord + Tenant (Standard Tier)",
    subtitle: "Best value — full experience for both parties",
    landlordPrice: 17.99,
    tenantTier: 2,
    tenantLabel: "Tenant: Affordable (£3.99 bundled)",
    total: 21.98,
    saving: 2.99 + 1.00,
    highlight: true,
    badge: "Best Value",
  },
];

function AddPropertyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: { name: string; address: string; postcode: string; notes: string }) => void }) {
  const [form, setForm] = useState({ name: "", address: "", postcode: "", notes: "" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground">Add Property</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Property Name</label>
            <input
              placeholder="e.g. My Home, Rental – Oak St"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Street Address</label>
            <input
              placeholder="e.g. 45 Oak Avenue"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Postcode</label>
            <input
              placeholder="e.g. SW1A 1AA"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
              value={form.postcode}
              onChange={e => setForm({ ...form, postcode: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Tenant: John Smith, 3-bed terrace"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.name && form.address) { onAdd(form); onClose(); } }}
            disabled={!form.name || !form.address}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Add Property
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Account() {
  const { tier, setTier, config } = useUserTier();
  const { properties, activeProperty, setActiveProperty, addProperty, removeProperty } = useProperty();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState("bundle-tier2");

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Subscription & Plan</h1>
        <p className="text-muted-foreground mt-1">Choose your tier to unlock features. Switch plans below to test.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <span className="text-2xl">🧪</span>
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-400">Developer Testing Mode</p>
          <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">Click any plan to instantly switch tiers and test gated features. In production this would connect to your payment provider.</p>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {([1, 2, 3, 4] as UserTier[]).map((t, idx) => {
          const cfg = TIER_CONFIGS[t];
          const Icon = TIER_ICONS[t];
          const isActive = tier === t;
          return (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              onClick={() => setTier(t)}
              className={`relative bg-card rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-xl ${isActive ? `${TIER_COLORS[t]} shadow-lg` : "border-border hover:border-primary/30"}`}
            >
              {isActive && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${TIER_ACCENT[t]} text-xs font-bold px-3 py-1 rounded-full shadow`}>
                  ✓ Current Plan
                </div>
              )}
              <div className={`inline-flex p-2.5 rounded-xl mb-4 ${TIER_ACCENT[t]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-0.5">Tier {t}</h3>
              <p className="text-sm font-semibold text-muted-foreground mb-1">{cfg.label}</p>
              <p className="text-xs text-muted-foreground mb-4">{cfg.tagline}</p>
              <div className="text-2xl font-display font-bold mb-1">
                {t === 1 ? "Free" : t === 2 ? "£4.99" : t === 3 ? "£9.99" : "£19.99"}
              </div>
              {t > 1 && <p className="text-xs text-muted-foreground mb-4">per month</p>}
              {t === 1 && <div className="mb-4" />}
              <div className="space-y-1.5 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Includes</p>
                {TIER_FEATURES[t].map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{f}</span>
                  </div>
                ))}
              </div>
              {TIER_LOCKED[t].length > 0 && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Locked</p>
                  {TIER_LOCKED[t].map(f => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground/50 line-through">{f}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${isActive ? `${TIER_ACCENT[t]} opacity-80` : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"}`}>
                {isActive ? "Active Plan" : `Switch to Tier ${t}`}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Landlord Bundle Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-1">
          <Building2 className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-display font-bold text-foreground">Landlord Bundle Pricing</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">As a landlord you pay for both your subscription and your tenant's. Choose how you want to set them up — we reward you with a discounted rate.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BUNDLES.map((bundle) => (
            <div
              key={bundle.id}
              onClick={() => setSelectedBundle(bundle.id)}
              className={`relative bg-card rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${selectedBundle === bundle.id ? "border-amber-500 shadow-md" : "border-border"}`}
            >
              {bundle.badge && (
                <span className={`absolute -top-3 left-4 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow text-white ${bundle.highlight ? "bg-amber-500" : "bg-slate-500"}`}>
                  {bundle.badge}
                </span>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm mb-0.5">{bundle.title}</h3>
                  <p className="text-xs text-muted-foreground">{bundle.subtitle}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 ml-2 mt-0.5 flex items-center justify-center ${selectedBundle === bundle.id ? "border-amber-500 bg-amber-500" : "border-border"}`}>
                  {selectedBundle === bundle.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Landlord sub</span>
                  <span className="font-semibold text-foreground">£{bundle.landlordPrice.toFixed(2)}/mo</span>
                </div>
                {bundle.tenantLabel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenant sub</span>
                    <span className="font-semibold text-foreground">{bundle.tenantLabel}</span>
                  </div>
                )}
                <div className="border-t border-border pt-1.5 flex justify-between">
                  <span className="font-semibold text-foreground">Total per month</span>
                  <span className="font-bold text-foreground">£{bundle.total.toFixed(2)}</span>
                </div>
                {bundle.saving && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="font-medium">You save</span>
                    <span className="font-bold">£{bundle.saving.toFixed(2)}/mo</span>
                  </div>
                )}
              </div>
              <div className={`w-full py-2 rounded-xl text-xs font-semibold text-center ${bundle.highlight ? "bg-amber-500 text-white" : selectedBundle === bundle.id ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground"}`}>
                {selectedBundle === bundle.id ? "Selected" : "Choose this bundle"}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Multi-Property Manager (Tier 4 only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-foreground">Property Manager</h2>
          </div>
          {config.showCompliance && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Property
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {config.showCompliance
            ? "Manage all your properties in one place. Switch the active property to filter readings and compliance reports."
            : "Multi-property management is available on the Landlord (Tier 4) plan."}
        </p>

        {!config.showCompliance ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
            <Lock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-muted-foreground mb-1">Landlord Tier Required</p>
            <p className="text-sm text-muted-foreground">Upgrade to Tier 4 to manage multiple properties.</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-foreground mb-1">No properties added yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add your first property to start filtering data by address.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Add First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(prop => {
              const isActive = activeProperty?.id === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => setActiveProperty(prop.id)}
                  className={`bg-card border-2 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${isActive ? "border-primary shadow-md shadow-primary/10" : "border-border"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                        <MapPin className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeProperty(prop.id); }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-foreground mb-0.5">{prop.name}</h3>
                  <p className="text-sm text-muted-foreground">{prop.address}</p>
                  {prop.postcode && <p className="text-xs text-muted-foreground/70">{prop.postcode}</p>}
                  {prop.notes && <p className="text-xs text-muted-foreground/70 mt-1.5 italic line-clamp-2">{prop.notes}</p>}
                </div>
              );
            })}
            <div
              onClick={() => setShowAddModal(true)}
              className="bg-card border-2 border-dashed border-border rounded-2xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 min-h-[120px]"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Add Property</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Plan Summary */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Current Plan Summary — Tier {tier}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Sensors", value: TIER_CONFIGS[tier].maxSensors === Infinity ? "Unlimited" : String(TIER_CONFIGS[tier].maxSensors) },
            { label: "Ads", value: TIER_CONFIGS[tier].showAds ? "Shown" : "None" },
            { label: "History", value: TIER_CONFIGS[tier].showHistory ? (TIER_CONFIGS[tier].historyDays === 1 ? "24h" : TIER_CONFIGS[tier].historyDays + "d") : "None" },
            { label: "Charts", value: TIER_CONFIGS[tier].showHumidityChart ? "Enabled" : "Locked" },
            { label: "Mould Alerts", value: TIER_CONFIGS[tier].showMouldAlerts ? "Enabled" : "Locked" },
            { label: "Compliance", value: TIER_CONFIGS[tier].showCompliance ? "Enabled" : "Locked" },
          ].map(item => (
            <div key={item.label} className="bg-muted/40 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="font-semibold text-sm text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onAdd={addProperty}
        />
      )}
    </Layout>
  );
}
