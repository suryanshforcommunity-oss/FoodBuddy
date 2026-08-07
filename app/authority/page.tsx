"use client";

import { useState, useEffect } from "react";
import { LucideTrendingUp, LucideAlertCircle, LucideShieldCheck, LucideStar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { supabase } from "@/lib/supabase";

export default function AuthorityDashboard() {
  const [mounted, setMounted] = useState(false);
  const [resolutionTrend, setResolutionTrend] = useState<any[]>([]);
  const [categoryResolution, setCategoryResolution] = useState<any[]>([]);
  const [stats, setStats] = useState({ escalated: 12, resolved7d: 148 });

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      const { data: complaints, error } = await supabase.from("complaints").select("*");
      if (error || !complaints) return;

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const trendMap = new Map();
      days.forEach(d => trendMap.set(d, { day: d, received: 0, resolved: 0, totalHours: 0 }));

      const categoryMap = new Map();
      let escalatedCount = 0;
      let resolved7dCount = 0;
      const now = new Date();

      complaints.forEach((c: any) => {
        const timestamp = new Date(c.timestamp);
        const dayStr = days[timestamp.getDay()];
        
        const trend = trendMap.get(dayStr);
        if (trend) trend.received += 1;
        
        if (c.status === "Resolved" && c.resolved_at) {
          if (trend) trend.resolved += 1;
          const resolvedAt = new Date(c.resolved_at);
          const hours = (resolvedAt.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          if (trend) trend.totalHours += hours;

          const cat = categoryMap.get(c.category) || { category: c.category, total: 0, totalHours: 0 };
          cat.total += 1;
          cat.totalHours += hours;
          categoryMap.set(c.category, cat);

          const daysAgo = (now.getTime() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysAgo <= 7) resolved7dCount += 1;
        } else if (c.status === "Pending") {
          const hoursPending = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          if (hoursPending > 24) escalatedCount += 1;
        }
      });

      const formattedTrend = days.map(d => {
        const t = trendMap.get(d);
        return {
          day: d,
          received: t.received,
          resolved: t.resolved,
          avgTimeHours: t.resolved > 0 ? Number((t.totalHours / t.resolved).toFixed(1)) : 0
        };
      });
      
      const sun = formattedTrend.shift();
      if (sun) formattedTrend.push(sun);
      setResolutionTrend(formattedTrend.length > 0 ? formattedTrend : []);

      const formattedCat = Array.from(categoryMap.values()).map(c => ({
        category: c.category,
        total: c.total,
        avgTime: c.total > 0 ? Number((c.totalHours / c.total).toFixed(1)) : 0
      }));
      setCategoryResolution(formattedCat.length > 0 ? formattedCat : []);

      setStats({ escalated: escalatedCount, resolved7d: resolved7dCount });
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Facility Overview</h2>
          <p className="text-muted-foreground mt-2 font-medium">High-level metrics and resolution analysis for mess performance.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600 shadow-inner">
              <LucideStar size={24} />
            </div>
            <span className="flex items-center text-green-600 text-xs font-extrabold bg-green-100 px-2 py-1 rounded-full shadow-sm">
              4.2 / 5
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Avg Food Rating</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">Good</p>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shadow-inner">
              <LucideShieldCheck size={24} />
            </div>
            <span className="flex items-center text-green-600 text-xs font-extrabold bg-green-100 px-2 py-1 rounded-full shadow-sm">
              92%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Hygiene Compliance</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">Excellent</p>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive shadow-inner">
              <LucideAlertCircle size={24} />
            </div>
            <span className="text-xs text-destructive font-extrabold bg-destructive/10 px-2 py-1 rounded-full shadow-sm">
              Needs Action
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Escalated Complaints</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">{stats.escalated}</p>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600 shadow-inner">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
            <span className="flex items-center text-green-600 text-xs font-extrabold bg-green-100 px-2 py-1 rounded-full shadow-sm">
              <LucideTrendingUp size={14} className="mr-1" /> +5%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Avg Daily Attendance</h3>
            <p className="text-4xl font-extrabold text-foreground drop-shadow-sm">1,105</p>
          </div>
        </div>
      </section>

      {/* Analytics Graphs Section */}
      {mounted && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {/* Complaints Trend Graph */}
          <div className="card-3d p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 blur-xl pointer-events-none"></div>
            <h3 className="text-xl font-extrabold text-foreground mb-6 drop-shadow-sm">Weekly Complaint Resolution Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resolutionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="received" name="Received" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Resolution Time by Category */}
          <div className="card-3d p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-10 blur-xl pointer-events-none"></div>
            <h3 className="text-xl font-extrabold text-foreground mb-6 drop-shadow-sm">Avg Resolution Time by Category</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryResolution} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="h" />
                  <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`${value} hours`, 'Avg Time']}
                  />
                  <Bar dataKey="avgTime" name="Avg Resolution (Hours)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      <section className="card-3d p-6 md:p-8 relative overflow-hidden mt-2">
        <h3 className="text-xl font-extrabold text-foreground mb-6 drop-shadow-sm">Recent Escalations</h3>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-primary/5 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="p-4 font-bold rounded-tl-xl uppercase tracking-wider text-xs">ID</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Category</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Description</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Date</th>
                <th className="p-4 font-bold rounded-tr-xl uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-bold text-foreground">#CMP-1042</td>
                <td className="p-4 text-orange-600 font-extrabold">Hygiene</td>
                <td className="p-4 text-muted-foreground font-medium">Foreign object found in lunch.</td>
                <td className="p-4 text-muted-foreground font-medium">Today</td>
                <td className="p-4"><span className="bg-destructive/10 text-destructive px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">Investigating</span></td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-bold text-foreground">#CMP-1038</td>
                <td className="p-4 text-blue-600 font-extrabold">Staff</td>
                <td className="p-4 text-muted-foreground font-medium">Rude behavior by counter staff.</td>
                <td className="p-4 text-muted-foreground font-medium">Yesterday</td>
                <td className="p-4"><span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">Pending Review</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
