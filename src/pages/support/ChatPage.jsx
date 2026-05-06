import { useEffect, useMemo, useRef, useState } from "react";
import {
  File,
  ImagePlus,
  Paperclip,
  SendHorizontal,
  MessageCircleMore,
  Search,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { createSupportChatSocket } from "@services/supportChatSocket";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useDebounce } from "@hooks/useDebounce";

const fakeCustomers = [
  {
    id: "cust-1",
    name: "Nguyen Minh 12",
    email: "customer12@example.com",
    online: true,
    unread: 2,
  },
  {
    id: "cust-2",
    name: "Tran Anh 07",
    email: "customer7@example.com",
    online: true,
    unread: 0,
  },
  {
    id: "cust-3",
    name: "Le Hieu 21",
    email: "customer21@example.com",
    online: false,
    unread: 1,
  },
  {
    id: "cust-4",
    name: "Pham Duc 03",
    email: "customer3@example.com",
    online: true,
    unread: 0,
  },
];

const initialConversations = {
  "cust-1": [
    {
      id: "seed-1",
      conversationId: "cust-1",
      sender: "customer",
      type: "text",
      content: "Hi, my resin order arrived damaged.",
      timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
    {
      id: "seed-2",
      conversationId: "cust-1",
      sender: "admin",
      type: "text",
      content: "Please send a photo. I will help process replacement.",
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
  ],
  "cust-2": [
    {
      id: "seed-3",
      conversationId: "cust-2",
      sender: "customer",
      type: "text",
      content: "Can I update shipping address for order AVX-91?",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
  ],
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const ChatPage = () => {
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messageEndRef = useRef(null);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeCustomerId, setActiveCustomerId] = useState(fakeCustomers[0].id);
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const customers = useMemo(() => {
    const ids = new Set([
      ...fakeCustomers.map((item) => item.id),
      ...Object.keys(conversations),
    ]);

    return Array.from(ids).map((id) => {
      const fallbackCustomer = fakeCustomers.find((item) => item.id === id) || {
        id,
        name: `Customer ${id}`,
        email: `${id}@example.com`,
        online: false,
      };
      const history = conversations[id] || [];
      const lastMessage = history[history.length - 1];

      return {
        ...fallbackCustomer,
        lastMessage: lastMessage?.content || "No messages yet",
        lastTimestamp: lastMessage?.timestamp || null,
      };
    });
  }, [conversations]);

  const activeMessages = conversations[activeCustomerId] || [];
  const activeCustomer =
    customers.find((item) => item.id === activeCustomerId) || customers[0];

  useEffect(() => {
    socketRef.current = createSupportChatSocket({
      onStatusChange: setConnectionStatus,
      onMessage: (incomingMessage) => {
        setConversations((prev) => ({
          ...prev,
          [incomingMessage.conversationId]: [
            ...(prev[incomingMessage.conversationId] || []),
            incomingMessage,
          ],
        }));
      },
    });

    return () => socketRef.current?.close();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const sendPayload = (type, content, metadata = {}) => {
    if (!content.trim()) return;

    const payload = {
      id: `msg-${Date.now()}`,
      conversationId: activeCustomerId,
      sender: "admin",
      type,
      content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    setConversations((prev) => ({
      ...prev,
      [activeCustomerId]: [...(prev[activeCustomerId] || []), payload],
    }));

    socketRef.current?.send(payload);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    sendPayload("text", message);
    setMessage("");
  };

  const handleFileSelect = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    sendPayload(type, file.name, { fileName: file.name });
    event.target.value = "";
  };

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-title text-2xl font-bold text-slate-950">
              Customer support chat
            </div>
            <div className="mt-1 text-sm text-slate-500">
              WebSocket channel ready for later swap.
            </div>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {connectionStatus}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="flex min-h-[70vh] flex-col p-4">
          <div className="border-b border-slate-200 px-3 pb-3">
            <div className="font-title text-lg font-semibold text-slate-950">
              Current chats
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Fallback fake customers shown when no prior chat exists.
            </div>
          </div>

          <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => setActiveCustomerId(customer.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeCustomerId === customer.id ? "border-amber-300 bg-amber-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-title text-sm font-semibold text-slate-900">
                      {customer.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {customer.email}
                    </div>
                  </div>
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${customer.online ? "bg-emerald-500" : "bg-slate-300"}`}
                  />
                </div>
                <div className="mt-3 truncate text-xs text-slate-500">
                  {customer.lastMessage}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-[70vh] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <div className="font-title text-lg font-semibold text-slate-950">
                {activeCustomer?.name}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {activeCustomer?.email}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {activeMessages.length
                ? `Last activity ${formatTime(activeMessages[activeMessages.length - 1].timestamp)}`
                : "No history"}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-6 py-6">
            {activeMessages.length ? (
              activeMessages.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${item.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${item.sender === "admin" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
                  >
                    <div className="text-sm">
                      {item.type === "image"
                        ? `Image: ${item.content}`
                        : item.type === "file"
                          ? `File: ${item.content}`
                          : item.content}
                    </div>
                    <div
                      className={`mt-2 text-[11px] ${item.sender === "admin" ? "text-white/70" : "text-slate-400"}`}
                    >
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No messages yet.
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white px-6 py-4"
          >
            <div className="flex items-end gap-3">
              <div className="flex flex-1 items-end gap-2">
                <Input
                  className="min-h-[48px]"
                  placeholder="Type support reply..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => handleFileSelect(event, "file")}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFileSelect(event, "image")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 w-12 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip style={{ width: 18, height: 18 }} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 w-12 p-0"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlus style={{ width: 18, height: 18 }} />
                </Button>
              </div>
              <Button type="submit" className="h-12 gap-2 px-5">
                <SendHorizontal style={{ width: 18, height: 18 }} />
                Send
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <File className="h-3.5 w-3.5" />
                File upload
              </div>
              <div className="flex items-center gap-1.5">
                <ImagePlus className="h-3.5 w-3.5" />
                Image upload
              </div>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ChatPage;
