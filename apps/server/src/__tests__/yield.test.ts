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
  city = "Bangalore",
  bedrooms = 3,
  price = 10000000 // ₹1 Crore
) {
  const res = await request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      title: `${city} ${bedrooms}BHK Residence`,
      description: "Superb investment opportunity located in high rental-demand corridor.",
      price,
      depositAmount: 150000,
      city,
      locality: "Outer Ring Road",
      address: "Prestige Tech Park Road",
      propertyType: "APARTMENT",
      bedrooms,
      bathrooms: 3,
      areaSqft: 1800,
      furnishing: "SEMI_FURNISHED",
      amenities: ["Power Backup", "Gym", "Pool"],
    });

  const propId = res.body.id;
  await request(app)
    .patch(`/api/properties/${propId}/publish`)
    .set("Authorization", `Bearer ${ownerToken}`);

  return propId;
}

describe("Phase 5: Rental Yield Estimation Engine (4 tests)", () => {
  beforeEach(cleanDb);

  it("1. Fewer than 2 comparable leases -> yield 0, disclaimer mentions 'Not enough'", async () => {
    const owner = await makeUser("Owner 1", "owner1@yield.test", "OWNER");
    const propId = await createProperty(owner.token, "Hyderabad", 2, 8000000);

    const res = await request(app).get(`/api/properties/${propId}/yield`);

    expect(res.status).toBe(200);
    expect(res.body.grossYieldPercent).toBe(0);
    expect(res.body.comparableCount).toBe(0);
    expect(res.body.disclaimer).toContain("Not enough comparable leases");
    expect(res.body.isVerified).toBe(false);
  });

  it("2. 4 comparable leases -> yield computed from real average", async () => {
    const owner = await makeUser("Owner 2", "owner2@yield.test", "OWNER");
    const tenant = await makeUser("Tenant 2", "tenant2@yield.test", "RENTER");

    // Target property: purchase price ₹10,000,000 (₹1 Cr), Bangalore, 3BHK
    const targetPropId = await createProperty(owner.token, "Bangalore", 3, 10000000);

    // Create 4 comparable properties with active leases in Bangalore, 3BHK:
    // Rents: ₹40,000, ₹50,000, ₹45,000, ₹65,000 -> Average = ₹50,000/month
    // Annual = ₹50,000 * 12 = ₹600,000
    // Gross Yield = (600,000 / 10,000,000) * 100 = 6%
    const rents = [40000, 50000, 45000, 65000];
    for (const rent of rents) {
      const compProp = await createProperty(owner.token, "Bangalore", 3, 9000000);
      await prisma.lease.create({
        data: {
          propertyId: compProp,
          tenantId: tenant.user.id,
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          endDate: new Date("2026-12-31T23:59:59.000Z"),
          rentAmount: rent,
          dueDay: 5,
          status: "ACTIVE",
          acceptanceStatus: "ACCEPTED",
        },
      });
    }

    const res = await request(app).get(`/api/properties/${targetPropId}/yield`);

    expect(res.status).toBe(200);
    expect(res.body.comparableCount).toBe(4);
    expect(res.body.monthlyRent).toBe(50000);
    expect(res.body.annualRent).toBe(600000);
    expect(res.body.grossYieldPercent).toBe(6);
    expect(res.body.disclaimer).toContain("Estimated from 4 active leases in Bangalore with 3BHK");
  });

  it("3. Every response includes non-empty disclaimer", async () => {
    const owner = await makeUser("Owner 3", "owner3@yield.test", "OWNER");
    const propId = await createProperty(owner.token, "Chennai", 1, 5000000);

    const res = await request(app).get(`/api/properties/${propId}/yield`);

    expect(res.status).toBe(200);
    expect(typeof res.body.disclaimer).toBe("string");
    expect(res.body.disclaimer.length).toBeGreaterThan(10);
  });

  it("4. isVerified is always false", async () => {
    const owner = await makeUser("Owner 4", "owner4@yield.test", "OWNER");
    const propId = await createProperty(owner.token, "Kolkata", 2, 6000000);

    const res = await request(app).get(`/api/properties/${propId}/yield`);

    expect(res.status).toBe(200);
    expect(res.body.isVerified).toBe(false);
  });
});
