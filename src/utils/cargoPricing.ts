type CargoPricingParams = {
  fromCity: string;
  toCity: string;
  cargoTypes: string[];
  cargoLength: string;
  cargoHeight: string;
  cargoWidth: string;
  cargoWeight: string;
  cargoServices: string[];
};

export type CargoPriceEstimate = {
  distanceKm: number;
  recommendedPrice: number;
  recommendedMin: number;
  recommendedMax: number;
  allowedMin: number;
  allowedMax: number;
};

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  барнаул: { lat: 53.3481, lon: 83.7798 },
  новосибирск: { lat: 55.0084, lon: 82.9357 },
  бийск: { lat: 52.5394, lon: 85.2138 },
  "горно-алтайск": { lat: 51.9581, lon: 85.9603 },
  кемерово: { lat: 55.3547, lon: 86.0884 },
  томск: { lat: 56.4846, lon: 84.9482 },
  бердск: { lat: 54.7583, lon: 83.1072 },
  тула: { lat: 54.192, lon: 37.6156 },
  саратов: { lat: 51.5336, lon: 46.0343 },
  москва: { lat: 55.7558, lon: 37.6173 },
  красноярск: { lat: 56.0153, lon: 92.8932 },
};

const CARGO_TYPE_SURCHARGE: Record<string, number> = {
  документы: 0,
  посылка: 80,
  "личные вещи": 180,
  мебель: 550,
  техника: 650,
  стройматериалы: 700,
  "хрупкий груз": 650,
  "животные / растения": 600,
  другое: 250,
};

const SERVICE_SURCHARGE: Record<string, number> = {
  "помощь с погрузкой": 450,
  "помощь с разгрузкой": 450,
  "доставка до двери": 350,
  "подъём на этаж": 500,
  "крепление груза": 250,
  фотоотчёт: 120,
};

const normalizeCity = (city: string) => city.trim().toLowerCase();

const roundToNearest = (value: number, step = 50) =>
  Math.round(value / step) * step;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const haversineKm = (
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

export const estimateRouteDistanceKm = (fromCity: string, toCity: string) => {
  const from = CITY_COORDINATES[normalizeCity(fromCity)];
  const to = CITY_COORDINATES[normalizeCity(toCity)];

  if (from && to) {
    return Math.max(8, Math.round(haversineKm(from, to) * 1.18));
  }

  if (fromCity.trim() && toCity.trim()) {
    return normalizeCity(fromCity) === normalizeCity(toCity) ? 12 : 120;
  }

  return 0;
};

export const calculateCargoPriceEstimate = ({
  fromCity,
  toCity,
  cargoTypes,
  cargoLength,
  cargoHeight,
  cargoWidth,
  cargoWeight,
  cargoServices,
}: CargoPricingParams): CargoPriceEstimate | null => {
  const distanceKm = estimateRouteDistanceKm(fromCity, toCity);
  const length = Number(cargoLength);
  const height = Number(cargoHeight);
  const width = Number(cargoWidth);
  const weight = Number(cargoWeight);

  if (
    !distanceKm ||
    cargoTypes.length === 0 ||
    length <= 0 ||
    height <= 0 ||
    width <= 0 ||
    weight <= 0
  ) {
    return null;
  }

  const serviceSurcharge = cargoServices.reduce(
    (sum, service) => sum + (SERVICE_SURCHARGE[service] ?? 0),
    0,
  );

  const basePrice = Math.max(350, distanceKm * 15);
  const volumeM3 = length * height * width;
  const sizeSurcharge = Math.min(2200, volumeM3 * 300);
  const weightSurcharge = Math.min(2200, weight * 8);
  const typeSurcharge = cargoTypes.reduce(
    (sum, type) => sum + (CARGO_TYPE_SURCHARGE[type] ?? 250),
    0,
  );
  const cargoSurcharge =
    typeSurcharge +
    sizeSurcharge +
    weightSurcharge +
    serviceSurcharge;
  const recommendedPrice = roundToNearest(basePrice + cargoSurcharge);

  return {
    distanceKm,
    recommendedPrice,
    recommendedMin: roundToNearest(recommendedPrice * 0.9),
    recommendedMax: roundToNearest(recommendedPrice * 1.15),
    allowedMin: roundToNearest(recommendedPrice * 0.7),
    allowedMax: roundToNearest(recommendedPrice * 1.4),
  };
};
