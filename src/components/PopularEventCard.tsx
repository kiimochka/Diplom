import React from "react";
import { PopularEvent } from "../data/popularEvents";

type Props = {
  event: PopularEvent;
  onFindTrip: (event: PopularEvent) => void;
};

const PopularEventCard: React.FC<Props> = ({ event, onFindTrip }) => {
  return (
    <article className="popular-event-card">
      <div className="popular-event-card__image-wrap">
        <img
          src={event.image}
          alt={event.title}
          className="popular-event-card__image"
          style={
            event.imagePosition
              ? { objectPosition: event.imagePosition }
              : undefined
          }
        />
        {event.badge && (
          <span
            className={
              "popular-event-card__badge " +
              (event.badgeColor === "red"
                ? "popular-event-card__badge--red"
                : "popular-event-card__badge--green")
            }
          >
            {event.badge}
          </span>
        )}
      </div>

      <div className="popular-event-card__content">
        <h3 className="popular-event-card__title">{event.title}</h3>
        <p className="popular-event-card__description">{event.description}</p>

        <div className="popular-event-card__meta">
          {event.duration && <span>{event.duration}</span>}
          {event.distance && <span>{event.distance}</span>}
        </div>

        {typeof event.priceFrom === "number" && (
          <div className="popular-event-card__price">
            Цена за место: <strong>от {event.priceFrom}₽</strong>
          </div>
        )}

        <button
          type="button"
          className="popular-event-card__button"
          onClick={() => onFindTrip(event)}
        >
          Найти поездку
        </button>
      </div>
    </article>
  );
};

export default PopularEventCard;
