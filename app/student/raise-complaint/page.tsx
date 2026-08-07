"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LucideChevronLeft, Loader2, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function RaiseComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "Food Quality",
    description: "",
  });
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
        const { error: uploadError } = await supabase.storage.from("complaints").upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from("complaints").getPublicUrl(filePath);
        mediaUrl = data.publicUrl;
      }

      const { data: dbUser } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (!dbUser) throw new Error("User not found in DB");

      await supabase.from("complaints").insert({
        student_id: dbUser.id,
        date: new Date().toISOString().split("T")[0],
        category: formData.category,
        description: formData.description,
        status: "Pending",
        media_urls: mediaUrl ? [mediaUrl] : [],
      });
      
      router.push("/student/track-complaints");
    } catch (error) {
      console.error("Error saving complaint:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/student" className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted transition-colors">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <h2 className="text-xl font-bold text-foreground">Raise Complaint</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
          >
            <option>Food Quality</option>
            <option>Hygiene & Cleanliness</option>
            <option>Staff Behaviour</option>
            <option>Water & Utilities</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            placeholder="Please describe the issue in detail..."
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Attach Evidence (Optional)</label>
          {preview ? (
            <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border border-border">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-background/80 p-1.5 rounded-full text-foreground hover:bg-background"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or take a photo</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !formData.description}
          className="mt-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Submit Complaint
        </button>
      </form>
    </div>
  );
}
