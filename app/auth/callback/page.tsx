"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN ?? "college.edu";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const email = session.user.email ?? "";

      // Enforce college domain
      if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
        await supabase.auth.signOut();
        router.replace("/login?error=domain");
        return;
      }

      // Look up the user's role in Supabase by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        // First-time Google sign-in — auto-create a student profile
        await supabase.from("users").insert({
          uid: session.user.id,
          name: session.user.user_metadata?.full_name ?? email.split("@")[0],
          email,
          role: "student",
        });
        router.replace("/student");
        return;
      }

      const role = userData.role;
      if (role === "manager") router.replace("/manager");
      else if (role === "authority" || role === "warden") router.replace("/authority");
      else router.replace("/student");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="text-muted-foreground font-medium">Signing you in…</p>
    </div>
  );
}
