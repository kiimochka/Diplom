export const MIN_PASSENGER_SEATS = 1;
export const MAX_PASSENGER_SEATS = 8;

export const clampPassengerSeats = (value: number) => {
  if (!Number.isFinite(value)) return MIN_PASSENGER_SEATS;

  return Math.min(
    MAX_PASSENGER_SEATS,
    Math.max(MIN_PASSENGER_SEATS, Math.trunc(value)),
  );
};
