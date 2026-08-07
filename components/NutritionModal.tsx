"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { LucideX, Flame, Activity } from "lucide-react";

export interface MenuItem {
  id: number;
  name: string;
  meal: string;
  type: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

export function NutritionModal({ isOpen, onClose, item }: NutritionModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !item) return null;

  // Use real data if available, otherwise mock it for demonstration
  const calories = item.calories || Math.floor(Math.random() * 300) + 200;
  const protein = item.protein || Math.floor(Math.random() * 20) + 5;
  const carbs = item.carbs || Math.floor(Math.random() * 50) + 20;
  const fat = item.fat || Math.floor(Math.random() * 15) + 5;
  const fiber = item.fiber || Math.floor(Math.random() * 10) + 2;

  const data = [
    { name: "Protein", value: protein, color: "#3b82f6" }, // blue
    { name: "Carbs", value: carbs, color: "#eab308" },   // yellow
    { name: "Fat", value: fat, color: "#ef4444" },       // red
    { name: "Fiber", value: fiber, color: "#22c55e" },   // green
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/50 p-2 rounded shadow-lg text-xs font-bold text-foreground">
          {`${payload[0].name}: ${payload[0].value}g`}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-card border border-border/50 rounded-3xl w-full max-w-md p-6 shadow-2xl card-3d animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors z-10"
        >
          <LucideX size={18} />
        </button>
        
        <div className="flex flex-col items-center text-center gap-1 mb-6 relative z-0">
          <div className={`text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider mb-2 ${String(item.type).toUpperCase() === 'VEG' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {String(item.type).toUpperCase() === 'VEG' ? 'Vegetarian' : 'Non-Vegetarian'}
          </div>
          <h2 className="text-2xl font-black text-foreground drop-shadow-sm pr-6 pl-6">{item.name}</h2>
          <p className="text-xs text-muted-foreground">{item.description || "Freshly prepared in the mess kitchen."}</p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <div className="flex flex-col items-center bg-orange-50 border border-orange-200 rounded-2xl p-4 w-32 shadow-inner">
            <Flame className="text-orange-500 mb-1" size={24} />
            <span className="text-2xl font-black text-orange-950">{calories}</span>
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Calories</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
            <Activity size={16} className="text-primary" />
            Macro Breakdown
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="w-1/2 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-1/2 flex flex-col gap-3">
              {data.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: macro.color }}></div>
                    <span className="text-xs font-bold text-muted-foreground">{macro.name}</span>
                  </div>
                  <span className="text-sm font-black text-foreground">{macro.value}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
