"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, Loader2, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  message: string;
  sender: "USER" | "ADMIN";
  createdAt: string;
}

interface Conversation {
  userId: string;
  user: { id: string; name: string; email: string };
  lastMessage: string;
  unread: number;
  totalMessages: number;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    const res = await fetch("/api/admin/chat");
    if (res.ok) setConversations(await res.json());
    setLoading(false);
  };

  const fetchMessages = async (userId: string) => {
    const res = await fetch(`/api/admin/chat?userId=${userId}`);
    if (res.ok) setMessages(await res.json());
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.userId);
    const interval = setInterval(() => fetchMessages(selected.userId), 5000);
    return () => clearInterval(interval);
  }, [selected]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selected || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply("");
    await fetch("/api/admin/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected.userId, message: text }),
    });
    fetchMessages(selected.userId);
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Chat</h1>
        <p className="text-navy-400">Respond to investor messages.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden flex" style={{ height: "600px" }}>
        {/* Inbox */}
        <div className="w-72 border-r border-navy-700 flex flex-col shrink-0">
          <div className="p-4 border-b border-navy-700">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" /> Conversations
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-navy-400 text-sm p-6">No messages yet.</p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.userId}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left p-4 border-b border-navy-700 hover:bg-navy-700 transition-colors ${selected?.userId === conv.userId ? "bg-navy-700" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-white truncate">{conv.user?.name || "User"}</p>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy-400 truncate mt-0.5">{conv.user?.email}</p>
                  <p className="text-xs text-navy-500 mt-1">{conv.totalMessages} messages</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-navy-400 gap-3">
              <MessageCircle className="w-10 h-10 opacity-30" />
              <p className="text-sm">Select a conversation to start replying</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-navy-700 flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="md:hidden text-navy-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <p className="font-semibold text-white">{selected.user?.name}</p>
                  <p className="text-xs text-navy-400">{selected.user?.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-navy-900">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "ADMIN" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === "ADMIN"
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-navy-800 text-white border border-navy-700 rounded-bl-sm"
                    }`}>
                      {msg.sender === "USER" && <p className="text-[10px] text-emerald-400 font-bold mb-0.5">{selected.user?.name}</p>}
                      <p>{msg.message}</p>
                      <p className="text-[10px] mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              <form onSubmit={sendReply} className="flex gap-2 p-4 border-t border-navy-700">
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 bg-navy-900 border border-navy-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
