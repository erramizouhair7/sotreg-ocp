import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const NotificationsContext =
  createContext(null);

const DEFAULT_NOTIFICATIONS = [
  {
    id: "welcome",
    type: "info",
    title: "SOTREG Analytics",
    message:
      "Le centre de notifications est actif.",
    createdAt: new Date().toISOString(),
    read: false,
    link: "/",
  },
];

export function NotificationsProvider({
  children,
}) {
  const [notifications, setNotifications] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "sotreg_notifications"
          );

        return saved
          ? JSON.parse(saved)
          : DEFAULT_NOTIFICATIONS;
      } catch {
        return DEFAULT_NOTIFICATIONS;
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "sotreg_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  function addNotification({
    type = "info",
    title,
    message,
    link = null,
  }) {
    const notification = {
      id: `NOTIF-${Date.now()}`,
      type,
      title,
      message,
      link,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications((current) => [
      notification,
      ...current,
    ]);

    return notification;
  }

  function markAsRead(id) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context =
    useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications doit être utilisé dans NotificationsProvider"
    );
  }

  return context;
}