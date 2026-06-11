// src/types/index.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  rating?: number;
  carName?: string;
  about?: string;
  avatarUrl?: string;
  location?: string;
}

export type DriverGender = "male" | "female";
export type BaggageSize = "small" | "medium" | "large";

export type TripType = "passenger" | "cargo";
export type RouteMode = "intercity" | "city";
export interface Trip {
  id: string;
  fromCity: string;
  toCity: string;
  routeMode?: RouteMode;
  date: string;
  departureTime: string;
  arrivalTime: string;
  driver: User;
  pricePerSeat: number;
  freeSeats: number;
  type: TripType;
  comment?: string;
  status?: TripStatus;
  cancellationReason?: string;
  cancelledAt?: string;

  stops?: string[]; // промежуточные точки
  carId?: string; // выбранная машина
  amenities?: {
    childSeat: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    luggageAllowed: boolean;
  };
  driverGender?: DriverGender;
  baggageSize?: BaggageSize;

  // только для грузовых
  cargoTypes?: string[]; // Типы груза: ["личные вещи", "мебель"]
  cargoLength?: number; // Длина груза в метрах
  cargoHeight?: number; // Высота груза в метрах
  cargoWidth?: number; // Ширина груза в метрах
  cargoWeight?: number; // Допустимый вес в килограммах
  cargoVehicleType?: string; // Тип транспорта: "универсал"
  cargoServices?: string[]; // Дополнительные услуги
  pricePerCar?: number; // Цена за машину
}

export type TripStatus = "active" | "archived" | "cancelled";

export interface TripHistoryItem extends Trip {
  status: TripStatus;
}

export interface PublicProfile extends User {
  about?: string;
  tripsCount?: number;
  reviewsCount?: number;
}

export interface Review {
  id: string;
  targetUserId: string;
  authorId: string;
  rating: number;
  text: string;
  createdAt: string;
  tripId?: string;
}

export const TRIPS_STORAGE_KEY = "rideshare-trips";
export const BOOKINGS_STORAGE_KEY = "rideshare-bookings";
export const USERS_STORAGE_KEY = "rideshare-users";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled_by_driver"
  | "cancelled_by_passenger"
  | "trip_cancelled";

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  seats: number;
  createdAt: string; // ISO-строка
  status: BookingStatus;
  cancellationReason?: string;
  cancelledAt?: string;
}

// ключ для хранения машин
export const CARS_STORAGE_KEY = "rideshare-cars";

export interface Car {
  id: string;
  ownerId: string; // id пользователя
  brand: string;
  model: string;
  color?: string;
  plate?: string;
}

export const CHATS_STORAGE_KEY = "rideshare-chats";
export const REVIEWS_STORAGE_KEY = "rideshare-reviews";

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string; // ISO
}

export interface Chat {
  id: string;
  driverId: string;
  passengerId: string;
  tripId: string;
  lastMessage: string;
  lastMessageAt: string; // ISO
}
