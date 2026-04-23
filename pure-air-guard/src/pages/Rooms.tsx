import { useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import RiskBadge from "../components/RiskBadge";
import { useGetRooms, useCreateRoom, useDeleteRoom } from "@workspace/api-client-react/src/generated/api";
import { useQueryClient } from "@tanstack/react-query";
import { getGetRoomsQueryKey } from "@workspace/api-client-react/src/generated/api";
import { Plus, Trash2, Home as HomeIcon, MapPin, Droplets, ThermometerSun, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Rooms() {
  const queryClient = useQueryClient();
  const { data: rooms, isLoading } = useGetRooms();
  const createMutation = useCreateRoom();
  const deleteMutation = useDeleteRoom();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "bedroom" as any,
    location: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRoomsQueryKey() });
        setIsAddModalOpen(false);
        setFormData({ name: "", type: "bedroom", location: "", notes: "" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to stop monitoring this room?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetRoomsQueryKey() })
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Monitored Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage areas and view their current mould risk status.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Room
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-muted/40 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : rooms?.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <HomeIcon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold mb-2">No Rooms Monitored</h3>
          <p className="text-muted-foreground max-w-md mb-6">Add rooms to start monitoring humidity, temperature, and tracking mould risk levels across your property.</p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-md hover:bg-primary/90 transition-colors"
          >
            Add Your First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms?.map((room, idx) => (
            <motion.div 
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{room.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      {room.location} • {room.type.replace('_', ' ')}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(room.id)}
                    className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-5">
                  <RiskBadge level={room.mouldRiskLevel} />
                </div>

                {/* Mocked current readings since Room model doesn't embed them directly, but typically you'd join them. We simulate visual stats here based on risk level for UI demo purposes */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-teal-500" />
                    <span className="text-sm font-medium">{room.mouldRiskLevel === 'high' ? '72%' : '45%'} RH</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">21.5°C</span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
                <span>Added {new Date(room.createdAt).toLocaleDateString()}</span>
                <span className="text-primary hover:underline cursor-pointer font-medium">View History</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Room">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Room Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Master Bedroom, Main Bathroom"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Room Type</label>
              <select 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="bedroom">Bedroom</option>
                <option value="bathroom">Bathroom</option>
                <option value="kitchen">Kitchen</option>
                <option value="living_room">Living Room</option>
                <option value="basement">Basement</option>
                <option value="attic">Attic</option>
                <option value="garage">Garage</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Location (Floor/Zone)</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 1st Floor, North Wing"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Notes (Optional)</label>
            <textarea 
              rows={3}
              placeholder="Any specific concerns about this room?"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-border mt-6">
            <button 
              type="button" 
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "Adding..." : "Add Room"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
