import { prisma } from "../../lib/prisma.js";
import type { RecommendationsResponse, RecommendationReason } from "@estateos/shared";

function mode(arr: number[]): number {
  if (arr.length === 0) return 0;
  const counts = new Map<number, number>();
  let maxCount = 0;
  let maxItem = arr[0] ?? 0;
  for (const item of arr) {
    const c = (counts.get(item) || 0) + 1;
    counts.set(item, c);
    if (c > maxCount) {
      maxCount = c;
      maxItem = item;
    }
  }
  return maxItem;
}

function countTop(arr: string[], topN: number): string[] {
  const counts = new Map<string, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([item]) => item);
}

export async function getRecommendations(userId: string): Promise<RecommendationsResponse> {
  // 1. Build a profile from the user's real actions
  const [favourites, enquiries] = await Promise.all([
    prisma.favourite.findMany({ where: { userId }, include: { property: true } }),
    prisma.enquiry.findMany({ where: { userId }, include: { property: true } }),
  ]);

  const interest = [...favourites.map((f) => f.property), ...enquiries.map((e) => e.property)];
  if (interest.length === 0) {
    return { data: [], basedOn: { favourites: 0, enquiries: 0, cities: [] } };
  }

  // 2. Extract signal
  const cities = [...new Set(interest.map((p) => p.city))];
  const bedrooms = mode(interest.map((p) => p.bedrooms));
  const prices = interest.map((p) => Number(p.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const amenities = countTop(interest.flatMap((p) => p.amenities), 3);

  // 3. Candidate pool: ACTIVE properties in those cities, not already interacted with, not owned by user
  const excluded = new Set(interest.map((p) => p.id));
  const candidates = await prisma.property.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      ownerId: { not: userId }, // Exclude user's own properties
      city: { in: cities },
      id: { notIn: [...excluded] },
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    take: 50,
  });

  // 4. Score with explainable rules — one reason per matching rule
  const scored = candidates.map((p) => {
    const reasons: RecommendationReason[] = [];
    let score = 0;

    if (cities.includes(p.city)) {
      score += 40;
      reasons.push({
        type: "CITY_MATCH",
        description: `In ${p.city} — where you've shown interest`,
      });
    }
    if (p.bedrooms === bedrooms) {
      score += 25;
      reasons.push({
        type: "BEDROOM_MATCH",
        description: `${p.bedrooms}BHK — same as your usual preference`,
      });
    }
    if (Number(p.price) >= minPrice && Number(p.price) <= maxPrice) {
      score += 20;
      reasons.push({
        type: "PRICE_MATCH",
        description: `₹${Number(p.price).toLocaleString()} — within your ₹${minPrice.toLocaleString()}–₹${maxPrice.toLocaleString()} range`,
      });
    }
    const matchingAmenities = amenities.filter((a) => p.amenities.includes(a));
    if (matchingAmenities.length > 0) {
      score += 10 * matchingAmenities.length;
      reasons.push({
        type: "AMENITY_MATCH",
        description: `Has ${matchingAmenities.join(", ")} — amenities you liked`,
      });
    }

    return { property: p, score, reasons };
  });

  // 5. Only return explainable results
  const results = scored
    .filter((s) => s.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => ({
      propertyId: s.property.id,
      title: s.property.title,
      city: s.property.city,
      price: Number(s.property.price),
      bedrooms: s.property.bedrooms,
      propertyType: s.property.propertyType,
      imageUrl: s.property.images[0]?.url ?? null,
      score: s.score,
      reasons: s.reasons,
    }));

  return {
    data: results,
    basedOn: {
      favourites: favourites.length,
      enquiries: enquiries.length,
      cities,
    },
  };
}
