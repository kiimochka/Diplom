import { mockReviews } from "../mockData";
import { Review, REVIEWS_STORAGE_KEY } from "../types";

export const readReviews = (): Review[] => {
  if (typeof window === "undefined") return mockReviews;

  const reviewsById = new Map<string, Review>();
  mockReviews.forEach((review) => reviewsById.set(review.id, review));

  const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!storedReviews) return Array.from(reviewsById.values());

  try {
    const parsedReviews = JSON.parse(storedReviews);
    if (!Array.isArray(parsedReviews)) return Array.from(reviewsById.values());

    parsedReviews.forEach((review) => {
      if (review && typeof review.id === "string") {
        reviewsById.set(review.id, review);
      }
    });
  } catch {
    return Array.from(reviewsById.values());
  }

  return Array.from(reviewsById.values());
};

export const getReviewWord = (count: number) => {
  const value = Math.abs(count) % 100;
  const lastDigit = value % 10;

  if (value > 10 && value < 20) return "отзывов";
  if (lastDigit > 1 && lastDigit < 5) return "отзыва";
  if (lastDigit === 1) return "отзыв";
  return "отзывов";
};

export const getUserReviewStats = (
  userId: string,
  fallbackRating?: number,
  reviews = readReviews(),
) => {
  const userReviews = reviews.filter((review) => review.targetUserId === userId);
  const averageRating = userReviews.length
    ? userReviews.reduce((sum, review) => sum + review.rating, 0) /
      userReviews.length
    : null;

  return {
    rating: averageRating ?? fallbackRating ?? null,
    reviewsCount: userReviews.length,
    reviews: userReviews,
  };
};
