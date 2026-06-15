// src/pages/HomePage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Trip, DriverGender, BaggageSize } from "../types";
import {
  useLocation,
  useNavigate,
  useSearchParams,
  useNavigationType,
} from "react-router-dom";
import {
  BlcPlus,
  Plus,
  CardIcon,
  SpeedIcon,
  TruckIcon,
  PinIcon,
} from "../icons/IconsIndex";
import TripCard from "../components/TripCard";
import CargoTripCard from "../components/CargoTripCard";
import SearchForm from "../components/SearchForm";
import PopularEventCard from "../components/PopularEventCard";
import { popularEvents, PopularEvent } from "../data/popularEvents";
import UpcomingEventCard from "../components/UpcomingEventCard";
import {
  upcomingEvents,
  EventCategory,
  UpcomingEvent,
} from "../data/upcomingEvents";
import altaiHeroImage from "../img/altai.jpg";
import cargoHeroImage from "../img/груз.jpg";
import { useTripMode } from "../context/TripModeContext";
import { useToast } from "../context/ToastContext";
import { readTrips } from "../utils/tripsStorage";
import {
  getTodayDateInputValue,
  isPastDateInputValue,
} from "../utils/dateValidation";
import { getCurrentReturnPath } from "../utils/returnTo";

const HomePage: React.FC = () => {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [ratingRange, setRatingRange] = useState<
    "1-2" | "2-3" | "3-4" | "4-5" | "5" | null
  >(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<"passenger" | "cargo">("passenger");
  const [routeMode, setRouteMode] = useState<"intercity" | "city">("intercity");

  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");

  const [onlyWithLuggage, setOnlyWithLuggage] = useState(false);

  const [sortBy, setSortBy] = useState<
    "cheapest" | "fastest" | "earliest" | null
  >(null);
  const [driverGender, setDriverGender] = useState<DriverGender | null>(null);

  const [withChildSeat, setWithChildSeat] = useState(false);
  const [withPets, setWithPets] = useState(false);
  const [withSmoking, setWithSmoking] = useState(false);

  const [baggageSize, setBaggageSize] = useState<BaggageSize | null>(null);
  const { setTripMode } = useTripMode();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();
  const currentReturnPath = getCurrentReturnPath(location);
  const [searchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const minTripDate = getTodayDateInputValue();
  const [activeEventCategory, setActiveEventCategory] =
    useState<EventCategory>("all");

  useEffect(() => {
    setTripMode(tripType);
  }, [tripType, setTripMode]);
  const handleCreateTripClick = () => {
    navigate("/create-trip", {
      state: { from: currentReturnPath },
    });
  };

  const handleUpcomingEventClick = (event: UpcomingEvent) => {
    navigate(
      `/search?from=${encodeURIComponent(event.fromCity)}&to=${encodeURIComponent(
        event.city,
      )}&passengers=1&tripType=passenger`,
    );
  };

  const handlePopularEventSearch = (event: PopularEvent) => {
    navigate(
      `/search?from=${encodeURIComponent(event.fromCity)}&to=${encodeURIComponent(
        event.toCity,
      )}&passengers=1&tripType=passenger`,
    );
  };

  // читаем общий список поездок
  useEffect(() => {
    setAllTrips(readTrips());
  }, []);

  // дебаунс ввода maxPriceInput
  useEffect(() => {
    const id = setTimeout(() => {
      if (maxPriceInput.trim() === "") {
        setMaxPrice(null);
      } else {
        const n = Number(maxPriceInput);
        if (!Number.isNaN(n)) setMaxPrice(n);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [maxPriceInput]);

  const filteredUpcomingEvents = useMemo(() => {
    if (activeEventCategory === "all") {
      return upcomingEvents;
    }

    return upcomingEvents.filter(
      (event) => event.category === activeEventCategory,
    );
  }, [activeEventCategory]);

  // применяем фильтры и сортировку
  const filteredTrips = useMemo(() => {
    let result = allTrips.filter((trip) => {
      const tripPrice =
        trip.type === "cargo"
          ? (trip.pricePerCar ?? trip.pricePerSeat)
          : trip.pricePerSeat;
      const matchesType = trip.type === tripType;
      const matchesFrom =
        !from || trip.fromCity.toLowerCase().includes(from.toLowerCase());
      const matchesTo =
        !to || trip.toCity.toLowerCase().includes(to.toLowerCase());
      const matchesDate = !date || trip.date === date;
      const matchesSeats = trip.freeSeats >= passengers;
      const matchesRouteMode =
        tripType !== "cargo" || (trip.routeMode ?? "intercity") === routeMode;

      const matchesPrice = maxPrice == null || tripPrice <= maxPrice;

      const driverRating = trip.driver.rating ?? 0;
      const matchesRating =
        !ratingRange ||
        (ratingRange === "1-2" && driverRating >= 1 && driverRating < 2) ||
        (ratingRange === "2-3" && driverRating >= 2 && driverRating < 3) ||
        (ratingRange === "3-4" && driverRating >= 3 && driverRating < 4) ||
        (ratingRange === "4-5" && driverRating >= 4 && driverRating < 5) ||
        (ratingRange === "5" && driverRating === 5);

      const matchesLuggage = !onlyWithLuggage || trip.amenities?.luggageAllowed;
      const matchesGender = !driverGender || trip.driverGender === driverGender;
      const matchesChildSeat = !withChildSeat || trip.amenities?.childSeat;
      const matchesPets = !withPets || trip.amenities?.petsAllowed;
      const matchesSmoking = !withSmoking || trip.amenities?.smokingAllowed;
      const matchesBaggageSize =
        !baggageSize || trip.baggageSize === baggageSize;

      return (
        matchesType &&
        matchesFrom &&
        matchesTo &&
        matchesDate &&
        matchesSeats &&
        matchesRouteMode &&
        matchesPrice &&
        matchesRating &&
        matchesLuggage &&
        matchesGender &&
        matchesChildSeat &&
        matchesPets &&
        matchesSmoking &&
        matchesBaggageSize
      );
    });

    if (sortBy === "cheapest") {
      result = [...result].sort((a, b) => {
        const priceA =
          a.type === "cargo"
            ? (a.pricePerCar ?? a.pricePerSeat)
            : a.pricePerSeat;
        const priceB =
          b.type === "cargo"
            ? (b.pricePerCar ?? b.pricePerSeat)
            : b.pricePerSeat;

        return priceA - priceB;
      });
    } else if (sortBy === "earliest") {
      result = [...result].sort((a, b) =>
        a.departureTime.localeCompare(b.departureTime),
      );
    } else if (sortBy === "fastest") {
      result = [...result].sort((a, b) =>
        a.arrivalTime.localeCompare(b.arrivalTime),
      );
    }

    return result;
  }, [
    allTrips,
    from,
    to,
    date,
    passengers,
    routeMode,
    tripType,
    maxPrice,
    ratingRange,
    onlyWithLuggage,
    sortBy,
    driverGender,
    withChildSeat,
    withPets,
    withSmoking,
    baggageSize,
  ]);

  // открыть отдельную страницу результатов поиска
  const handleSearchClick = () => {
    if (!from.trim()) {
      showToast({
        type: "error",
        title: "Укажите город отправления",
        message: "Поиск доступен только после заполнения поля «Откуда».",
      });
      return;
    }

    if ((tripType === "passenger" || routeMode === "intercity") && !to.trim()) {
      showToast({
        type: "error",
        title: "Укажите город прибытия",
        message: "Поиск доступен только после заполнения поля «Куда».",
      });
      return;
    }

    if (!date) {
      showToast({
        type: "error",
        title: "Укажите дату поездки",
        message: "Без даты поиск поездки недоступен.",
      });
      return;
    }

    if (isPastDateInputValue(date)) {
      showToast({
        type: "error",
        title: "Дата уже прошла",
        message: "Выберите сегодняшнюю или будущую дату поездки.",
      });
      return;
    }

    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);
    params.set("tripType", tripType);
    params.set("routeMode", routeMode);
    params.set("passengers", String(passengers));

    navigate(`/search?${params.toString()}`);
  };

  // восстановление из URL при навигации "назад"
  useEffect(() => {
    if (!allTrips.length) return;

    const urlFrom = searchParams.get("from") || "";
    const urlTo = searchParams.get("to") || "";
    const urlDate = searchParams.get("date") || "";
    const urlTripType =
      (searchParams.get("tripType") as "passenger" | "cargo") || "passenger";
    const urlRouteMode =
      (searchParams.get("routeMode") as "intercity" | "city") || "intercity";
    const urlPassengers = Number(searchParams.get("passengers") || "1");

    if (urlFrom || urlTo || urlDate || searchParams.get("tripType")) {
      setFrom(urlFrom);
      setTo(urlTo);
      setDate(urlDate);
      setTripType(urlTripType);
      setRouteMode(urlRouteMode);
      setPassengers(Number.isNaN(urlPassengers) ? 1 : urlPassengers);
      setHasSearched(false);
    }
  }, [allTrips, searchParams, navigationType]);

  const cargoSteps = [
    {
      number: "01",
      title: "Укажите маршрут",
      text: "Выберите откуда и куда нужно перевезти груз, дату и основные параметры перевозки.",
    },
    {
      number: "02",
      title: "Подберите подходящую машину",
      text: "Сравните доступные варианты по типу транспорта, габаритам, весу и дополнительным услугам.",
    },
    {
      number: "03",
      title: "Отправьте запрос водителю",
      text: "Забронируйте перевозку и дождитесь подтверждения. Иногда водитель может одобрить бронирование сразу.",
    },
  ];

  const cargoAdvantages = [
    {
      Icon: CardIcon,
      title: "Выгоднее отдельной доставки",
      text: "Вы используете свободное место в машине, которая уже едет по маршруту, и не переплачиваете за отдельный рейс.",
    },
    {
      Icon: SpeedIcon,
      title: "Быстрый поиск",
      text: "Форма поиска и фильтры помогают за несколько минут найти подходящий вариант для вашего груза.",
    },
    {
      Icon: TruckIcon,
      title: "Гибкие параметры",
      text: "Можно подобрать перевозку по типу транспорта, габаритам, весу и дополнительным услугам.",
    },
    {
      Icon: PinIcon,
      title: "Для города и межгорода",
      text: "Подходит и для доставки по городу, и для междугородних перевозок по России.",
    },
  ];

  const cargoTrustPoints = [
    "Проверенные профили водителей",
    "Отзывы и рейтинг после поездок",
    "Понятные условия бронирования",
    "Удобный выбор транспорта под ваш груз",
  ];

  const cargoTypes = [
    "Личные вещи",
    "Коробки и посылки",
    "Мебель",
    "Бытовая техника",
    "Стройматериалы",
    "Груз для переезда",
  ];

  return (
    <div className="home-main">
      <section
        className={
          tripType === "cargo" ? "home-hero home-hero--cargo" : "home-hero"
        }
        style={
          {
            "--home-hero-image": `url(${
              tripType === "cargo" ? cargoHeroImage : altaiHeroImage
            })`,
          } as React.CSSProperties
        }
      >
        <div className="home-hero__content">
          {tripType === "cargo" ? (
            <>

              <h1 className="home-hero__title">
                Перевезти груз проще,
                <br />
                если машина уже едет по пути
              </h1>

              <p className="home-hero__subtitle">
                Найдите попутный транспорт для перевозки груза по городу
                или по России. Это удобно, быстро и часто выгоднее, чем
                заказывать отдельную доставку.
              </p>

              <div className="home-hero__features">
                <div className="home-hero__feature">
                  Дешевле отдельной перевозки
                </div>
                <div className="home-hero__feature">Быстрый поиск машины</div>
                <div className="home-hero__feature">
                  Для частных и бизнес-задач
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="home-hero__title">
                Поездка к родным? На дачу?
                <br /> В другой город?
              </h1>

              <p className="home-hero__subtitle">
                Выберите маршрут — и мы поможем <br />
                быстро найти попутчика.
              </p>

              <div className="home-hero__features">
                <div className="home-hero__feature">Быстрый поиск</div>
                <div className="home-hero__feature">Удобные маршруты</div>
                <div className="home-hero__feature">Поездки по России</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* форма поиска */}
      <section className="home-search">
        <div className="home-search-tabs">
          <button
            className={
              "home-search-tab home-search-tab--passenger" +
              (tripType === "passenger"
                ? " home-search-tab--active-passenger"
                : " home-search-tab--inactive-passenger")
            }
            onClick={() => setTripType("passenger")}
          >
            Пассажир
          </button>

          <button
            className={
              "home-search-tab home-search-tab--cargo" +
              (tripType === "cargo"
                ? " home-search-tab--active-cargo"
                : " home-search-tab--inactive-cargo")
            }
            onClick={() => setTripType("cargo")}
          >
            Груз
          </button>
        </div>

        {tripType === "passenger" ? (
          <div className="home-search-bar home-search-bar--passenger">
            <input
              className="home-search-input"
              placeholder="Откуда"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              className="home-search-input"
              placeholder="Куда"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />

            <div className="home-search-row-bottom">
              <input
                className="home-search-input"
                placeholder="Когда"
                type="date"
                value={date}
                min={minTripDate}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <div className="home-passengers-counter">
                <button
                  type="button"
                  className="home-passengers-btn home-passengers-btn--minus"
                  onClick={() => setPassengers((p) => (p > 1 ? p - 1 : 1))}
                >
                  −
                </button>

                <div className="home-passengers-value">
                  {passengers} пассажир{passengers > 1 ? "а" : ""}
                </div>

                <button
                  type="button"
                  className="home-passengers-btn home-passengers-btn--plus"
                  onClick={() => setPassengers((p) => (p < 4 ? p + 1 : 4))}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="home-search-submit"
              onClick={handleSearchClick}
            >
              Найти поездку
            </button>
          </div>
        ) : (
          <SearchForm
            initialFromCity={from}
            initialToCity={to}
            initialDate={date}
            initialPassengers={passengers}
            tripType="cargo"
            initialRouteMode={routeMode}
            onSearch={(params) => {
              const nextParams = new URLSearchParams();
              if (params.from) nextParams.set("from", params.from);
              if (params.to) nextParams.set("to", params.to);
              if (params.date) nextParams.set("date", params.date);
              nextParams.set("tripType", "cargo");
              nextParams.set("routeMode", params.routeMode);
              nextParams.set("passengers", String(params.passengers));

              navigate(`/search?${nextParams.toString()}`);
            }}
          />
        )}
      </section>

      <div className="home-search-bottom">
        <button
          className={
            "home-create-trip home-create-trip--small" +
            (tripType === "cargo" ? " home-create-trip--cargo" : "")
          }
          onClick={handleCreateTripClick}
        >
          <span className="home-nav-link-icon">
            {tripType === "cargo" ? <Plus /> : <BlcPlus />}
          </span>
          Создать поездку
        </button>
      </div>

      {tripType === "cargo" && !hasSearched && (
        <section className="cargo-info-section">
          <div className="cargo-info-block">
            <div className="cargo-info-heading">
              <span className="cargo-info-eyebrow">Как это работает</span>
              <h2>Отправить груз можно в 3 простых шага</h2>
              <p>
                Сервис помогает быстро найти машину, которая уже едет в нужном
                направлении, и договориться о перевозке без сложного оформления.
              </p>
            </div>

            <div className="cargo-steps-grid">
              {cargoSteps.map((step) => (
                <article key={step.number} className="cargo-step-card">
                  <div className="cargo-step-card__number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="cargo-info-block">
            <div className="cargo-info-heading">
              <span className="cargo-info-eyebrow">Почему это удобно</span>
              <h2>Почему пользователи выбирают такой способ перевозки</h2>
              <p>
                Попутная грузовая перевозка помогает сэкономить, быстрее найти
                транспорт и подобрать условия под конкретную задачу.
              </p>
            </div>

            <div className="cargo-advantages-grid">
              {cargoAdvantages.map((item) => (
                <article key={item.title} className="cargo-advantage-card">
                  <div className="cargo-advantage-card__icon">
                    <item.Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="cargo-trust-box">
            <div className="cargo-trust-box__content">
              <h2>
                Важно не только найти машину, но и быть уверенным в перевозке
              </h2>
              <p>
                Для нового пользователя важно понимать, почему сервису можно
                доверять. Поэтому стоит сразу показать сильные стороны
                платформы.
              </p>

              <ul className="cargo-trust-list">
                {cargoTrustPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="cargo-trust-box__stats">
              <div className="cargo-stat-card">
                <strong>Быстро</strong>
                <span>Поиск машины без лишних шагов</span>
              </div>
              <div className="cargo-stat-card">
                <strong>Понятно</strong>
                <span>
                  Маршрут, условия и выбор транспорта
                  <br /> в одном месте
                </span>
              </div>
              <div className="cargo-stat-card">
                <strong>Удобно</strong>
                <span>Фильтры под разные типы грузов</span>
              </div>
            </div>
          </div>

          <div className="cargo-info-block">
            <div className="cargo-info-heading">
              <span className="cargo-info-eyebrow">
                Для каких задач подходит
              </span>
              <h2>Подходит для самых разных грузов</h2>
              <p>
                Такой формат удобен и для повседневных задач,
                <br /> и для перевозки более крупного груза.
              </p>
            </div>

            <div className="cargo-types-grid">
              {cargoTypes.map((type) => (
                <div key={type} className="cargo-type-pill">
                  {type}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasSearched && (
        <section className="home-results">
          <h2>Найденные поездки</h2>

          <div className="results-layout">
            <aside
              className={
                "results-filters " +
                (tripType === "cargo"
                  ? "results-filters--cargo"
                  : "results-filters--passenger")
              }
            >
              {tripType === "passenger" ? (
                <>
                  <h3>Сортировка</h3>

                  <div className="results-filter-group">
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="sort"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={sortBy === "cheapest"}
                        onChange={() => setSortBy("cheapest")}
                      />
                      Самые дешевые поездки
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="sort"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={sortBy === "fastest"}
                        onChange={() => setSortBy("fastest")}
                      />
                      Самые быстрые поездки
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="sort"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={sortBy === "earliest"}
                        onChange={() => setSortBy("earliest")}
                      />
                      Самые ранние поездки
                    </label>
                  </div>

                  <div className="results-filter-group">
                    <span className="results-filter-label">
                      Макс. цена за место
                    </span>

                    <div className="price-input-row">
                      <input
                        type="number"
                        min={0}
                        className="results-filter-input price-input"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        placeholder="Без ограничения"
                      />
                      <span className="price-input-suffix">₽</span>
                    </div>

                    <div className="price-range-row">
                      <span className="price-range-min">0</span>
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        step={100}
                        className="price-range"
                        value={maxPrice ?? 10000}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          setMaxPrice(n);
                          setMaxPriceInput(String(n));
                        }}
                      />
                      <span className="price-range-max">10 000+</span>
                    </div>
                  </div>

                  <div className="results-filter-group">
                    <span className="results-filter-label">
                      Минимальный рейтинг водителя
                    </span>
                    <div className="rating-radio-group">
                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="1-2"
                          checked={ratingRange === "1-2"}
                          onChange={(e) => setRatingRange("1-2")}
                        />
                        ⭐ от 1 до 2
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="2-3"
                          checked={ratingRange === "2-3"}
                          onChange={(e) => setRatingRange("2-3")}
                        />
                        ⭐⭐ от 2 до 3
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="3-4"
                          checked={ratingRange === "3-4"}
                          onChange={(e) => setRatingRange("3-4")}
                        />
                        ⭐⭐⭐ от 3 до 4
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="4-5"
                          checked={ratingRange === "4-5"}
                          onChange={(e) => setRatingRange("4-5")}
                        />
                        ⭐⭐⭐⭐ от 4 до 5
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="5"
                          checked={ratingRange === "5"}
                          onChange={(e) => setRatingRange("5")}
                        />
                        ⭐⭐⭐⭐⭐ только 5
                      </label>
                    </div>
                    <button
                      type="button"
                      className="results-filter-reset"
                      onClick={() => setRatingRange(null)}
                    >
                      Сбросить рейтинг
                    </button>
                  </div>

                  <h4 className="results-filter-title">Пол водителя</h4>
                  <div className="results-filter-group">
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="driverGender"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={driverGender === "female"}
                        onChange={() => setDriverGender("female")}
                      />
                      Женский
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="driverGender"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={driverGender === "male"}
                        onChange={() => setDriverGender("male")}
                      />
                      Мужской
                    </label>
                  </div>

                  <h4 className="results-filter-title">Удобства</h4>
                  <div className="results-filter-group">
                    <label className="results-filter-checkbox">
                      <input
                        type="checkbox"
                        className={
                          "checkbox-square " +
                          (tripType === "passenger"
                            ? "checkbox-square--passenger"
                            : "checkbox-square--cargo")
                        }
                        checked={withChildSeat}
                        onChange={(e) => setWithChildSeat(e.target.checked)}
                      />
                      Есть детское кресло
                    </label>
                    <label className="results-filter-checkbox">
                      <input
                        type="checkbox"
                        className={
                          "checkbox-square " +
                          (tripType === "passenger"
                            ? "checkbox-square--passenger"
                            : "checkbox-square--cargo")
                        }
                        checked={withPets}
                        onChange={(e) => setWithPets(e.target.checked)}
                      />
                      Можно с животными
                    </label>
                    <label className="results-filter-checkbox">
                      <input
                        type="checkbox"
                        className={
                          "checkbox-square " +
                          (tripType === "passenger"
                            ? "checkbox-square--passenger"
                            : "checkbox-square--cargo")
                        }
                        checked={withSmoking}
                        onChange={(e) => setWithSmoking(e.target.checked)}
                      />
                      Можно курить
                    </label>
                    <label className="results-filter-checkbox">
                      <input
                        type="checkbox"
                        className={
                          "checkbox-square " +
                          (tripType === "passenger"
                            ? "checkbox-square--passenger"
                            : "checkbox-square--cargo")
                        }
                        checked={onlyWithLuggage}
                        onChange={(e) => setOnlyWithLuggage(e.target.checked)}
                      />
                      Можно с багажом
                    </label>
                  </div>

                  <h4 className="results-filter-title">Багаж</h4>
                  <div className="results-filter-group">
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="baggageSize"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={baggageSize === "small"}
                        onChange={() => setBaggageSize("small")}
                      />
                      Маленький
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="baggageSize"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={baggageSize === "medium"}
                        onChange={() => setBaggageSize("medium")}
                      />
                      Средний
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="baggageSize"
                        className={
                          "radio-circle " +
                          (tripType === "passenger"
                            ? "radio-circle--passenger"
                            : "radio-circle--cargo")
                        }
                        checked={baggageSize === "large"}
                        onChange={() => setBaggageSize("large")}
                      />
                      Большой
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* УРЕЗАННЫЕ ФИЛЬТРЫ ДЛЯ ГРУЗА */}
                  <h3>Сортировка</h3>

                  <div className="results-filter-group">
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="sort"
                        className={
                          "radio-circle " +
                          (tripType === "cargo"
                            ? "radio-circle--cargo"
                            : "radio-circle--passenger")
                        }
                        checked={sortBy === "cheapest"}
                        onChange={() => setSortBy("cheapest")}
                      />
                      Самые дешевые поездки
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="sort"
                        className={
                          "radio-circle " +
                          (tripType === "cargo"
                            ? "radio-circle--cargo"
                            : "radio-circle--passenger")
                        }
                        checked={sortBy === "fastest"}
                        onChange={() => setSortBy("fastest")}
                      />
                      Самые быстрые поездки
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="sort"
                        className={
                          "radio-circle " +
                          (tripType === "cargo"
                            ? "radio-circle--cargo"
                            : "radio-circle--passenger")
                        }
                        checked={sortBy === "earliest"}
                        onChange={() => setSortBy("earliest")}
                      />
                      Самые ранние поездки
                    </label>
                  </div>

                  <div className="results-filter-group">
                    <span className="results-filter-label">
                      Макс. цена за поездку
                    </span>

                    <div className="price-input-row">
                      <input
                        type="number"
                        min={0}
                        className="results-filter-input price-input"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        placeholder="Без ограничения"
                      />
                      <span className="price-input-suffix">₽</span>
                    </div>

                    <div className="price-range-row">
                      <span className="price-range-min">0</span>
                      <input
                        type="range"
                        min={0}
                        max={100000}
                        step={500}
                        className="price-range"
                        value={maxPrice ?? 100000}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          setMaxPrice(n);
                          setMaxPriceInput(String(n));
                        }}
                      />
                      <span className="price-range-max">100 000+</span>
                    </div>
                  </div>

                  <div className="results-filter-group">
                    <span className="results-filter-label">
                      Минимальный рейтинг водителя
                    </span>
                    <div className="rating-radio-group">
                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="1-2"
                          checked={ratingRange === "1-2"}
                          onChange={(e) => setRatingRange("1-2")}
                        />
                        ⭐ от 1 до 2
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="2-3"
                          checked={ratingRange === "2-3"}
                          onChange={(e) => setRatingRange("2-3")}
                        />
                        ⭐⭐ от 2 до 3
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="3-4"
                          checked={ratingRange === "3-4"}
                          onChange={(e) => setRatingRange("3-4")}
                        />
                        ⭐⭐⭐ от 3 до 4
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="4-5"
                          checked={ratingRange === "4-5"}
                          onChange={(e) => setRatingRange("4-5")}
                        />
                        ⭐⭐⭐⭐ от 4 до 5
                      </label>

                      <label className="rating-radio">
                        <input
                          type="radio"
                          name="driverRating"
                          value="5"
                          checked={ratingRange === "5"}
                          onChange={(e) => setRatingRange("5")}
                        />
                        ⭐⭐⭐⭐⭐ только 5
                      </label>
                    </div>
                    <button
                      type="button"
                      className="results-filter-reset"
                      onClick={() => setRatingRange(null)}
                    >
                      Сбросить рейтинг
                    </button>
                  </div>
                </>
              )}
            </aside>

            <div className="results-list">
              {filteredTrips.length === 0 ? (
                <p className="results-empty">Поездки не найдены.</p>
              ) : (
                filteredTrips.map((trip) =>
                  trip.type === "cargo" ? (
                    <CargoTripCard
                      key={trip.id}
                      id={trip.id}
                      date={trip.date}
                      departureTime={trip.departureTime}
                      fromCity={trip.fromCity}
                      toCity={trip.toCity}
                      carTitle={trip.driver.carName ?? "Автомобиль"}
                      cargoTypes={trip.cargoTypes ?? []}
                      cargoLength={trip.cargoLength}
                      cargoHeight={trip.cargoHeight}
                      cargoWidth={trip.cargoWidth}
                      cargoWeight={trip.cargoWeight}
                      cargoVehicleType={trip.cargoVehicleType}
                      cargoServices={trip.cargoServices}
                      pricePerCar={trip.pricePerCar ?? trip.pricePerSeat}
                    />
                  ) : (
                    <TripCard
                      key={trip.id}
                      id={trip.id}
                      time={trip.departureTime}
                      date={trip.date}
                      fromCity={trip.fromCity}
                      toCity={trip.toCity}
                      driverName={trip.driver.fullName}
                      carName={trip.driver.carName}
                      price={trip.pricePerSeat}
                      seatsLeft={trip.freeSeats}
                      context="search"
                    />
                  ),
                )
              )}
            </div>
          </div>
        </section>
      )}

      {tripType === "passenger" && !hasSearched && (
        <>
          <section className="home-popular-routes">
            <h2>Популярные маршруты</h2>
            <div className="home-events-grid home-events-carousel">
              {popularEvents.map((event) => (
                <PopularEventCard
                  key={event.id}
                  event={event}
                  onFindTrip={handlePopularEventSearch}
                />
              ))}
            </div>
          </section>

          <section className="home-events">
            <h2 className="home-events__title">
              Не только переезды! Отправляйтесь на события вместе
            </h2>

            <p className="home-events__subtitle">
              Забронируйте поездку, найдите попутчиков и сэкономьте на дороге.
              Культура ждёт вас!
            </p>

            <div className="home-events__categories">
              <button
                type="button"
                className={
                  "home-events__category-btn" +
                  (activeEventCategory === "all"
                    ? " home-events__category-btn--active"
                    : "")
                }
                onClick={() => setActiveEventCategory("all")}
              >
                Все события
              </button>

              <button
                type="button"
                className={
                  "home-events__category-btn" +
                  (activeEventCategory === "concert"
                    ? " home-events__category-btn--active"
                    : "")
                }
                onClick={() => setActiveEventCategory("concert")}
              >
                Концерты
              </button>

              <button
                type="button"
                className={
                  "home-events__category-btn" +
                  (activeEventCategory === "theater"
                    ? " home-events__category-btn--active"
                    : "")
                }
                onClick={() => setActiveEventCategory("theater")}
              >
                Театр
              </button>

              <button
                type="button"
                className={
                  "home-events__category-btn" +
                  (activeEventCategory === "sport"
                    ? " home-events__category-btn--active"
                    : "")
                }
                onClick={() => setActiveEventCategory("sport")}
              >
                Спорт
              </button>
            </div>

            <h6 className="home-events__disclaimer">
              *Мы не являемся организаторами мероприятий и не продаём билеты.
              <br />
              Информация о событиях носит ознакомительный характер.
            </h6>

            <div className="home-events-grid home-events-carousel">
              {filteredUpcomingEvents.map((event) => (
                <UpcomingEventCard
                  key={event.id}
                  event={event}
                  onBookTrip={handleUpcomingEventClick}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
