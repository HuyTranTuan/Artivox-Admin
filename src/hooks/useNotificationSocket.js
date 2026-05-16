import { useEffect, useRef, useState, useCallback } from "react";
import { setupNotificationListener } from "@services/notificationSocket";
import { notificationService } from "@services/notificationService";

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

  // Setup socket listener
  useEffect(() => {
    if (!enabled || !staffId || !userId || !fetchedRef.current) return;

    try {
      unsubscribeRef.current = setupNotificationListener({
        staffId,
        userId,
        onNotification: handleNewNotification,
        onChatMessage: handleNewChatMessage,
      });

      setSocketStatus("connected");
    } catch (error) {
      console.error("Failed to setup notification listener:", error);
      setSocketStatus("error");
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        setSocketStatus("disconnected");
      }
    };
  }, [enabled, staffId, userId, handleNewNotification, handleNewChatMessage]);

  return {
    notifications,
    chatMessages,
    socketStatus,
    isLoading,
    addNotification: handleNewNotification,
    addChatMessage: handleNewChatMessage,
  };
};
