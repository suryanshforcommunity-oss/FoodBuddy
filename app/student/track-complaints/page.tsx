"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LucideChevronLeft, LucideClock, LucideCheckCircle, LucideAlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function TrackComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchComplaints = async () => {
      const { data: dbUser } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (!dbUser) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("student_id", dbUser.id)
        .order("timestamp", { ascending: false });
        
      if (!error && data) setComplaints(data);
      setLoading(false);
    };

    fetchComplaints();

    let channel: any;

    const setupRealtime = async () => {
      const { data } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (data?.id) {
        channel = supabase
          .channel(`complaints-${data.id}-${Date.now()}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `student_id=eq.${data.id}` }, () => {
            fetchComplaints();
          })
          .subscribe();
      }
    };
    
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <LucideClock size={16} className="text-orange-500" />;
      case "Resolved": return <LucideCheckCircle size={16} className="text-green-500" />;
      default: return <LucideAlertCircle size={16} className="text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Resolved": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/student" className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted transition-colors">
            <LucideChevronLeft size={24} className="text-foreground" />
          </Link>
          <h2 className="text-xl font-bold text-foreground">My Complaints</h2>
        </div>
        <Link href="/student/raise-complaint" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          New Issue
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="w-32 h-4 bg-muted rounded"></div>
            </div>
          </div>
        ) : complaints.length > 0 ? (
          complaints.map((complaint) => (
            <div key={complaint.id} className="bg-card glass-panel rounded-xl p-5 border border-border flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{complaint.category}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(complaint.timestamp).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(complaint.status)}`}>
                  {getStatusIcon(complaint.status)}
                  {complaint.status}
                </div>
              </div>
              
              <p className="text-sm text-foreground mt-1">{complaint.description}</p>
              
              {complaint.media_urls && complaint.media_urls.length > 0 && (
                <div className="mt-2 flex gap-2">
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-border">
                    <img src={complaint.media_urls[0]} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-card glass-panel rounded-xl p-10 border border-border flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-3">check_circle</span>
            <h3 className="text-lg font-semibold text-foreground">All Good!</h3>
            <p className="text-sm text-muted-foreground mt-1">You haven't raised any complaints recently.</p>
          </div>
        )}
      </div>
    </div>
  );
}
