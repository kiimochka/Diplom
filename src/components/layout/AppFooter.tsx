import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogoIcon } from "../../icons/IconsIndex";
import { getCurrentReturnPath } from "../../utils/returnTo";

const AppFooter: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentReturnPath = getCurrentReturnPath(location);

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <Link to="/" className="app-footer__logo" aria-label="На главную">
            <LogoIcon aria-hidden="true" focusable="false" />
          </Link>
          <p className="app-footer__tagline">
            Сервис для поиска попутных поездок и перевозки грузов по пути.
          </p>
        </div>

        <div className="app-footer__columns">
          <nav
            className="app-footer__column app-footer__column--important"
            aria-label="Важные страницы"
          >
            <h2 className="app-footer__title">Важные страницы</h2>
            <Link to="/">Главная</Link>
            <Link to="/search?tripType=passenger&routeMode=intercity&passengers=1">
              Поиск поездок
            </Link>
            <Link to="/create-trip" state={{ from: currentReturnPath }}>
              Создать поездку
            </Link>
            <Link to={user ? "/profile" : "/login"}>
              {user ? "Личный кабинет" : "Войти в кабинет"}
            </Link>
          </nav>

          <nav
            className="app-footer__column app-footer__column--help"
            aria-label="Помощь"
          >
            <h2 className="app-footer__title">Помощь</h2>
            <Link to="/support">Поддержка</Link>
            {!user && <Link to="/register">Регистрация</Link>}
            <Link to="/privacy-policy">Политика конфиденциальности</Link>
            <Link to="/personal-data-consent">
              Согласие на обработку данных
            </Link>
          </nav>

          <div className="app-footer__column app-footer__column--meta">
            <h2 className="app-footer__title">О сервисе</h2>
            <p className="app-footer__meta-text">
              Объединяем водителей, пассажиров и отправителей грузов, чтобы
              поездки становились удобнее, а свободные места в машине
              использовались с пользой.
            </p>
          </div>
        </div>
      </div>

      <div className="app-footer__bottom">
        <span>© {new Date().getFullYear()} ПоПути</span>
      </div>
    </footer>
  );
};

export default AppFooter;
