"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { LucideUserPlus, Loader2, LucideCheckCircle } from "lucide-react";

export default function EnrollUserPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    year: "1",
    role: "student",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Create a secondary Supabase client to avoid altering the current session
      const secondarySupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );

      // Create the user in Auth
      const { data: authData, error: authError } = await secondarySupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Add the user to the Supabase users table
      const { error: dbError } = await supabase.from("users").insert({
        uid: authData.user?.id,
        name: formData.name,
        email: formData.email,
        roll_no: formData.rollNo,
        year: formData.year,
        role: formData.role,
      });

      if (dbError) throw dbError;
      
      setSuccess(true);
      setFormData({
        name: "",
        rollNo: "",
        year: "1",
        role: "student",
        email: "",
        password: "",
      });
      
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground drop-shadow-sm">Enroll New User</h2>
          <p className="text-muted-foreground mt-2 font-medium">Create verified accounts for students, managers, and staff.</p>
        </div>
      </div>

      <div className="card-3d p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10 blur-2xl pointer-events-none"></div>

        {success && (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl mb-6 flex items-center gap-3 font-semibold border border-green-200">
            <LucideCheckCircle className="text-green-600" />
            User successfully enrolled and added to the database!
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 font-semibold border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-4 border-b border-border/50 pb-2">Personal Details</h3>
              
              <div>
                <label className="block text-sm font-bold text-secondary-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-secondary-foreground mb-2">Roll Number</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
                    placeholder="e.g. 2024CS01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-foreground mb-2">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold cursor-pointer"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="N/A">Not Applicable (Staff)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-4 border-b border-border/50 pb-2">Account Settings</h3>
              
              <div>
                <label className="block text-sm font-bold text-secondary-foreground mb-2">System Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="manager">Mess Manager</option>
                  <option value="authority">Warden / Authority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
                  placeholder="student@college.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary-foreground mb-2">Temporary Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
          </div>

          <div className="pt-4 border-t border-border/50 mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-3d py-4 px-8 rounded-xl font-extrabold text-lg flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <LucideUserPlus size={20} />
                  Enroll User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
