"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LucideLayoutDashboard, LucideUsers, LucideAlertTriangle, LucideUtensils, LucideSparkles, LucideMegaphone, LucideLogOut, LucideRecycle, LucideTicket, LucideBox } from "lucide-react";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] border border-border/50 bg-card z-50 card-3d m-4 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <h1 className="text-2xl font-bold text-primary">FoodBuddy</h1>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold ml-auto">Manager</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2 hide-scrollbar">
          <Link href="/manager" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-all hover:bg-primary/20">
            <LucideLayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/manager/attendance" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideUsers size={20} />
            <span>Attendance</span>
          </Link>
          <Link href="/manager/staff" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideUsers size={20} />
            <span>Staff</span>
          </Link>
          <Link href="/manager/complaints" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideAlertTriangle size={20} />
            <span>Complaints</span>
          </Link>
          <Link href="/manager/menu" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideUtensils size={20} />
            <span>Menu Update</span>
          </Link>
          <Link href="/manager/hygiene" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideSparkles size={20} />
            <span>Hygiene Reports</span>
          </Link>
          <Link href="/manager/notices" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideMegaphone size={20} />
            <span>Notices</span>
          </Link>
          <div className="my-2 border-t border-border/50"></div>
          <Link href="/manager/food-waste" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideRecycle size={20} />
            <span>Food Waste</span>
          </Link>
          <Link href="/manager/guest-bookings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideTicket size={20} />
            <span>Guest Bookings</span>
          </Link>
          <Link href="/manager/lost-and-found" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideBox size={20} />
            <span>Lost & Found</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border/50 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 font-bold transition-all">
            <LucideLogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
          <div className="flex justify-between items-center px-4 h-16 w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">FoodBuddy</h1>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">MGR</span>
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-transparent items-center justify-between px-8 z-40 mt-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
            <input className="pl-10 pr-4 py-2 rounded-xl border border-border/50 bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm w-72 transition-all card-3d-inset" placeholder="Search students, complaints..." type="text"/>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-muted-foreground hover:text-primary transition-colors relative btn-3d-secondary w-10 h-10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-sm">
              MG
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto pt-[80px] pb-[90px] md:pt-4 md:pb-8 px-4 md:px-8 w-full max-w-7xl mx-auto relative hide-scrollbar">
          {children}
        </main>

        {/* Bottom Nav (Mobile) */}
        <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-[72px] px-2 pb-safe w-full">
            <Link href="/manager" className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-3 py-1 active:scale-90 transition-all">
              <LucideLayoutDashboard size={20} />
              <span className="text-[10px] font-semibold mt-1">Dashboard</span>
            </Link>
            <Link href="/manager/attendance" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideUsers size={20} />
              <span className="text-[10px] font-medium mt-1">Attendance</span>
            </Link>
            <Link href="/manager/staff" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideUsers size={20} />
              <span className="text-[10px] font-medium mt-1">Staff</span>
            </Link>
            <Link href="/manager/complaints" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideAlertTriangle size={20} />
              <span className="text-[10px] font-medium mt-1">Issues</span>
            </Link>
            <Link href="/manager/menu" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideUtensils size={20} />
              <span className="text-[10px] font-medium mt-1">Menu</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
