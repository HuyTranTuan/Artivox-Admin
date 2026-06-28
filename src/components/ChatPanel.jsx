import { useRef, useState, useEffect } from "react";
import {
  Download,
  Eye,
  File,
  ImagePlus,
  Paperclip,
  PanelRightClose,
  PanelRightOpen,
  SendHorizontal,
  X,
} from "lucide-react";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import ImageViewer from "@/components/ImageViewer";
import useTranslation from "@/hooks/useTranslation";

const MAX_FILE_SIZE_DEFAULT = 15 * 1024 * 1024;

const formatTime = (v) =>
  new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatFileSize = (b) =>
  b < 1024
    ? `${b} B`
    : b < 1024 * 1024
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / (1024 * 1024)).toFixed(1)} MB`;

const downloadFile = async (url, name) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
};

const isImageType = (t) => t?.startsWith("image/");

/* Message bubble */
const MessageContent = ({ message, onImageClick }) => {
  const { t } = useTranslation();

  const [imgErr, setImgErr] = useState(false);
  const mimeType = message.fileType || message.mimeType;
  const type =
    message.type ||
    (message.fileUrl ? (isImageType(mimeType) ? "image" : "file") : "text");
  const isImg = type === "image" || (type === "file" && isImageType(mimeType));
  const fileUrl = message.fileData || message.fileUrl;
  const name =
    message.fileName || (type !== "text" ? message.content : null) || "File";

  if (isImg && fileUrl && !imgErr)
    return (
      <div className="space-y-1.5">
        <div
          className="relative group rounded-xl overflow-hidden cursor-pointer border border-slate-200/50"
          onClick={() => onImageClick(fileUrl, name)}
        >
          <img
            src={fileUrl}
            alt={name}
            className="max-w-full max-h-48 object-contain bg-slate-100"
            onError={() => setImgErr(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
            <Eye className="h-8 w-8  opacity-0 group-hover:opacity-100" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs truncate flex-1">{name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(fileUrl, name);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-700 shrink-0"
          >
            <Download className="h-3 w-3" />
            {t("common.download")}
          </button>
        </div>
      </div>
    );

  if (type === "file")
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <File className="h-5 w-5  shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{name}</div>
          {message.fileSize && (
            <div className="text-[10px] ">
              {formatFileSize(message.fileSize)}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => downloadFile(fileUrl || "#", name)}
          className="text-xs font-medium text-blue-500 hover:text-blue-700 shrink-0"
          disabled={!fileUrl}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    );

  return (
    <div className="text-sm whitespace-pre-wrap wrap-break-words">
      {message.content}
    </div>
  );
};

/* Status dot */
const StatusDot = ({ status }) => {
  const color =
    {
      connected: "bg-emerald-500",
      connecting: "bg-amber-400 animate-pulse",
      disconnected: "bg-slate-400",
      error: "bg-rose-500",
    }[status] || "bg-slate-400";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
};

/* Main ChatPanel */
export const ChatPanel = ({
  rooms = [],
  activeRoomId,
  onSelectRoom,
  messages = [],
  onSendText,
  onSendFile,
  connectionStatus = "connecting",
  loadingRooms = false,
  sidebarOpen = true,
  onToggleSidebar,
  currentUserId,
  senderType = "STAFF",
  roomLabel,
  roomSubLabel,
  headerActions,
  emptyRoomsText = "No conversations.",
  inputPlaceholder = "Type a message¦",
  maxFileSize = MAX_FILE_SIZE_DEFAULT,
  className = "",
}) => {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messageEndRef = useRef(null);
  const [text, setText] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);

  const activeRoom = rooms.find((r) => String(r.id) === String(activeRoomId));

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeRoomId]);

  const readAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSendText = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);
    try {
      await onSendText?.(content);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > maxFileSize) {
      setUploadError(`File too large (max ${formatFileSize(maxFileSize)})`);
      return;
    }
    setUploadError(null);
    if (type === "image") {
      const url = URL.createObjectURL(file);
      setImagePreview({ url, file, mimeType: file.type });
      return;
    }
    setSending(true);
    try {
      const base64 = await readAsBase64(file);
      await onSendFile?.(file, base64, file.type);
    } catch (e) {
      setUploadError("Upload failed.");
    } finally {
      setSending(false);
    }
  };

  const sendImagePreview = async () => {
    if (!imagePreview) return;
    setSending(true);
    try {
      const base64 = await readAsBase64(imagePreview.file);
      await onSendFile?.(imagePreview.file, base64, imagePreview.mimeType);
      setImagePreview(null);
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setSending(false);
    }
  };

  const isOwnMsg = (msg) =>
    msg.senderType === senderType ||
    msg.senderType === "STAFF" ||
    msg.senderType === "ADMIN" ||
    msg.adminId === currentUserId ||
    msg.staffId === currentUserId;

  return (
    <div
      className={`flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-72 shrink-0 border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-sm ">{t("conversations")}</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status={connectionStatus} />
              <span className="text-[10px]  capitalize">
                {connectionStatus}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="px-4 py-6 text-sm  text-center">Loading¦</div>
            ) : rooms.length === 0 ? (
              <div className="px-4 py-6 text-sm  text-center">
                {emptyRoomsText}
              </div>
            ) : (
              rooms.map((room) => {
                const isActive = String(room.id) === String(activeRoomId);
                const label = roomLabel
                  ? roomLabel(room)
                  : room.name || room.title || `Room ${room.id}`;
                const sub = roomSubLabel
                  ? roomSubLabel(room)
                  : room.lastMessage?.content || room.status || "";
                const unread = room.unreadCount || 0;
                return (
                  <Button
                    key={room.id}
                    variant="outline"
                    onClick={() => onSelectRoom?.(String(room.id))}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 text-left transition hover:bg-slate-50 ${isActive ? "bg-amber-2000 border-l-2 border-l-(--color-primary)" : ""}`}
                  >
                    <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-sm font-bold ">
                      {label[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold  truncate">
                          {label}
                        </span>
                        {unread > 0 && (
                          <span className="ml-1 shrink-0 h-5 min-w-5 rounded-full bg-(--color-primary)  text-[10px] font-bold flex items-center justify-center px-1">
                            {unread}
                          </span>
                        )}
                      </div>
                      {sub && (
                        <div className="text-xs  truncate mt-0.5">{sub}</div>
                      )}
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 shrink-0">
          {onToggleSidebar && (
            <Button
              variant="outline"
              onClick={onToggleSidebar}
              className=" hover:text-slate-700 transition"
            >
              {sidebarOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          )}
          {activeRoom ? (
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm ">
                {roomLabel
                  ? roomLabel(activeRoom)
                  : activeRoom.name || `Room ${activeRoom.id}`}
              </div>
              {roomSubLabel && (
                <div className="text-xs ">{roomSubLabel(activeRoom)}</div>
              )}
            </div>
          ) : (
            <div className="flex-1 text-sm ">{t("selectAConversation")}</div>
          )}
          {headerActions}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!activeRoomId ? (
            <div className="flex h-full items-center justify-center text-sm ">
              {t("selectAConversationToStartChatting")}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm ">
              {t("noMessagesYet")}
            </div>
          ) : (
            messages.map((msg, i) => {
              const own = isOwnMsg(msg);
              return (
                <div
                  key={msg.id || i}
                  className={`flex ${own ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${own ? "rounded-br-sm" : "rounded-bl-sm"}`}
                  >
                    <MessageContent
                      message={msg}
                      onImageClick={(url, name) =>
                        setViewerImage({ url, name })
                      }
                    />
                    <div
                      className={`mt-1 text-[10px] ${own ? " text-right" : ""}`}
                    >
                      {msg.timestamp || msg.createdAt
                        ? formatTime(msg.timestamp || msg.createdAt)
                        : ""}
                      {own && msg.isRead && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <img
                src={imagePreview.url}
                alt="preview"
                className="h-16 w-16 object-cover rounded-xl border border-slate-200"
              />
              <div className="flex-1">
                <div className="text-xs  truncate">
                  {imagePreview.file.name}
                </div>
                <div className="text-[10px] ">
                  {formatFileSize(imagePreview.file.size)}
                </div>
              </div>
              <Button
                variant={"secondary"}
                onClick={() => {
                  setImagePreview(null);
                  URL.revokeObjectURL(imagePreview.url);
                }}
                className=" hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={sendImagePreview} disabled={sending}>
                {t("common.send")}
              </Button>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mx-4 mb-1 text-xs text-rose-500">{uploadError}</div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "file")}
          />
          <Input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "image")}
          />

          <Button
            variant={"secondary"}
            onClick={() => imageInputRef.current?.click()}
            className=" hover:text-slate-700 transition shrink-0"
            title="Attach image"
            disabled={!activeRoomId}
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => fileInputRef.current?.click()}
            className=" hover:text-slate-700 transition shrink-0"
            title="Attach file"
            disabled={!activeRoomId}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Input
            className="flex-1"
            placeholder={inputPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            disabled={!activeRoomId || sending}
          />

          <Button
            className="shrink-0"
            onClick={handleSendText}
            disabled={!activeRoomId || !text.trim() || sending}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image lightbox */}
      {viewerImage && (
        <ImageViewer
          images={[{ src: viewerImage.url, alt: viewerImage.name }]}
          initialIndex={0}
          onClose={() => setViewerImage(null)}
        />
      )}
    </div>
  );
};

export default ChatPanel;
