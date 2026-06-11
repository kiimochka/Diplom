// src/pages/SearchResultsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm";
import TripCard from "../components/TripCard";
import { Trip, DriverGender, BaggageSize } from "../types";
import CargoTripCard from "../components/CargoTripCard";
import { useTripMode } from "../context/TripModeContext";
import PageHeader from "../components/layout/PageHeader";
import { readTrips } from "../utils/tripsStorage";
import { isPastDateInputValue } from "../utils/dateValidation";
import { FiltersSettingsIcon } from "../icons/IconsIndex";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResultsPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { setTripMode } = useTripMode();

  const tripType = query.get("tripType") === "cargo" ? "cargo" : "passenger";

  useEffect(() => {
    setTripMode(tripType);
  }, [tripType, setTripMode]);

  const from = query.get("from") || "";
  const to = query.get("to") || "";
  const date = query.get("date") || "";
  const hasPastSearchDate = isPastDateInputValue(date);
  const routeMode =
    query.get("routeMode") === "city" ? "city" : "intercity";
  const passengersRaw = Number(query.get("passengers") || "1");
  const passengers = Number.isNaN(passengersRaw) ? 1 : passengersRaw;

  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // читаем общий список поездок
  useEffect(() => {
    setAllTrips(readTrips());
  }, []);

  // базовый фильтр по параметрам поиска в URL
  const trips = useMemo(
    () =>
      allTrips.filter((trip) => {
        const matchesType = trip.type === tripType;
        const matchesFrom =
          !from || trip.fromCity.toLowerCase().includes(from.toLowerCase());
        const matchesTo =
          !to || trip.toCity.toLowerCase().includes(to.toLowerCase());
        const matchesDate = !date || trip.date === date;
        const matchesSeats = trip.freeSeats >= passengers;
        const matchesRouteMode =
          tripType !== "cargo" || (trip.routeMode ?? "intercity") === routeMode;

        return (
          !hasPastSearchDate &&
          matchesType &&
          matchesFrom &&
          matchesTo &&
          matchesDate &&
          matchesSeats &&
          matchesRouteMode
        );
      }),
    [
      allTrips,
      tripType,
      from,
      to,
      date,
      passengers,
      routeMode,
      hasPastSearchDate,
    ],
  );

  // состояние фильтров колонки
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [ratingThreshold, setRatingThreshold] = useState<number | null>(null);
  const [onlyWithLuggage, setOnlyWithLuggage] = useState(false);

  const [sortBy, setSortBy] = useState<
    "cheapest" | "fastest" | "earliest" | null
  >(null);
  const [driverGender, setDriverGender] = useState<DriverGender | null>(null);

  const [withChildSeat, setWithChildSeat] = useState(false);
  const [withPets, setWithPets] = useState(false);
  const [withSmoking, setWithSmoking] = useState(false);

  const [baggageSize, setBaggageSize] = useState<BaggageSize | null>(null);
  const backToHomeParams = useMemo(() => {
    const params = new URLSearchParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);
    params.set("tripType", tripType);
    params.set("routeMode", routeMode);
    params.set("passengers", String(passengers));

    return `/?${params.toString()}`;
  }, [from, to, date, tripType, routeMode, passengers]);

  const priceBounds = useMemo(() => {
    if (trips.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = trips.map((trip) =>
      trip.type === "cargo"
        ? (trip.pricePerCar ?? trip.pricePerSeat)
        : trip.pricePerSeat,
    );

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [trips]);

  useEffect(() => {
    setMaxPrice(priceBounds.max || null);
  }, [priceBounds.max]);

  const priceRangeProgress =
    priceBounds.max === priceBounds.min || maxPrice == null
      ? 100
      : ((maxPrice - priceBounds.min) /
          (priceBounds.max - priceBounds.min)) *
        100;

  const handleResetFilters = () => {
    setMaxPrice(priceBounds.max || null);
    setRatingThreshold(null);
    setOnlyWithLuggage(false);
    setSortBy(null);
    setDriverGender(null);
    setWithChildSeat(false);
    setWithPets(false);
    setWithSmoking(false);
    setBaggageSize(null);
  };

  // применяем фильтры и сортировку
  const filteredTrips = useMemo(() => {
    let result = trips.filter((trip) => {
      const tripPrice =
        trip.type === "cargo"
          ? (trip.pricePerCar ?? trip.pricePerSeat)
          : trip.pricePerSeat;
      const matchesPrice = maxPrice == null || tripPrice <= maxPrice;
      const driverRating = trip.driver.rating ?? 0;
      const matchesRating =
        ratingThreshold == null || driverRating >= ratingThreshold;
      const matchesLuggage =
        tripType === "cargo" ||
        !onlyWithLuggage ||
        trip.amenities?.luggageAllowed;

      const matchesGender = !driverGender || trip.driverGender === driverGender;

      const matchesChildSeat =
        tripType === "cargo" || !withChildSeat || trip.amenities?.childSeat;
      const matchesPets =
        tripType === "cargo" || !withPets || trip.amenities?.petsAllowed;
      const matchesSmoking =
        tripType === "cargo" || !withSmoking || trip.amenities?.smokingAllowed;

      const matchesBaggageSize =
        tripType === "cargo" || !baggageSize || trip.baggageSize === baggageSize;

      return (
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
    trips,
    tripType,
    maxPrice,
    ratingThreshold,
    onlyWithLuggage,
    sortBy,
    driverGender,
    withChildSeat,
    withPets,
    withSmoking,
    baggageSize,
  ]);

  return (
    <div className="results-page">
      <PageHeader
        title={tripType === "cargo" ? "Результаты поиска грузов" : "Результаты поиска"}
        fallback={backToHomeParams}
      />

      <SearchForm
        initialFromCity={from}
        initialToCity={to}
        initialDate={date}
        initialPassengers={passengers}
        tripType={tripType}
        initialRouteMode={routeMode}
        onSearch={(params) => {
          const nextParams = new URLSearchParams();
          if (params.from) nextParams.set("from", params.from);
          if (params.to) nextParams.set("to", params.to);
          if (params.date) nextParams.set("date", params.date);
          nextParams.set("passengers", String(params.passengers));
          nextParams.set("tripType", tripType);
          nextParams.set("routeMode", params.routeMode);

          navigate(`/search?${nextParams.toString()}`);
        }}
      />

      <button
        type="button"
        className={
          "results-filters-toggle " +
          (tripType === "cargo"
            ? "results-filters-toggle--cargo"
            : "results-filters-toggle--passenger")
        }
        aria-expanded={isFiltersOpen}
        aria-controls="search-results-filters"
        onClick={() => setIsFiltersOpen((current) => !current)}
      >
        <FiltersSettingsIcon aria-hidden="true" />
        <span>Фильтры</span>
      </button>

      {hasPastSearchDate ? (
        <p className="results-empty">
          Дата поездки уже прошла. Выберите сегодняшнюю или будущую дату.
        </p>
      ) : trips.length === 0 && (
        <p className="results-empty">
          По заданным параметрам поездок пока нет.
        </p>
      )}

      <div className="results-layout">
        <aside
          id="search-results-filters"
          className={
            "results-filters " +
            (tripType === "cargo"
              ? "results-filters--cargo"
              : "results-filters--passenger") +
            (isFiltersOpen ? " results-filters--open" : "")
          }
        >
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
            <span className="results-filter-label">Стоимость</span>

            <div className="price-range-row">
              <span className="price-range-min">{priceBounds.min} ₽</span>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={tripType === "cargo" ? 500 : 100}
                className={
                  "price-range " +
                  (tripType === "cargo"
                    ? "price-range--cargo"
                    : "price-range--passenger")
                }
                style={
                  {
                    "--price-range-progress": `${priceRangeProgress}%`,
                  } as React.CSSProperties
                }
                value={maxPrice ?? priceBounds.max}
                disabled={priceBounds.min === priceBounds.max}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <span className="price-range-max">{priceBounds.max} ₽</span>
            </div>

            <div className="price-range-value">
              до {maxPrice ?? priceBounds.max} ₽
            </div>
          </div>

          <div className="results-filter-group">
            <span className="results-filter-label">Рейтинг водителя</span>
            <div
              className={
                "rating-segmented " +
                (tripType === "cargo"
                  ? "rating-segmented--cargo"
                  : "rating-segmented--passenger")
              }
              aria-label="Рейтинг водителя"
            >
              <button
                type="button"
                className={
                  "rating-segment" +
                  (ratingThreshold == null ? " rating-segment--active" : "") +
                  (tripType === "cargo" ? " rating-segment--cargo" : "")
                }
                onClick={() => setRatingThreshold(null)}
              >
                Любой
              </button>
              <button
                type="button"
                className={
                  "rating-segment" +
                  (ratingThreshold === 4 ? " rating-segment--active" : "") +
                  (tripType === "cargo" ? " rating-segment--cargo" : "")
                }
                onClick={() => setRatingThreshold(4)}
              >
                4+
              </button>
              <button
                type="button"
                className={
                  "rating-segment" +
                  (ratingThreshold === 4.5 ? " rating-segment--active" : "") +
                  (tripType === "cargo" ? " rating-segment--cargo" : "")
                }
                onClick={() => setRatingThreshold(4.5)}
              >
                4.5+
              </button>
              <button
                type="button"
                className={
                  "rating-segment" +
                  (ratingThreshold === 5 ? " rating-segment--active" : "") +
                  (tripType === "cargo" ? " rating-segment--cargo" : "")
                }
                onClick={() => setRatingThreshold(5)}
              >
                5
              </button>
            </div>
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

          {tripType === "passenger" && (
            <>
              <h4 className="results-filter-title">Удобства</h4>
              <div className="results-filter-group">
                <label className="results-filter-checkbox">
                  <input
                    type="checkbox"
                    className="checkbox-square checkbox-square--passenger"
                    checked={withChildSeat}
                    onChange={(e) => setWithChildSeat(e.target.checked)}
                  />
                  Есть детское кресло
                </label>
                <label className="results-filter-checkbox">
                  <input
                    type="checkbox"
                    className="checkbox-square checkbox-square--passenger"
                    checked={withPets}
                    onChange={(e) => setWithPets(e.target.checked)}
                  />
                  Можно с животными
                </label>
                <label className="results-filter-checkbox">
                  <input
                    type="checkbox"
                    className="checkbox-square checkbox-square--passenger"
                    checked={withSmoking}
                    onChange={(e) => setWithSmoking(e.target.checked)}
                  />
                  Можно курить
                </label>
                <label className="results-filter-checkbox">
                  <input
                    type="checkbox"
                    className="checkbox-square checkbox-square--passenger"
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
                    className="radio-circle radio-circle--passenger"
                    checked={baggageSize === "small"}
                    onChange={() => setBaggageSize("small")}
                  />
                  Маленький
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="baggageSize"
                    className="radio-circle radio-circle--passenger"
                    checked={baggageSize === "medium"}
                    onChange={() => setBaggageSize("medium")}
                  />
                  Средний
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="baggageSize"
                    className="radio-circle radio-circle--passenger"
                    checked={baggageSize === "large"}
                    onChange={() => setBaggageSize("large")}
                  />
                  Большой
                </label>
              </div>
            </>
          )}

          <button
            type="button"
            className={
              "results-filters-reset-all " +
              (tripType === "cargo" ? "results-filters-reset-all--cargo" : "")
            }
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </button>
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
    </div>
  );
};

export default SearchResultsPage;
