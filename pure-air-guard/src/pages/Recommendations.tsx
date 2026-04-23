import Layout from "../components/Layout";
import { useGetRecommendations } from "@workspace/api-client-react/src/generated/api";
import { Lightbulb, Wind, ThermometerSun, Droplets, SprayCan, Wrench, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Recommendations() {
  const { data: recommendations, isLoading } = useGetRecommendations();

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'ventilation': return <Wind className="w-5 h-5 text-blue-500" />;
      case 'temperature': return <ThermometerSun className="w-5 h-5 text-amber-500" />;
      case 'humidity': return <Droplets className="w-5 h-5 text-teal-500" />;
      case 'cleaning': return <SprayCan className="w-5 h-5 text-purple-500" />;
      case 'structural': return <Wrench className="w-5 h-5 text-orange-500" />;
      default: return <Lightbulb className="w-5 h-5 text-primary" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high': return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/50">High Priority</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/50">Medium</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">Low</span>;
    }
  };

  return (
    <Layout>
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-primary" />
          Prevention Guide
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Actionable advice to maintain healthy indoor air quality and prevent mould growth permanently.</p>
      </div>

      {isLoading ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {[1,2,3,4,5].map(i => <div key={i} className="break-inside-avoid h-40 bg-muted/40 animate-pulse rounded-2xl mb-6"></div>)}
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-12">
          {recommendations?.map((rec, idx) => (
            <motion.div 
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`break-inside-avoid bg-card rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden ${rec.applicable ? 'border-primary/30' : 'border-border opacity-70'}`}
            >
              {!rec.applicable && (
                <div className="absolute top-0 right-0 bg-muted text-muted-foreground text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                  General Info
                </div>
              )}
              <div className="flex items-start gap-4 mb-3">
                <div className="p-2.5 bg-muted rounded-xl border border-border/50 shrink-0">
                  {getCategoryIcon(rec.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{rec.category}</span>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{rec.title}</h3>
                </div>
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed mt-4">
                {rec.description}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
