"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LucideUsers, LucideShieldAlert } from "lucide-react";

export default function ManagerStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("staff")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error && error.code !== "42P01") throw error; // Ignore undefined table initially
        setStaffList(data || []);
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaff();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground drop-shadow-sm">Mess Staff</h2>
          <p className="text-muted-foreground mt-2 font-medium">View the list of currently assigned staff members.</p>
        </div>
      </div>

      <div className="card-3d p-6 relative overflow-hidden flex flex-col gap-6 min-h-[500px]">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <LucideUsers size={20} className="text-primary" />
          Staff Directory
        </h3>

        {/* Staff Table */}
        <div className="flex-1 overflow-x-auto hide-scrollbar rounded-xl border border-border/50 bg-background/50">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-primary/5 text-muted-foreground border-b border-border/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Name</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Role & Shift</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Contact</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="w-32 h-4 bg-muted rounded"></div>
                    </div>
                  </td>
                </tr>
              ) : staffList.length > 0 ? (
                staffList.map((staff) => (
                  <tr key={staff.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {staff.name ? staff.name.substring(0, 2).toUpperCase() : "ST"}
                        </div>
                        <span className="font-bold text-foreground">{staff.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground text-xs">{staff.role}</span>
                        <span className="text-muted-foreground text-xs">{staff.shift}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-muted-foreground">{staff.contact || "N/A"}</td>
                    <td className="p-4 font-medium text-muted-foreground text-right">
                      {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : "Unknown"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <LucideShieldAlert size={40} className="opacity-20" />
                      <p className="font-medium text-base">No staff members assigned yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
