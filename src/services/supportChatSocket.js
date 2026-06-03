import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api/v1";
const WS_URL = API_URL.replace("/api/v1", "");

export const createSupportChatSocket = ({ customerId, onMessage, onTyping }) => {
  const token = localStorage.getItem("adminToken");
  const socket = io(`${WS_URL}/chat`, {
    auth: { token: `Bearer ${token}` },
  });

  socket.on("connect", () => {
    if (customerId) {
      socket.emit("chat:join", { customerId });
    }
  });

  socket.on("chat:message", (message) => {
    if (onMessage) onMessage(message);
  });

  socket.on("chat:typing", (data) => {
    if (onTyping) onTyping(data);
  });

  return {
    joinRoom(id) {
      socket.emit("chat:join", { customerId: id });
    },
    leaveRoom(id) {
      socket.emit("chat:leave", { customerId: id });
    },
    sendTyping(id) {
      socket.emit("chat:typing", { customerId: id, senderType: "ADMIN" });
    },
    close() {
      socket.disconnect();
    },
  };
};

