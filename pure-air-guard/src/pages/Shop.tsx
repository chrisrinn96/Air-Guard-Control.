import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink, Star, Truck, Shield, RotateCcw, ArrowRight } from "lucide-react";

const SHOP_URL = "https://YOUR-SHOPIFY-STORE.myshopify.com";

const FEATURED_PRODUCTS = [
  {
    name: "Pro-Grade Dehumidifier 12L",
    description: "Removes up to 12 litres of moisture daily. Auto-humidistat, continuous drain option, ultra-quiet 38dB. Ideal for problem rooms and basements.",
    category: "Dehumidifiers",
    badge: "Best Seller",
    badgeColor: "bg-amber-500",
    imagePlaceholder: "💧",
    price: "£149.99",
  },
  {
    name: "Anti-Mould Wall Paint 2.5L",
    description: "Professional-strength fungicidal paint for kitchens and bathrooms. Prevents mould regrowth for up to 5 years. Available in 20 colours.",
    category: "Paints & Coatings",
    badge: "Top Rated",
    badgeColor: "bg-emerald-500",
    imagePlaceholder: "🎨",
    price: "£34.99",
  },
  {
    name: "Positive Input Ventilation Unit",
    description: "Whole-home ventilation solution. Draws fresh, filtered air in from the loft and gently circulates it throughout the property. Landlord favourite.",
    category: "Ventilation",
    badge: "Landlord Pick",
    badgeColor: "bg-purple-500",
    imagePlaceholder: "🌬️",
    price: "£219.99",
  },
  {
    name: "Smart Extractor Fan w/ Humidity Sensor",
    description: "Auto-activates when humidity exceeds 70% and switches off when the room returns to safe levels. App-controllable, quiet 28dB motor.",
    category: "Ventilation",
    badge: "Smart Home",
    badgeColor: "bg-blue-500",
    imagePlaceholder: "⚙️",
    price: "£79.99",
  },
  {
    name: "Mould Remover & Inhibitor Spray 1L",
    description: "Hospital-grade biocide spray. Kills 99.9% of mould spores on contact and leaves an anti-fungal barrier for up to 6 months.",
    category: "Treatments",
    badge: "Quick Fix",
    badgeColor: "bg-red-500",
    imagePlaceholder: "🧴",
    price: "£18.99",
  },
  {
    name: "Heated Clothes Airer 3-Tier",
    description: "Dries laundry 3× faster than a standard airer. Low wattage (120W), built-in timer, folds flat for storage. Stops moisture from drying clothes being released into rooms.",
    category: "Laundry",
    badge: "Energy Saving",
    badgeColor: "bg-teal-500",
    imagePlaceholder: "👕",
    price: "£59.99",
  },
  {
    name: "Window Secondary Glazing Film",
    description: "Adds an insulating layer to cold single-glazed windows, drastically reducing condensation. Cut to size, easy self-install. One roll covers 4 average windows.",
    category: "Insulation",
    badge: "Winter Essential",
    badgeColor: "bg-sky-500",
    imagePlaceholder: "🪟",
    price: "£22.99",
  },
  {
    name: "Anti-Mould Grout Pen (Twin Pack)",
    description: "Refresh discoloured bathroom grout in minutes. Contains a built-in mould inhibitor. Water-resistant when dry. Comes in Brilliant White and Ivory.",
    category: "Treatments",
    badge: "Quick Fix",
    badgeColor: "bg-red-500",
    imagePlaceholder: "✏️",
    price: "£12.99",
  },
  {
    name: "Silicone Sealant Anti-Mould (6-Pack)",
    description: "Professional-grade mould-resistant silicone for baths, showers and kitchen sinks. Remains flexible and won't crack. Resists mould for 10+ years.",
    category: "Sealants",
    badge: "Multi-Pack",
    badgeColor: "bg-orange-500",
    imagePlaceholder: "🔩",
    price: "£29.99",
  },
];

const CATEGORIES = ["All", "Dehumidifiers", "Ventilation", "Paints & Coatings", "Treatments", "Laundry", "Insulation", "Sealants"];

export default function Shop() {
  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-display font-bold text-foreground">Anti-Mould Shop</h1>
        </div>
        <p className="text-muted-foreground">Professional-grade mould prevention products, tried and tested — all available in our store.</p>
      </div>

      {/* Shop Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary to-accent rounded-3xl p-8 mb-8 text-white overflow-hidden"
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-wider">Pure Air Guard Official Store</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Everything You Need to Fight Mould</h2>
            <p className="text-white/80 max-w-lg">Dehumidifiers, anti-mould paints, smart ventilation, treatments and more. All personally tested and recommended by our team.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {[{ icon: Truck, label: "Free UK delivery over £50" }, { icon: Shield, label: "2-year guarantee" }, { icon: RotateCcw, label: "30-day returns" }].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-sm text-white/80">
                  <item.icon className="w-4 h-4 text-white/60" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3.5 rounded-xl hover:bg-white/90 hover:scale-105 transition-all shadow-lg text-base"
          >
            <ShoppingBag className="w-5 h-5" />
            Open Full Store
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: "⭐", title: "4.9/5 Rating", sub: "Over 2,000 reviews" },
          { icon: "🚚", title: "Free Delivery", sub: "On orders over £50" },
          { icon: "🔒", title: "Secure Payment", sub: "Powered by Shopify" },
        ].map(item => (
          <div key={item.title} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="font-semibold text-sm text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Featured Products */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-foreground">Featured Products</h2>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all products <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative bg-gradient-to-br from-muted/60 to-muted/30 h-40 flex items-center justify-center text-6xl">
                {product.imagePlaceholder}
                <span className={`absolute top-3 left-3 text-[10px] font-bold text-white px-2 py-1 rounded-full uppercase tracking-wide ${product.badgeColor}`}>
                  {product.badge}
                </span>
                <span className="absolute top-3 right-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border">
                  {product.category}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-3">{product.description}</p>

                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(4.9)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-display font-bold text-foreground">{product.price}</span>
                  <a
                    href={SHOP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Buy Now
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-muted/40 border border-border rounded-2xl p-5 text-center">
        <p className="text-sm text-muted-foreground mb-3">Looking for something specific? Our full catalogue has over 150 products.</p>
        <a
          href={SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Browse Full Catalogue
        </a>
        <p className="text-xs text-muted-foreground mt-3 opacity-60">
          Note: Update the shop URL in <code className="bg-muted px-1 rounded">src/pages/Shop.tsx</code> once your Shopify store is live.
        </p>
      </div>
    </Layout>
  );
}
