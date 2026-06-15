// src/utils/initMockData.ts
import {
  TRIPS_STORAGE_KEY,
  USERS_STORAGE_KEY,
  BOOKINGS_STORAGE_KEY,
  CARS_STORAGE_KEY,
  CHATS_STORAGE_KEY,
  REVIEWS_STORAGE_KEY,
} from "../types";

import {
  mockTrips,
  mockUsers,
  mockBookings,
  mockCars,
  mockChats,
  mockReviews,
} from "../mockData";

const AUTH_STORAGE_KEY = "rideshare-user";
const MOCK_DATA_VERSION_KEY = "rideshare-mock-data-version";
const MOCK_DATA_VERSION = "2026-06-15-altai-routes";

export const initMockData = () => {
  if (typeof window === "undefined") return;

  const shouldResetData =
    localStorage.getItem(MOCK_DATA_VERSION_KEY) !== MOCK_DATA_VERSION;

  if (!shouldResetData && localStorage.getItem(TRIPS_STORAGE_KEY)) {
    if (!localStorage.getItem(REVIEWS_STORAGE_KEY)) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(mockReviews));
    }

    return;
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(mockTrips));
  localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(mockCars));
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(mockBookings));
  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(mockChats));
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(mockReviews));
  localStorage.removeItem(AUTH_STORAGE_KEY);

  localStorage.setItem(MOCK_DATA_VERSION_KEY, MOCK_DATA_VERSION);
};
