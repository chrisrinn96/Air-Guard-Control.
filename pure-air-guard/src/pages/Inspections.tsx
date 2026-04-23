import { useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useGetInspections, useCreateInspection, useGetRooms } from "@workspace/api-client-react/src/generated/api";
import { useQueryClient } from "@tanstack/react-query";
import { getGetInspectionsQueryKey } from "@workspace/api-client-react/src/generated/api";
import { ClipboardCheck, Plus, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Inspections() {
  const queryClient = useQueryClient();
  const { data: inspections, isLoading } = useGetInspections();
  const { data: rooms } = useGetRooms();
  const createMutation = useCreateInspection();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    inspector: "",
    findings: "",
    mouldFound: false,
    mouldArea: "",
    actionsTaken: "",
    nextInspectionDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      data: {
        roomId: parseInt(formData.roomId),
        inspector: formData.inspector,
        findings: formData.findings,
        mouldFound: formData.mouldFound,
        mouldArea: formData.mouldArea || null,
        actionsTaken: formData.actionsTaken || null,
        nextInspectionDate: formData.nextInspectionDate || null
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInspectionsQueryKey() });
        setIsAddModalOpen(false);
        setFormData({
          roomId: "", inspector: "", findings: "", mouldFound: false, mouldArea: "", actionsTaken: "", nextInspectionDate: ""
        });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Inspection Logs</h1>
          <p className="text-muted-foreground mt-1">Track physical checks and remediation efforts.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Log Inspection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           [1,2,3].map(i => <div key={i} className="h-64 bg-muted/40 animate-pulse rounded-2xl"></div>)
        ) : inspections?.length === 0 ? (
          <div className="col-span-full bg-card border border-border border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <ClipboardCheck className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Inspections Logged</h3>
            <p className="text-muted-foreground">Keep a record of your visual checks to maintain a healthy environment.</p>
          </div>
        ) : (
          inspections?.map((inspection) => (
            <div key={inspection.id} className="bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
              <div className={`px-5 py-3 border-b flex items-center justify-between ${inspection.mouldFound ? 'bg-red-50/50 border-red-100 dark:bg-red-950/20' : 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {inspection.mouldFound ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {inspection.roomName}
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border/50">
                  {format(new Date(inspection.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Inspector</p>
                  <p className="text-sm font-medium">{inspection.inspector}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Findings</p>
                  <p className="text-sm text-foreground/80 line-clamp-3">{inspection.findings}</p>
                </div>

                {inspection.mouldFound && inspection.mouldArea && (
                  <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                    <p className="text-xs text-red-800 dark:text-red-400 font-semibold uppercase tracking-wider mb-1">Affected Area</p>
                    <p className="text-sm text-red-900 dark:text-red-300">{inspection.mouldArea}</p>
                  </div>
                )}
              </div>
              
              {inspection.nextInspectionDate && (
                <div className="px-5 py-3 bg-muted/30 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  Next check due: <span className="font-semibold text-foreground">{format(new Date(inspection.nextInspectionDate), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log New Inspection">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Room</label>
              <select 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.roomId}
                onChange={e => setFormData({...formData, roomId: e.target.value})}
              >
                <option value="" disabled>Select room...</option>
                {rooms?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Inspector Name</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.inspector}
                onChange={e => setFormData({...formData, inspector: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">General Findings</label>
            <textarea 
              rows={3} required
              placeholder="Describe condition of walls, ceilings, windows..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              value={formData.findings}
              onChange={e => setFormData({...formData, findings: e.target.value})}
            />
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/20">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                checked={formData.mouldFound}
                onChange={e => setFormData({...formData, mouldFound: e.target.checked})}
              />
              <span className="font-semibold text-foreground">Mould detected during inspection</span>
            </label>
          </div>

          {formData.mouldFound && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-red-600 dark:text-red-400">Describe Affected Area</label>
                <input 
                  type="text" required={formData.mouldFound}
                  placeholder="e.g. Bottom corner of window frame, 10x10cm"
                  className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500/20 outline-none"
                  value={formData.mouldArea}
                  onChange={e => setFormData({...formData, mouldArea: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Remediation Actions Taken</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cleaned with bleach solution, improved ventilation"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.actionsTaken}
                  onChange={e => setFormData({...formData, actionsTaken: e.target.value})}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Next Inspection Date (Optional)</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.nextInspectionDate}
              onChange={e => setFormData({...formData, nextInspectionDate: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-border mt-6">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 shadow-md transition-all disabled:opacity-50">
              {createMutation.isPending ? "Saving..." : "Save Log"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
