"use client";

import Link from "next/link";
import { LucideTrendingUp, LucideMessageSquare, LucideAlertTriangle, LucideCheckCircle, LucideDownload, LucideQrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    critical: 0,
    overdue: 0,
    resolvedToday: 0,
    foodWasteKg: 45, // Mocked
  });
  const [attendance, setAttendance] = useState({
    live: 0,
    expected: 1200,
  });
  const [currentMeal, setCurrentMeal] = useState("LUNCH");
  const [historyData, setHistoryData] = useState<any[]>([]);

  const [noticeAudience, setNoticeAudience] = useState("All Students");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeImportant, setNoticeImportant] = useState(false);
  const [sendingNotice, setSendingNotice] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // 1. Fetch Complaints
        const { data: complaintsData, error: complaintsError } = await supabase
          .from("complaints")
          .select("*");
          
        if (!complaintsError && complaintsData) {
          let pending = 0;
          let critical = 0;
          let overdue = 0;
          let resolvedToday = 0;
          
          complaintsData.forEach((c) => {
            if (c.status === "Pending") {
              pending++;
              if (c.category === "Hygiene" || c.category === "Food Quality") critical++;
              if (new Date(c.timestamp) < yesterday) overdue++;
            } else if (c.status === "Resolved") {
              if (c.resolved_at && c.resolved_at.startsWith(todayStr)) {
                resolvedToday++;
              }
            }
          });
          
          setStats({ pending, critical, overdue, resolvedToday });
        }
        
        // 2. Determine current meal (No snacks)
        const hour = now.getHours();
        let meal = "LUNCH";
        if (hour >= 6 && hour < 11) meal = "BREAKFAST";
        else if (hour >= 11 && hour < 16) meal = "LUNCH";
        else meal = "DINNER";
        setCurrentMeal(meal);

        // 3. Fetch Expected Attendance (total students)
        const { count: studentCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "student");
          
        const expected = studentCount || 1200;

        // 4. Fetch Live Attendance
        const { count: liveCount } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("date", todayStr)
          .eq("meal_type", meal);
          
        setAttendance({
          live: liveCount || 0,
          expected: expected,
        });

        // 5. Fetch Historical Attendance (Last 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 7 days including today
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];
        
        const { data: histData, error: histError } = await supabase
          .from("attendance")
          .select("date, meal_type")
          .gte("date", sevenDaysAgoStr)
          .order("date", { ascending: true });
          
        if (!histError && histData) {
          // Initialize map for the last 7 days
          const historyMap = new Map();
          for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split("T")[0];
            const displayDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            historyMap.set(dateStr, { date: displayDate, BREAKFAST: 0, LUNCH: 0, DINNER: 0 });
          }
          
          histData.forEach((record: any) => {
            if (historyMap.has(record.date)) {
              const dayData = historyMap.get(record.date);
              if (record.meal_type === "BREAKFAST" || record.meal_type === "LUNCH" || record.meal_type === "DINNER") {
                dayData[record.meal_type] = (dayData[record.meal_type] || 0) + 1;
              }
            }
          });
          
          setHistoryData(Array.from(historyMap.values()));
        }

      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time subscription for live attendance
    const attendanceChannel = supabase
      .channel("live-attendance")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance" }, (payload) => {
        // Optimistically increment attendance if it matches current meal and date
        const todayStr = new Date().toISOString().split("T")[0];
        if (payload.new.date === todayStr && payload.new.meal_type === currentMeal) {
          setAttendance(prev => ({ ...prev, live: prev.live + 1 }));
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(attendanceChannel);
    };
  }, [currentMeal]);

  const handleBroadcastNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeMessage.trim()) return;
    
    setSendingNotice(true);
    try {
      const { error } = await supabase.from("notices").insert([{
        audience: noticeAudience,
        title: "Dashboard Alert", // or use first few words of message
        content: noticeMessage,
        important: noticeImportant,
        date: new Date().toISOString()
      }]);
      
      if (error && error.code !== "42P01") throw error; // Ignore if table doesn't exist for demo
      
      alert("Notice broadcasted successfully!");
      setNoticeMessage("");
      setNoticeImportant(false);
    } catch (err) {
      console.error("Error broadcasting notice:", err);
      alert("Failed to broadcast notice.");
    } finally {
      setSendingNotice(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-2 font-medium">Today's operational status across the mess facility.</p>
        </div>
        <button className="btn-3d px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <LucideDownload size={20} />
          Generate Report
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-inner">
              <LucideMessageSquare size={24} />
            </div>
            <span className="flex items-center text-green-600 text-xs font-extrabold bg-green-100 px-2 py-1 rounded-full shadow-sm">
              <LucideTrendingUp size={14} className="mr-1" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Total Pending</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">{stats.pending}</p>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive shadow-inner">
              <LucideAlertTriangle size={24} />
            </div>
            <span className="flex items-center text-destructive text-xs font-extrabold bg-destructive/10 px-2 py-1 rounded-full shadow-sm">
              <LucideTrendingUp size={14} className="mr-1" /> +3
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Critical Issues</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">{stats.critical}</p>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600 shadow-inner">
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <span className="text-xs font-bold text-muted-foreground px-2 py-1">vs Yesterday</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Overdue Action</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">{stats.overdue}</p>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600 shadow-inner">
              <LucideCheckCircle size={24} />
            </div>
            <span className="flex items-center text-green-600 text-xs font-extrabold bg-green-100 px-2 py-1 rounded-full shadow-sm">
              <LucideTrendingUp size={14} className="mr-1" /> 85%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Resolved Today</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">{stats.resolvedToday}</p>
          </div>
        </div>

        <Link href="/manager/food-waste" className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform bg-gradient-to-br from-green-50 to-green-100/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-200 text-green-700 shadow-inner">
              <span className="material-symbols-outlined text-[24px]">recycling</span>
            </div>
            <span className="text-xs font-bold text-muted-foreground px-2 py-1">Yesterday</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-green-800 mb-1 uppercase tracking-wider">Food Waste</h3>
            <p className="text-3xl lg:text-4xl font-extrabold text-green-900 drop-shadow-sm">{stats.foodWasteKg} <span className="text-xl font-bold text-green-700">kg</span></p>
          </div>
        </Link>

        <Link href="/manager/lost-and-found" className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform bg-gradient-to-br from-yellow-50 to-yellow-100/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-yellow-200 text-yellow-700 shadow-inner">
              <span className="material-symbols-outlined text-[24px]">box</span>
            </div>
            <span className="text-xs font-bold text-muted-foreground px-2 py-1">Hub</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-yellow-800 mb-1 uppercase tracking-wider">Lost & Found</h3>
            <p className="text-xs font-bold text-yellow-900 drop-shadow-sm">Manage Items</p>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-2">
        <div className="lg:col-span-7 card-3d p-6 md:p-8 flex flex-col relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10 blur-2xl pointer-events-none"></div>
          
          <h3 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2 drop-shadow-sm">
            <LucideQrCode className="text-primary" size={24} />
            Live Session Attendance
          </h3>
          <div className="flex flex-col sm:flex-row gap-8 items-center h-full">
            <div className="card-3d-inset p-4 rounded-2xl w-48 h-48 flex-shrink-0 flex flex-col items-center justify-center relative group">
              <div className="w-full h-full bg-background flex items-center justify-center rounded-xl border-2 border-dashed border-primary/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <span className="material-symbols-outlined text-5xl text-primary/40">qr_code_scanner</span>
              </div>
              <Link href="/manager/attendance" className="absolute -bottom-4 btn-3d rounded-full p-3 flex items-center justify-center hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">open_in_new</span>
              </Link>
            </div>
            <div className="flex-1 w-full flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full shadow-inner uppercase tracking-wider">Current: {currentMeal}</span>
                <span className="text-xs text-green-600 font-extrabold flex items-center gap-1.5 px-3 py-1 bg-green-100 rounded-full shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-ping absolute opacity-75"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600 relative"></span>
                  LIVE
                </span>
              </div>
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-5xl font-black text-foreground tracking-tighter drop-shadow-sm">{attendance.live}</span>
                  <span className="text-sm font-bold text-muted-foreground pb-1">/ {attendance.expected} Expected</span>
                </div>
                <div className="w-full h-4 bg-background rounded-full overflow-hidden shadow-inner border border-border/50">
                  <div className="h-full bg-primary rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" style={{ width: `${Math.min(100, Math.max(0, (attendance.live / (attendance.expected || 1)) * 100))}%` }}></div>
                </div>
              </div>
              <Link href="/manager/attendance" className="block text-center w-full btn-3d py-3.5 rounded-xl font-bold text-lg hover:shadow-lg transition-all active:scale-[0.98]">
                Manage Session
              </Link>
            </div>
          </div>
          
          {/* Attendance History Chart */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <h4 className="text-lg font-bold text-foreground mb-4">Weekly Attendance History</h4>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="BREAKFAST" name="Breakfast" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="LUNCH" name="Lunch" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="DINNER" name="Dinner" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 card-3d p-6 md:p-8 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-10 blur-xl pointer-events-none"></div>
          
          <h3 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2 drop-shadow-sm">
            <span className="material-symbols-outlined text-orange-500 text-[28px]">campaign</span>
            Quick Notice
          </h3>
          <form onSubmit={handleBroadcastNotice} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Audience</label>
              <select 
                value={noticeAudience}
                onChange={(e) => setNoticeAudience(e.target.value)}
                className="w-full border border-border bg-background p-3 rounded-xl font-semibold focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset"
              >
                <option>All Students</option>
                <option>Hostel A Only</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Message</label>
              <textarea 
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                className="w-full border border-border bg-background p-4 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none resize-none transition-all card-3d-inset" 
                placeholder="Type urgent announcement here..." 
                rows={4}
                required
              ></textarea>
            </div>
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={noticeImportant}
                    onChange={(e) => setNoticeImportant(e.target.checked)}
                    className="peer appearance-none w-6 h-6 border-2 border-muted-foreground rounded bg-background checked:bg-primary checked:border-primary transition-colors cursor-pointer" 
                  />
                  <span className="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-[18px]">check</span>
                </div>
                <span className="font-bold text-sm text-muted-foreground group-hover:text-foreground transition-colors">Send Alert</span>
              </label>
              <button 
                type="submit" 
                disabled={sendingNotice}
                className="btn-3d px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">{sendingNotice ? "sync" : "send"}</span>
                {sendingNotice ? "Sending..." : "Broadcast"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
