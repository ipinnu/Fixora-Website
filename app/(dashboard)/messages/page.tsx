"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Thread { job_id: string; job_title: string; other_id: string; other_name: string; last_message: string; last_at: string; unread: number; }
interface Message { id: string; sender_id: string; body: string; created_at: string; }

function timeAgo(ts: string) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return new Date(ts).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function MessagesPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const activeJobId = params.get("job");

  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find(t => t.job_id === activeJobId);

  // Auth check
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id);
    });
  }, [router]);

  // Load threads
  const loadThreads = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("job_id, body, created_at, sender_id, receiver_id, read, jobs(title), sender:profiles!sender_id(full_name), receiver:profiles!receiver_id(full_name)")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!data) return;
    const map = new Map<string, Thread>();
    for (const m of data as Record<string, unknown>[]) {
      const jid = m.job_id as string;
      if (map.has(jid)) continue;
      const isMe = m.sender_id === userId;
      const other = isMe ? m.receiver as Record<string, unknown> : m.sender as Record<string, unknown>;
      const otherId = isMe ? m.receiver_id as string : m.sender_id as string;
      const unread = (data as Record<string, unknown>[]).filter(x => x.job_id === jid && x.receiver_id === userId && !x.read).length;
      map.set(jid, {
        job_id: jid,
        job_title: (m.jobs as Record<string, unknown>)?.title as string ?? "Job",
        other_id: otherId,
        other_name: other?.full_name as string ?? "User",
        last_message: m.body as string,
        last_at: m.created_at as string,
        unread,
      });
    }
    setThreads(Array.from(map.values()));
  }, [userId]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  // Load messages for active thread
  const loadMessages = useCallback(async () => {
    if (!activeJobId || !userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("job_id", activeJobId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    // Mark as read
    await supabase.from("messages").update({ read: true }).eq("job_id", activeJobId).eq("receiver_id", userId);
  }, [activeJobId, userId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!userId || !activeJobId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${activeJobId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `job_id=eq.${activeJobId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, activeJobId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!body.trim() || !activeThread || !userId) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from("messages").insert({
      job_id: activeJobId,
      sender_id: userId,
      receiver_id: activeThread.other_id,
      body: body.trim(),
      read: false,
    });
    setBody("");
    setSending(false);
    loadThreads();
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#09090A" }}>
      {/* Sidebar — thread list */}
      <div className={`${sidebarOpen || !activeJobId ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 flex-shrink-0 border-r`}
        style={{ borderColor: "#1E1E1A", backgroundColor: "#0F0E0C" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b flex-shrink-0" style={{ borderColor: "#1E1E1A" }}>
          <Link href="/" className="font-serif text-[20px]" style={{ color: "var(--color-ochre)" }}>FIXORA</Link>
          <span className="font-sans text-[13px] font-semibold" style={{ color: "var(--color-cream)" }}>Messages</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#1B1B17" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3A3A33" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p className="font-sans text-[13px]" style={{ color: "#3A3A33" }}>No conversations yet</p>
            </div>
          ) : (
            threads.map(t => (
              <button key={t.job_id} onClick={() => { router.push(`/messages?job=${t.job_id}`); setSidebarOpen(false); }}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 border-b"
                style={{ borderColor: "#1E1E1A", backgroundColor: t.job_id === activeJobId ? "rgba(200,134,26,0.06)" : "transparent" }}
                onMouseEnter={e => { if (t.job_id !== activeJobId) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { if (t.job_id !== activeJobId) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-sans text-[13px] font-semibold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.2), rgba(200,134,26,0.08))", color: "var(--color-ochre)" }}>
                  {t.other_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-sans text-[13px] font-semibold truncate" style={{ color: "var(--color-cream)" }}>{t.other_name}</span>
                    <span className="font-mono text-[10px] flex-shrink-0 ml-2" style={{ color: "#5A5A50" }}>{timeAgo(t.last_at)}</span>
                  </div>
                  <p className="font-sans text-[11px] mb-0.5 truncate" style={{ color: "#5A5A50" }}>{t.job_title}</p>
                  <p className="font-sans text-[12px] truncate" style={{ color: t.unread > 0 ? "var(--color-cream)" : "#5A5A50" }}>{t.last_message}</p>
                </div>
                {t.unread > 0 && (
                  <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono text-[10px] font-bold"
                    style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>{t.unread}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main — message area */}
      <div className={`${!activeJobId || sidebarOpen ? "hidden lg:flex" : "flex"} flex-1 flex-col min-w-0`}>
        {!activeJobId ? (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ color: "#3A3A33" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p className="font-sans text-[14px] mt-3">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 px-5 h-16 border-b flex-shrink-0" style={{ borderColor: "#1E1E1A", backgroundColor: "#0F0E0C" }}>
              <button className="lg:hidden mr-1" onClick={() => setSidebarOpen(true)} style={{ color: "#5A5A50" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4L6 10l6 6"/></svg>
              </button>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-sans text-[13px] font-semibold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.2), rgba(200,134,26,0.08))", color: "var(--color-ochre)" }}>
                {activeThread?.other_name.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="font-sans text-[14px] font-semibold" style={{ color: "var(--color-cream)" }}>{activeThread?.other_name}</p>
                <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{activeThread?.job_title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map(m => {
                  const mine = m.sender_id === userId;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%] rounded-2xl px-4 py-2.5"
                        style={{
                          background: mine ? "linear-gradient(135deg, #C8861A, #E8A040)" : "#1B1B17",
                          color: mine ? "#0D0D0B" : "var(--color-cream)",
                          borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        }}>
                        <p className="font-sans text-[14px] leading-relaxed">{m.body}</p>
                        <p className="font-mono text-[9px] mt-1 opacity-60 text-right">{timeAgo(m.created_at)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-end gap-3 px-5 py-4 border-t" style={{ borderColor: "#1E1E1A" }}>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none transition-all"
                style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)", maxHeight: "120px" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={send} disabled={sending || !body.trim()}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: body.trim() ? "linear-gradient(135deg, #C8861A, #E8A040)" : "#1B1B17", color: body.trim() ? "#0D0D0B" : "#3A3A33" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return <Suspense><MessagesPageContent /></Suspense>;
}
