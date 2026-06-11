import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Trip, User } from "../types";
import "../styles/user-profile-page.css";
import PageHeader from "../components/layout/PageHeader";
import { readTrips } from "../utils/tripsStorage";
import { getCurrentReturnPath, getSafeReturnTo } from "../utils/returnTo";
import { readReviews } from "../utils/reviewsStorage";
import { readUsers } from "../utils/usersStorage";
import {
  CalendarIcon,
  MessageIcon,
  People,
  PinIcon,
  StarFilledIcon,
  TripIcon,
  TruckIcon,
} from "../icons/IconsIndex";

type ProfileState = {
  profile: User | null;
  users: User[];
  trips: Trip[];
  reviews: ReturnType<typeof readReviews>;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getTripPath = (trip: Trip) =>
  trip.type === "cargo" ? `/cargo-trip/${trip.id}` : `/trip/${trip.id}`;

const Avatar: React.FC<{ user: User; size?: "large" | "small" }> = ({
  user,
  size = "large",
}) => (
  <div className={`user-profile-avatar user-profile-avatar--${size}`}>
    {user.avatarUrl ? (
      <img src={user.avatarUrl} alt={user.fullName} />
    ) : (
      <People aria-hidden="true" />
    )}
  </div>
);

const UserProfilePage: React.FC = () => {
  const { id, userId } = useParams<{ id?: string; userId?: string }>();
  const profileId = id ?? userId;
  const location = useLocation();
  const returnTo = getSafeReturnTo(
    new URLSearchParams(location.search).get("returnTo"),
  );
  const currentReturnPath = getCurrentReturnPath(location);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<ProfileState>({
    profile: null,
    users: [],
    trips: [],
    reviews: [],
  });

  useEffect(() => {
    setIsLoading(true);

    const users = readUsers();
    const trips = readTrips();
    const reviews = readReviews();

    setState({
      profile: users.find((user) => user.id === profileId) ?? null,
      users,
      trips,
      reviews,
    });
    setIsLoading(false);
  }, [profileId]);

  const profileTrips = useMemo(
    () => state.trips.filter((trip) => trip.driver.id === state.profile?.id),
    [state.profile?.id, state.trips],
  );

  const profileReviews = useMemo(
    () =>
      state.reviews
        .filter((review) => review.targetUserId === state.profile?.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [state.profile?.id, state.reviews],
  );

  const averageReviewRating = profileReviews.length
    ? (
        profileReviews.reduce((sum, review) => sum + review.rating, 0) /
        profileReviews.length
      ).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="user-profile-page">
        <PageHeader title="Профиль пользователя" fallback={returnTo ?? "/"} />
        <section className="user-profile-card user-profile-loading">
          <div className="user-profile-skeleton user-profile-skeleton--avatar" />
          <div className="user-profile-loading-lines">
            <div className="user-profile-skeleton" />
            <div className="user-profile-skeleton user-profile-skeleton--short" />
          </div>
        </section>
      </div>
    );
  }

  if (!state.profile) {
    return (
      <div className="user-profile-page">
        <PageHeader title="Профиль пользователя" fallback={returnTo ?? "/"} />
        <section className="user-profile-card user-profile-empty">
          <People className="user-profile-empty-icon" aria-hidden="true" />
          <h2>Профиль не найден</h2>
          <p>
            Не получилось найти пользователя с таким id. Возможно, профиль был
            удален или ссылка устарела.
          </p>
        </section>
      </div>
    );
  }

  const profile = state.profile;

  return (
    <div className="user-profile-page">
      <PageHeader
        title="Профиль пользователя"
        fallback={returnTo ?? "/profile"}
      />

      <section className="user-profile-card user-main-info">
        <Avatar user={profile} />

        <div className="user-main-info-content">
          <div>
            <h2>{profile.fullName}</h2>
            {profile.location && (
              <div className="user-profile-location">
                <PinIcon aria-hidden="true" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          <div className="user-profile-meta">
            <span className="user-profile-badge">
              <StarFilledIcon aria-hidden="true" />
              Рейтинг: {averageReviewRating ?? profile.rating ?? "нет данных"}
            </span>
            <span className="user-profile-badge">
              <TripIcon aria-hidden="true" />
              Поездок: {profileTrips.length}
            </span>
            <span className="user-profile-badge">
              <MessageIcon aria-hidden="true" />
              Отзывов: {profileReviews.length}
            </span>
            {profile.carName && (
              <span className="user-profile-badge">
                <TruckIcon aria-hidden="true" />
                {profile.carName}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="user-profile-content-grid">
        <section className="user-profile-card user-about">
          <div className="user-profile-section-title">
            <People aria-hidden="true" />
            <h3>О пользователе</h3>
          </div>
          <p>
            {profile.about?.trim() ||
              "Пользователь пока не добавил краткое описание."}
          </p>
        </section>

        <section className="user-profile-card user-created-trips">
          <div className="user-profile-section-title">
            <TripIcon aria-hidden="true" />
            <h3>Созданные поездки</h3>
          </div>

          {profileTrips.length === 0 ? (
            <div className="user-profile-empty-state">
              Пользователь пока не создавал поездок.
            </div>
          ) : (
            <div className="user-profile-trips-list">
              {profileTrips.map((trip) => (
                <Link
                  key={trip.id}
                  to={getTripPath(trip)}
                  state={{ from: currentReturnPath }}
                  className="user-profile-trip-card"
                >
                  <div className="user-profile-trip-icon">
                    {trip.type === "cargo" ? (
                      <TruckIcon aria-hidden="true" />
                    ) : (
                      <TripIcon aria-hidden="true" />
                    )}
                  </div>
                  <div className="user-profile-trip-main">
                    <div className="user-profile-trip-route">
                      <span>{trip.fromCity}</span>
                      <span className="user-profile-route-separator">—</span>
                      <span>{trip.toCity}</span>
                    </div>
                    <div className="user-profile-trip-details">
                      <span>
                        <CalendarIcon aria-hidden="true" />
                        {formatDate(trip.date)}, {trip.departureTime}
                      </span>
                      <span>
                        {trip.type === "cargo"
                          ? `${trip.pricePerCar ?? trip.pricePerSeat} ₽ за машину`
                          : `${trip.pricePerSeat} ₽ за место`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="user-profile-card user-reviews">
          <div className="user-profile-section-title">
            <MessageIcon aria-hidden="true" />
            <h3>Отзывы</h3>
          </div>

          {profileReviews.length === 0 ? (
            <div className="user-profile-empty-state">
              У пользователя пока нет отзывов.
            </div>
          ) : (
            <div className="user-reviews-list">
              {profileReviews.map((review) => {
                const author = state.users.find(
                  (user) => user.id === review.authorId,
                );
                const authorName = author?.fullName ?? "Пользователь удален";

                return (
                  <article className="user-review-item" key={review.id}>
                    <div className="user-review-header">
                      {author ? (
                        <Link
                          to={`/user/${author.id}`}
                          state={{ from: currentReturnPath }}
                          className="user-review-author"
                        >
                          <Avatar user={author} size="small" />
                          <span>{authorName}</span>
                        </Link>
                      ) : (
                        <div className="user-review-author">
                          <div className="user-profile-avatar user-profile-avatar--small">
                            <People aria-hidden="true" />
                          </div>
                          <span>{authorName}</span>
                        </div>
                      )}

                      <span className="user-review-rating">
                        <StarFilledIcon aria-hidden="true" />
                        {review.rating.toFixed(1)}
                      </span>
                    </div>

                    <p>{review.text}</p>
                    <time dateTime={review.createdAt}>
                      {formatDate(review.createdAt)}
                    </time>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;
