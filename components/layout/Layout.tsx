import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTripMode } from "../../context/TripModeContext";
import "../../styles/header.css";
import { HomeIcon, BlcPlus, Plus, LogoIcon } from "../../icons/IconsIndex";
import { SupportIconB } from "../../icons/IconsIndex";
import AppFooter from "./AppFooter";
import {
  BOOKING_REQUESTS_CHANGED_EVENT,
  countPendingDriverRequests,
} from "../../utils/bookingNotifications";
import { getCurrentReturnPath } from "../../utils/returnTo";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { tripMode } = useTripMode();
  const navigate = useNavigate();
  const location = useLocation();
  const currentReturnPath = getCurrentReturnPath(location);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const refreshPendingRequestsCount = useCallback(() => {
    setPendingRequestsCount(countPendingDriverRequests(user));
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleCreateTripClick = () => {
    navigate("/create-trip", {
      state: { from: currentReturnPath },
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // закрываем дропдаун по клику вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    refreshPendingRequestsCount();
    window.addEventListener(
      BOOKING_REQUESTS_CHANGED_EVENT,
      refreshPendingRequestsCount,
    );
    window.addEventListener("storage", refreshPendingRequestsCount);

    return () => {
      window.removeEventListener(
        BOOKING_REQUESTS_CHANGED_EVENT,
        refreshPendingRequestsCount,
      );
      window.removeEventListener("storage", refreshPendingRequestsCount);
    };
  }, [refreshPendingRequestsCount]);

  return (
    <div className="app-layout home">
      <header className="app-header home-header">
        {/* ЛЕВАЯ ЧАСТЬ: логотип */}
        <div
          className="header-left home-logo"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
          aria-label="На главную"
        >
          <LogoIcon aria-hidden="true" focusable="false" />
        </div>

        {/* ЦЕНТР: создать поездку */}
        <div className="header-center">
          <button
            className={
              "home-create-trip" +
              (tripMode === "cargo" ? " home-create-trip--cargo" : "")
            }
            onClick={handleCreateTripClick}
          >
            <span className="home-nav-link-icon">
              {tripMode === "cargo" ? <Plus /> : <BlcPlus />}
            </span>
            Создать поездку
          </button>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: кабинет + поддержка */}
        <div className="header-right home-nav">
          {/* Кнопка ЛК с выпадающим меню */}
          <div className="header-profile" ref={menuRef}>
            <button
              type="button"
              className="home-nav-link home-nav-link--profile header-profile-button"
              onClick={toggleMenu}
            >
              <span className="home-nav-link-icon">
                <HomeIcon />
                {pendingRequestsCount > 0 && (
                  <span
                    className="header-profile-icon-badge"
                    aria-label={`Заявок без ответа: ${pendingRequestsCount}`}
                  >
                    {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                  </span>
                )}
              </span>
              <span className="home-nav-link-text">Личный кабинет</span>
            </button>

            {isMenuOpen && (
              <div className="header-profile-menu">
                <Link
                  to="/profile"
                  state={{ section: "history" }}
                  className="header-profile-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  История поездок
                </Link>
                <Link
                  to="/profile"
                  state={{ section: "notifications" }}
                  className="header-profile-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Уведомления</span>
                  {pendingRequestsCount > 0 && (
                    <span
                      className="header-profile-menu-badge"
                      aria-label={`Заявок без ответа: ${pendingRequestsCount}`}
                    >
                      {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  state={{ section: "personal" }}
                  className="header-profile-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Личные данные
                </Link>
                <Link
                  to="/profile"
                  state={{ section: "messenger" }}
                  className="header-profile-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Мессенджер
                </Link>
                <Link
                  to="/profile"
                  state={{ section: "settings" }}
                  className="header-profile-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Настройки
                </Link>
                <Link
                  to="/profile"
                  state={{ section: "support" }}
                  className="header-profile-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Служба поддержки
                </Link>

                <div className="header-profile-divider" />

                {!user ? (
                  <div className="header-profile-auth">
                    <Link
                      to="/login"
                      className="header-profile-button-main"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Войти
                    </Link>
                    <button
                      type="button"
                      className="header-profile-secondary"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/register");
                      }}
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="header-profile-button-main"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Поддержка */}
          <Link
            className="home-nav-link home-nav-link--support"
            to={user ? "/profile" : "/login"}
            state={
              user
                ? { section: "support" }
                : {
                    from: "/profile",
                    section: "support",
                    message:
                      "Войдите в личный кабинет, чтобы обратиться в службу поддержки.",
                  }
            }
          >
            <span className="support-nav-link-icon">
              <SupportIconB />
            </span>
            <span className="support-nav-link-text">Поддержка</span>
          </Link>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <AppFooter />
    </div>
  );
};

export default Layout;
