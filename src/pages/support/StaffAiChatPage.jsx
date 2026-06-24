import { useEffect, useRef, useState } from "react";
import { Bot, SendHorizontal, Sparkles, X } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { useAuth } from "@hooks/useAuth";
import { getAutoReply } from "@services/aiChatService";
import { useTranslation } from "@hooks/useTranslation";
import { useAuthStore } from "@store/authStore";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

// â”€â”€ Typewriter hook: drains a text queue char-by-char into displayed text â”€â”€
function useTypewriter(speed = 18) {
  const queueRef = useRef(""); // pending characters to type out
  const displayRef = useRef(""); // what's currently displayed
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef(null);
  const onDoneRef = useRef(null);
  const activeRef = useRef(false);

  const start = (onDone) => {
    queueRef.current = "";
    displayRef.current = "";
    setDisplayed("");
    onDoneRef.current = onDone || null;
    activeRef.current = true;

    // Drain queue char-by-char
    intervalRef.current = setInterval(() => {
      if (queueRef.current.length > 0) {
        const char = queueRef.current[0];
        queueRef.current = queueRef.current.slice(1);
        displayRef.current += char;
        setDisplayed(displayRef.current);
      } else if (!activeRef.current) {
        // Queue empty + streaming finished â†’ done
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (onDoneRef.current) onDoneRef.current(displayRef.current);
      }
    }, speed);
  };

  const push = (text) => {
    queueRef.current += text;
  };

  const finish = () => {
    activeRef.current = false;
  };

  const stop = () => {
    activeRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stop(), []);

  return { displayed, start, push, finish, stop };
}

const StaffAiChatPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const messageEndRef = useRef(null);
  const AI_CHAT_ROOM = user?.email || "staffId";

  const [messages, setMessages] = useState([
    {
      id: "ai-welcome",
      roomId: AI_CHAT_ROOM,
      sender: "ai",
      type: "text",
      content: t(
        "chat.aiWelcome",
        "Hello! I'm your Artivox AI Assistant. I can help you with product information, order status, customer inquiries, and more. How can I assist you today?",
      ),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streamingId, setStreamingId] = useState(null); // which message is currently streaming

  const typewriter = useTypewriter(18);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, typewriter.displayed]);

  const handleSend = async (event) => {
    event.preventDefault();
    const promptText = input.trim();
    if (!promptText || thinking) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      roomId: AI_CHAT_ROOM,
      sender: "staff",
      type: "text",
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    const aiMessageId = `ai-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: aiMessageId,
        roomId: AI_CHAT_ROOM,
        sender: "ai",
        type: "text",
        content: "",
        confidence: 0.9,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");
    setThinking(true);
    setStreamingId(aiMessageId);

    // Start the typewriter ” when it finishes, save final text to messages state
    typewriter.start((finalText) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: finalText } : msg,
        ),
      );
      setStreamingId(null);
    });

    try {
      const history = messages
        .filter(
          (msg) => msg.id !== "ai-welcome" && !msg.id.startsWith("ai-welcome"),
        )
        .slice(-5)
        .map((msg) => ({
          senderType: msg.sender === "staff" ? "CUSTOMER" : "ADMIN",
          content: msg.content,
        }));

      const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api/v1";
      const token = useAuthStore.getState().accessToken;

      const response = await fetch(`${apiBase}/chat/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: promptText, history }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.token) {
                typewriter.push(parsed.token); // enqueue for typewriter
              }
            } catch (e) {
              // partial JSON ” skip
            }
          }
        }
      }

      // Signal to typewriter that no more data is coming
      typewriter.finish();
    } catch (error) {
      console.error("AI chat error, using local fallback:", error);
      typewriter.stop();

      const aiReply = getAutoReply(promptText);
      const fallbackContent =
        aiReply?.reply ||
        t(
          "chat.aiFallback",
          "I'm not sure I understand. Could you please rephrase your question?",
        );

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === aiMessageId) {
            return {
              ...msg,
              id: `ai-fallback-${Date.now()}`,
              content: fallbackContent,
              intent: aiReply?.intent || "fallback",
              confidence: aiReply?.confidence || 0,
            };
          }
          return msg;
        }),
      );
      setStreamingId(null);
    } finally {
      setThinking(false);
    }
  };

  const handleClearChat = () => {
    typewriter.stop();
    setStreamingId(null);
    setMessages([
      {
        id: `ai-welcome-${Date.now()}`,
        roomId: AI_CHAT_ROOM,
        sender: "ai",
        type: "text",
        content: t("chat.chatCleared", "Chat cleared. How can I help you?"),
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
              <div className="font-title text-2xl font-bold text-slate-950">
                {t("chat.title", "AI Assistant Chat")}
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-white">
                {t(
                  "chat.subtitle",
                  "Ask me anything about products, orders, or customers",
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t("chat.roomLabel", { id: AI_CHAT_ROOM })}
            </span>
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs"
              onClick={handleClearChat}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              {t("common.clear", "Clear")}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex min-h-[70vh] flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
            <Bot className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="font-title text-base font-semibold text-slate-950">
              {t("chat.aiName", "Artivox AI")}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500 dark:text-white">
                {t("common.online", "Online")}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((msg) => {
            // For the currently streaming message, show typewriter output
            const isStreaming = msg.id === streamingId;
            const displayContent = isStreaming
              ? typewriter.displayed
              : msg.content;

            return (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "staff" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.sender === "staff"
                      ? "bg-(--color-primary)/10"
                      : "bg-(--color-primary)/20 border border-(--color-primary)/20"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                        <Bot className="h-3 w-3" />
                        AI
                      </span>
                      {msg.confidence > 0.6 && !isStreaming && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          <Sparkles className="h-3 w-3" />
                          {t("chat.confident", "Confident")}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">
                    {displayContent ||
                      (thinking && msg.sender === "ai" ? (
                        <span className="flex gap-1 items-center py-1">
                          <span
                            className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </span>
                      ) : null)}
                    {isStreaming && (
                      <span className="inline-block w-0.5 h-4 bg-amber-500 animate-pulse ml-0.5 align-text-bottom" />
                    )}
                  </div>
                  <div
                    className={`mt-2 text-[11px] ${msg.sender === "staff" ? "" : "text-amber-500/80"}`}
                  >
                    {formatTime(msg.timestamp)}
                    {msg.sender === "ai" &&
                      msg.intent &&
                      msg.intent !== "fallback" && (
                        <span className="ml-2 italic opacity-60">
                          {msg.intent.replace("_", " ")}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 px-6 py-4"
        >
          <div className="flex items-end gap-3">
            <Input
              className="min-h-[48px]"
              placeholder={
                thinking
                  ? t("chat.aiThinking", "AI is thinking...")
                  : t(
                      "chat.askPlaceholder",
                      "Ask about products, orders, materials, or anything...",
                    )
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={thinking}
            />
            <Button
              type="submit"
              className="h-12 gap-2 px-5"
              disabled={thinking || !input.trim()}
            >
              <SendHorizontal className="h-4 w-4" />
              {t("common.send", "Send")}
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t("chat.poweredByAI", "Powered by AI knowledge base")}
            </span>
            <span>
              {t("chat.roomId", {
                id: AI_CHAT_ROOM,
                defaultValue: "Room ID: {{id}}",
              })}
            </span>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default StaffAiChatPage;
