// src/types/index.ts

export interface User {
  id: string;
  fullName: string;
  email: string;
  rating?: number;
  carName?: string;
}

export interface Trip {
  id: string;
  fromCity: string;
  toCity: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  driver: User;
  pricePerSeat: number;
  freeSeats: number;

  stops?: string[]; // промежуточные точки
  carId?: string; // выбранная машина
  amenities?: {
    childSeat: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    luggageAllowed: boolean;
  };
}

export type TripStatus = "active" | "archived";

export interface TripHistoryItem extends Trip {
  status: TripStatus;
}

export interface PublicProfile extends User {
  about?: string;
  tripsCount?: number;
  reviewsCount?: number;
}

export const TRIPS_STORAGE_KEY = "rideshare-trips";
export const BOOKINGS_STORAGE_KEY = "rideshare-bookings";
export const USERS_STORAGE_KEY = "rideshare-users";

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  seats: number;
  createdAt: string; // ISO-строка
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
