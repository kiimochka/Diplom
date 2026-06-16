import concertImage from "../img/concert.jpg";
import liveImage from "../img/live.jpg";
import theatreImage from "../img/theatre.jpg";
import hockeyImage from "../img/hockey.jpg";

export type EventCategory = "all" | "concert" | "theater" | "sport";

export type UpcomingEvent = {
  id: string;
  title: string;
  city: string;
  venue: string;
  date: string;
  image: string;
  category: Exclude<EventCategory, "all">;
  badge?: string;
  badgeColor?: "green" | "red";
  buttonText?: string;
  fromCity: string;
};

export const upcomingEvents: UpcomingEvent[] = [
  {
    id: "basta",
    title: "Баста",
    city: "Новосибирск",
    venue: "Дворец культуры",
    date: "2026-07-25 20:00",
    image: concertImage,
    category: "concert",
    badge: "Популярно",
    badgeColor: "green",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
  {
    id: "sirotkin",
    title: "Сироткин",
    city: "Красноярск",
    venue: "Концертный зал Сибирь",
    date: "2026-07-26 19:30",
    image: liveImage,
    category: "concert",
    badge: "Горячее!",
    badgeColor: "red",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
  {
    id: "crime-and-punishment",
    title: "Преступление и наказание",
    city: "Красноярск",
    venue: "Концертный зал Сибирь",
    date: "2026-07-27 19:00",
    image: theatreImage,
    category: "theater",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
  {
    id: "hockey",
    title: "Чемпионат по хоккею",
    city: "Новосибирск",
    venue: "Дворец спорта",
    date: "2026-07-28 19:30",
    image: hockeyImage,
    category: "sport",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
];
    id: "sirotkin",
    title: "Сироткин",
    city: "Красноярск",
    venue: "Концертный зал Сибирь",
    date: "2026-07-26 19:30",
    image: liveImage,
    category: "concert",
    badge: "Горячее!",
    badgeColor: "red",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
  {
    id: "crime-and-punishment",
    title: "Преступление и наказание",
    city: "Красноярск",
    venue: "Концертный зал Сибирь",
    date: "2026-07-27 19:00",
    image: theatreImage,
    category: "theater",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
  {
    id: "hockey",
    title: "Чемпионат по хоккею",
    city: "Новосибирск",
    venue: "Дворец спорта",
    date: "2026-07-28 19:30",
    image: hockeyImage,
    category: "sport",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
];
    id: "sirotkin",
    title: "Сироткин",
    city: "Красноярск",
    venue: "Концертный зал Сибирь",
    date: "2026-05-15 19:30",
    image:
      liveImage,
    category: "concert",
    badge: "Горячее!",
    badgeColor: "red",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
  {
    id: "crime-and-punishment",
    title: "Преступление и наказание",
    city: "Красноярск",
    venue: "Концертный зал Сибирь",
    date: "2026-05-08 19:00",
    image:
   theatreImage,
    category: "theater",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
  {
    id: "hockey",
    title: "Чемпионат по хоккею",
    city: "Новосибирск",
    venue: "Дворец спорта",
    date: "2026-05-20 19:30",
    image:
      hockeyImage,
    category: "sport",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
];
