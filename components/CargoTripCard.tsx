// src/components/CargoTripCard.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookingStatus } from "../types";
import { getCurrentReturnPath } from "../utils/returnTo";
import {
  BoxIcon,
  CarIcon,
  PlusIcon,
  WeightIcon,
} from "../icons/IconsIndex";

type CargoTripCardProps = {
  id?: string;
  date?: string;
  departureTime?: string;
  fromCity: string;
  toCity: string;

  // модель автомобиля
  carTitle: string; // например: "ГАЗ Газель"

  // описание груза
  cargoTypes: string[];
  cargoLength?: number;
  cargoHeight?: number;
  cargoWidth?: number;
  cargoWeight?: number;
  cargoVehicleType?: string;
  cargoServices?: string[];

  // параметры снизу
  pricePerCar: number;
  bookingStatus?: BookingStatus;
};

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  rejected: "Отклонено",
  cancelled_by_driver: "Бронь отменена водителем",
  cancelled_by_passenger: "Вы отказались от поездки",
  trip_cancelled: "Поездка отменена",
};

const CargoTripCard: React.FC<CargoTripCardProps> = ({
  id,
  date,
  departureTime,
  fromCity,
  toCity,
  carTitle,
  cargoTypes,
  cargoLength,
  cargoHeight,
  cargoWidth,
  cargoWeight,
  cargoVehicleType,
  cargoServices = [],
  pricePerCar,
  bookingStatus,
}) => {
  const location = useLocation();
  const tripPath = id ? `/cargo-trip/${id}` : "";
  const fromPath = getCurrentReturnPath(location);
  const cargoTypesLabel = cargoTypes.length ? cargoTypes.join(", ") : "уточняется";
  const cargoDimensionsLabel =
    cargoLength && cargoHeight && cargoWidth
      ? `${cargoLength} × ${cargoHeight} × ${cargoWidth} м`
      : "";

  const content = (
    <div className="cargo-card">
      {/* Левая часть */}
      <div className="cargo-card-left">
        {/* верх: фото + текстовый блок */}
        <div className="cargo-card-top-row">
          <div className="cargo-card-image" />

          <div className="cargo-card-text">
            {date && (
              <div className="cargo-card-date">
                {departureTime
                  ? `${formatTripDate(date)}, ${departureTime}`
                  : formatTripDate(date)}
              </div>
            )}

            {/* маршрут */}
            <div className="cargo-card-route">
              <span>{fromCity}</span>
              {toCity && (
                <>
                  <span className="cargo-card-route-separator">—</span>
                  <span>{toCity}</span>
                </>
              )}
            </div>

            {/* модель автомобиля */}
            <div className="cargo-card-car-title">{carTitle}</div>

            {/* тип груза */}
            <div className="cargo-card-cargo-type">
              Тип груза: {cargoTypesLabel}
            </div>
          </div>
        </div>

        {/* нижний ряд: параметры с иконками */}
        <div className="cargo-card-params-row">
          {cargoDimensionsLabel && (
            <div className="cargo-card-param">
              <span className="cargo-card-param-icon">
                <BoxIcon aria-hidden="true" />
              </span>
              <span className="cargo-card-param-text">
                габариты: {cargoDimensionsLabel}
              </span>
            </div>
          )}

          {cargoWeight !== undefined && (
            <div className="cargo-card-param">
              <span className="cargo-card-param-icon">
                <WeightIcon aria-hidden="true" />
              </span>
              <span className="cargo-card-param-text">
                до {cargoWeight} кг
              </span>
            </div>
          )}

          {cargoVehicleType && (
            <div className="cargo-card-param">
              <span className="cargo-card-param-icon">
                <CarIcon aria-hidden="true" />
              </span>
              <span className="cargo-card-param-text">{cargoVehicleType}</span>
            </div>
          )}

          {cargoServices.slice(0, 2).map((service) => (
            <div className="cargo-card-param" key={service}>
              <span className="cargo-card-param-icon">
                <PlusIcon aria-hidden="true" />
              </span>
              <span className="cargo-card-param-text">{service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Правая часть */}
      <div className="cargo-card-side">
        <div className="cargo-card-price-chip">
          <span className="cargo-card-price-label">За машину</span>
          <span className="cargo-card-price-value">{pricePerCar} ₽</span>
        </div>

        {bookingStatus ? (
          <div
            className={`booking-status-badge booking-status-badge--${bookingStatus}`}
          >
            {BOOKING_STATUS_LABELS[bookingStatus]}
          </div>
        ) : null}
      </div>
    </div>
  );

  return id ? (
    <Link
      to={tripPath}
      state={{ from: fromPath }}
      className="trip-card-link-wrapper"
    >
      {content}
    </Link>
  ) : (
    content
  );
};

function formatTripDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(date);
}

export default CargoTripCard;
