import { estimateRouteDistanceKm } from "./cargoPricing";

type PassengerPricingParams = {
  fromCity: string;
  toCity: string;
  amenities: {
    childSeat: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    luggageAllowed: boolean;
  };
};

export type PassengerPriceEstimate = {
  distanceKm: number;
  recommendedPrice: number;
  recommendedMin: number;
  recommendedMax: number;
  allowedMin: number;
  allowedMax: number;
};

const roundToNearest = (value: number, step = 50) =>
  Math.round(value / step) * step;

export const calculatePassengerPriceEstimate = ({
  fromCity,
  toCity,
  amenities,
}: PassengerPricingParams): PassengerPriceEstimate | null => {
  const distanceKm = estimateRouteDistanceKm(fromCity, toCity);

  if (!distanceKm) {
    return null;
  }

  const amenitySurcharge =
    (amenities.luggageAllowed ? 80 : 0) +
    (amenities.petsAllowed ? 120 : 0) +
    (amenities.childSeat ? 100 : 0);
  const basePrice = Math.max(150, distanceKm * 3.2);
  const recommendedPrice = roundToNearest(basePrice + amenitySurcharge);

  return {
    distanceKm,
    recommendedPrice,
    recommendedMin: roundToNearest(recommendedPrice * 0.9),
    recommendedMax: roundToNearest(recommendedPrice * 1.15),
    allowedMin: roundToNearest(recommendedPrice * 0.7),
    allowedMax: roundToNearest(recommendedPrice * 1.4),
  };
};
