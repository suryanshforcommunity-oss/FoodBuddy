"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isMessEnrolled, supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Html5Qrcode } from "html5-qrcode";
import { LucideChevronLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function QRScannerPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"scanning" | "success" | "error" | "loading">("scanning");
  const [message, setMessage] = useState("");
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  // Tracks whether .start() has actually resolved — guards every .stop() call.
  const isScannerRunning = useRef(false);
  const { user } = useAuth();
  
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const stopScanner = async (reason?: string) => {
    if (!html5QrcodeRef.current) return;

    if (isScannerRunning.current) {
      isScannerRunning.current = false;
      try {
        await html5QrcodeRef.current.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }

    try {
      await html5QrcodeRef.current?.clear();
    } catch (error) {
      console.error("Error clearing scanner:", error);
    }

    html5QrcodeRef.current = null;
    setStatus("error");
    setMessage(reason || "Scan stopped.");
  };

  useEffect(() => {
    if (status !== "scanning") return;
    if (html5QrcodeRef.current) return;

    const scannerElement = document.getElementById("reader");
    if (!scannerElement) return;

    const html5Qrcode = new Html5Qrcode("reader");
    html5QrcodeRef.current = html5Qrcode;

    const onScanSuccess = async (decodedText: string) => {
      if (status !== "scanning") return;

      if (!isScannerRunning.current) return;

      let stopped = false;
      try {
        isScannerRunning.current = false;
        await html5Qrcode.stop();
        stopped = true;
      } catch (error) {
        console.error("Error stopping scanner:", error);
        setStatus("error");
        setMessage("Unable to stop camera before verifying.");
      }

      if (!stopped) {
        return;
      }

      await html5Qrcode.clear();
      html5QrcodeRef.current = null;
      setScanResult(decodedText);
      setStatus("loading");

      const currentUser = userRef.current;
      if (!currentUser) {
        setStatus("error");
        setMessage("You must be logged in.");
        return;
      }

      // ── Mess enrollment gate ───────────────────────────────────────────────
      // Checks Supabase (warden's table) before allowing attendance to be saved.
      const enrolled = await isMessEnrolled(currentUser.email ?? "");
      if (!enrolled) {
        setStatus("error");
        setMessage("You are not enrolled in the mess. Please contact the warden.");
        return;
      }
      // ────────────────────────────────────────────────────────────────────────
      
      try {
        // In a real app, you would hit a Cloud Function to validate the token securely.
        // For this demo, we simulate it.
        const tokenParts = decodedText.split("_"); 
        // Example expected format: FOODBUDDY_SESSION_LUNCH_20231025
        
        if (!decodedText.startsWith("FOODBUDDY_SESSION_")) {
          throw new Error("Invalid QR Code.");
        }
        
        const mealType = tokenParts[2] || "Unknown";
        
        // Fetch user name by email
        let studentName = currentUser.user_metadata?.full_name ?? "Unknown Student";
        const { data: userData } = await supabase
          .from("users")
          .select("name")
          .eq("email", currentUser.email)
          .single();
        if (userData?.name) {
          studentName = userData.name;
        }

        // Log attendance in Supabase
        const { data: dbUser } = await supabase.from("users").select("id").eq("email", currentUser.email).single();
        if (!dbUser) throw new Error("User not found in DB");

        const { error: insertError } = await supabase.from("attendance").insert({
          student_id: dbUser.id,
          student_name: studentName,
          date: new Date().toISOString().split("T")[0],
          meal_type: mealType,
          method: "QR",
          session_token: decodedText
        });

        if (insertError) throw insertError;

        setStatus("success");
        setMessage(`Attendance marked for ${mealType}!`);
        
        // Return to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/student");
        }, 3000);
        
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Failed to verify session.");
      }
    };

    const onScanError = (error: any) => {
      // Ignore scan errors as they happen constantly when no QR is found
    };

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          throw new Error("No cameras found");
        }

        const cameraId = devices[0].id;

        // Guard: bail out if this effect's instance was superseded (StrictMode
        // double-invoke) or the DOM node is gone. Comparing by reference ensures
        // only the LATEST instance proceeds, preventing the double-camera feed.
        if (html5QrcodeRef.current !== html5Qrcode || !document.getElementById("reader")) {
          return;
        }

        html5Qrcode
          .start(cameraId, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanError)
          .then(() => {
            isScannerRunning.current = true;
          })
          .catch((error) => {
            console.error("Failed to start scanner:", error);
            setStatus("error");
            setMessage("Unable to access camera.");
          });
      })
      .catch((error) => {
        console.error("Camera init error:", error);
        setStatus("error");
        setMessage("No camera available.");
      });

    return () => {
      const instance = html5QrcodeRef.current;
      html5QrcodeRef.current = null;
      if (instance) {
        const wasRunning = isScannerRunning.current;
        isScannerRunning.current = false;
        // Wrap clear() in Promise.resolve() because it returns void (not a
        // Promise) in some html5-qrcode versions, making .catch() undefined.
        (wasRunning ? instance.stop() : Promise.resolve())
          .catch(() => null)
          .finally(() => Promise.resolve(instance.clear()).catch(() => null));
      }
    };
  }, [status, router]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/student" className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted transition-colors">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <h2 className="text-xl font-bold text-foreground">Mark Attendance</h2>
      </div>

      <div className="bg-card glass-panel rounded-xl p-5 border border-border flex flex-col items-center gap-4 text-center min-h-[400px] justify-center relative overflow-hidden">
        {status === "scanning" && (
          <>
            <p className="text-sm text-muted-foreground mb-2">Point your camera at the QR code displayed at the mess counter.</p>
            <div id="reader" className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-primary/20"></div>
            <button
              type="button"
              onClick={() => stopScanner("Scan manually stopped.")}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Stop Scanning
            </button>
          </>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
            <p className="text-sm font-medium">Verifying Session...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Success!</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
              <XCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Scan Failed</h3>
            <p className="text-muted-foreground">{message}</p>
            <button 
              onClick={() => { setStatus("scanning"); setMessage(""); setScanResult(null); }}
              className="mt-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
