"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LucideUsers, LucidePlus, LucideTrash2, LucideLoader2 } from "lucide-react";

export default function ManageStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    shift: "",
    contact: "",
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error && error.code !== "42P01") throw error; // Ignore undefined table initially
      setStaffList(data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { error } = await supabase
        .from("staff")
        .insert([
          {
            name: formData.name,
            role: formData.role,
            shift: formData.shift,
            contact: formData.contact,
          }
        ]);
      if (error) throw error;
      
      setFormData({ name: "", role: "", shift: "", contact: "" });
      await fetchStaff();
    } catch (err) {
      console.error("Error adding staff:", err);
      alert("Failed to add staff member. Check if the 'staff' table is created.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      await fetchStaff();
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Failed to delete staff member.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground drop-shadow-sm">Manage Staff</h2>
          <p className="text-muted-foreground mt-2 font-medium">Add, view, and remove mess staff members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="card-3d p-6 h-fit">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <LucidePlus size={20} className="text-primary" />
            Add New Staff
          </h3>
          <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset font-semibold text-sm"
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">Role</label>
              <select 
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset font-semibold text-sm"
              >
                <option value="" disabled>Select Role</option>
                <option value="Head Chef">Head Chef</option>
                <option value="Cook">Cook</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Server">Server</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">Shift</label>
              <select 
                required
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset font-semibold text-sm"
              >
                <option value="" disabled>Select Shift</option>
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Evening">Evening (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
                <option value="All Day">All Day</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">Contact (Optional)</label>
              <input 
                type="text" 
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all card-3d-inset font-semibold text-sm"
                placeholder="e.g., +91 9876543210"
              />
            </div>
            <button 
              type="submit" 
              disabled={adding}
              className="btn-3d w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-70 cursor-pointer"
            >
              {adding ? <LucideLoader2 size={18} className="animate-spin" /> : <LucidePlus size={18} />}
              {adding ? "Adding..." : "Add Staff"}
            </button>
          </form>
        </div>

        {/* Staff List */}
        <div className="card-3d p-6 lg:col-span-2 flex flex-col min-h-[400px]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <LucideUsers size={20} className="text-primary" />
            Current Staff
          </h3>
          
          <div className="flex-1 overflow-x-auto hide-scrollbar rounded-xl border border-border/50 bg-background/50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-primary/5 text-muted-foreground border-b border-border/50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Name</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Role & Shift</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Contact</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="w-32 h-4 bg-muted rounded"></div>
                      </div>
                    </td>
                  </tr>
                ) : staffList.length > 0 ? (
                  staffList.map((staff) => (
                    <tr key={staff.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {staff.name ? staff.name.substring(0, 2).toUpperCase() : "ST"}
                          </div>
                          <span className="font-bold text-foreground">{staff.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground text-xs">{staff.role}</span>
                          <span className="text-muted-foreground text-xs">{staff.shift}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-muted-foreground">{staff.contact || "N/A"}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(staff.id)}
                          className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all ml-auto cursor-pointer"
                          title="Remove Staff"
                        >
                          <LucideTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-muted-foreground">
                      <p className="font-medium text-base">No staff members found.</p>
                      <p className="text-sm mt-1">Add staff using the form.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
