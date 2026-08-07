"use client";

import { useState } from "react";
import { LucideSend, LucideMegaphone, LucideTrash2 } from "lucide-react";

export default function ManagerNoticesPage() {
  const [notices, setNotices] = useState([
    { id: 1, title: "Special Dinner on Sunday", audience: "All Students", date: "Today", important: true },
    { id: 2, name: "Water Supply Interruption", audience: "Hostel A", date: "Yesterday", important: false },
  ]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("All Students");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setNotices([
      { id: Date.now(), title, audience, date: "Just now", important: false },
      ...notices
    ]);
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: number) => {
    setNotices(notices.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">Notices & Announcements</h2>
          <p className="text-muted-foreground mt-2 font-medium">Broadcast messages to students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Notice Form */}
        <div className="card-3d p-6 md:p-8 flex flex-col gap-6 h-fit">
          <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <LucideMegaphone size={24} className="text-primary" />
            New Announcement
          </h3>
          <form onSubmit={handlePost} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Audience</label>
              <select 
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
              >
                <option>All Students</option>
                <option>Hostel A</option>
                <option>Hostel B</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short heading..." 
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all card-3d-inset font-semibold"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-foreground uppercase tracking-wider">Message</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Detailed announcement content..." 
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none card-3d-inset font-medium"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="btn-3d w-full py-4 rounded-xl font-extrabold text-lg flex justify-center items-center gap-2 disabled:opacity-50 mt-2"
            >
              <LucideSend size={20} />
              Publish Notice
            </button>
          </form>
        </div>

        {/* Recent Notices */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-extrabold text-foreground mb-2">Recent Broadcasts</h3>
          {notices.map(notice => (
            <div key={notice.id} className="card-3d p-6 relative group overflow-hidden">
              {notice.important && (
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${
                    notice.audience === 'All Students' ? 'bg-primary/20 text-primary' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {notice.audience}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">{notice.date}</span>
                </div>
                <button 
                  onClick={() => handleDelete(notice.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <LucideTrash2 size={18} />
                </button>
              </div>
              <h4 className="font-bold text-lg text-foreground mb-1">{'title' in notice ? notice.title : notice.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
