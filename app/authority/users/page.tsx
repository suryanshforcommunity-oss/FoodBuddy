"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LucideUsers, LucideSearch, LucideShieldAlert, LucideFilter } from "lucide-react";
import Link from "next/link";

export default function RegisteredUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (user.roll_no?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "student":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Student</span>;
      case "manager":
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Manager</span>;
      case "authority":
      case "warden":
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{role}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground drop-shadow-sm">Registered Users</h2>
          <p className="text-muted-foreground mt-2 font-medium">Manage and view all accounts registered in the system.</p>
        </div>
        <Link href="/authority/enroll-user" className="btn-3d px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <LucideUsers size={20} />
          Enroll New User
        </Link>
      </div>

      <div className="card-3d p-6 relative overflow-hidden flex flex-col gap-6 min-h-[500px]">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-1 shadow-sm shrink-0 card-3d-inset">
            <LucideFilter size={18} className="text-muted-foreground" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-sm font-bold border-none focus:ring-0 py-2 outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="manager">Mess Managers</option>
              <option value="authority">Admins/Wardens</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-x-auto hide-scrollbar rounded-xl border border-border/50 bg-background/50">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-primary/5 text-muted-foreground border-b border-border/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Name</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">ID / Roll No</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Email</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Role</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="w-32 h-4 bg-muted rounded"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                        </div>
                        <span className="font-bold text-foreground">{user.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-muted-foreground">{user.roll_no || "N/A"}</td>
                    <td className="p-4 font-medium text-muted-foreground">{user.email}</td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4 font-medium text-muted-foreground text-right">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <LucideShieldAlert size={40} className="opacity-20" />
                      <p className="font-medium text-base">No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
