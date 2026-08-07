"use client";

import { LucideCheckCircle, LucideStar, LucideThumbsUp, LucideThumbsDown } from "lucide-react";

export default function AuthorityRatingsOverview() {
  const dailyRatings = [
    { date: "Aug 02", rating: 4.2, upvotes: 320, downvotes: 45 },
    { date: "Aug 01", rating: 4.5, upvotes: 410, downvotes: 20 },
    { date: "Jul 31", rating: 3.8, upvotes: 210, downvotes: 115 },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Food & Hygiene</h2>
          <p className="text-muted-foreground mt-2 font-medium">Daily quality metrics and student satisfaction.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-3d p-6 flex flex-col gap-2 border-t-4 border-t-green-500">
          <div className="flex items-center gap-2 text-green-600">
            <LucideCheckCircle size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">Overall Quality</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-foreground">92%</span>
            <span className="text-sm font-bold text-muted-foreground mb-1">Satisfied</span>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col gap-2 border-t-4 border-t-orange-500">
          <div className="flex items-center gap-2 text-orange-600">
            <LucideStar size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">Avg Food Rating</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-foreground">4.2</span>
            <span className="text-sm font-bold text-muted-foreground mb-1">/ 5.0</span>
          </div>
        </div>

        <div className="card-3d p-6 flex flex-col gap-2 border-t-4 border-t-blue-500">
          <div className="flex items-center gap-2 text-blue-600">
            <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
            <span className="font-bold uppercase tracking-wider text-xs">Hygiene Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-foreground">4.8</span>
            <span className="text-sm font-bold text-muted-foreground mb-1">/ 5.0</span>
          </div>
        </div>
      </div>

      <section className="card-3d p-6 md:p-8 mt-2">
        <h3 className="text-xl font-extrabold text-foreground mb-6 drop-shadow-sm">Recent Daily Metrics</h3>
        <div className="grid grid-cols-1 gap-4">
          {dailyRatings.map((day, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-background border border-border/50 rounded-2xl shadow-inner card-3d-inset">
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-foreground text-lg">{day.date}</span>
                <div className="flex items-center gap-1 text-orange-500">
                  <LucideStar size={14} style={{ fill: "currentColor" }} />
                  <span className="text-xs font-bold">{day.rating} Avg</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <LucideThumbsUp size={16} className="text-green-500 mb-1" />
                  <span className="text-xs font-bold text-muted-foreground">{day.upvotes}</span>
                </div>
                <div className="flex flex-col items-center">
                  <LucideThumbsDown size={16} className="text-destructive mb-1" />
                  <span className="text-xs font-bold text-muted-foreground">{day.downvotes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
