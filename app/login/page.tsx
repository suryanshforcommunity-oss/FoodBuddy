"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LucideUtensils, Loader2, ChevronDown } from "lucide-react";

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN ?? "college.edu";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // ── Google Sign-In via Supabase OAuth (primary — for students) ────────────
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Hint the account picker to show the college Google account
          queryParams: { hd: ALLOWED_DOMAIN },
        },
      });
      if (error) throw error;
      // Page will redirect — no further action needed here
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  // ── Email/Password Sign-In via Supabase (for managers & authority) ────────
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Look up role in Supabase users table by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", data.user.email)
        .single();

      if (userError || !userData) {
        setError("User profile not found. Please contact administration.");
        await supabase.auth.signOut();
        return;
      }

      const role = userData.role;
      if (role === "manager") router.push("/manager");
      else if (role === "authority" || role === "warden") router.push("/authority");
      else router.push("/student");

    } catch (err: any) {
      setError(err.message?.includes("Invalid login")
        ? "Invalid email or password."
        : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Redirect from callback with errors ───────────────────────────────
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const domainError = searchParams?.get("error") === "domain";
  const notAddedError = searchParams?.get("error") === "not_added";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden glass-panel border border-border">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <LucideUtensils size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-card-foreground mb-2">
            Welcome to FoodBuddy
          </h1>
          <p className="text-center text-muted-foreground mb-8 text-sm">
            Sign in with your college Google account
          </p>

          {/* Error banner */}
          {(error || domainError || notAddedError) && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 border border-destructive/20 font-medium">
              {domainError
                ? `Only @${ALLOWED_DOMAIN} accounts are allowed. Please select your college email.`
                : notAddedError
                ? "Your account is not registered. Please contact your warden to get added."
                : error}
            </div>
          )}

          {/* ── Primary: Google Sign-In ── */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-border bg-background hover:bg-muted active:scale-95 transition-all font-semibold text-foreground shadow-sm mb-6 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          {/* ── Secondary: Email/Password (for admins) ── */}
          <div className="border-t border-border/50 pt-4">
            <button
              type="button"
              onClick={() => setShowAdminLogin((v) => !v)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Admin / Staff login
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showAdminLogin ? "rotate-180" : ""}`}
              />
            </button>

            {showAdminLogin && (
              <form onSubmit={handleEmailSignIn} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-secondary-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
                    placeholder="manager@college.edu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-foreground mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-3d py-3 rounded-xl font-extrabold flex justify-center items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
