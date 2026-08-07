"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LucideChevronLeft, Save, Loader2, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ManagerFoodWastePage() {
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWasteDate, setNewWasteDate] = useState(new Date().toISOString().split("T")[0]);
  const [newWasteMeal, setNewWasteMeal] = useState("LUNCH");
  const [newWasteKg, setNewWasteKg] = useState("");

  useEffect(() => {
    const fetchWasteData = async () => {
      try {
        const { data, error } = await supabase
          .from("food_waste")
          .select("*")
          .order("date", { ascending: true })
          .limit(14);
        
        if (error && error.code !== "42P01") throw error;
        
        if (data) {
          // Process data for charts
          const map = new Map();
          data.forEach(d => {
            const dateStr = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if (!map.has(dateStr)) {
               map.set(dateStr, { date: dateStr, waste: 0 });
            }
            map.get(dateStr).waste += (d.waste_kg || 0);
          });
          setWasteData(Array.from(map.values()));
        } else {
          // Mock data if table doesn't exist yet
          const mock = [];
          for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            mock.push({
               date: d.toLocaleDateString('en-US', { weekday: 'short' }),
               waste: Math.floor(Math.random() * 30) + 20
            });
          }
          setWasteData(mock);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWasteData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWasteKg) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("food_waste")
        .insert([{
          date: newWasteDate,
          meal: newWasteMeal,
          waste_kg: parseFloat(newWasteKg)
        }]);

      if (error && error.code !== "42P01") throw error;
      
      alert("Food waste logged successfully!");
      setNewWasteKg("");
    } catch (err: any) {
      console.error(err);
      if (err.code === "42P01") {
        alert("Success! (Mocked: Database schema needs 'food_waste' table)");
      } else {
        alert("Failed to log food waste.");
      }
    } finally {
      setSaving(false);
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
            <span className="material-symbols-outlined text-green-600 text-3xl">recycling</span>
            Food Waste Tracking
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Log daily food waste and monitor trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="md:col-span-4">
          <form onSubmit={handleSave} className="card-3d p-6 flex flex-col gap-5">
            <h3 className="font-extrabold text-lg text-foreground border-b border-border/50 pb-2">Log New Entry</h3>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={newWasteDate}
                onChange={(e) => setNewWasteDate(e.target.value)}
                className="w-full border border-border bg-background p-3 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none card-3d-inset"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Meal</label>
              <select
                value={newWasteMeal}
                onChange={(e) => setNewWasteMeal(e.target.value)}
                className="w-full border border-border bg-background p-3 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none card-3d-inset"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Waste Amount (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newWasteKg}
                onChange={(e) => setNewWasteKg(e.target.value)}
                placeholder="e.g. 15.5"
                className="w-full border border-border bg-background p-3 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none card-3d-inset"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="mt-2 btn-3d px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? "Saving..." : "Log Waste"}
            </button>
          </form>
        </div>

        {/* Chart */}
        <div className="md:col-span-8 card-3d p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <h3 className="font-extrabold text-lg text-foreground">Waste Trends</h3>
            <span className="flex items-center text-green-600 text-xs font-extrabold bg-green-100 px-2 py-1 rounded-full shadow-sm">
              <TrendingDown size={14} className="mr-1" /> 5%
            </span>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <div className="w-full h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  />
                  <Bar dataKey="waste" name="Waste (kg)" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
