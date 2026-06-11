import { mockTrips } from "../mockData";
import { Trip, TRIPS_STORAGE_KEY } from "../types";

type LegacyCargoTrip = Trip & {
  cargoType?: string;
  cargoSize?: string;
  cargoWeight?: string | number;
  cargoDescription?: string;
  cargoWeightTons?: number;
  isTent?: boolean;
};

const LEGACY_SIZE_DIMENSIONS: Record<
  string,
  Pick<Trip, "cargoLength" | "cargoHeight" | "cargoWidth">
> = {
  маленький: { cargoLength: 0.5, cargoHeight: 0.3, cargoWidth: 0.4 },
  "маленький груз": { cargoLength: 0.5, cargoHeight: 0.3, cargoWidth: 0.4 },
  средний: { cargoLength: 1, cargoHeight: 0.7, cargoWidth: 0.7 },
  "средний груз": { cargoLength: 1, cargoHeight: 0.7, cargoWidth: 0.7 },
  крупный: { cargoLength: 2, cargoHeight: 1.5, cargoWidth: 1 },
  "крупный груз": { cargoLength: 2, cargoHeight: 1.5, cargoWidth: 1 },
  негабаритный: { cargoLength: 3, cargoHeight: 2, cargoWidth: 1.5 },
  "негабаритный груз": { cargoLength: 3, cargoHeight: 2, cargoWidth: 1.5 },
  "несколько мест": { cargoLength: 1.5, cargoHeight: 1, cargoWidth: 1 },
  "несколько грузов": { cargoLength: 1.5, cargoHeight: 1, cargoWidth: 1 },
};

const isTrip = (value: unknown): value is Trip => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "string"
  );
};

const parseCargoWeightKg = (value: string | number | undefined) => {
  if (typeof value === "number") return value;
  if (!value) return undefined;

  const match = value.match(/\d+(?:[.,]\d+)?/);
  if (!match) return undefined;

  return Number(match[0].replace(",", "."));
};

const normalizeTrip = (trip: Trip): Trip => {
  if (trip.type !== "cargo") return trip;

  const legacyTrip = trip as LegacyCargoTrip;
  const {
    cargoType,
    cargoSize,
    cargoDescription,
    cargoWeightTons,
    isTent,
    ...currentTrip
  } = legacyTrip;
  const legacyDimensions = cargoSize ? LEGACY_SIZE_DIMENSIONS[cargoSize] : {};

  return {
    ...currentTrip,
    cargoTypes: currentTrip.cargoTypes ?? (cargoType ? [cargoType] : []),
    cargoLength: currentTrip.cargoLength ?? legacyDimensions.cargoLength,
    cargoHeight: currentTrip.cargoHeight ?? legacyDimensions.cargoHeight,
    cargoWidth: currentTrip.cargoWidth ?? legacyDimensions.cargoWidth,
    cargoWeight: parseCargoWeightKg(legacyTrip.cargoWeight),
  };
};

export const readTrips = (): Trip[] => {
  if (typeof window === "undefined") {
    return mockTrips;
  }

  const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);

  if (!storedTrips) {
    return mockTrips;
  }

  try {
    const parsedTrips = JSON.parse(storedTrips);

    if (!Array.isArray(parsedTrips)) {
      return mockTrips;
    }

    const tripsById = new Map<string, Trip>();

    mockTrips.forEach((trip) => {
      tripsById.set(trip.id, normalizeTrip(trip));
    });

    parsedTrips.forEach((trip) => {
      if (isTrip(trip)) {
        tripsById.set(trip.id, normalizeTrip(trip));
      }
    });

    return Array.from(tripsById.values());
  } catch {
    return mockTrips;
  }
};
