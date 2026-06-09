import { useEffect, useRef, useState, useCallback } from "react";
import { setupNotificationListener } from "@services/notificationSocket";
import { notificationService } from "@services/notificationService";
import { io } from "socket.io-client";
import { useAuthStore } from "@store/authStore";

export const useNotificationSocket = (staffId, userId, enabled = true) => {
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef(null);
  const fetchedRef = useRef(false);

  const handleNewNotification = useCallback((message) => {
    setNotifications((prev) => {
      // Check if notification already exists
      const exists = prev.some((n) => n.id === message.id);
      if (exists) return prev;

      const updated = [message, ...prev];
      return updated.slice(0, 50); // Keep last 50 notifications
    });
  }, []);

  const handleNewChatMessage = useCallback((message) => {
    setChatMessages((prev) => {
      const updated = [...prev, message];
      return updated.slice(-100); // Keep last 100 messages
    });
  }, []);

  // Fetch initial notifications from API
  useEffect(() => {
    if (!enabled || !staffId || !userId || fetchedRef.current) return;

    const fetchInitialNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications(20, 0);
        if (data && Array.isArray(data)) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch initial notifications:", error);
      } finally {
        setIsLoading(false);
        fetchedRef.current = true;
      }
    };

    fetchInitialNotifications();
  }, [enabled, staffId, userId]);

  // Setup socket listener (existing mock/ws)
  useEffect(() => {
    if (!enabled || !staffId || !userId) return;

    try {
      unsubscribeRef.current = setupNotificationListener({
        staffId,
        userId,
        onNotification: handleNewNotification,
        onChatMessage: handleNewChatMessage,
      });
    } catch (error) {
      console.error("Failed to setup notification listener:", error);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [enabled, staffId, userId, handleNewNotification, handleNewChatMessage]);

  // Socket.io real-time notifications (for chat_notification etc.)
  useEffect(() => {
    if (!enabled || !staffId) return;

    const token = useAuthStore.getState().accessToken;

    const socket = io(`${import.meta.env.VITE_SOCKET_URL || "http://localhost:3600"}/notifications`, {
      transports: ["websocket"],
      auth: { token: token ? `Bearer ${token}` : undefined }
    });

    socket.on("connect", () => {
      setSocketStatus("connected");
    });

    socket.on("disconnect", () => {
      setSocketStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setSocketStatus("error");
    });

    socket.on("chat_notification", (data) => {
      handleNewNotification({
        id: `chat-${Date.now()}`,
        title: data.title,
        description: data.message,
        type: "CHAT_MESSAGE",
        isRead: false,
        createdAt: data.createdAt,
        metadata: { chatRoomId: data.chatRoomId, customerId: data.customerId },
      });
    });

    socket.on("notifications_read", (data) => {
      if (data.chatRoomId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.metadata && String(n.metadata.chatRoomId) === String(data.chatRoomId)
              ? { ...n, isRead: true }
              : n
          )
        );
      }
    });

    return () => { socket.disconnect(); };
  }, [enabled, staffId, handleNewNotification]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  return {
    notifications,
    chatMessages,
    socketStatus,
    isLoading,
    addNotification: handleNewNotification,
    addChatMessage: handleNewChatMessage,
    markAsRead,
  };
};
