"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { NutritionModal, MenuItem } from "@/components/NutritionModal";

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");
  const [todayMenu, setTodayMenu] = useState<any[]>([]);
  const [crowdLevel, setCrowdLevel] = useState("Low");
  const [crowdPercent, setCrowdPercent] = useState(0);
  const [foodWaste, setFoodWaste] = useState(45); // Mocked 45kg
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNutrition = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;
    const fetchData = async () => {
      const { data: userData } = await supabase
        .from("users")
        .select("name")
        .eq("email", user.email)
        .single();
      if (userData?.name) {
        setUserName(userData.name.split(" ")[0]);
      }

      const currentDay = new Date().getDay();
      const fetchId = currentDay === 0 ? 7 : currentDay;
      const { data: menuData } = await supabase
        .from("weekly_menu")
        .select("*")
        .eq("day_id", fetchId);
      
      if (menuData) {
        setTodayMenu(menuData);
      }

      // Fetch Live Attendance for Crowd Indicator
      const todayStr = new Date().toISOString().split("T")[0];
      const hour = new Date().getHours();
      let meal = "LUNCH";
      if (hour >= 6 && hour < 11) meal = "BREAKFAST";
      else if (hour >= 11 && hour < 16) meal = "LUNCH";
      else meal = "DINNER";

      const { count: liveCount } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("date", todayStr)
        .eq("meal_type", meal);
        
      const { count: studentCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      const expected = studentCount || 1200;
      const live = liveCount || 0;
      const percent = Math.min(100, Math.max(0, Math.round((live / expected) * 100)));
      
      setCrowdPercent(percent);
      if (percent > 70) setCrowdLevel("High");
      else if (percent > 30) setCrowdLevel("Medium");
      else setCrowdLevel("Low");
      
    };
    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <section className="mt-2 md:mt-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Good morning, {userName}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Ready for lunch?</h2>
        </div>
        <div className="hidden md:flex gap-3">
          <Link href="/student/attendance" className="btn-3d px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Scan QR
          </Link>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="md:col-span-8 flex flex-col gap-6 md:gap-8">
          
          {/* Live Crowd & Food Waste Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="card-3d p-5 flex items-center justify-between group cursor-default">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Crowd</h3>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-black drop-shadow-sm ${
                    crowdLevel === 'High' ? 'text-destructive' : 
                    crowdLevel === 'Medium' ? 'text-orange-500' : 'text-green-600'
                  }`}>{crowdLevel}</span>
                  <span className="text-sm font-bold text-muted-foreground pb-1">{crowdPercent}%</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${
                    crowdLevel === 'High' ? 'bg-destructive/10 text-destructive' : 
                    crowdLevel === 'Medium' ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-600'
                  }`}>
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
            </section>
            
            <section className="card-3d p-5 flex items-center justify-between group bg-gradient-to-br from-green-50 to-green-100/50 cursor-default">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider">Yesterday's Waste</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-green-900 drop-shadow-sm">{foodWaste} kg</span>
                </div>
                <p className="text-[10px] text-green-700 font-medium">Let's waste less food today!</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-200 text-green-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">recycling</span>
              </div>
            </section>
          </div>

          {/* Rate Today's Food */}
          <section className="card-3d p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-foreground">Rate Today's Lunch</h3>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className="text-sm text-muted-foreground">Tap a star to rate your meal experience.</p>
            </div>
            <div className="flex justify-center items-center gap-2 bg-background p-4 rounded-2xl border border-border/50 shadow-inner">
              {[1, 2, 3, 4, 5].map((star) => (
                <Link href="/student/rate-food" key={star} className="text-border hover:text-ring transition-transform hover:scale-110 p-1 active:scale-90">
                  <span className="material-symbols-outlined text-4xl md:text-5xl drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                </Link>
              ))}
            </div>
          </section>

          {/* View Today's Menu */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end px-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Today's Menu</h3>
              <Link href="/student/menu" className="text-sm text-primary font-bold flex items-center gap-1 hover:underline">
                See Full Week <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            
            {/* Menu Sections */}
            <div className="flex flex-col gap-6">
              {todayMenu.length > 0 ? (
                <>
                  {['BREAKFAST', 'LUNCH', 'DINNER'].map((mealType) => {
                    const items = todayMenu.filter(i => String(i.meal || i.meal_type || '').toUpperCase() === mealType);
                    if (items.length === 0) return null;
                    return (
                      <div key={mealType} className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-primary">{mealType}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {items.map((item, idx) => {
                            const bg = idx % 3 === 0 ? "bg-orange-100" : idx % 3 === 1 ? "bg-green-100" : "bg-yellow-100";
                            const mealStr = String(item.meal || item.meal_type || '').toUpperCase();
                            const icon = mealStr === "BREAKFAST" ? "free_breakfast" : mealStr === "LUNCH" ? "restaurant" : "soup_kitchen";
                            return (
                              <div key={item.id} onClick={() => handleOpenNutrition(item)} className="card-3d overflow-hidden flex flex-col group cursor-pointer">
                                <div className={`h-32 w-full ${bg} relative flex items-center justify-center transition-transform group-hover:scale-105`}>
                                  <span className="material-symbols-outlined text-6xl text-black/10 drop-shadow-sm">{icon}</span>
                                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${String(item.type).toUpperCase() === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {String(item.type).toUpperCase() === 'VEG' ? 'VEG' : 'NON-VEG'}
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col gap-1 bg-card border-t border-border/50 z-10">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-base font-bold text-foreground truncate">{item.name}</h4>
                                    {item.calories && (
                                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded whitespace-nowrap">{item.calories} kcal</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {/* Uncategorized Items */}
                  {(() => {
                    const uncategorized = todayMenu.filter(i => !['BREAKFAST', 'LUNCH', 'DINNER'].includes(String(i.meal || i.meal_type || '').toUpperCase()));
                    if (uncategorized.length === 0) return null;
                    return (
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-primary">Other / Uncategorized</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {uncategorized.map((item, idx) => {
                            const bg = idx % 3 === 0 ? "bg-orange-100" : idx % 3 === 1 ? "bg-green-100" : "bg-yellow-100";
                            return (
                              <div key={item.id} onClick={() => handleOpenNutrition(item)} className="card-3d overflow-hidden flex flex-col group cursor-pointer">
                                <div className={`h-32 w-full ${bg} relative flex items-center justify-center transition-transform group-hover:scale-105`}>
                                  <span className="material-symbols-outlined text-6xl text-black/10 drop-shadow-sm">restaurant</span>
                                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${String(item.type).toUpperCase() === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {String(item.type).toUpperCase() === 'VEG' ? 'VEG' : 'NON-VEG'}
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col gap-1 bg-card border-t border-border/50 z-10">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-base font-bold text-foreground truncate">{item.name}</h4>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="col-span-full text-center p-8 text-muted-foreground bg-muted/50 rounded-2xl border border-border/50 border-dashed card-3d-inset">
                  No menu items scheduled for today.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (Quick Actions & Activity) */}
        <div className="md:col-span-4 flex flex-col gap-6 md:gap-8">
          
          {/* Quick Actions Grid */}
          <section className="grid grid-cols-2 gap-4">
            <Link href="/student/hygiene" className="col-span-2 card-3d p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">cleaning_services</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-foreground">Hygiene & Quality</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Upload photos of issues</p>
              </div>
              <span className="material-symbols-outlined text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward_ios</span>
            </Link>

            <Link href="/student/staff-review" className="card-3d p-4 flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shadow-sm group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-xl">support_agent</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Staff Review</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Service</p>
              </div>
            </Link>

            <Link href="/student/suggestions" className="card-3d p-4 flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent shadow-sm group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-xl">lightbulb</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Suggest Food</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Ideas</p>
              </div>
            </Link>

            <Link href="/student/raise-complaint" className="card-3d p-4 flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shadow-sm group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-xl">assignment_late</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Other Issues</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Tickets</p>
              </div>
            </Link>

            <Link href="/student/notices" className="card-3d p-4 flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 shadow-sm group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-xl">campaign</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Notices</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Updates</p>
              </div>
            </Link>
            
            <Link href="/student/guest-booking" className="card-3d p-4 flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shadow-sm group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-xl">person_add</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Guest Meal</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Book Pass</p>
              </div>
            </Link>

            <Link href="/student/preferences" className="card-3d p-4 flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shadow-sm group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-xl">restaurant_menu</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Dietary Profile</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Preferences</p>
              </div>
            </Link>

            <Link href="/student/lost-and-found" className="card-3d p-4 flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 shadow-sm group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-xl">box</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Lost & Found</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Items</p>
              </div>
            </Link>
          </section>

          {/* Track My Complaints (Preview) */}
          <section className="flex flex-col gap-4 bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Recent Activity</h3>
              <Link href="/student/track-complaints" className="text-xs text-primary font-bold hover:underline">View All</Link>
            </div>
            
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-border/50"></div>
              
              <div className="flex gap-4 relative pb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0 z-10 border-4 border-card shadow-sm">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div className="flex flex-col pt-1 bg-background w-full p-3 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-foreground">Hygiene Report</h4>
                    <span className="text-[10px] text-muted-foreground">Yesterday</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Table cleanliness issue addressed.</p>
                  <span className="self-start bg-green-100 text-green-700 text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wide">Resolved</span>
                </div>
              </div>

              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 shrink-0 z-10 border-4 border-card shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                </div>
                <div className="flex flex-col pt-1 bg-background w-full p-3 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-foreground">Food Quality</h4>
                    <span className="text-[10px] text-muted-foreground">Today</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Undercooked rice complaint logged.</p>
                  <span className="self-start bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wide">In Review</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <NutritionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={selectedItem} />
    </div>
  );
}
