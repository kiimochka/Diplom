import React, { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, deleteProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleCreateTripClick = () => {
    navigate("/create-trip");
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        {/* ЛЕВАЯ ЧАСТЬ: логотип */}
        <div
          className="header-left"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          <span className="logo-text">RideShare</span>
        </div>

        {/* ЦЕНТР: создать поездку */}
        <div className="header-center">
          <button className="header-button" onClick={handleCreateTripClick}>
            Создать поездку
          </button>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: кабинет + аутентификация */}
        <div className="header-right">
          <Link className="header-link" to="/profile">
            Личный кабинет
          </Link>

          {!user && (
            <>
              <Link className="header-link" to="/login">
                Войти
              </Link>
              <Link className="header-link" to="/register">
                Регистрация
              </Link>
            </>
          )}

          {user && (
            <>
              <button className="header-button" onClick={handleLogout}>
                Выйти
              </button>
            </>
          )}
        </div>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        © {new Date().getFullYear()} RideShare
      </footer>
    </div>
  );
};

export default Layout;
