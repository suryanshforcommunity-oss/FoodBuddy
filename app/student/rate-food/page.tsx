"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LucideChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function RateFoodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const { user } = useAuth();

  const handleRate = (meal: string, rating: number) => {
    setRatings({ ...ratings, [meal]: rating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!user || !user.email) return;
    
    setLoading(true);
    try {
      const { data: dbUser } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (!dbUser) throw new Error("User not found in DB");

      const ratingPromises = Object.entries(ratings).map(([mealType, ratingValue]) => {
        if (ratingValue > 0) {
          return supabase.from("ratings").insert({
            student_id: dbUser.id,
            date: new Date().toISOString().split("T")[0],
            meal_type: mealType.toUpperCase(),
            rating_value: ratingValue,
          });
        }
        return Promise.resolve();
      });
      
      await Promise.all(ratingPromises);
      
      router.push("/student");
    } catch (error) {
      console.error("Error saving ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (meal: string) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(meal, star)}
            className={`${(ratings as any)[meal] >= star ? "text-yellow-500" : "text-border"} hover:text-yellow-400 transition-colors active:scale-90`}
          >
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: (ratings as any)[meal] >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/student" className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted transition-colors">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <h2 className="text-xl font-bold text-foreground">Rate Today's Food</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-card glass-panel rounded-xl p-5 border border-border flex flex-col items-center gap-3">
          <h3 className="font-semibold text-foreground">Breakfast</h3>
          {renderStars("breakfast")}
        </div>

        <div className="bg-card glass-panel rounded-xl p-5 border border-border flex flex-col items-center gap-3">
          <h3 className="font-semibold text-foreground">Lunch</h3>
          {renderStars("lunch")}
        </div>

        <div className="bg-card glass-panel rounded-xl p-5 border border-border flex flex-col items-center gap-3">
          <h3 className="font-semibold text-foreground">Dinner</h3>
          {renderStars("dinner")}
        </div>

        <button
          type="submit"
          disabled={loading || (ratings.breakfast === 0 && ratings.lunch === 0 && ratings.dinner === 0)}
          className="mt-4 w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Submit Ratings
        </button>
      </form>
    </div>
  );
}
