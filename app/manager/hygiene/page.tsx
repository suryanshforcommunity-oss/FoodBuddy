"use client";

import { LucideCheckCircle, LucideAlertTriangle, LucideFilter } from "lucide-react";

export default function ManagerHygienePage() {
  const reports = [
    { id: "HYG-101", location: "Main Dining Hall", issue: "Tables not cleared properly after lunch rush.", status: "Pending", priority: "Medium", time: "1 hour ago" },
    { id: "HYG-102", location: "Kitchen Prep Area", issue: "Dishwashing station overflowing.", status: "Urgent", priority: "High", time: "3 hours ago" },
    { id: "HYG-099", location: "Handwash Station", issue: "No liquid soap available.", status: "Resolved", priority: "Low", time: "Yesterday" }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Hygiene & Cleaning</h2>
          <p className="text-muted-foreground mt-2 font-medium">Monitor and assign cleaning tasks based on student reports.</p>
        </div>
        <button className="btn-3d px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <LucideFilter size={20} />
          Filter Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-3d p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-destructive">
            <LucideAlertTriangle size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">Urgent Action</span>
          </div>
          <span className="text-4xl font-extrabold text-foreground">2</span>
        </div>
        <div className="card-3d p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-orange-500">
            <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
            <span className="font-bold uppercase tracking-wider text-xs">Pending Review</span>
          </div>
          <span className="text-4xl font-extrabold text-foreground">8</span>
        </div>
        <div className="card-3d p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <LucideCheckCircle size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">Cleaned (Today)</span>
          </div>
          <span className="text-4xl font-extrabold text-foreground">14</span>
        </div>
      </div>

      <section className="card-3d p-6 md:p-8 relative overflow-hidden mt-2">
        <h3 className="text-xl font-extrabold text-foreground mb-6 drop-shadow-sm">Recent Reports</h3>
        <div className="grid grid-cols-1 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-background border border-border/50 rounded-2xl shadow-inner gap-4 card-3d-inset">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{r.id}</span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${
                    r.priority === 'High' ? 'bg-red-500 text-white' : 
                    r.priority === 'Medium' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                  }`}>{r.priority}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-sm">{r.location}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{r.issue}</p>
                <span className="text-xs text-muted-foreground font-semibold">{r.time}</span>
              </div>
              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm self-start md:self-auto ${
                  r.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                  r.status === 'Urgent' ? 'bg-destructive/10 text-destructive' : 'bg-orange-100 text-orange-700'
                }`}>
                  {r.status}
                </span>
                {r.status !== 'Resolved' && (
                  <button className="text-sm font-bold text-primary hover:underline">Mark as Cleaned</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
