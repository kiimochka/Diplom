import novosibirskImage from "../img/1_2097460.jpg";
import biyskImage from "../img/altai-2.jpg";
import kamenImage from "../img/home2.jpg";
import rubtsovskImage from "../img/live.jpg";

export type PopularEvent = {
  id: string;
  title: string;
  description: string;
  fromCity: string;
  toCity: string;
  image: string;
  imagePosition?: string;
  duration?: string;
  distance?: string;
  priceFrom?: number;
};

export const popularEvents: PopularEvent[] = [
  {
    id: "novosibirsk",
    title: "Новосибирск",
    description: "Ежедневные поездки из Барнаула через Тальменку и Черепаново.",
    fromCity: "Барнаул",
    toCity: "Новосибирск",
    image: novosibirskImage,
    duration: "4-5 часов",
    distance: "230 км",
    priceFrom: 900,
  },
  {
    id: "biysk",
    title: "Бийск",
    description: "Популярное направление к Сросткам, Белокурихе и Горному Алтаю.",
    fromCity: "Барнаул",
    toCity: "Бийск",
    image: biyskImage,
    duration: "2.5-3.5 часа",
    distance: "165 км",
    priceFrom: 650,
  },
  {
    id: "kamen-na-obi",
    title: "Камень-на-Оби",
    description: "Маршруты из Барнаула и Новосибирска через Павловск и Крутиху.",
    fromCity: "Барнаул",
    toCity: "Камень-на-Оби",
    image: kamenImage,
    imagePosition: "center 65%",
    duration: "3-4 часа",
    distance: "210 км",
    priceFrom: 850,
  },
  {
    id: "rubtsovsk",
    title: "Рубцовск",
    description: "Поездки на юго-запад края через Алейск и Поспелиху.",
    fromCity: "Барнаул",
    toCity: "Рубцовск",
    image: rubtsovskImage,
    duration: "4-5 часов",
    distance: "290 км",
    priceFrom: 1100,
  },
];
