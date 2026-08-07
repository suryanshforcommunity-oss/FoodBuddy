"use client";
import { AuthProvider } from "@/lib/auth-context";
import { ReactNode } from "react";

/** Client-side wrapper so the server root layout stays a Server Component. */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
