import Layout from "../components/Layout";
import { motion } from "framer-motion";
import {
  Wind, ShoppingBag, Droplets, Thermometer, Home, AlertTriangle,
  CheckCircle2, Lightbulb, Shirt, UtensilsCrossed, Bath, Snowflake, Hammer
} from "lucide-react";
import { Link } from "wouter";

interface TipCard {
  title: string;
  description: string;
  type: "do" | "avoid" | "tip";
}

interface Category {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  iconColor: string;
  tips: TipCard[];
}

const categories: Category[] = [
  {
    icon: Shirt,
    label: "Laundry & Washing",
    color: "border-blue-200 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
    tips: [
      { type: "avoid", title: "Never dry clothes in a closed room", description: "Drying laundry indoors releases up to 2 litres of moisture per load into the air. If you must dry indoors, keep a window open to let damp air escape." },
      { type: "do", title: "Open a window when drying washing", description: "Keep a gap open in the room where clothes are drying. This allows moisture-laden air to escape before it condenses on cold walls." },
      { type: "do", title: "Use a dehumidifier alongside drying", description: "A dehumidifier next to your clothes airer dramatically reduces the time it takes to dry laundry and keeps room humidity below 55%." },
      { type: "tip", title: "Use a heated airer", description: "Heated airers dry clothes up to 3× faster than a standard airer, releasing less moisture into your home over a shorter time." },
      { type: "avoid", title: "Don't hang washing on radiators", description: "Hanging wet clothes on radiators forces your boiler to work harder and creates a large warm, humid surface — perfect for mould spores to settle." },
    ],
  },
  {
    icon: Wind,
    label: "Ventilation",
    color: "border-teal-200 dark:border-teal-800",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    iconColor: "text-teal-500",
    tips: [
      { type: "do", title: "Open windows for at least 15 minutes daily", description: "Even in winter, briefly opening windows flushes out stale, humid air. Focus on bedrooms in the morning when condensation peaks after a night's sleep." },
      { type: "do", title: "Use extractor fans consistently", description: "Run bathroom and kitchen extractor fans during and for 15–20 minutes after bathing or cooking. This is the single most effective ventilation action you can take." },
      { type: "tip", title: "Keep interior doors open", description: "Keeping doors between rooms open allows air to circulate and prevents humid air from becoming trapped in isolated rooms." },
      { type: "avoid", title: "Don't block air vents or trickle vents", description: "Air bricks and window trickle vents exist to provide constant low-level airflow. Blocking them to 'keep the heat in' creates conditions for mould growth." },
      { type: "do", title: "Purge rooms after guests stay", description: "After guests stay, open windows and let the room breathe. Occupied rooms experience significantly higher humidity from breathing alone." },
    ],
  },
  {
    icon: UtensilsCrossed,
    label: "Cooking",
    color: "border-orange-200 dark:border-orange-800",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-500",
    tips: [
      { type: "do", title: "Always use lids on pans", description: "Keeping lids on saucepans reduces steam released into your kitchen by up to 70%. It also uses less energy as food heats faster." },
      { type: "do", title: "Turn on the extractor fan before you cook", description: "Start your extractor fan before turning on the hob so it's already pulling air when steam is produced. Leave it on for 10 minutes after cooking finishes." },
      { type: "tip", title: "Keep the kitchen door closed while cooking", description: "This prevents cooking moisture from spreading into the rest of the home. Open the kitchen window instead to vent steam directly outside." },
      { type: "avoid", title: "Don't leave boiling pots unwatched on a low heat", description: "Slow evaporation from uncovered pans left simmering for a long time can raise kitchen humidity by 20% or more." },
    ],
  },
  {
    icon: Bath,
    label: "Bathrooms",
    color: "border-purple-200 dark:border-purple-800",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-500",
    tips: [
      { type: "do", title: "Wipe down wet surfaces after showering", description: "Using a squeegee or towel on shower tiles and glass after every shower removes the standing water that feeds mould. This takes under 60 seconds." },
      { type: "do", title: "Leave the bathroom door open after showering", description: "Once you've finished, open the door and window to allow steam to disperse. A bathroom closed tight with residual steam is a perfect mould breeding ground." },
      { type: "avoid", title: "Don't leave damp towels bunched up", description: "Hang towels fully spread on a towel rail and run the extractor fan. Bunched towels stay damp for hours and develop mildew quickly." },
      { type: "tip", title: "Check silicone sealant regularly", description: "Discoloured or cracked sealant around baths and showers lets moisture penetrate behind tiles. Replacing it is cheap and prevents significant mould damage." },
      { type: "avoid", title: "Don't skip resealing grout", description: "Porous grout absorbs water and harbours mould. Applying a grout sealant annually keeps it water-resistant and much easier to clean." },
    ],
  },
  {
    icon: Snowflake,
    label: "Winter & Cold Weather",
    color: "border-sky-200 dark:border-sky-800",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    iconColor: "text-sky-500",
    tips: [
      { type: "tip", title: "Keep heating consistent rather than off/on cycling", description: "A home that is allowed to get very cold then rapidly heated creates condensation on cold surfaces. A lower but steady temperature is much better for preventing mould." },
      { type: "do", title: "Keep bedroom temperatures above 14°C", description: "Cold bedroom walls cause breath condensation to settle on surfaces overnight. Set radiators to a low level rather than turning them off entirely." },
      { type: "avoid", title: "Don't let rooms become cold and damp simultaneously", description: "Empty, unheated rooms in winter are the most common source of serious mould damage. Even minimal heating prevents the worst condensation." },
      { type: "do", title: "Move furniture slightly away from cold external walls", description: "A small 5cm gap between furniture and external walls allows air to circulate behind sofas and wardrobes where mould often starts unseen." },
      { type: "tip", title: "Check for cold bridges and insulation gaps", description: "Window frames, wall corners and loft hatches are common cold spots. Adding draught strips or ceiling insulation prevents the condensation that leads to mould at these points." },
    ],
  },
  {
    icon: Hammer,
    label: "Maintenance & Fabric",
    color: "border-amber-200 dark:border-amber-800",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
    tips: [
      { type: "do", title: "Check gutters and downpipes twice a year", description: "Blocked gutters overflow against walls, causing persistent dampness that no amount of ventilation will fix. Clear them in autumn and spring." },
      { type: "do", title: "Inspect the roof after storms", description: "Loose or cracked roof tiles can allow rainwater in, which saturates insulation and causes mould to form on ceilings and top-floor walls." },
      { type: "tip", title: "Apply anti-mould paint in high-risk rooms", description: "Anti-mould paints contain fungicides and are ideal for bathroom and kitchen ceilings. Pair them with a bathroom-grade primer for the best results." },
      { type: "avoid", title: "Don't paint over mould without treating it first", description: "Painting over mould without treating the underlying cause is ineffective — it will return within weeks. Treat with a bleach-based solution, allow to dry fully, then repaint." },
      { type: "do", title: "Seal windows and doors with draught strips", description: "Draughts cool wall and window surfaces unevenly, creating localised cold spots where condensation gathers. Sealing them improves both warmth and air quality." },
    ],
  },
];

