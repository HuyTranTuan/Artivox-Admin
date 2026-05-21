import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, SendHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { useAuth } from "@hooks/useAuth";
import { getAutoReply } from "@services/aiChatService";
import { useTranslation } from "@hooks/useTranslation";
import { useUiStore } from "@store/uiStore";

const AI_CHAT_ROOM = "staffId";

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const StaffAiChatPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useUiStore();
  const messageEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: "ai-welcome",
      roomId: AI_CHAT_ROOM,
      sender: "ai",
      type: "text",
      content: "Hello! I'm your Artivox AI Assistant. I can help you with product information, order status, customer inquiries, and more. How can I assist you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      roomId: AI_CHAT_ROOM,
      sender: "staff",
      type: "text",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI processing delay
    setTimeout(() => {
      const aiReply = getAutoReply(input.trim());
      const aiMessage = {
        id: `ai-${Date.now()}`,
        roomId: AI_CHAT_ROOM,
        sender: "ai",
        type: "text",
        content: aiReply?.reply || "I'm not sure I understand. Could you please rephrase your question?",
        intent: aiReply?.intent || "fallback",
        confidence: aiReply?.confidence || 0,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 600);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `ai-welcome-${Date.now()}`,
        roomId: AI_CHAT_ROOM,
        sender: "ai",
        type: "text",
        content: "Chat cleared. How can I help you?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-title text-2xl font-bold text-slate-950">AI Assistant Chat</div>
              <div className="mt-1 text-sm text-slate-500">Ask me anything about products, orders, or customers</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Room: {AI_CHAT_ROOM}
            </span>
            <Button variant="ghost" className="h-9 px-3 text-xs" onClick={handleClearChat}>
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex min-h-[70vh] flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Bot className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="font-title text-base font-semibold text-slate-950">Artivox AI</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-6 py-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "staff" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.sender === "staff" ? "bg-slate-950 text-white" : "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-slate-800"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      <Bot className="h-3 w-3" />
                      AI
                    </span>
                    {msg.confidence > 0.6 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Sparkles className="h-3 w-3" />
                        Confident
                      </span>
                    )}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div className={`mt-2 text-[11px] ${msg.sender === "staff" ? "text-white/70" : "text-amber-500/80"}`}>
                  {formatTime(msg.timestamp)}
                  {msg.sender === "ai" && msg.intent && msg.intent !== "fallback" && <span className="ml-2 italic opacity-60">{msg.intent.replace("_", " ")}</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-end gap-3">
            <Input className="min-h-[48px]" placeholder="Ask about products, orders, materials, or anything..." value={input} onChange={(e) => setInput(e.target.value)} />
            <Button type="submit" className="h-12 gap-2 px-5">
              <SendHorizontal className="h-4 w-4" />
              Send
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by AI knowledge base
            </span>
            <span>Room ID: {AI_CHAT_ROOM}</span>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default StaffAiChatPage;
