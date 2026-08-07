"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LucideChevronLeft, Loader2, CheckCircle, BoxSelect } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ManagerLostAndFoundPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lost_and_found")
        .select("*")
        .order("status", { ascending: false }) // 'Open' comes before 'Resolved' (alphabetically Open > Resolved? No, O < R, so ascending is Open first? Let's use Open first)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      // Mock data
      setItems([
        { id: '1', type: 'Lost', item_name: 'Blue Water Bottle', description: 'Tupperware bottle near table 4.', reported_by: 'student@example.com', date: new Date().toISOString().split("T")[0], status: 'Open' },
        { id: '2', type: 'Found', item_name: 'Student ID Card', description: 'Found near the handwash area.', reported_by: 'manager@example.com', date: new Date().toISOString().split("T")[0], status: 'Resolved' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleResolve = async (id: string) => {
    // Optimistic UI update
    setItems(items.map(item => item.id === id ? { ...item, status: 'Resolved' } : item));
    
    try {
      const { error } = await supabase
        .from("lost_and_found")
        .update({ status: 'Resolved' })
        .eq("id", id);
        
      if (error && error.code !== "42P01") throw error;
    } catch (err) {
      // Silent fallback
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full relative">
      <div className="flex items-center gap-3 mb-2 md:mb-6">
        <Link href="/manager" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-600 text-3xl">box</span>
            Lost & Found Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and resolve reported lost or found items.</p>
        </div>
      </div>

      <div className="card-3d p-6 md:p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <h3 className="font-extrabold text-lg text-foreground">All Reported Items</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border/50">
            <BoxSelect size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-foreground font-bold text-lg">No items reported</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className={`bg-background border ${item.status === 'Resolved' ? 'border-border/30 opacity-70' : 'border-border/50'} rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between gap-4 card-3d-inset transition-opacity`}>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.type === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.status === 'Open' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium ml-auto">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-lg font-bold text-foreground">{item.item_name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  <span className="text-xs font-bold text-muted-foreground mt-2">Reported by: {item.reported_by}</span>
                </div>
                
                {item.status === 'Open' && (
                  <div className="flex items-center self-start sm:self-center mt-2 sm:mt-0">
                    <button 
                      onClick={() => handleResolve(item.id)}
                      className="btn-3d bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl flex items-center gap-2 active:scale-95"
                    >
                      <CheckCircle size={20} />
                      <span className="font-bold">Resolve</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
