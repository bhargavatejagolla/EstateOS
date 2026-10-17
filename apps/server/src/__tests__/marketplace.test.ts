import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { cleanDb } from "../test/helpers.js";

async function makeUser(email: string, role: "OWNER" | "RENTER") {
  const res = await request(app).post("/api/auth/register").send({
    name: role === "OWNER" ? "Owner User" : "Renter User",
    email,
    password: "password123",
    role,
  });
  return {
    token: res.body.accessToken as string,
    user: res.body.user,
  };
}

const sampleProperty = {
  title: "Sunlit 2BHK in Indiranagar",
  description: "Beautiful modern apartment with modular kitchen and private balcony.",
  price: 38000,
  depositAmount: 120000,
  city: "Bangalore",
  locality: "Indiranagar",
  address: "100ft Road, Indiranagar, Bangalore",
  propertyType: "APARTMENT",
  bedrooms: 2,
  bathrooms: 2,
  areaSqft: 1100,
  furnishing: "SEMI_FURNISHED",
  amenities: ["Power Backup", "Lift", "Security"],
};

describe("Phase 3: Marketplace, Enquiries & Appointments", () => {
  beforeEach(cleanDb);

  it("1. Search only returns ACTIVE properties (DRAFT properties remain hidden)", async () => {
    const owner = await makeUser("owner1@test.com", "OWNER");

    // Create property (created in DRAFT status by default)
    const createRes = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);
    expect(createRes.status).toBe(201);
    const propId = createRes.body.id;

    // Public search should return 0 results since it is in DRAFT
    const searchDraft = await request(app).get("/api/properties");
    expect(searchDraft.status).toBe(200);
    expect(searchDraft.body.properties.some((p: { id: string }) => p.id === propId)).toBe(false);

    // Publish property to ACTIVE
    const publishRes = await request(app)
      .patch(`/api/properties/${propId}/publish`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.status).toBe("ACTIVE");

    // Public search should now include the ACTIVE property
    const searchActive = await request(app).get("/api/properties");
    expect(searchActive.status).toBe(200);
    expect(searchActive.body.properties.some((p: { id: string }) => p.id === propId)).toBe(true);
  });

  it("2. Search excludes soft-deleted properties", async () => {
    const owner = await makeUser("owner2@test.com", "OWNER");

    const createRes = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);
    const propId = createRes.body.id;

    // Publish
    await request(app)
      .patch(`/api/properties/${propId}/publish`)
      .set("Authorization", `Bearer ${owner.token}`);

    // Soft delete
    const delRes = await request(app)
      .delete(`/api/properties/${propId}`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(delRes.status).toBe(204);

    // Search should exclude deleted property
    const searchRes = await request(app).get("/api/properties");
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.properties.some((p: { id: string }) => p.id === propId)).toBe(false);
  });

  it("3. Search filters accurately by city, propertyType, and price range", async () => {
    const owner = await makeUser("owner3@test.com", "OWNER");

    // Property 1: Bangalore, Apartment, 38000
    const p1 = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);
    await request(app).patch(`/api/properties/${p1.body.id}/publish`).set("Authorization", `Bearer ${owner.token}`);

    // Property 2: Mumbai, Villa, 85000
    const p2 = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        ...sampleProperty,
        title: "Sea Breeze Villa",
        city: "Mumbai",
        locality: "Bandra",
        propertyType: "VILLA",
        price: 85000,
      });
    await request(app).patch(`/api/properties/${p2.body.id}/publish`).set("Authorization", `Bearer ${owner.token}`);

    // Filter by city=Bangalore
    const bngRes = await request(app).get("/api/properties?city=Bangalore");
    expect(bngRes.body.properties.length).toBe(1);
    expect(bngRes.body.properties[0].city).toBe("Bangalore");

    // Filter by propertyType=VILLA
    const villaRes = await request(app).get("/api/properties?propertyType=VILLA");
    expect(villaRes.body.properties.length).toBe(1);
    expect(villaRes.body.properties[0].propertyType).toBe("VILLA");

    // Filter by price range maxPrice=50000
    const budgetRes = await request(app).get("/api/properties?maxPrice=50000");
    expect(budgetRes.body.properties.length).toBe(1);
    expect(budgetRes.body.properties[0].price).toBe(38000);
  });

  it("4. Owner can toggle publish status between ACTIVE and DRAFT", async () => {
    const owner = await makeUser("owner4@test.com", "OWNER");

    const p = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);

    // Toggle 1: DRAFT -> ACTIVE
    const toggle1 = await request(app)
      .patch(`/api/properties/${p.body.id}/publish`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(toggle1.status).toBe(200);
    expect(toggle1.body.status).toBe("ACTIVE");

    // Toggle 2: ACTIVE -> DRAFT
    const toggle2 = await request(app)
      .patch(`/api/properties/${p.body.id}/publish`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(toggle2.status).toBe(200);
    expect(toggle2.body.status).toBe("DRAFT");
  });

  it("5. Non-owner is blocked from publishing another owner's property (403)", async () => {
    const ownerA = await makeUser("ownerA@test.com", "OWNER");
    const ownerB = await makeUser("ownerB@test.com", "OWNER");

    const prop = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${ownerA.token}`)
      .send(sampleProperty);

    // Owner B attempts to publish Owner A's property
    const res = await request(app)
      .patch(`/api/properties/${prop.body.id}/publish`)
      .set("Authorization", `Bearer ${ownerB.token}`);
    expect(res.status).toBe(403);
  });

  it("6. Renter can add an active property to favourites and list favourites", async () => {
    const owner = await makeUser("owner6@test.com", "OWNER");
    const renter = await makeUser("renter6@test.com", "RENTER");

    const p = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);

    // Add to favourites
    const addFav = await request(app)
      .post(`/api/favourites/${p.body.id}`)
      .set("Authorization", `Bearer ${renter.token}`);
    expect(addFav.status).toBe(201);

    // List favourites
    const favsList = await request(app)
      .get("/api/favourites")
      .set("Authorization", `Bearer ${renter.token}`);
    expect(favsList.status).toBe(200);
    expect(favsList.body.length).toBe(1);
    expect(favsList.body[0].property.id).toBe(p.body.id);
  });

  it("7. Renter can remove a property from favourites", async () => {
    const owner = await makeUser("owner7@test.com", "OWNER");
    const renter = await makeUser("renter7@test.com", "RENTER");

    const p = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);

    await request(app)
      .post(`/api/favourites/${p.body.id}`)
      .set("Authorization", `Bearer ${renter.token}`);

    // Delete favourite
    const removeFav = await request(app)
      .delete(`/api/favourites/${p.body.id}`)
      .set("Authorization", `Bearer ${renter.token}`);
    expect(removeFav.status).toBe(204);

    // List favourites should now be empty
    const favsList = await request(app)
      .get("/api/favourites")
      .set("Authorization", `Bearer ${renter.token}`);
    expect(favsList.body.length).toBe(0);
  });

  it("8. Owner cannot submit enquiry on their own property (400)", async () => {
    const owner = await makeUser("owner8@test.com", "OWNER");

    const p = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);

    const enquiryRes = await request(app)
      .post("/api/enquiries")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId: p.body.id,
        message: "Can I rent my own house?",
      });
    expect(enquiryRes.status).toBe(400);
  });

  it("9. Renter submits enquiry; owner sees lead with ownerNotes while renter cannot see ownerNotes", async () => {
    const owner = await makeUser("owner9@test.com", "OWNER");
    const renter = await makeUser("renter9@test.com", "RENTER");

    const p = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);

    // Renter creates enquiry
    const enqRes = await request(app)
      .post("/api/enquiries")
      .set("Authorization", `Bearer ${renter.token}`)
      .send({
        propertyId: p.body.id,
        message: "Hello, looking to move in by 1st of next month.",
      });
    expect(enqRes.status).toBe(201);
    expect(enqRes.body.status).toBe("NEW");
    const enqId = enqRes.body.id;

    // Owner updates status to CONTACTED and adds private owner notes
    const updateRes = await request(app)
      .patch(`/api/enquiries/${enqId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        status: "CONTACTED",
        ownerNotes: "Verified LinkedIn & salary slip; reliable applicant.",
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("CONTACTED");

    // Owner views enquiry: sees private owner notes
    const ownerView = await request(app)
      .get(`/api/enquiries/${enqId}`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(ownerView.body.ownerNotes).toBe("Verified LinkedIn & salary slip; reliable applicant.");

    // Renter views enquiry: ownerNotes MUST be stripped (null)
    const renterView = await request(app)
      .get(`/api/enquiries/${enqId}`)
      .set("Authorization", `Bearer ${renter.token}`);
    expect(renterView.body.ownerNotes).toBeNull();
  });

  it("10. Scheduling visit in atomic transaction transitions enquiry status to VISIT_SCHEDULED", async () => {
    const owner = await makeUser("owner10@test.com", "OWNER");
    const renter = await makeUser("renter10@test.com", "RENTER");

    const p = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleProperty);

    const enqRes = await request(app)
      .post("/api/enquiries")
      .set("Authorization", `Bearer ${renter.token}`)
      .send({
        propertyId: p.body.id,
        message: "Would love to see the house this weekend.",
      });
    const enqId = enqRes.body.id;

    // Schedule appointment for this weekend
    const visitDate = new Date(Date.now() + 86400000 * 2).toISOString();
    const aptRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${renter.token}`)
      .send({
        enquiryId: enqId,
        visitAt: visitDate,
        notes: "Will visit on Saturday morning 11 AM",
      });
    expect(aptRes.status).toBe(201);
    expect(aptRes.body.status).toBe("PROPOSED");

    // Verify enquiry status automatically transitioned to VISIT_SCHEDULED
    const enqCheck = await request(app)
      .get(`/api/enquiries/${enqId}`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(enqCheck.body.status).toBe("VISIT_SCHEDULED");
  });
});
