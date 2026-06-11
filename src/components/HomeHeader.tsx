import React from "react";
import { Link } from "react-router-dom";
import { LogoIcon } from "../icons/IconsIndex";

type HomeHeaderProps = {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onAccountClick: () => void;
};

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  isLoggedIn,
  onLoginClick,
  onAccountClick,
}) => {
  return (
    <header className="home-header">
      <div className="home-logo">
        <Link to="/" aria-label="На главную">
          <LogoIcon aria-hidden="true" focusable="false" />
        </Link>
      </div>

      <nav className="home-nav">
        <button className="home-create-trip">
          <span className="home-create-trip-icon">+</span>
          Создать поездку
        </button>

        {/* справа: Войти / Личный кабинет */}
        {isLoggedIn ? (
          <button className="home-nav-link" onClick={onAccountClick}>
            Личный кабинет
          </button>
        ) : (
          <button className="home-nav-link" onClick={onLoginClick}>
            Войти
          </button>
        )}
      </nav>
    </header>
  );
};
