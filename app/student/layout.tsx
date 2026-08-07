"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function StudentLayout({ children }: { children: ReactNode }) {
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
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">FB</div>
          <h1 className="text-2xl font-bold text-foreground">FoodBuddy</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto hide-scrollbar">
          <Link href="/student" className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary font-semibold transition-all hover:bg-primary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Dashboard
          </Link>
          <Link href="/student/menu" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">restaurant_menu</span>
            Menu
          </Link>
          <Link href="/student/track-complaints" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">report_problem</span>
            Issues & Complaints
          </Link>
          <Link href="/student/attendance" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            QR Scanner
          </Link>
          <Link href="/student/notices" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">campaign</span>
            Notices
          </Link>
          <Link href="/student/rules" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">rule</span>
            Rules & Regulations
          </Link>
          <div className="my-2 border-t border-border/50"></div>
          <Link href="/student/preferences" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">restaurant_menu</span>
            Dietary Profile
          </Link>
          <Link href="/student/guest-booking" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">person_add</span>
            Guest Booking
          </Link>
          <Link href="/student/lost-and-found" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <span className="material-symbols-outlined">box</span>
            Lost & Found
          </Link>
        </nav>
        <div className="p-4 border-t border-border/50">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-destructive hover:bg-destructive/10 font-bold transition-all">
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
          <div className="flex justify-between items-center px-4 h-16 w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center text-primary font-bold">
                FB
              </div>
              <h1 className="text-xl font-bold text-foreground">FoodBuddy</h1>
            </div>
            <button aria-label="Notifications" className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pt-[80px] pb-[120px] md:pt-4 md:pb-4 px-4 md:px-8 w-full max-w-7xl mx-auto relative hide-scrollbar">
          {children}
        </main>

        {/* Floating QR Scanner Button (Mobile) */}
        <div className="md:hidden fixed bottom-[60px] left-1/2 -translate-x-1/2 z-[60] pointer-events-none w-full flex justify-center">
          <Link href="/student/attendance" className="pointer-events-auto w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-background active:scale-90 transition-transform -translate-y-4 btn-3d">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
          </Link>
        </div>

        {/* Bottom Nav (Mobile) */}
        <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-[72px] px-2 pb-safe w-full">
            <Link href="/student" className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-1 active:scale-90 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="text-[10px] font-semibold mt-1">Home</span>
            </Link>
            <Link href="/student/menu" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-4 py-1">
              <span className="material-symbols-outlined">restaurant_menu</span>
              <span className="text-[10px] font-medium mt-1">Menu</span>
            </Link>
            <div className="w-16"></div> {/* Spacer */}
            <Link href="/student/track-complaints" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-4 py-1">
              <span className="material-symbols-outlined">report_problem</span>
              <span className="text-[10px] font-medium mt-1">Issues</span>
            </Link>
            <button onClick={handleLogout} className="flex flex-col items-center justify-center text-destructive active:scale-90 transition-all px-4 py-1">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-[10px] font-bold mt-1">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
