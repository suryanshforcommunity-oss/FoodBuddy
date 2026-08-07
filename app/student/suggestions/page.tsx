"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LucideChevronLeft, Loader2, LucideSend, LucideAlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function SuggestionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState("Menu Addition");
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const WEEKLY_LIMIT = 2;

  useEffect(() => {
    if (!user) return;
    
    const fetchWeeklyCount = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count, error } = await supabase
        .from("suggestions")
        .select("*", { count: 'exact', head: true })
        .eq("student_id", user.id)
        .gte("created_at", oneWeekAgo.toISOString());
        
      if (!error && count !== null) {
        setWeeklyCount(count);
        if (count >= WEEKLY_LIMIT) {
          setLimitReached(true);
        }
      }
    };
    
    fetchWeeklyCount();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || limitReached) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.from("suggestions").insert([{
        student_id: user.id,
        category: category,
        suggestion: suggestion
      }]);
      
      if (error && error.code !== "42P01") throw error; // Ignore if table doesn't exist for demo/fallback
      
      alert("Suggestion submitted successfully!");
      router.push("/student");
    } catch (err) {
      console.error("Error submitting suggestion:", err);
      alert("Failed to submit suggestion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-2 md:mb-6">
        <Link href="/student" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm">Suggest Food</h2>
          <p className="text-sm text-muted-foreground mt-1">Got ideas for the menu?</p>
        </div>
      </div>

      <div className="card-3d p-6 md:p-8">
        {limitReached ? (
          <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-2">
              <LucideAlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Weekly Limit Reached</h3>
            <p className="text-muted-foreground font-medium max-w-sm">
              You have already submitted {weeklyCount} suggestions this week. To maintain quality and prevent spam, we limit submissions to {WEEKLY_LIMIT} per week.
            </p>
            <p className="text-sm font-bold text-primary mt-2">Please try again next week!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold w-fit mb-2">
              {WEEKLY_LIMIT - weeklyCount} submissions remaining this week
            </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
            >
              <option>Menu Addition</option>
              <option>Special Event Food</option>
              <option>Healthy Options</option>
              <option>Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-foreground">Suggestion Details</label>
            <textarea 
              required
              rows={5}
              placeholder="E.g., We should have more protein options like Soya Chunks on Thursdays..." 
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none card-3d-inset"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading || !suggestion}
            className="mt-4 w-full btn-3d disabled:opacity-50 text-primary-foreground font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <LucideSend size={20} />}
            Submit Suggestion
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
