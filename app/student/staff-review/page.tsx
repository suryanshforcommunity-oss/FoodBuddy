"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LucideChevronLeft, Loader2, LucideSend } from "lucide-react";

export default function StaffReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [staffName, setStaffName] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submit
    setTimeout(() => {
      setLoading(false);
      router.push("/student");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-2 md:mb-6">
        <Link href="/student" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm">Staff Review</h2>
          <p className="text-sm text-muted-foreground mt-1">Help us improve service quality</p>
        </div>
      </div>

      <div className="card-3d p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-foreground">Staff Member (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Ramesh" 
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="font-bold text-foreground">Service Rating</label>
            <div className="flex justify-center items-center gap-3 bg-background p-6 rounded-2xl border border-border/50 shadow-inner card-3d-inset">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition-transform hover:scale-110 active:scale-90 ${rating >= star ? "text-yellow-500" : "text-muted"}`}
                >
                  <span className="material-symbols-outlined text-4xl md:text-5xl drop-shadow-sm" style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-foreground">Comments</label>
            <textarea 
              required
              rows={4}
              placeholder="Tell us about your experience..." 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none card-3d-inset"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading || rating === 0 || !comments}
            className="mt-4 w-full btn-3d disabled:opacity-50 text-primary-foreground font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <LucideSend size={20} />}
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
