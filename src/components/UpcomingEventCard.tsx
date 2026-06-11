import React from "react";
import { UpcomingEvent } from "../data/upcomingEvents";

type Props = {
  event: UpcomingEvent;
  onBookTrip: (event: UpcomingEvent) => void;
};

const categoryLabelMap = {
  concert: "Концерт",
  theater: "Театр",
  sport: "Спорт",
};

const UpcomingEventCard: React.FC<Props> = ({ event, onBookTrip }) => {
  return (
    <article className="upcoming-event-card">
      <div className="upcoming-event-card__image-wrap">
        <img
          src={event.image}
          alt={event.title}
          className="upcoming-event-card__image"
        />

        <span className="upcoming-event-card__category">
          {categoryLabelMap[event.category]}
        </span>

        {event.badge && (
          <span
            className={
              "upcoming-event-card__badge " +
              (event.badgeColor === "red"
                ? "upcoming-event-card__badge--red"
                : "upcoming-event-card__badge--green")
            }
          >
            {event.badge}
          </span>
        )}
      </div>

      <div className="upcoming-event-card__content">
        <h3 className="upcoming-event-card__title">{event.title}</h3>

        <p className="upcoming-event-card__location">
          {event.city}, {event.venue}
        </p>

        <p className="upcoming-event-card__date">
          {formatEventDate(event.date)}
        </p>

        <button
          type="button"
          className="upcoming-event-card__button"
          onClick={() => onBookTrip(event)}
        >
          {event.buttonText || "Забронировать поездку"}
        </button>
      </div>
    </article>
  );
};

function formatEventDate(value: string) {
  const [datePart, timePart] = value.split(" ");
  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");
  const monthNames = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const monthIndex = Number(month) - 1;
  const monthLabel = monthNames[monthIndex] || month;

  return `${day} ${monthLabel} ${year}, ${timePart || ""}`.trim();
}

export default UpcomingEventCard;
