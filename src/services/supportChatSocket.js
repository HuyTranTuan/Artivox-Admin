import { getAutoReply } from "./aiChatService";

const SUPPORT_CHAT_WS_URL = import.meta.env.VITE_SUPPORT_CHAT_WS_URL || "";
const SUPPORT_CHAT_CHANNEL = import.meta.env.VITE_SUPPORT_CHAT_CHANNEL || "support-chat-demo";

let mockListeners = [];

const emitMockMessage = (message) => {
  mockListeners.forEach((listener) => listener(message));
};

const parseIncomingMessage = (rawMessage) => {
  try {
    const parsed = JSON.parse(rawMessage);
    return parsed?.payload || parsed;
  } catch {
    return {
      id: `raw-${Date.now()}`,
      conversationId: "fallback-thread",
      sender: "customer",
      type: "text",
      content: rawMessage,
      timestamp: new Date().toISOString(),
    };
  }
};

export const createSupportChatSocket = ({ onMessage, onStatusChange }) => {
  let socket = null;
  let mockReplyTimeout = null;
  let isClosed = false;

  const handleIncoming = (message) => {
    onMessage(message);
  };

  if (SUPPORT_CHAT_WS_URL) {
    try {
      socket = new WebSocket(SUPPORT_CHAT_WS_URL);
      onStatusChange("connecting");

      socket.addEventListener("open", () => {
        if (isClosed) return;
        onStatusChange("connected");
        socket.send(
          JSON.stringify({
            action: "subscribe",
            channel: SUPPORT_CHAT_CHANNEL,
          }),
        );
      });

      socket.addEventListener("message", (event) => {
        if (isClosed) return;
        handleIncoming(parseIncomingMessage(event.data));
      });

      socket.addEventListener("close", () => {
        if (isClosed) return;
        onStatusChange("disconnected");
      });

      socket.addEventListener("error", () => {
        if (isClosed) return;
        onStatusChange("error");
      });
    } catch {
      socket = null;
      onStatusChange("error");
    }
  } else {
    onStatusChange("mock");
    mockListeners.push(handleIncoming);
  }

  return {
    channel: SUPPORT_CHAT_CHANNEL,
    send(payload) {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: "message",
            channel: SUPPORT_CHAT_CHANNEL,
            payload,
          }),
        );
        return;
      }

      if (payload.sender === "customer") {
        // AI Auto-Reply for customer messages
        const aiReply = getAutoReply(payload.content);
        if (aiReply) {
          clearTimeout(mockReplyTimeout);
          mockReplyTimeout = window.setTimeout(() => {
            const aiMessage = {
              id: `ai-${Date.now()}`,
              conversationId: payload.conversationId,
              sender: "ai",
              type: "text",
              content: aiReply.reply,
              intent: aiReply.intent,
              confidence: aiReply.confidence,
              timestamp: new Date().toISOString(),
            };
            emitMockMessage(aiMessage);
          }, 600);
        }
        return;
      }

      if (payload.sender === "admin") {
        clearTimeout(mockReplyTimeout);
        mockReplyTimeout = window.setTimeout(() => {
          emitMockMessage({
            id: `reply-${Date.now()}`,
            conversationId: payload.conversationId,
            sender: "customer",
            type: "text",
            content: "Thank you for your help! I'll check that.",
            timestamp: new Date().toISOString(),
          });
        }, 900);
        return;
      }

      emitMockMessage(payload);
    },
    close() {
      isClosed = true;
      clearTimeout(mockReplyTimeout);
      mockListeners = mockListeners.filter((listener) => listener !== handleIncoming);
      if (socket && socket.readyState <= WebSocket.OPEN) {
        socket.close();
      }
    },
  };
};
