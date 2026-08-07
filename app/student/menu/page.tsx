"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LucideChevronLeft, LucideCalendarDays, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { NutritionModal, MenuItem } from "@/components/NutritionModal";

interface MenuItem {
  id: number;
  name: string;
  meal: string;
  type: string;
  calories?: number;
  protein?: number;
}

export default function StudentMenuPage() {
  const [selectedDayId, setSelectedDayId] = useState(new Date().getDay() || 1);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNutrition = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const days = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 0, name: "Sunday" }
  ];

  const selectedDayName = days.find(d => d.id === selectedDayId)?.name || "Monday";

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const fetchId = selectedDayId === 0 ? 7 : selectedDayId;
        const { data, error } = await supabase
          .from("weekly_menu")
          .select("*")
          .eq("day_id", fetchId);

        if (error) throw error;
        
        const items = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          meal: row.meal,
          type: row.type,
          calories: row.calories,
          protein: row.protein,
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [selectedDayId]);

  const breakfastItems = menuItems.filter(item => item.meal === "Breakfast");
  const lunchItems = menuItems.filter(item => item.meal === "Lunch");
  const dinnerItems = menuItems.filter(item => item.meal === "Dinner");

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full relative">
      <div className="flex items-center gap-3 mb-2 md:mb-6">
        <Link href="/student" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm">Weekly Menu</h2>
          <p className="text-sm text-muted-foreground mt-1">Check what's cooking this week!</p>
        </div>
      </div>

      {/* Days Selector */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 snap-x">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayId(day.id)}
            className={`snap-start shrink-0 px-6 py-3 rounded-xl font-bold transition-all ${
              selectedDayId === day.id 
                ? "btn-3d text-primary-foreground shadow-lg scale-105" 
                : "card-3d text-muted-foreground hover:text-foreground"
            }`}
          >
            {day.name}
          </button>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}
      
      <NutritionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={selectedItem} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-2 min-h-[300px]">
        {/* Breakfast */}
        <section className="card-3d overflow-hidden flex flex-col group">
          <div className="h-32 bg-blue-100 flex items-center justify-center relative">
            <span className="material-symbols-outlined text-6xl text-blue-500/20 drop-shadow-sm">free_breakfast</span>
            <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
               <LucideCalendarDays size={14}/> 07:30 - 09:30
            </div>
            <h3 className="absolute bottom-4 left-4 text-2xl font-extrabold text-blue-900/80">Breakfast</h3>
          </div>
          <div className="p-6 flex flex-col gap-4 bg-card flex-1 border-t border-border/50">
            {breakfastItems.length === 0 ? (
              <p className="text-sm font-semibold text-muted-foreground text-center py-4">No menu available</p>
            ) : (
              breakfastItems.map((item) => (
                <div key={item.id} onClick={() => handleOpenNutrition(item)} className="flex flex-col gap-1 cursor-pointer hover:bg-muted/30 p-2 rounded-xl transition-colors -mx-2">
                  <div className="flex gap-3 items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                  </div>
                  {(item.calories || item.protein) && (
                    <div className="flex gap-2 ml-6">
                      {item.calories && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{item.calories} kcal</span>}
                      {item.protein && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.protein}g protein</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Lunch */}
        <section className="card-3d overflow-hidden flex flex-col group">
          <div className="h-32 bg-orange-100 flex items-center justify-center relative">
            <span className="material-symbols-outlined text-6xl text-orange-500/20 drop-shadow-sm">lunch_dining</span>
            <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
               <LucideCalendarDays size={14}/> 12:30 - 14:30
            </div>
            <h3 className="absolute bottom-4 left-4 text-2xl font-extrabold text-orange-900/80">Lunch</h3>
          </div>
          <div className="p-6 flex flex-col gap-4 bg-card flex-1 border-t border-border/50">
            {lunchItems.length === 0 ? (
              <p className="text-sm font-semibold text-muted-foreground text-center py-4">No menu available</p>
            ) : (
              lunchItems.map((item) => (
                <div key={item.id} onClick={() => handleOpenNutrition(item)} className="flex flex-col gap-1 cursor-pointer hover:bg-muted/30 p-2 rounded-xl transition-colors -mx-2">
                  <div className="flex gap-3 items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                  </div>
                  {(item.calories || item.protein) && (
                    <div className="flex gap-2 ml-6">
                      {item.calories && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{item.calories} kcal</span>}
                      {item.protein && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.protein}g protein</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Dinner */}
        <section className="card-3d overflow-hidden flex flex-col group">
          <div className="h-32 bg-indigo-100 flex items-center justify-center relative">
            <span className="material-symbols-outlined text-6xl text-indigo-500/20 drop-shadow-sm">dinner_dining</span>
            <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
               <LucideCalendarDays size={14}/> 19:30 - 21:30
            </div>
            <h3 className="absolute bottom-4 left-4 text-2xl font-extrabold text-indigo-900/80">Dinner</h3>
          </div>
          <div className="p-6 flex flex-col gap-4 bg-card flex-1 border-t border-border/50">
            {dinnerItems.length === 0 ? (
              <p className="text-sm font-semibold text-muted-foreground text-center py-4">No menu available</p>
            ) : (
              dinnerItems.map((item) => (
                <div key={item.id} onClick={() => handleOpenNutrition(item)} className="flex flex-col gap-1 cursor-pointer hover:bg-muted/30 p-2 rounded-xl transition-colors -mx-2">
                  <div className="flex gap-3 items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                  </div>
                  {(item.calories || item.protein) && (
                    <div className="flex gap-2 ml-6">
                      {item.calories && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{item.calories} kcal</span>}
                      {item.protein && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.protein}g protein</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
