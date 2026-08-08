"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LucideChevronLeft, Loader2, Plus, BoxSelect } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function StudentLostAndFoundPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    type: "Lost",
    itemName: "",
    description: "",
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lost_and_found")
        .select("*")
        .eq("status", "Open")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      // Fallback to local storage if table doesn't exist
      const localData = localStorage.getItem('lost_and_found_items');
      if (localData) {
        setItems(JSON.parse(localData));
      } else {
        const mockData = [
          { id: '1', type: 'Lost', item_name: 'Blue Water Bottle', description: 'Tupperware bottle near table 4.', reported_by: 'student@example.com', date: new Date().toISOString().split("T")[0], status: 'Open' },
          { id: '2', type: 'Found', item_name: 'Student ID Card', description: 'Found near the handwash area.', reported_by: 'manager@example.com', date: new Date().toISOString().split("T")[0], status: 'Open' },
        ];
        localStorage.setItem('lost_and_found_items', JSON.stringify(mockData));
        setItems(mockData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !newItem.itemName.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("lost_and_found")
        .insert([{
          type: newItem.type,
          item_name: newItem.itemName,
          description: newItem.description,
          reported_by: user.email,
          date: new Date().toISOString().split("T")[0],
          status: "Open"
        }]);

      if (error) throw error;
      
      alert("Item reported successfully!");
      setShowForm(false);
      setNewItem({ type: "Lost", itemName: "", description: "" });
      fetchItems();
    } catch (err: any) {
      // Save to local storage as fallback
      const localData = JSON.parse(localStorage.getItem('lost_and_found_items') || '[]');
      const newMockItem = {
        id: Math.random().toString(36).substring(7),
        type: newItem.type,
        item_name: newItem.itemName,
        description: newItem.description,
        reported_by: user.email,
        date: new Date().toISOString().split("T")[0],
        status: 'Open'
      };
      localStorage.setItem('lost_and_found_items', JSON.stringify([newMockItem, ...localData]));
      
      alert("Item reported successfully! (Saved locally)");
      setShowForm(false);
      setNewItem({ type: "Lost", itemName: "", description: "" });
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full relative">
      <div className="flex items-center justify-between mb-2 md:mb-6">
        <div className="flex items-center gap-3">
          <Link href="/student" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
            <LucideChevronLeft size={24} className="text-foreground" />
          </Link>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm">Lost & Found</h2>
            <p className="text-sm text-muted-foreground mt-1">Report lost items or see if someone found them.</p>
          </div>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn-3d px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Report Item</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleReport} className="card-3d p-6 md:p-8 flex flex-col gap-6 mb-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <h3 className="font-extrabold text-lg text-foreground">Report an Item</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground font-bold text-sm">Cancel</button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-foreground uppercase tracking-wider">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="Lost" 
                  checked={newItem.type === "Lost"} 
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="accent-primary w-4 h-4"
                />
                <span className="font-semibold text-foreground">I Lost Something</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="Found" 
                  checked={newItem.type === "Found"} 
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="accent-primary w-4 h-4"
                />
                <span className="font-semibold text-foreground">I Found Something</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-foreground uppercase tracking-wider">Item Name</label>
            <input
              type="text"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              placeholder="e.g. Blue Water Bottle"
              className="w-full border border-border bg-background p-4 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-foreground uppercase tracking-wider">Description & Location</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Provide details and where you lost/found it..."
              className="w-full border border-border bg-background p-4 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none resize-none transition-all card-3d-inset"
              rows={3}
              required
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-3d px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              {saving ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/50 shadow-sm card-3d-inset">
          <BoxSelect size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-foreground font-bold text-lg">No active items</p>
          <p className="text-muted-foreground text-sm mt-1">There are currently no lost or found items reported.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card-3d p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                  item.type === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {item.type}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">{item.item_name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
              <div className="mt-2 pt-3 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground truncate max-w-[200px]">By: {item.reported_by}</span>
                {item.reported_by === user?.email && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Yours</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
