import { Booking, BOOKINGS_STORAGE_KEY, User } from "../types";
import { readTrips } from "./tripsStorage";

export const BOOKING_REQUESTS_CHANGED_EVENT = "booking-requests-changed";

const readBookings = (): Booking[] => {
  const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);

  if (!storedBookings) return [];

  try {
    const parsed = JSON.parse(storedBookings);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
};

export const countPendingDriverRequests = (user: User | null): number => {
  if (!user) return 0;

  const myTripIds = new Set(
    readTrips()
      .filter((trip) => trip.driver.id === user.id)
      .map((trip) => trip.id),
  );

  return readBookings().filter(
    (booking) =>
      myTripIds.has(booking.tripId) && booking.status === "pending",
  ).length;
};

export const notifyBookingRequestsChanged = () => {
  window.dispatchEvent(new Event(BOOKING_REQUESTS_CHANGED_EVENT));
};
