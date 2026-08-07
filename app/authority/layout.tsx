"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LucideLayoutDashboard, LucideUsers, LucideAlertTriangle, LucideCheckCircle, LucideLogOut } from "lucide-react";

export default function AuthorityLayout({
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
        <div className="p-6 flex items-center gap-3 border-b border-border/50 bg-primary/5 rounded-t-xl">
          <h1 className="text-2xl font-bold text-primary">FoodBuddy</h1>
          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-bold ml-auto shadow-md">Admin</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2 hide-scrollbar">
          <Link href="/authority" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-all hover:bg-primary/20">
            <LucideLayoutDashboard size={20} />
            <span>Overview</span>
          </Link>
          <Link href="/authority/enroll-user" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideUsers size={20} />
            <span>Enroll User</span>
          </Link>
          <Link href="/authority/users" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideUsers size={20} />
            <span>Registered Users</span>
          </Link>
          <Link href="/authority/staff-ratings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideUsers size={20} />
            <span>Staff Ratings</span>
          </Link>
          <Link href="/authority/staff" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideUsers size={20} />
            <span>Manage Staff</span>
          </Link>
          <Link href="/authority/complaints-overview" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideAlertTriangle size={20} />
            <span>Complaints Tracker</span>
          </Link>
          <Link href="/authority/ratings-overview" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-all">
            <LucideCheckCircle size={20} />
            <span>Food & Hygiene</span>
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
              <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-md">
              AU
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-transparent items-center justify-between px-8 z-40 mt-4">
          <h2 className="font-bold text-foreground text-2xl drop-shadow-sm">Executive Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md btn-3d">
              AU
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
            <Link href="/authority" className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-3 py-1 active:scale-90 transition-all">
              <LucideLayoutDashboard size={20} />
              <span className="text-[10px] font-semibold mt-1">Overview</span>
            </Link>
            <Link href="/authority/staff" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideUsers size={20} />
              <span className="text-[10px] font-medium mt-1">Staff</span>
            </Link>
            <Link href="/authority/staff-ratings" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideUsers size={20} />
              <span className="text-[10px] font-medium mt-1">Ratings</span>
            </Link>
            <Link href="/authority/complaints-overview" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideAlertTriangle size={20} />
              <span className="text-[10px] font-medium mt-1">Issues</span>
            </Link>
            <Link href="/authority/ratings-overview" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all px-3 py-1">
              <LucideCheckCircle size={20} />
              <span className="text-[10px] font-medium mt-1">Food & Hygiene</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
