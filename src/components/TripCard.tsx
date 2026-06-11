import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookingStatus } from "../types";
import { getCurrentReturnPath } from "../utils/returnTo";

type TripCardProps = {
  id?: string;
  time: string;
  date?: string;
  fromCity: string;
  toCity: string;
  driverName: string;
  carName?: string;
  price: number;
  seatsLeft: number;
  context?: "history-driver" | "history-passenger" | "search";
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

const TripCard: React.FC<TripCardProps> = ({
  id,
  time,
  date,
  fromCity,
  toCity,
  driverName,
  carName,
  price,
  seatsLeft,
  context = "search",
  bookingStatus,
}) => {
  const location = useLocation();
  const tripPath = id ? `/trip/${id}` : "";
  const fromPath = getCurrentReturnPath(location);

  const content = (
    <div className="trip-card">
      <div className="trip-card-main">
        <div className="trip-card-time-route">
          <div className="trip-card-time">
            {date ? `${formatTripDate(date)}, ${time}` : time}
          </div>
          <div className="trip-card-route">
            <span>{fromCity}</span>
            <span className="trip-card-route-separator">—</span>
            <span>{toCity}</span>
          </div>
        </div>

        <div className="trip-card-driver">
          <div className="trip-card-avatar" />
          <div className="trip-card-driver-info">
            <div className="trip-card-driver-name">{driverName}</div>
            {carName && <div className="trip-card-car">{carName}</div>}
          </div>
        </div>
      </div>

      <div className="trip-card-side">
        <div className="trip-card-price">{price} ₽</div>
        {context === "history-passenger" && bookingStatus ? (
          <div
            className={`booking-status-badge booking-status-badge--${bookingStatus}`}
          >
            {BOOKING_STATUS_LABELS[bookingStatus]}
          </div>
        ) : (
          <div className="trip-card-seats">Осталось {seatsLeft} мест</div>
        )}
      </div>
    </div>
  );

  // если есть id — делаем кликабельной ВСЮ карточку
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

export default TripCard;
