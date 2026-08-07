import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// TODO: Replace NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// in .env.local with your real Supabase project credentials.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks whether a student (by their college email) is enrolled in the mess.
 * The warden marks enrollment in the Supabase table configured via env vars.
 *
 * Table config (set in .env.local):
 *   NEXT_PUBLIC_SUPABASE_ENROLLMENT_TABLE   — e.g. "mess_enrollment"
 *   NEXT_PUBLIC_SUPABASE_ENROLLMENT_EMAIL_COL — e.g. "college_email"
 *   NEXT_PUBLIC_SUPABASE_ENROLLMENT_FLAG_COL  — e.g. "is_enrolled" (boolean)
 */
export async function isMessEnrolled(email: string): Promise<boolean> {
  const table =
    process.env.NEXT_PUBLIC_SUPABASE_ENROLLMENT_TABLE ?? "mess_enrollment";
  const emailCol =
    process.env.NEXT_PUBLIC_SUPABASE_ENROLLMENT_EMAIL_COL ?? "college_email";
  const flagCol =
    process.env.NEXT_PUBLIC_SUPABASE_ENROLLMENT_FLAG_COL ?? "is_enrolled";

  const { data, error } = await supabase
    .from(table)
    .select(flagCol)
    .eq(emailCol, email)
    .maybeSingle(); // returns null (not error) when no row found

  if (error) {
    console.error("Supabase enrollment check error:", error.message);
    // Fail closed: if we can't verify, deny access.
    return false;
  }

  return (data as Record<string, any>)?.[flagCol] === true;
}
