"use client";

import Link from "next/link";
import { LucideChevronLeft, LucidePin } from "lucide-react";

export default function NoticesPage() {
  const notices = [
    {
      id: 1,
      title: "Festive Special Dinner",
      date: "Aug 15, 2026",
      content: "There will be a special Independence Day dinner tomorrow. The regular menu is suspended.",
      type: "important",
      bg: "bg-red-50",
      border: "border-red-200"
    },
    {
      id: 2,
      title: "Water Supply Interruption",
      date: "Aug 10, 2026",
      content: "Due to maintenance, RO water dispensers will be unavailable between 2 PM and 4 PM today.",
      type: "alert",
      bg: "bg-orange-50",
      border: "border-orange-200"
    },
    {
      id: 3,
      title: "Menu Update",
      date: "Aug 01, 2026",
      content: "Based on student feedback, Dal Makhani has been added to the Sunday Dinner menu.",
      type: "info",
      bg: "bg-blue-50",
      border: "border-blue-200"
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-2 md:mb-6">
        <Link href="/student" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm">Notice Board</h2>
          <p className="text-sm text-muted-foreground mt-1">Important updates from the mess authority</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className={`card-3d p-6 relative overflow-hidden ${notice.bg} border-2 ${notice.border}`}>
            <div className="absolute top-4 right-4 text-muted-foreground/50 rotate-45">
              <LucidePin size={28} />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm ${
                notice.type === 'important' ? 'bg-red-500 text-white' : 
                notice.type === 'alert' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {notice.type}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">{notice.date}</span>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2 pr-8">{notice.title}</h3>
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
              {notice.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
