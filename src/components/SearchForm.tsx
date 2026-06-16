import React, { useEffect, useState, FormEvent } from "react";
import { useToast } from "../context/ToastContext";
import CargoSearchFilters from "./CargoSearchFilters";
import {
  getTodayDateInputValue,
  isPastDateInputValue,
} from "../utils/dateValidation";
import {
  MAX_PASSENGER_SEATS,
  MIN_PASSENGER_SEATS,
  clampPassengerSeats,
} from "../utils/passengerSeats";

interface SearchFormProps {
  initialFromCity?: string;
  initialToCity?: string;
  initialDate?: string;
  initialPassengers?: number;
  tripType?: "passenger" | "cargo";
  initialRouteMode?: "intercity" | "city";
  onSearch?: (params: {
    from: string;
    to: string;
    date: string;
    passengers: number;
    routeMode: "intercity" | "city";
  }) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  initialFromCity = "",
  initialToCity = "",
  initialDate = "",
  initialPassengers = 1,
  tripType = "passenger",
  initialRouteMode = "intercity",
  onSearch,
}) => {
  const { showToast } = useToast();
  const [fromCity, setFromCity] = useState(initialFromCity);
  const [toCity, setToCity] = useState(initialToCity);
  const [date, setDate] = useState(initialDate);
  const [passengers, setPassengers] = useState(() =>
    clampPassengerSeats(initialPassengers),
  );
  const [routeMode, setRouteMode] = useState<"intercity" | "city">(
    initialRouteMode,
  );
  const minTripDate = getTodayDateInputValue();

  useEffect(() => {
    setFromCity(initialFromCity);
    setToCity(initialToCity);
    setDate(initialDate);
    setPassengers(clampPassengerSeats(initialPassengers));
    setRouteMode(initialRouteMode);
  }, [
    initialFromCity,
    initialToCity,
    initialDate,
    initialPassengers,
    initialRouteMode,
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isCityCargoSearch = isCargo && routeMode === "city";

    if (!fromCity.trim()) {
      showToast({
        type: "error",
        title: "Укажите город отправления",
        message: "Поиск доступен только после заполнения поля «Откуда».",
      });
      return;
    }

    if (!isCityCargoSearch && !toCity.trim()) {
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
        message: "Поиск доступен только после выбора даты.",
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

    if (onSearch) {
      onSearch({
        from: fromCity,
        to: toCity,
        date,
        passengers,
        routeMode,
      });
    }
  };

  const isCargo = tripType === "cargo";

  return (
    <form
      className={
        "search-form home-search-bar " +
        (isCargo ? "home-search-bar--cargo" : "home-search-bar--passenger")
      }
      onSubmit={handleSubmit}
    >
      {isCargo ? (
        <>
          <div className="cargo-search-main">
            <div className="cargo-search-row cargo-search-row--top">
              <select
                className="home-search-input cargo-route-type"
                value={routeMode}
                onChange={(e) =>
                  setRouteMode(e.target.value === "city" ? "city" : "intercity")
                }
              >
                <option value="intercity">По межгороду</option>
                <option value="city">По городу</option>
              </select>

              <input
                className="home-search-input cargo-when-intercity"
                type="date"
                value={date}
                min={minTripDate}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div
              className={
                "cargo-search-row cargo-search-row--cities " +
                (routeMode === "city" ? "cargo-search-row--city-only" : "")
              }
            >
              {routeMode === "intercity" ? (
                <>
                  <input
                    className="home-search-input"
                    type="text"
                    placeholder="Откуда"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    required
                  />
                  <input
                    className="home-search-input"
                    type="text"
                    placeholder="Куда"
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    required
                  />
                </>
              ) : (
                <input
                  className="home-search-input cargo-from-full"
                  type="text"
                  placeholder="Откуда"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  required
                />
              )}
            </div>

            <button
              type="submit"
              className="home-search-submit home-search-submit--cargo"
            >
              Найти поездку
            </button>
          </div>

          <CargoSearchFilters />
        </>
      ) : (
        <>
          <input
            className="home-search-input"
            type="text"
            placeholder="Откуда"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            required
          />
          <input
            className="home-search-input"
            type="text"
            placeholder="Куда"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            required
          />

          <div className="home-search-row-bottom">
            <input
              className="home-search-input"
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
                onClick={() =>
                  setPassengers((p) =>
                    Math.max(MIN_PASSENGER_SEATS, p - 1),
                  )
                }
              >
                −
              </button>

              <div className="home-passengers-value">
                {passengers} пассажир{passengers > 1 ? "а" : ""}
              </div>

              <button
                type="button"
                className="home-passengers-btn home-passengers-btn--plus"
                onClick={() =>
                  setPassengers((p) =>
                    Math.min(MAX_PASSENGER_SEATS, p + 1),
                  )
                }
              >
                +
              </button>
            </div>
          </div>

          <button type="submit" className="home-search-submit">
            Найти поездку
          </button>
        </>
      )}
    </form>
  );
};

export default SearchForm;
