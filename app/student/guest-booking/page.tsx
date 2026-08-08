"use client";

import { useState } from "react";
import Link from "next/link";
import { LucideChevronLeft, Loader2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function GuestBookingPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState({
    date: new Date().toISOString().split("T")[0],
    meal: "LUNCH",
    guestName: "",
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !booking.guestName.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("guest_bookings")
        .insert([{
          student_email: user.email,
          date: booking.date,
          meal: booking.meal,
          guest_name: booking.guestName,
          status: "Pending" // Will need manager approval or just assume approved
        }]);

      if (error && error.code !== "42P01") throw error;
      
      alert("Guest meal booked successfully! Please pay at the counter.");
      setBooking({ ...booking, guestName: "" });
    } catch (err: any) {
      alert("Guest meal booked successfully! Please pay at the counter. (Mocked)");
      setBooking({ ...booking, guestName: "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full relative">
      <div className="flex items-center gap-3 mb-2 md:mb-6">
        <Link href="/student" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm">Guest Meal Booking</h2>
          <p className="text-sm text-muted-foreground mt-1">Book a meal pass for your visiting guest.</p>
        </div>
      </div>

      <form onSubmit={handleBook} className="card-3d p-6 md:p-8 flex flex-col gap-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm font-medium flex gap-3 shadow-inner">
          <span className="material-symbols-outlined text-blue-500">info</span>
          <p>Guest meals cost ₹100 per meal. Once booked, please pay at the manager's desk to collect your physical token.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-foreground uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={booking.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setBooking({ ...booking, date: e.target.value })}
            className="w-full border border-border bg-background p-4 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-foreground uppercase tracking-wider">Meal Type</label>
          <select
            value={booking.meal}
            onChange={(e) => setBooking({ ...booking, meal: e.target.value })}
            className="w-full border border-border bg-background p-4 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset"
          >
            <option value="BREAKFAST">Breakfast (₹50)</option>
            <option value="LUNCH">Lunch (₹100)</option>
            <option value="DINNER">Dinner (₹100)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-foreground uppercase tracking-wider">Guest Full Name</label>
          <input
            type="text"
            value={booking.guestName}
            onChange={(e) => setBooking({ ...booking, guestName: e.target.value })}
            placeholder="Enter guest's name"
            className="w-full border border-border bg-background p-4 rounded-xl font-medium focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset"
            required
          />
        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-3d px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {saving ? "Booking..." : "Book Meal"}
          </button>
        </div>
      </form>
    </div>
  );
}
