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
    date: "2026-05-12 20:00",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
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
    date: "2026-05-15 19:30",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1200&q=80",
    category: "sport",
    buttonText: "Забронировать поездку",
    fromCity: "Барнаул",
  },
];
