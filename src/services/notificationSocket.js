const NOTIFICATION_WS_URL = import.meta.env.VITE_NOTIFICATION_WS_URL || "";

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
      type: "notification",
      content: rawMessage,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Create a socket connection for notifications
 * Channel format: "staffId-notification" for notifications
 * Channel format: "staffId-userId" for chat messages
 */
export const createNotificationSocket = ({ staffId, userId, onMessage, onStatusChange }) => {
  let socket = null;
  let isClosed = false;
  const chatChannel = `${staffId}-${userId}`;
  const notificationChannel = `${staffId}-notification`;

  const handleIncoming = (message) => {
    onMessage(message);
  };

  if (NOTIFICATION_WS_URL) {
    try {
      socket = new WebSocket(NOTIFICATION_WS_URL);
      onStatusChange("connecting");

      socket.addEventListener("open", () => {
        if (isClosed) return;
        onStatusChange("connected");

        // Subscribe to notification channel
        socket.send(
          JSON.stringify({
            action: "subscribe",
            channel: notificationChannel,
          }),
        );

        // Subscribe to chat channel
        socket.send(
          JSON.stringify({
            action: "subscribe",
            channel: chatChannel,
          }),
        );
      });

      socket.addEventListener("message", (event) => {
        if (isClosed) return;
        const parsed = parseIncomingMessage(event.data);
        handleIncoming(parsed);
      });

      socket.addEventListener("error", (error) => {
        if (!isClosed) {
          onStatusChange("error");
        }
      });

      socket.addEventListener("close", () => {
        if (!isClosed) {
          onStatusChange("disconnected");
          isClosed = true;
        }
      });
    } catch (error) {
      console.error("WebSocket creation failed:", error);
      onStatusChange("error");
    }
  } else {
    // Mock implementation for development
    onStatusChange("mock");
  }

  return {
    send: (channel, message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: "send",
            channel,
            message,
          }),
        );
      } else if (!NOTIFICATION_WS_URL) {
        // Mock mode: emit message after a delay
        setTimeout(() => {
          emitMockMessage({
            id: `mock-${Date.now()}`,
            channel,
            ...message,
            timestamp: new Date().toISOString(),
          });
        }, 500);
      }
    },

    close: () => {
      isClosed = true;
      if (socket) {
        socket.close();
        socket = null;
      }
    },

    subscribeToChannel: (channel) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: "subscribe",
            channel,
          }),
        );
      }
    },

    unsubscribeFromChannel: (channel) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: "unsubscribe",
            channel,
          }),
        );
      }
    },

    isConnected: () => socket && socket.readyState === WebSocket.OPEN,
  };
};

/**
 * Hook-like utility for managing notification subscriptions
 */
export const setupNotificationListener = ({ staffId, userId, onNotification, onChatMessage }) => {
  let unsubscribeNotification = null;
  let unsubscribeChat = null;

  const handleMessage = (message) => {
    const channel = message.channel || "";

    if (channel.includes("notification")) {
      onNotification?.(message);
    } else if (channel.includes(`${staffId}-${userId}`)) {
      onChatMessage?.(message);
    }
  };

  const handleStatusChange = (status) => {
    if (status === "connected") {
      // Connection established
    }
  };

  const socket = createNotificationSocket({
    staffId,
    userId,
    onMessage: handleMessage,
    onStatusChange: handleStatusChange,
  });

  return () => {
    socket.close();
  };
};
