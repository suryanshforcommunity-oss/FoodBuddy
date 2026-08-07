"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { LucideFilter, LucideCheckCircle2 } from "lucide-react";

export default function ManagerComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchComplaints = async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("timestamp", { ascending: false });
      if (!error && data) setComplaints(data);
    };

    fetchComplaints();

    const channel = supabase
      .channel(`public:complaints-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => {
        fetchComplaints();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredComplaints = complaints.filter(c => filter === "All" || c.status === filter);

  const handleResolve = async (id: string) => {
    // Optimistic UI update
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "Resolved", resolved_at: new Date().toISOString() } : c));

    try {
      const { error } = await supabase
        .from("complaints")
        .update({ 
          status: "Resolved",
          resolved_at: new Date().toISOString()
        })
        .eq("id", id);
        
      if (error) {
        console.error("Supabase Error:", error);
        // Revert on error
        const { data } = await supabase.from("complaints").select("*").order("timestamp", { ascending: false });
        if (data) setComplaints(data);
        alert(`Failed to resolve complaint: ${error.message || JSON.stringify(error)}`);
      }
    } catch (err) {
      console.error("Exception:", err);
      // Revert on error
      const { data } = await supabase.from("complaints").select("*").order("timestamp", { ascending: false });
      if (data) setComplaints(data);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Complaints Register</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and resolve student issues.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1 shadow-sm">
          <LucideFilter size={16} className="text-muted-foreground ml-2" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-sm font-medium border-none focus:ring-0 py-1.5 pl-2 pr-6 outline-none cursor-pointer"
          >
            <option value="All">All Issues</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-muted-foreground align-top">
                    {new Date(complaint.timestamp).toLocaleDateString()}
                    <div className="text-xs mt-1 opacity-70">{new Date(complaint.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4 font-medium text-foreground align-top">
                    {complaint.category}
                  </td>
                  <td className="p-4 text-muted-foreground max-w-md align-top">
                    <p className="line-clamp-2">{complaint.description}</p>
                    {complaint.media_urls && complaint.media_urls.length > 0 && (
                      <a href={complaint.media_urls[0]} target="_blank" rel="noreferrer" className="text-primary text-xs font-semibold mt-2 inline-block hover:underline">View Attachment</a>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      complaint.status === "Pending" ? "bg-orange-100 text-orange-700" :
                      complaint.status === "Resolved" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="p-4 align-top text-right">
                    {complaint.status !== "Resolved" && (
                      <button 
                        onClick={() => handleResolve(complaint.id)}
                        className="flex items-center justify-center gap-1.5 ml-auto bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <LucideCheckCircle2 size={14} />
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
