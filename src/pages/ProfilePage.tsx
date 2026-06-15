// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileHistory from "../components/profile/ProfileHistory";
import ProfilePersonalData from "../components/profile/ProfilePersonalData";
import ProfileSettings from "../components/profile/ProfileSettings";
import ProfileNotifications from "../components/profile/ProfileNotifications";
import {
  TripIcon,
  People,
  MessageIcon,
  Settings,
  SupportIconY,
} from "../icons/IconsIndex";
import PageHeader from "../components/layout/PageHeader";
import MessengerSection from "../components/profile/MessengerSection";
import SupportPage from "../pages/SupportPage";
import {
  BOOKING_REQUESTS_CHANGED_EVENT,
  countPendingDriverRequests,
} from "../utils/bookingNotifications";

type Section =
  | "history"
  | "notifications"
  | "personal"
  | "messenger"
  | "settings"
  | "support";

const ProfilePage: React.FC = () => {
  const { user } = useAuth(); // [file:3]
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<Section>("history");
  const [initialMessengerChatId, setInitialMessengerChatId] = useState<
    string | null
  >(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const refreshPendingRequestsCount = useCallback(() => {
    setPendingRequestsCount(countPendingDriverRequests(user));
  }, [user]);

  // читаем section из state, который прокидывается из Layout при клике по ЛК
  useEffect(() => {
    const state = location.state as
      | { section?: Section; chatId?: string }
      | null;
    if (state?.section) {
      setActiveSection(state.section);
    }
    setInitialMessengerChatId(state?.chatId ?? null);
  }, [location.state]);

  useEffect(() => {
    refreshPendingRequestsCount();
    window.addEventListener(
      BOOKING_REQUESTS_CHANGED_EVENT,
      refreshPendingRequestsCount,
    );

    return () => {
      window.removeEventListener(
        BOOKING_REQUESTS_CHANGED_EVENT,
        refreshPendingRequestsCount,
      );
    };
  }, [refreshPendingRequestsCount]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-page">
      <PageHeader title="Личный кабинет" />
      <aside className="profile-sidebar">
        <button
          className={
            activeSection === "history"
              ? "profile-sidebar-item profile-sidebar-item--active"
              : "profile-sidebar-item"
          }
          onClick={() => setActiveSection("history")}
        >
          <span className="profile-sidebar-icon">
            <TripIcon />
          </span>
          <span className="profile-sidebar-text">История поездок</span>
        </button>
        <button
          className={
            activeSection === "notifications"
              ? "profile-sidebar-item profile-sidebar-item--active"
              : "profile-sidebar-item"
          }
          onClick={() => setActiveSection("notifications")}
        >
          <span className="profile-sidebar-icon">
            <MessageIcon />
          </span>
          <span className="profile-sidebar-text">Уведомления</span>
          {pendingRequestsCount > 0 && (
            <span
              className="profile-sidebar-badge"
              aria-label={`Заявок без ответа: ${pendingRequestsCount}`}
            >
              {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
            </span>
          )}
        </button>
        <button
          className={
            activeSection === "personal"
              ? "profile-sidebar-item profile-sidebar-item--active"
              : "profile-sidebar-item"
          }
          onClick={() => setActiveSection("personal")}
        >
          <span className="profile-sidebar-icon">
            <People />
          </span>
          <span className="profile-sidebar-text">Личные данные</span>
        </button>
        <button
          className={
            activeSection === "messenger"
              ? "profile-sidebar-item profile-sidebar-item--active"
              : "profile-sidebar-item"
          }
          onClick={() => {
            setActiveSection("messenger");
            setInitialMessengerChatId(null);
          }}
        >
          <span className="profile-sidebar-icon">
            <MessageIcon />
          </span>
          <span className="profile-sidebar-text">Мессенджер</span>
        </button>
        <button
          className={
            activeSection === "settings"
              ? "profile-sidebar-item profile-sidebar-item--active"
              : "profile-sidebar-item"
          }
          onClick={() => setActiveSection("settings")}
        >
          <span className="profile-sidebar-icon">
            <Settings />
          </span>
          <span className="profile-sidebar-text">Настройки</span>
        </button>
        <button
          className={
            activeSection === "support"
              ? "profile-sidebar-item profile-sidebar-item--active"
              : "profile-sidebar-item"
          }
          onClick={() => setActiveSection("support")}
        >
          <span className="profile-sidebar-icon">
            <SupportIconY />
          </span>
          <span className="profile-sidebar-text">Служба поддержки</span>
        </button>
      </aside>

      {/* ПРАВАЯ ЧАСТЬ – содержимое выбранного раздела */}
      <section className="profile-content">
        {activeSection === "history" && <ProfileHistory />}
        {activeSection === "notifications" && (
          <ProfileNotifications onRequestsChanged={refreshPendingRequestsCount} />
        )}
        {activeSection === "personal" && <ProfilePersonalData />}
        {activeSection === "messenger" && (
          <MessengerSection initialChatId={initialMessengerChatId} />
        )}
        {activeSection === "settings" && <ProfileSettings />}
        {activeSection === "support" && <SupportPage />}
      </section>
    </div>
  );
};

export default ProfilePage;
