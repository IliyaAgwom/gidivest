"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  message: string;
  sender: "USER" | "ADMIN";
  createdAt: string;
  read: boolean;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasShownPrompt = useRef(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat/messages");
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data);
      if (!open) {
        const newUnread = data.filter(m => m.sender === "ADMIN" && !m.read).length;
        setUnread(newUnread);
      }
    } catch {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [open]);

  // Show welcome prompt once per session
  useEffect(() => {
    if (!hasShownPrompt.current) {
      hasShownPrompt.current = true;
      setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 8000);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
      }
    } catch {}
    setSending(false);
  };

  return (
    <>
      {/* Welcome prompt bubble */}
      {showPrompt && !open && (
        <div
          className="fixed bottom-24 right-6 z-40 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-2xl rounded-br-sm shadow-xl px-4 py-3 max-w-[220px] cursor-pointer animate-fade-in"
          onClick={() => { setOpen(true); setShowPrompt(false); }}
        >
          <p className="text-sm font-semibold text-navy-900 dark:text-white">👋 Hi! Need help?</p>
          <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">Our team is ready to assist you.</p>
        </div>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "440px" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-white font-semibold text-sm">Support Chat</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-navy-50 dark:bg-navy-950">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 opacity-60">
                <MessageCircle className="w-8 h-8 text-navy-400" />
                <p className="text-xs text-navy-500 dark:text-navy-400">Send us a message and we'll respond shortly.</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.sender === "USER"
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-navy-800 text-navy-900 dark:text-white border border-navy-100 dark:border-navy-700 rounded-bl-sm"
                }`}>
                  {msg.sender === "ADMIN" && (
                    <p className="text-[10px] font-bold text-emerald-500 mb-0.5">Support</p>
                  )}
                  <p>{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === "USER" ? "text-emerald-200" : "text-navy-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm rounded-xl bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-navy-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setOpen(v => !v); setShowPrompt(false); setUnread(0); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
