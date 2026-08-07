"use client";

import { useState, useEffect } from "react";
import { LucidePlus, LucideTrash2, LucideSave, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: number;
  name: string;
  meal: string;
  type: string;
  calories?: number;
  protein?: number;
}

export default function ManagerMenuPage() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  
  const [activeDay, setActiveDay] = useState("Monday");
  const [activeMeal, setActiveMeal] = useState("Breakfast");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newItemType, setNewItemType] = useState("veg");
  const [newItemCalories, setNewItemCalories] = useState("");
  const [newItemProtein, setNewItemProtein] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const dayMap: Record<string, number> = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("weekly_menu")
          .select("*")
          .eq("day_id", dayMap[activeDay]);

        if (error) throw error;
        
        // Map Supabase rows back to MenuItem format
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
  }, [activeDay]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setMenuItems([...menuItems, { 
      id: Date.now(), 
      name: newItem, 
      meal: activeMeal, 
      type: newItemType,
      calories: newItemCalories ? parseInt(newItemCalories) : undefined,
      protein: newItemProtein ? parseInt(newItemProtein) : undefined
    }]);
    setNewItem("");
    setNewItemCalories("");
    setNewItemProtein("");
  };

  const handleRemove = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing items for the day
      await supabase.from("weekly_menu").delete().eq("day_id", dayMap[activeDay]);
      
      // Insert new items
      if (menuItems.length > 0) {
        const insertData = menuItems.map(item => ({
          day_id: dayMap[activeDay],
          name: item.name,
          meal: item.meal,
          type: item.type,
          calories: item.calories,
          protein: item.protein,
        }));
        const { error } = await supabase.from("weekly_menu").insert(insertData);
        if (error) throw error;
      }
      alert("Menu saved successfully!");
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Failed to save menu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Menu Management</h2>
          <p className="text-muted-foreground mt-2 font-medium">Update the weekly mess menu.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-3d px-6 py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={20} /> : <LucideSave size={20} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Days Selection */}
      <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4 min-w-max pb-4">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeDay === day
                  ? "btn-3d scale-105"
                  : "card-3d text-muted-foreground hover:text-foreground"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Selection */}
      <div className="flex gap-4">
        {meals.map((meal) => (
          <button
            key={meal}
            onClick={() => setActiveMeal(meal)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeMeal === meal
                ? "bg-primary/20 text-primary border border-primary/50 shadow-inner"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {meal}
          </button>
        ))}
      </div>

      <div className="card-3d p-6 md:p-8 flex flex-col gap-6 mt-2 relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-xl">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : null}
        <h3 className="text-xl font-extrabold text-foreground drop-shadow-sm flex items-center justify-between">
          <span>{activeDay} - {activeMeal}</span>
          <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold">Edit Mode</span>
        </h3>
        
        <div className="flex flex-col gap-3">
          {menuItems.filter(item => item.meal === activeMeal).length === 0 && !loading ? (
            <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border/50">
              <p className="text-muted-foreground font-semibold">No items added yet.</p>
            </div>
          ) : (
            menuItems.filter(item => item.meal === activeMeal).map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-background border border-border/50 rounded-xl shadow-inner card-3d-inset group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{item.name}</span>
                    {(item.calories || item.protein) && (
                      <span className="text-xs text-muted-foreground font-medium">
                        {item.calories ? `${item.calories} kcal` : ''} 
                        {item.calories && item.protein ? ' • ' : ''} 
                        {item.protein ? `${item.protein}g protein` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors active:scale-90"
                >
                  <LucideTrash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={newItemType} 
              onChange={(e) => setNewItemType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold w-full sm:w-auto"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`Add new item for ${activeMeal}...`}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="number"
              value={newItemCalories}
              onChange={(e) => setNewItemCalories(e.target.value)}
              placeholder="Calories (kcal) optional"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
            />
            <input
              type="number"
              value={newItemProtein}
              onChange={(e) => setNewItemProtein(e.target.value)}
              placeholder="Protein (g) optional"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
            />
            <button 
              type="submit"
              disabled={!newItem.trim()}
              className="btn-3d px-6 py-3 rounded-xl flex items-center justify-center disabled:opacity-50 font-bold"
            >
              <LucidePlus size={20} className="mr-2" /> Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
