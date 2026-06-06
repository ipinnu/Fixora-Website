"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_ICON: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  new_job: {
    color: "#C8861A",
    bg: "rgba(200,134,26,0.1)",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  },
  bid_received: {
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  bid_accepted: {
    color: "#2ECC6A",
    bg: "rgba(46,204,106,0.1)",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  },
  bid_declined: {
    color: "#E84545",
    bg: "rgba(232,69,69,0.08)",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  },
};

export default function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newPing, setNewPing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unread = notifications.filter(n => !n.read).length;

  // Initial fetch
  useEffect(() => {
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setNotifications(data as Notification[]);
      });
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as Notification;
          setNotifications(prev => [n, ...prev]);
          setNewPing(true);
          setTimeout(() => setNewPing(false), 2000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (!unreadIds.length) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <motion.button
        type="button"
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200"
        style={{ backgroundColor: open ? "rgba(200,134,26,0.12)" : "rgba(255,255,255,0.04)", color: "#7A7A6A" }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.04)"; }}
      >
        <motion.div
          animate={newPing ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: open ? "var(--color-ochre)" : "#7A7A6A" }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </motion.div>

        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono text-[10px] font-bold px-1"
            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
            style={{ backgroundColor: "#141412", border: "1px solid #2A2A25", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1E1E1A" }}>
              <span className="font-sans text-[14px] font-semibold" style={{ color: "var(--color-cream)" }}>
                Notifications
                {unread > 0 && (
                  <span className="ml-2 font-mono text-[11px] rounded-full px-2 py-0.5" style={{ backgroundColor: "rgba(200,134,26,0.15)", color: "var(--color-ochre)" }}>
                    {unread} new
                  </span>
                )}
              </span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="font-sans text-[11px] transition-colors duration-150"
                  style={{ color: "#5A5A50" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-ochre)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#1B1B17" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3A3A33" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <p className="font-sans text-[13px]" style={{ color: "#3A3A33" }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const cfg = TYPE_ICON[n.type] ?? TYPE_ICON.new_job;
                  return (
                    <motion.button
                      key={n.id}
                      type="button"
                      onClick={() => markRead(n.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150"
                      style={{ backgroundColor: n.read ? "transparent" : "rgba(200,134,26,0.04)" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.03)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = n.read ? "transparent" : "rgba(200,134,26,0.04)")}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] font-medium leading-snug mb-0.5"
                          style={{ color: n.read ? "#7A7A6A" : "var(--color-cream)" }}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="font-sans text-[12px] truncate" style={{ color: "#5A5A50" }}>{n.body}</p>
                        )}
                        <p className="font-mono text-[10px] mt-1" style={{ color: "#3A3A33" }}>{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "var(--color-ochre)" }} />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
