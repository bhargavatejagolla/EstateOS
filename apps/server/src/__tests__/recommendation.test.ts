import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { cleanDb } from "../test/helpers.js";
import { prisma } from "../lib/prisma.js";

async function makeUser(name: string, email: string, role: "OWNER" | "RENTER" | "TENANT") {
  const res = await request(app).post("/api/auth/register").send({
    name,
    email,
    password: "password123",
    role,
  });
  return {
    token: res.body.accessToken as string,
    user: res.body.user,
  };
}

async function createProperty(
  ownerToken: string,
  data: {
    title: string;
    city: string;
    bedrooms: number;
    price: number;
    amenities?: string[];
  }
) {
  const res = await request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      title: data.title,
      description: "Wonderful spacious apartment with great ventilation and natural sunlight.",
      price: data.price,
      depositAmount: data.price * 3,
      city: data.city,
      locality: "Downtown",
      address: "123 Main Street",
      propertyType: "APARTMENT",
      bedrooms: data.bedrooms,
      bathrooms: 2,
      areaSqft: 1200,
      furnishing: "SEMI_FURNISHED",
      amenities: data.amenities || ["Gym", "Pool"],
    });

  const propId = res.body.id;

  // Publish
  await request(app)
    .patch(`/api/properties/${propId}/publish`)
    .set("Authorization", `Bearer ${ownerToken}`);

  return propId;
}

describe("Phase 5: Explainable Recommendations Engine (5 tests)", () => {
  beforeEach(cleanDb);

  it("1. User with no favourites/enquiries -> empty list, basedOn.cities empty", async () => {
    const renter = await makeUser("Fresh Renter", "fresh@recs.test", "RENTER");

    const res = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${renter.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.basedOn).toEqual({
      favourites: 0,
      enquiries: 0,
      cities: [],
    });
  });

  it("2. User favourited 2 properties in Bangalore -> recommendations all in Bangalore", async () => {
    const owner = await makeUser("Landlord 2", "owner2@recs.test", "OWNER");
    const renter = await makeUser("Renter 2", "renter2@recs.test", "RENTER");

    // Create 2 Bangalore properties and 1 Delhi property
    const b1 = await createProperty(owner.token, { title: "Bangalore Villa 1", city: "Bangalore", bedrooms: 2, price: 30000 });
    const b2 = await createProperty(owner.token, { title: "Bangalore Villa 2", city: "Bangalore", bedrooms: 2, price: 32000 });
    const b3 = await createProperty(owner.token, { title: "Bangalore Candidate 3", city: "Bangalore", bedrooms: 2, price: 31000 });
    await createProperty(owner.token, { title: "Delhi Central 1", city: "Delhi", bedrooms: 2, price: 30000 });

    // Renter favourites b1 and b2
    await request(app)
      .post(`/api/favourites/${b1}`)
      .set("Authorization", `Bearer ${renter.token}`);
    await request(app)
      .post(`/api/favourites/${b2}`)
      .set("Authorization", `Bearer ${renter.token}`);

    const res = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${renter.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((r: any) => r.city === "Bangalore")).toBe(true);
    expect(res.body.data.some((r: any) => r.propertyId === b3)).toBe(true);
  });

  it("3. Every recommendation has >= 1 reason", async () => {
    const owner = await makeUser("Landlord 3", "owner3@recs.test", "OWNER");
    const renter = await makeUser("Renter 3", "renter3@recs.test", "RENTER");

    const p1 = await createProperty(owner.token, { title: "Koramangala 3BHK", city: "Bangalore", bedrooms: 3, price: 45000, amenities: ["Gym", "Pool"] });
    await createProperty(owner.token, { title: "Indiranagar 3BHK", city: "Bangalore", bedrooms: 3, price: 46000, amenities: ["Gym"] });

    // Renter enquiries on p1
    await request(app)
      .post("/api/enquiries")
      .set("Authorization", `Bearer ${renter.token}`)
      .send({
        propertyId: p1,
        message: "Hello, is this property available for immediate move-in?",
      });

    const res = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${renter.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const rec of res.body.data) {
      expect(rec.reasons.length).toBeGreaterThanOrEqual(1);
      for (const reason of rec.reasons) {
        expect(reason.description).toBeDefined();
        expect(reason.description.length).toBeGreaterThan(5);
      }
    }
  });

  it("4. User's own properties are never recommended", async () => {
    // Owner who also acts as renter
    const owner = await makeUser("Owner-Renter 4", "owner_renter4@recs.test", "OWNER");
    const otherOwner = await makeUser("Other Landlord 4", "other4@recs.test", "OWNER");

    // Owner creates their own property in Bangalore
    const myProp = await createProperty(owner.token, { title: "My Own Villa", city: "Bangalore", bedrooms: 2, price: 30000 });
    // Other owner creates a property in Bangalore
    const otherProp = await createProperty(otherOwner.token, { title: "Other Landlord Villa", city: "Bangalore", bedrooms: 2, price: 30000 });

    // Favourites another property to seed Bangalore interest
    const seedProp = await createProperty(otherOwner.token, { title: "Seed Apt", city: "Bangalore", bedrooms: 2, price: 30000 });
    await request(app)
      .post(`/api/favourites/${seedProp}`)
      .set("Authorization", `Bearer ${owner.token}`);

    const res = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const recIds = res.body.data.map((r: any) => r.propertyId);
    expect(recIds).not.toContain(myProp);
    expect(recIds).toContain(otherProp);
  });

  it("5. Property matching no rule is never returned", async () => {
    const owner = await makeUser("Landlord 5", "owner5@recs.test", "OWNER");
    const renter = await makeUser("Renter 5", "renter5@recs.test", "RENTER");

    // Renter likes properties in Pune with 1BHK, ₹15,000, ["Parking"]
    const pPune = await createProperty(owner.token, { title: "Pune 1BHK", city: "Pune", bedrooms: 1, price: 15000, amenities: ["Parking"] });
    await request(app)
      .post(`/api/favourites/${pPune}`)
      .set("Authorization", `Bearer ${renter.token}`);

    // Create property in completely different city (Mumbai)
    const pMumbai = await createProperty(owner.token, { title: "Mumbai 4BHK", city: "Mumbai", bedrooms: 4, price: 120000, amenities: ["Private Pool"] });

    const res = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${renter.token}`);

    expect(res.status).toBe(200);
    const recIds = res.body.data.map((r: any) => r.propertyId);
    expect(recIds).not.toContain(pMumbai);
  });
});
