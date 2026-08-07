"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LucideChevronLeft, Loader2, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HygieneReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      let mediaUrl = "";
      if (file) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("hygiene").upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from("hygiene").getPublicUrl(filePath);
        mediaUrl = data.publicUrl;
      }

      const { data: dbUser } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (!dbUser) throw new Error("User not found in DB");

      await supabase.from("hygiene_reviews").insert({
        student_id: dbUser.id,
        date: new Date().toISOString().split("T")[0],
        description: description,
        media_urls: mediaUrl ? [mediaUrl] : [],
      });
      
      router.push("/student");
    } catch (error) {
      console.error("Error saving hygiene review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3">
        <Link href="/student" className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-muted active:scale-90 transition-all font-bold">
          <LucideChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-foreground drop-shadow-sm">Hygiene & Quality</h2>
          <p className="text-muted-foreground font-medium text-sm">Report hygiene issues with photo evidence.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="card-3d p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-foreground uppercase tracking-wider">Issue Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="E.g., Tables are dirty, plates not washed properly..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm resize-none card-3d-inset font-medium"
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center justify-between">
              Photo Evidence
              <span className="text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm font-extrabold">REQUIRED</span>
            </label>
            {preview ? (
              <div className="relative w-full h-48 bg-muted rounded-xl overflow-hidden border border-border shadow-inner card-3d-inset">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-lg font-bold shadow-md active:scale-90 transition-transform"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/50 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors shadow-inner card-3d-inset group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-3 bg-primary/10 rounded-full text-primary mb-3 group-hover:scale-110 transition-transform">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-primary">Tap to take a photo</p>
                  <p className="text-xs text-muted-foreground mt-1 font-semibold">Live evidence required</p>
                </div>
                <input type="file" required className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !description || !file}
          className="w-full btn-3d py-4 rounded-xl font-extrabold text-lg flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <ImagePlus size={24} />}
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
