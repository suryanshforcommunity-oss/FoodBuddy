"use client";

import { LucideAlertTriangle, LucideCheckCircle, LucideClock, LucideFilter } from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthorityComplaintsOverview() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState({ highPriority: 0, inProgress: 0, resolved7d: 0 });

  useEffect(() => {
    const fetchComplaints = async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("timestamp", { ascending: false });
      if (!error && data) {
        setComplaints(data);
        
        let highPriority = 0;
        let inProgress = 0;
        let resolved7d = 0;
        const now = new Date();
        
        data.forEach((c: any) => {
          if (c.status === "Pending" || c.status === "In Progress") {
             inProgress += 1;
             const hoursPending = (now.getTime() - new Date(c.timestamp).getTime()) / (1000 * 60 * 60);
             if (hoursPending > 24) highPriority += 1;
          } else if (c.status === "Resolved" && c.resolved_at) {
             const daysAgo = (now.getTime() - new Date(c.resolved_at).getTime()) / (1000 * 60 * 60 * 24);
             if (daysAgo <= 7) resolved7d += 1;
          }
        });
        
        setStats({ highPriority, inProgress, resolved7d });
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Complaints Tracker</h2>
          <p className="text-muted-foreground mt-2 font-medium">Monitor and resolve student escalations.</p>
        </div>
        <button className="btn-3d px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <LucideFilter size={20} />
          Filter Issues
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-3d p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-destructive">
            <LucideAlertTriangle size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">High Priority</span>
          </div>
          <span className="text-4xl font-extrabold text-foreground">{stats.highPriority}</span>
        </div>
        <div className="card-3d p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-orange-500">
            <LucideClock size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">In Progress</span>
          </div>
          <span className="text-4xl font-extrabold text-foreground">{stats.inProgress}</span>
        </div>
        <div className="card-3d p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <LucideCheckCircle size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">Resolved (7d)</span>
          </div>
          <span className="text-4xl font-extrabold text-foreground">{stats.resolved7d}</span>
        </div>
      </div>

      <div className="card-3d p-6 md:p-8 mt-2">
        <div className="grid grid-cols-1 gap-4">
          {complaints.length > 0 ? (
            complaints.map((c) => {
              const isResolved = c.status === "Resolved" && c.resolved_at;
              let resolveText = "";
              if (isResolved) {
                const hours = (new Date(c.resolved_at).getTime() - new Date(c.timestamp).getTime()) / (1000 * 60 * 60);
                resolveText = `Resolved in ${hours.toFixed(1)} hrs`;
              }
  
              const hoursPending = (new Date().getTime() - new Date(c.timestamp).getTime()) / (1000 * 60 * 60);
              const priority = isResolved ? "Low" : hoursPending > 24 ? "High" : "Medium";
              
              return (
                <div key={c.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-background border border-border/50 rounded-2xl shadow-inner gap-4 card-3d-inset">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">CMP-{c.id.substring(0,6).toUpperCase()}</span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${
                        priority === 'High' ? 'bg-red-500 text-white' : 
                        priority === 'Medium' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                      }`}>{priority}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-sm">{c.category}</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{c.description}</p>
                    <span className="text-xs text-muted-foreground font-semibold">
                       {new Date(c.timestamp).toLocaleDateString()} {new Date(c.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                    <span className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm self-start md:self-auto ${
                      c.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {c.status}
                    </span>
                    {isResolved && (
                      <span className="text-xs font-semibold text-green-600">{resolveText}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No complaints found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
