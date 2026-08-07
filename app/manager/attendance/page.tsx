"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { LucideRefreshCw, LucideUsers, LucideDownload } from "lucide-react";

export default function ManagerAttendancePage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [mealType, setMealType] = useState<string>("LUNCH");
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const generateSession = async () => {
    // Generate a secure session token
    // Format: FOODBUDDY_SESSION_[MEAL]_[TIMESTAMP]_[RANDOM]
    const token = `FOODBUDDY_SESSION_${mealType}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setSessionToken(token);
    
    try {
      const url = await QRCode.toDataURL(token, {
        width: 400,
        margin: 2,
        color: {
          dark: '#005146', // Primary color
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    generateSession();
  }, [mealType]);

  const { user } = useAuth();

  // Listen for live attendance scans
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    
    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", today)
        .eq("meal_type", mealType)
        .order("timestamp", { ascending: false });
        
      if (!error && data) {
        setAttendanceCount(data.length);
        setRecentScans(data);
      }
    };

    fetchAttendance();

    const channel = supabase
      .channel("public:attendance")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => {
        fetchAttendance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mealType, user]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Live Attendance Scanner</h2>
        <div className="flex gap-2">
          <select 
            value={mealType} 
            onChange={(e) => setMealType(e.target.value)}
            className="border border-border bg-background px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Display */}
        <div className="lg:col-span-2 bg-card border border-border shadow-sm rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-foreground">Scan to Mark {mealType} Attendance</h3>
            <p className="text-muted-foreground mt-1">Students can scan this using the FoodBuddy app.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-inner border border-border mb-8">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Session QR Code" className="w-64 h-64" />
            ) : (
              <div className="w-64 h-64 bg-muted animate-pulse rounded-lg"></div>
            )}
          </div>
          
          <button 
            onClick={generateSession}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <LucideRefreshCw size={18} />
            Refresh QR Code
          </button>
          <p className="text-xs text-muted-foreground mt-4 text-center max-w-sm">
            For security, refresh the QR code every 5 minutes to prevent screenshots and proxy attendance.
          </p>
        </div>

        {/* Live Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <LucideUsers size={120} />
            </div>
            <h3 className="text-primary-foreground/80 font-medium mb-1 relative z-10">Total Scans ({mealType})</h3>
            <p className="text-5xl font-bold relative z-10">{attendanceCount}</p>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex-1 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Verified Students ({attendanceCount})</h3>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 hide-scrollbar">
              {recentScans.length > 0 ? (
                recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {(scan.student_name || scan.student_id).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{scan.student_name || `UID: ...${scan.student_id.substring(scan.student_id.length - 4)}`}</p>
                        <p className="text-xs text-muted-foreground font-medium">{new Date(scan.timestamp).toLocaleTimeString()} • {scan.student_name ? `UID: ...${scan.student_id.substring(scan.student_id.length - 4)}` : 'Name unavailable'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-green-700 bg-green-100 px-2 py-1 rounded shadow-sm uppercase tracking-wider">Verified</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">qr_code_scanner</span>
                  <p className="text-sm font-medium">Waiting for scans...</p>
                </div>
              )}
            </div>
            
            <button className="mt-4 w-full flex items-center justify-center gap-2 border border-border text-foreground hover:bg-muted px-4 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm active:scale-[0.98]">
              <LucideDownload size={16} />
              Export {mealType} Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
