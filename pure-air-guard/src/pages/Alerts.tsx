import Layout from "../components/Layout";
import { useGetAlerts, useResolveAlert } from "@workspace/api-client-react/src/generated/api";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAlertsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react/src/generated/api";
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Alerts() {
  const queryClient = useQueryClient();
  const { data: alerts, isLoading } = useGetAlerts({ status: 'all' });
  const resolveMutation = useResolveAlert();

  const handleResolve = (id: number) => {
    resolveMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  const getAlertIcon = (severity: string, status: string) => {
    if (status === 'resolved') return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    if (severity === 'critical') return <ShieldAlert className="w-6 h-6 text-red-500" />;
    if (severity === 'danger') return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    return <AlertTriangle className="w-6 h-6 text-amber-500" />;
  };

  const getAlertBg = (severity: string, status: string) => {
    if (status === 'resolved') return "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50";
    if (severity === 'critical') return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/60";
    if (severity === 'danger') return "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/60";
    return "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60";
  };

  const activeAlerts = alerts?.filter(a => a.status === 'active') || [];
  const resolvedAlerts = alerts?.filter(a => a.status === 'resolved') || [];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">System Alerts</h1>
        <p className="text-muted-foreground mt-1">Requires immediate attention to prevent mould growth.</p>
      </div>

      <div className="space-y-8">
        {/* Active Alerts Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Active Alerts
            <span className="bg-destructive text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
              {activeAlerts.length}
            </span>
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-24 bg-muted/40 animate-pulse rounded-xl"></div>)}
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium text-lg">All Clear!</p>
              <p className="text-muted-foreground">No active alerts at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {activeAlerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${getAlertBg(alert.severity, alert.status)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-background p-2 rounded-full shadow-sm border border-border/50">
                        {getAlertIcon(alert.severity, alert.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{alert.roomName}</h3>
                          <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-background/50 border border-border/50 text-foreground/70">
                            {alert.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-foreground/90 font-medium mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-foreground/60 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolveMutation.isPending}
                      className="shrink-0 bg-background hover:bg-emerald-50 text-foreground hover:text-emerald-700 border border-border px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm self-start md:self-auto"
                    >
                      Mark Resolved
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Resolved Alerts Section */}
        {resolvedAlerts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-muted-foreground">Recently Resolved</h2>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{alert.message} <span className="text-muted-foreground font-normal">in {alert.roomName}</span></p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    Resolved {alert.resolvedAt ? formatDistanceToNow(new Date(alert.resolvedAt), { addSuffix: true }) : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
