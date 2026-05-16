import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, File, ImagePlus, Paperclip, SendHorizontal, Bot, Sparkles, X, Eye, ChevronLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import ImageViewer from "@components/ui/ImageViewer";
import { createSupportChatSocket } from "@services/supportChatSocket";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const fakeCustomers = [
  { id: "cust-1", name: "Nguyen Minh 12", online: true },
  { id: "cust-2", name: "Tran Anh 07", online: true },
  { id: "cust-3", name: "Le Hieu 21", online: false },
  { id: "cust-4", name: "Pham Duc 03", online: true },
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

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const isImageType = (type) => type && type.startsWith("image/");

const MessageContent = ({ message, onImageClick }) => {
  const [imageError, setImageError] = useState(false);

  if (message.type === "image" || (message.type === "file" && isImageType(message.mimeType))) {
    const imageUrl = message.fileData || message.content;
    const displayName = message.fileName || message.content || "Image";

    if (imageUrl && !imageError) {
      return (
        <div className="space-y-1.5">
          <div className="relative group rounded-lg overflow-hidden cursor-pointer border border-slate-200/50" onClick={() => onImageClick(imageUrl, displayName)}>
            <img src={imageUrl} alt={displayName} className="max-w-full max-h-48 object-contain bg-slate-100" onError={() => setImageError(true)} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-200">
              <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs truncate flex-1">{displayName}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(imageUrl, displayName);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors shrink-0"
            >
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <File className="h-5 w-5 text-slate-400 shrink-0" />
          <span className="text-sm truncate flex-1">{displayName}</span>
        </div>
        <button
          type="button"
          onClick={() => downloadFile(imageUrl || "#", displayName)}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
          disabled={!imageUrl}
        >
          <Download className="h-3 w-3" /> Download
        </button>
      </div>
    );
  }

  if (message.type === "file") {
    const fileUrl = message.fileData || "#";
    const displayName = message.fileName || message.content || "File";
    const fileSize = message.fileSize ? formatFileSize(message.fileSize) : null;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <File className="h-5 w-5 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{displayName}</div>
            {fileSize && <div className="text-[10px] text-slate-400">{fileSize}</div>}
          </div>
          <button
            type="button"
            onClick={() => downloadFile(fileUrl, displayName)}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors shrink-0"
            disabled={!message.fileData}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return <div className="text-sm">{message.content}</div>;
};

const ChatPage = () => {
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messageEndRef = useRef(null);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeCustomerId, setActiveCustomerId] = useState(fakeCustomers[0].id);
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [uploadError, setUploadError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [customerListOpen, setCustomerListOpen] = useState(true);

  const customers = useMemo(() => {
    const ids = new Set([...fakeCustomers.map((item) => item.id), ...Object.keys(conversations)]);
    return Array.from(ids).map((id) => {
      const fallbackCustomer = fakeCustomers.find((item) => item.id === id) || { id, name: `Customer ${id}`, online: false };
      const history = conversations[id] || [];
      const lastMessage = history[history.length - 1];
      return {
        ...fallbackCustomer,
        isActive: activeCustomerId === id,
        lastMessage:
          lastMessage?.type === "file" || lastMessage?.type === "image"
            ? `[${lastMessage.type === "image" ? "Image" : "File"}] ${lastMessage.fileName || lastMessage.content}`
            : lastMessage?.content || "No messages yet",
        lastTimestamp: lastMessage?.timestamp || null,
      };
    });
  }, [conversations, activeCustomerId]);

  const activeMessages = conversations[activeCustomerId] || [];
  const activeCustomer = customers.find((item) => item.id === activeCustomerId) || customers[0];

  useEffect(() => {
    socketRef.current = createSupportChatSocket({
      onStatusChange: setConnectionStatus,
      onMessage: (incomingMessage) => {
        setConversations((prev) => ({
          ...prev,
          [incomingMessage.conversationId]: [...(prev[incomingMessage.conversationId] || []), incomingMessage],
        }));
      },
    });
    return () => socketRef.current?.close();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const sendPayload = (type, content, metadata = {}) => {
    if (type === "text" && !content.trim()) return;
    const payload = {
      id: `msg-${Date.now()}`,
      conversationId: activeCustomerId,
      sender: "admin",
      type,
      content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    setConversations((prev) => ({ ...prev, [activeCustomerId]: [...(prev[activeCustomerId] || []), payload] }));
    socketRef.current?.send(payload);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    sendPayload("text", message);
    setMessage("");
  };

  const handleFileSelect = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File "${file.name}" exceeds 15MB limit (${formatFileSize(file.size)})`);
      event.target.value = "";
      setTimeout(() => setUploadError(null), 5000);
      return;
    }
    try {
      const base64Data = await readFileAsBase64(file);
      sendPayload(type, base64Data, { fileName: file.name, fileSize: file.size, mimeType: file.type, fileData: base64Data });
    } catch {
      setUploadError(`Failed to read file "${file.name}"`);
      setTimeout(() => setUploadError(null), 5000);
    }
    event.target.value = "";
  };

  const handleImageClick = useCallback((src, filename) => setImagePreview({ src, filename }), []);
  const closeImagePreview = useCallback(() => setImagePreview(null), []);

  return (
    <section className="space-y-6">
      {uploadError && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 shadow-lg animate-in slide-in-from-top-2">
          <X className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700">{uploadError}</span>
          <Button type="button" variant="ghost" className="h-6 w-6 p-0 ml-2" onClick={() => setUploadError(null)}>
            <X className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      )}

      {imagePreview && <ImageViewer src={imagePreview.src} filename={imagePreview.filename} onClose={closeImagePreview} />}

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-title text-2xl font-bold text-slate-950">Customer support chat</div>
            <div className="mt-1 text-sm text-slate-500">
              {customers.length} active conversation{customers.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{connectionStatus}</div>
        </div>
      </Card>

      <Card className="flex min-h-[70vh] flex-col overflow-hidden" style={{ minWidth: "500px" }}>
        {/* Chat header with customer toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-lg"
              onClick={() => setCustomerListOpen(!customerListOpen)}
              title={customerListOpen ? "Hide customer list" : "Show customer list"}
            >
              {customerListOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
            </Button>
            <div>
              <div className="font-title text-lg font-semibold text-slate-950">{activeCustomer?.name}</div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${activeCustomer?.online ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="text-xs text-slate-500">{activeCustomer?.online ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400">{activeMessages.length ? `Last activity ${formatTime(activeMessages[activeMessages.length - 1].timestamp)}` : "No history"}</div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Customer list - toggleable sidebar with max-width 250px */}
          {customerListOpen && (
            <div className="border-r border-slate-200 overflow-y-auto shrink-0 bg-slate-50/50" style={{ maxWidth: "250px", width: "250px" }}>
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setActiveCustomerId(customer.id)}
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-100 ${
                    customer.isActive ? "bg-amber-50 border-l-2 border-l-amber-500" : "border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${customer.online ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{customer.name}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{customer.lastMessage}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-6 py-6">
              {activeMessages.length ? (
                activeMessages.map((item) => (
                  <div key={item.id} className={`flex ${item.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        item.sender === "admin"
                          ? "bg-slate-950 text-white"
                          : item.sender === "ai"
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-slate-800"
                            : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {item.sender === "ai" && (
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                            <Bot className="h-3 w-3" />
                            AI Assistant
                          </span>
                          {item.confidence > 0.6 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              <Sparkles className="h-3 w-3" />
                              Auto
                            </span>
                          )}
                        </div>
                      )}
                      <MessageContent message={item} onImageClick={handleImageClick} />
                      <div className={`mt-2 text-[11px] ${item.sender === "admin" ? "text-white/70" : item.sender === "ai" ? "text-amber-500/80" : "text-slate-400"}`}>
                        {formatTime(item.timestamp)}
                        {item.sender === "ai" && item.intent && <span className="ml-2 italic opacity-60">{item.intent.replace("_", " ")}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">No messages yet.</div>
              )}
              <div ref={messageEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex items-end gap-3">
                <div className="flex flex-1 items-end gap-2">
                  <Input className="min-h-[48px]" placeholder="Type support reply..." value={message} onChange={(event) => setMessage(event.target.value)} />
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => handleFileSelect(event, "file")} />
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFileSelect(event, "image")} />
                  <Button type="button" variant="ghost" className="h-12 w-12 p-0" title="Attach file (max 15MB)" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip style={{ width: 18, height: 18 }} />
                  </Button>
                  <Button type="button" variant="ghost" className="h-12 w-12 p-0" title="Attach image (max 15MB)" onClick={() => imageInputRef.current?.click()}>
                    <ImagePlus style={{ width: 18, height: 18 }} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="h-12 gap-2 px-5">
                    <SendHorizontal style={{ width: 18, height: 18 }} />
                    Send
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5" />
                  AI auto-reply enabled
                </div>
                <div className="flex items-center gap-1.5">
                  <File className="h-3.5 w-3.5" />
                  File upload <span className="text-slate-300">(max 15MB)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ImagePlus className="h-3.5 w-3.5" />
                  Image upload <span className="text-slate-300">(max 15MB)</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default ChatPage;
