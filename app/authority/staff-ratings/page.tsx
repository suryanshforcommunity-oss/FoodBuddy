"use client";

import { LucideSearch, LucideStar, LucideUsers } from "lucide-react";

export default function AuthorityStaffRatings() {
  const staff = [
    { id: 1, name: "Ramesh Kumar", role: "Head Chef", rating: 4.8, reviews: 156 },
    { id: 2, name: "Suresh Singh", role: "Counter Staff", rating: 4.2, reviews: 89 },
    { id: 3, name: "Anita Devi", role: "Cleaning Staff", rating: 4.9, reviews: 210 },
    { id: 4, name: "Rajiv Sharma", role: "Counter Staff", rating: 3.5, reviews: 45 }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Staff Ratings</h2>
          <p className="text-muted-foreground mt-2 font-medium">Review performance and student feedback for staff members.</p>
        </div>
      </div>

      <div className="card-3d p-4 flex items-center gap-3">
        <LucideSearch className="text-muted-foreground ml-2" size={24} />
        <input 
          type="text" 
          placeholder="Search staff by name or role..." 
          className="w-full bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((s) => (
          <div key={s.id} className="card-3d p-6 flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <LucideUsers size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{s.name}</h3>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.role}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg shadow-sm">
                  <LucideStar size={14} style={{ fill: "currentColor" }} />
                  <span className="font-extrabold">{s.rating}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold mt-1">{s.reviews} Reviews</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <button className="w-full btn-3d-secondary py-2 rounded-xl font-bold text-sm">
                View Feedback
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