const TYPE_CONFIG = {
  do: { label: "Do this", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500" },
  avoid: { label: "Avoid this", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", dot: "bg-red-500" },
  tip: { label: "Pro tip", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", dot: "bg-blue-500" },
};

export default function Advice() {
  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Lightbulb className="w-7 h-7 text-amber-500" />
          <h1 className="text-3xl font-display font-bold text-foreground">Mould Prevention Advice</h1>
        </div>
        <p className="text-muted-foreground">Evidence-based tips to reduce humidity and stop mould before it starts — free for all members.</p>
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Want products that actually work?</p>
            <p className="text-sm text-muted-foreground">Browse our curated range of anti-mould devices and prevention products.</p>
          </div>
        </div>
        <Link href="/shop">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md shrink-0">
            <ShoppingBag className="w-4 h-4" />
            Visit Our Shop
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-6 flex-wrap mb-8">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span className="text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-10">
        {categories.map((cat, catIdx) => {
          const Icon = cat.icon;
          return (
            <motion.section
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.07 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${cat.bgColor} border ${cat.color}`}>
                  <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">{cat.label}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cat.tips.map((tip, tipIdx) => {
                  const typeConf = TYPE_CONFIG[tip.type];
                  return (
                    <motion.div
                      key={tip.title}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: catIdx * 0.07 + tipIdx * 0.04 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm leading-snug">{tip.title}</h3>
                        <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

      <div className="mt-10 bg-gradient-to-br from-primary to-accent rounded-3xl p-8 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="relative z-10">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 text-white/80" />
          <h3 className="text-2xl font-display font-bold mb-2">Still Struggling with Damp?</h3>
          <p className="text-white/80 max-w-xl mx-auto mb-6">Our shop stocks professional-grade dehumidifiers, anti-mould paints, extractor fans and more — all tried and tested by our team.</p>
          <Link href="/shop">
            <div className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-white/90 hover:scale-105 transition-all cursor-pointer shadow-lg">
              <ShoppingBag className="w-5 h-5" />
              Shop Anti-Mould Products
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
