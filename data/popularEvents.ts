import pryanikImage from "../img/пряники.png";
import saratovImage from "../img/глушь.jpg";
import homeImage from "../img/домой2.jpg";
import altaiRouteImage from "../img/1_2097460.jpg";

export type PopularEvent = {
  id: string;
  title: string;
  description: string;
  fromCity: string;
  toCity: string;
  image: string;
  imagePosition?: string;
  badge?: string;
  badgeColor?: "green" | "red";
  duration?: string;
  distance?: string;
  priceFrom?: number;
};

export const popularEvents: PopularEvent[] = [
  {
    id: "tula-pryanik",
    title: "За тульским пряником",
    description: "Гастротур в историческую Тулу.",
    fromCity: "Барнаул",
    toCity: "Тула",
    image: pryanikImage,
    badge: "Горячее!",
    badgeColor: "red",
    duration: "3-4 часа",
    distance: "180 км",
    priceFrom: 1800,
  },
  {
    id: "saratov-aunt",
    title: "К тетке в Саратов",
    description: "Комфортная поездка к родным.",
    fromCity: "Барнаул",
    toCity: "Саратов",
    image: saratovImage,
    imagePosition: "center 75%",
    badge: "Популярно",
    badgeColor: "green",
    duration: "8-10 часов",
    distance: "720 км",
    priceFrom: 1200,
  },
  {
    id: "weekend-dacha",
    title: "Выходные на даче",
    description: "Отдых за городом на выходных.",
    fromCity: "Барнаул",
    toCity: "Бердск",
    image: homeImage,
    duration: "1-1.5 часа",
    distance: "50 км",
    priceFrom: 1200,
  },
  {
    id: "altai-weekend",
    title: "В горы на выходные",
    description: "Маршрут к алтайским видам и свежему воздуху.",
    fromCity: "Барнаул",
    toCity: "Горно-Алтайск",
    image: altaiRouteImage,
    badge: "Новый маршрут",
    badgeColor: "green",
    duration: "4-5 часов",
    distance: "260 км",
    priceFrom: 1600,
  },
];
