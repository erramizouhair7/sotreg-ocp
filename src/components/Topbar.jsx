import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth }
  from "../context/AuthContext";

import { useNotifications }
  from "../context/NotificationsContext";

export default function Topbar() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  const [open, setOpen] =
    useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    function closeMenu(e) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          e.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      closeMenu
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenu
      );
    };
  }, []);

  function openNotification(notification) {
    markAsRead(notification.id);

    if (notification.link) {
      navigate(notification.link);
    }

    setOpen(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sotreg-topbar">

      <div />

      <div className="topbar-actions">

        <div
          className="notification-wrapper"
          ref={wrapperRef}
        >

          <button
            className="notification-button"
            onClick={() =>
              setOpen((value) => !value)
            }
            title="Notifications"
          >
            🔔

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="notification-panel">

              <div className="notification-panel-header">

                <div>
                  <strong>
                    Notifications
                  </strong>

                  <span>
                    {unreadCount} non lue
                    {unreadCount > 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                  >
                    Tout lire
                  </button>
                )}

              </div>

              <div className="notification-list">

                {notifications.length ===
                  0 && (
                  <div className="notification-empty">
                    Aucune notification.
                  </div>
                )}

                {notifications.map(
                  (notification) => (
                    <button
                      key={notification.id}
                      className={`notification-item ${
                        notification.read
                          ? ""
                          : "unread"
                      }`}
                      onClick={() =>
                        openNotification(
                          notification
                        )
                      }
                    >

                      <span
                        className={`notification-status ${notification.type}`}
                      />

                      <span className="notification-text">

                        <strong>
                          {notification.title}
                        </strong>

                        <span>
                          {
                            notification.message
                          }
                        </span>

                        <small>
                          {new Date(
                            notification.createdAt
                          ).toLocaleString(
                            "fr-FR"
                          )}
                        </small>

                      </span>

                    </button>
                  )
                )}

              </div>

              {notifications.length > 0 && (
                <button
                  className="notification-clear"
                  onClick={
                    clearNotifications
                  }
                >
                  Effacer les notifications
                </button>
              )}

            </div>
          )}

        </div>

        <div className="topbar-user">

          <div className="topbar-avatar">
            {user?.name?.charAt(0) ||
              "S"}
          </div>

          <div className="topbar-user-details">
            <strong>
              {user?.name}
            </strong>

            <span>
              {user?.role}
            </span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Déconnexion
        </button>

      </div>

    </header>
  );
}