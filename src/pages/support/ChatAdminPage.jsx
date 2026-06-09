import { useTranslate } from "@/i18n/useTranslate";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  File,
  ImagePlus,
  Paperclip,
  SendHorizontal,
  X,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  MessageSquarePlus,
  User,
} from "lucide-react";
import { io } from "socket.io-client";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import ImageViewer from "@/components/ImageViewer";
import { chatService } from "@services/chatService";
import { useAuthStore } from "@/store/authStore";
import useTranslation from "@/hooks/useTranslation";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api/v1";
const SOCKET_URL = API_URL.replace("/api/v1", "");

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
  } catch (err) {
    window.open(url, "_blank");
  }
};
const isImageType = (t) => t?.startsWith("image/");

const MessageContent = ({ message, onImageClick }) => {
  const { t } = useTranslate();

  const { t } = useTranslation();
  const [imgErr, setImgErr] = useState(false);
  const mimeType = message.fileType || message.mimeType;
  const type = message.type || (message.fileUrl ? (isImageType(mimeType) ? 'image' : 'file') : 'text');
  
  const isImg =
    type === "image" ||
    (type === "file" && isImageType(mimeType));
  const fileUrl = message.fileData || message.fileUrl;
  const name = message.fileName || (type !== 'text' ? message.content : null) || t("common.file", "File");

  if (isImg && fileUrl && !imgErr)
    return (
      <div className="space-y-1.5">
        <div
          className="relative group rounded-lg overflow-hidden cursor-pointer border border-slate-200/50"
          onClick={() => onImageClick(fileUrl, name)}
        >
          <img
            src={fileUrl}
            alt={name}
            className="max-w-full max-h-48 object-contain bg-slate-100"
            onError={() => setImgErr(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
            <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <Download className="h-3 w-3" /> {t("common.download", "Download")}
          </button>
        </div>
      </div>
    );

  if (type === "file")
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <File className="h-5 w-5 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{name}</div>
            {message.fileSize && (
              <div className="text-[10px] text-slate-400">
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
      </div>
    );

  return <div className="text-sm">{message.content}</div>;
};

const ChatAdminPage = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const chatSocketRef = useRef(null);
  const notifSocketRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messageEndRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [internalUsers, setInternalUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [uploadError, setUploadError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showUserList, setShowUserList] = useState(false); // toggle between room list and user list
  const [chatToast, setChatToast] = useState({
    message: "",
    roomId: null,
    visible: false,
  });

  // ── Load all internal rooms and users once ──
  useEffect(() => {
    Promise.all([
      chatService.getInternalRooms(),
      chatService.getInternalUsers()
    ])
      .then(([roomsRes, usersRes]) => {
        const list = Array.isArray(roomsRes) ? roomsRes : roomsRes?.data || [];
        setRooms(list);
        if (list.length) setActiveRoomId(String(list[0].id));
        
        const usersList = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
        setInternalUsers(usersList);
      })
      .catch(() => setConnectionStatus("error"))
      .finally(() => setLoadingRooms(false));
  }, []);

  // ── Load messages when active room changes ──
  useEffect(() => {
    if (!activeRoomId) return;
    if (conversations[activeRoomId]) return;
    chatService
      .getInternalMessages(activeRoomId)
      .then((data) => {
        const msgs = Array.isArray(data) ? data : data?.data || [];
        setConversations((prev) => ({ ...prev, [activeRoomId]: msgs }));
      })
      .catch(() => {});
  }, [activeRoomId]);

  // ── Mark as read when opening a room ──
  useEffect(() => {
    if (!activeRoomId) return;
    chatService.markInternalAsRead(activeRoomId).catch(() => {});
  }, [activeRoomId]);

  // ── Socket.io — connect once ──
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    const chatSocket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token}` },
    });
    chatSocketRef.current = chatSocket;

    const notifSocket = io(`${SOCKET_URL}/notifications`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token}` },
    });
    notifSocketRef.current = notifSocket;

    chatSocket.on("connect", () => {
      setConnectionStatus("connected");
    });

    // New persisted message from server
    chatSocket.on("new_internal_message", (msg) => {
      const rid = String(msg.roomId || msg.chatRoomId);
      setConversations((prev) => {
        const existing = prev[rid] || [];
        if (existing.some(m => String(m.id) === String(msg.id))) return prev;
        
        if (msg.senderId === user?.id) {
          const optIndex = existing.findIndex(m => String(m.id).startsWith("tmp-") && m.content === msg.content);
          if (optIndex !== -1) {
            const newExisting = [...existing];
            newExisting[optIndex] = msg;
            return {
              ...prev,
              [rid]: newExisting,
            };
          }
        }
        
        return {
          ...prev,
          [rid]: [...existing, msg],
        };
      });
      // Refresh rooms list
      chatService.getInternalRooms().then((data) => {
        setRooms(Array.isArray(data) ? data : data?.data || []);
      }).catch(() => {});
    });

    // Sender sees "Seen" indicator
    chatSocket.on("internal_messages_read", ({ chatRoomId, readerId }) => {
      if (String(readerId) === String(user?.id)) return;
      const rid = String(chatRoomId);
      setConversations((prev) => ({
        ...prev,
        [rid]: (prev[rid] || []).map((m) =>
          String(m.senderId) === String(user?.id) ? { ...m, isRead: true } : m,
        ),
      }));
    });

    chatSocket.on("disconnect", () => setConnectionStatus("disconnected"));
    chatSocket.on("connect_error", () => setConnectionStatus("error"));

    // Notification for internal messages
    notifSocket.on("new_notification", (data) => {
      if (data.type === "INTERNAL_MESSAGE") {
        setChatToast({
          message: `💬 ${data.title}: ${data.message}`,
          roomId: data.roomId,
          visible: true,
        });
        setTimeout(
          () => setChatToast((prev) => ({ ...prev, visible: false })),
          6000,
        );
        chatService.getInternalRooms().then((res) => {
          setRooms(Array.isArray(res) ? res : res?.data || []);
        }).catch(() => {});
      }
    });

    return () => {
      chatSocket.disconnect();
      notifSocket.disconnect();
    };
  }, [user?.id]); // connect once

  // ── Join/leave specific chat room on the /chat socket ──
  useEffect(() => {
    const socket = chatSocketRef.current;
    if (!socket?.connected || !activeRoomId) return;

    socket.emit("room:join", { chatRoomId: `internal:${activeRoomId}` });

    return () => {
      if (socket.connected) {
        socket.emit("room:leave", { chatRoomId: `internal:${activeRoomId}` });
      }
    };
  }, [activeRoomId, connectionStatus]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeRoomId]);

  const activeMessages =
    (activeRoomId ? conversations[activeRoomId] : []) || [];
  const activeRoom = rooms.find((r) => String(r.id) === activeRoomId);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const sendPayload = async (type, content, metadata = {}) => {
    if (!activeRoomId) return;
    if (type === "text" && !content.trim()) return;

    // Optimistic
    const optimistic = {
      id: `tmp-${Date.now()}`,
      roomId: activeRoomId,
      senderId: user?.id,
      type,
      content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    setConversations((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), optimistic],
    }));

    try {
      const savedMsgData = await chatService.sendInternalMessage(activeRoomId, {
        content: type === "text" ? content : metadata.fileName || "File",
        fileUrl: metadata.fileData || null,
        fileType: metadata.mimeType || null,
      });
      const savedMsg = savedMsgData?.data || savedMsgData;
      setConversations((prev) => {
        const existing = prev[activeRoomId] || [];
        const exists = existing.some((m) => String(m.id) === String(savedMsg.id));
        return {
          ...prev,
          [activeRoomId]: exists
            ? existing.filter((m) => m.id !== optimistic.id)
            : existing.map((m) => (m.id === optimistic.id ? savedMsg : m)),
        };
      });
    } catch {
      setConversations((prev) => ({
        ...prev,
        [activeRoomId]: (prev[activeRoomId] || []).filter(
          (m) => m.id !== optimistic.id,
        ),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendPayload("text", message);
    setMessage("");
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`"${file.name}" exceeds 15MB`);
      e.target.value = "";
      setTimeout(() => setUploadError(null), 5000);
      return;
    }
    try {
      const base64Data = await readFileAsBase64(file);
      sendPayload(type, base64Data, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileData: base64Data,
      });
    } catch {
      setUploadError(`Failed to read "${file.name}"`);
      setTimeout(() => setUploadError(null), 5000);
    }
    e.target.value = "";
  };

  const handleStartChat = async (participantId) => {
    try {
      const res = await chatService.getOrCreateInternalRoom(participantId);
      const room = res.data || res;
      
      // Update room list if not exists
      setRooms(prev => {
        if (!prev.find(r => r.id === room.id)) {
          return [room, ...prev];
        }
        return prev;
      });
      
      setActiveRoomId(String(room.id));
      setShowUserList(false);
    } catch (err) {
      setUploadError("Failed to create/fetch chat room.");
      setTimeout(() => setUploadError(null), 5000);
    }
  };

  const handleImageClick = useCallback(
    (src, filename) => setImagePreview({ src, filename }),
    [],
  );
  const closeImagePreview = useCallback(() => setImagePreview(null), []);

  const getOtherParticipant = (room) => {
    if (!room || !user) return null;
    return String(room.participant1Id) === String(user.id) ? room.participant2 : room.participant1;
  };

  const otherUser = getOtherParticipant(activeRoom);

  return (
    <section className="space-y-6">
      {uploadError && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 shadow-lg animate-in slide-in-from-top-2">
          <X className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700">{uploadError}</span>
          <Button
            type="button"
            variant="ghost"
            className="h-6 w-6 p-0 ml-2"
            onClick={() => setUploadError(null)}
          >
            <X className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      )}

      {chatToast.visible && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-white shadow-xl cursor-pointer animate-in slide-in-from-top-2 hover:bg-blue-700 transition-colors"
          onClick={() => {
            if (chatToast.roomId) setActiveRoomId(chatToast.roomId);
            setChatToast((prev) => ({ ...prev, visible: false }));
          }}
        >
          <span className="text-sm font-medium">{chatToast.message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setChatToast((prev) => ({ ...prev, visible: false }));
            }}
            className="text-white/70 hover:text-white ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {imagePreview && (
        <ImageViewer
          src={imagePreview.src}
          filename={imagePreview.filename}
          onClose={closeImagePreview}
        />
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-title text-2xl font-bold text-slate-950">{t('internalTeamChat')}</div>
            <div className="mt-1 text-sm text-slate-500">{t('collaborateDirectlyWithOtherStaffMembersAndAdmins')}</div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowUserList(!showUserList);
                if (!sidebarOpen) setSidebarOpen(true);
              }}
              className="gap-2"
            >
              <MessageSquarePlus className="h-4 w-4" />{t('newChat')}</Button>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {connectionStatus}
            </div>
          </div>
        </div>
      </Card>

      <Card
        className="flex min-h-[70vh] flex-col overflow-hidden"
        style={{ minWidth: 500 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
            <div>
              <div className="font-title text-lg font-semibold text-slate-950">
                {otherUser?.fullName ||
                  (activeRoomId ? `Room ${activeRoomId}` : "Select a conversation")}
              </div>
              {otherUser && (
                <div className="text-xs text-slate-400 capitalize">
                  {otherUser.role} • {otherUser.email}
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {activeMessages.length
              ? `${t("chat.last", "Last")}: ${formatTime(activeMessages[activeMessages.length - 1].createdAt || activeMessages[activeMessages.length - 1].timestamp)}`
              : ""}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {sidebarOpen && (
            <div
              className="border-r border-slate-200 overflow-y-auto shrink-0 bg-slate-50/50 flex flex-col"
              style={{ width: 280 }}
            >
              {showUserList ? (
                // Users list
                <div className="p-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 pt-2">{t('startANewChat')}</div>
                  {internalUsers.length === 0 ? (
                    <div className="text-sm text-slate-400 px-2 py-4">{t('noOtherTeamMembersFound')}</div>
                  ) : (
                    internalUsers.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleStartChat(u.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition hover:bg-slate-200/50"
                      >
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{u.fullName}</div>
                          <div className="text-[10px] text-slate-500 capitalize">{u.role}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // Rooms list
                <>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4 pt-4">{t('activeChats')}</div>
                  {loadingRooms ? (
                    <div className="flex items-center justify-center h-20 text-sm text-slate-400">
                      {t("common.loading", "Loading...")}
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-sm text-slate-400">
                      {t("chat.noConversations", "No conversations")}
                    </div>
                  ) : (
                    rooms.map((room) => {
                      const msgs = conversations[String(room.id)] || [];
                      const last = msgs[msgs.length - 1];
                      const isActive = String(room.id) === activeRoomId;
                      const participant = getOtherParticipant(room);
                      
                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => setActiveRoomId(String(room.id))}
                          className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-100 ${
                            isActive
                              ? "bg-amber-50 border-l-2 border-l-amber-500"
                              : "border-l-2 border-l-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {participant?.avatarUrl ? (
                                <img src={participant.avatarUrl} alt={participant.fullName} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-3 w-3 text-slate-400" />
                              )}
                            </div>
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {participant?.fullName || `Staff ${participant?.id || ""}`}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5 pl-8">
                            {last?.content || t("chat.noMessagesYet", "No messages yet")}
                          </div>
                        </button>
                      );
                    })
                  )}
                </>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-6 py-6">
              {activeMessages.length ? (
                activeMessages.map((item) => {
                  const isMe = String(item.senderId) === String(user?.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          isMe
                            ? "bg-slate-950 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <MessageContent
                          message={item}
                          onImageClick={handleImageClick}
                        />
                        <div
                          className={`mt-2 flex items-center gap-1 text-[11px] ${
                            isMe
                              ? "text-white/70 justify-end"
                              : "text-slate-400 justify-start"
                          }`}
                        >
                          {formatTime(item.createdAt || item.timestamp)}
                          {isMe && item.isRead && (
                            <span className="ml-1 opacity-70">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  {activeRoomId ? t("chat.noMessagesYet", "No messages yet.") : "Select a chat from the left sidebar or start a new one."}
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-200 bg-white px-6 py-4"
            >
              <div className="flex items-end gap-3">
                <div className="flex flex-1 items-end gap-2">
                  <Input
                    className="min-h-[48px]"
                    placeholder={t("chat.typeReply", "Type message...")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!activeRoomId}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "file")}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "image")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 w-12 p-0"
                    title={t("chat.attachFile", "Attach file (max 15MB)")}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!activeRoomId}
                  >
                    <Paperclip style={{ width: 18, height: 18 }} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 w-12 p-0"
                    title={t("chat.attachImage", "Attach image (max 15MB)")}
                    onClick={() => imageInputRef.current?.click()}
                    disabled={!activeRoomId}
                  >
                    <ImagePlus style={{ width: 18, height: 18 }} />
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="h-12 gap-2 px-5"
                  disabled={!message.trim() || !activeRoomId}
                >
                  <SendHorizontal style={{ width: 18, height: 18 }} />{" "}
                  {t("common.send", "Send")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default ChatAdminPage;
