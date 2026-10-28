import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { cleanDb } from "../test/helpers.js";

async function makeOwner(email = "own@test.com") {
  const res = await request(app).post("/api/auth/register").send({
    name: "Owner",
    email,
    password: "password123",
    role: "OWNER",
  });
  return res.body.accessToken as string;
}

async function makeRenter(email = "ren@test.com") {
  const res = await request(app).post("/api/auth/register").send({
    name: "Renter",
    email,
    password: "password123",
    role: "RENTER",
  });
  return res.body.accessToken as string;
}

const sample = {
  title: "3BHK Koramangala",
  description: "Spacious apartment, close to all amenities and metro station.",
  price: 45000,
  city: "Bangalore",
  locality: "Koramangala",
  address: "123, 5th Block, Koramangala",
  propertyType: "APARTMENT",
  bedrooms: 3,
  bathrooms: 2,
  areaSqft: 1450,
  furnishing: "SEMI_FURNISHED",
  amenities: ["Parking"],
};

describe("Properties", () => {
  beforeEach(cleanDb);

  it("rejects RENTER from creating a property", async () => {
    const token = await makeRenter();
    const res = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    expect(res.status).toBe(403);
  });

  it("allows OWNER to create a property", async () => {
    const token = await makeOwner();
    const res = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(sample.title);
    expect(res.body.images).toEqual([]);
  });

  it("blocks a different owner from editing", async () => {
    const tokenA = await makeOwner("a@test.com");
    const created = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(sample);
    const propertyId = created.body.id;

    const tokenB = await makeOwner("b@test.com");
    const res = await request(app)
      .put(`/api/properties/${propertyId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hijacked" });
    expect(res.status).toBe(403);
  });

  it("rejects property creation with invalid body (422)", async () => {
    const token = await makeOwner();
    const res = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "x" }); // invalid
    expect(res.status).toBe(422);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/properties").send(sample);
    expect(res.status).toBe(401);
  });

  it("allows OWNER to upload property image with 'image' field", async () => {
    const token = await makeOwner("uploader1@test.com");
    const created = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    const propertyId = created.body.id;

    const res = await request(app)
      .post(`/api/properties/${propertyId}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.url).toBeDefined();
    expect(res.body.isPrimary).toBe(true);
  });

  it("allows OWNER to upload property image with 'file' field as fallback", async () => {
    const token = await makeOwner("uploader2@test.com");
    const created = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    const propertyId = created.body.id;

    const res = await request(app)
      .post(`/api/properties/${propertyId}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake-image-bytes"), {
        filename: "test.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.url).toBeDefined();
    expect(res.body.isPrimary).toBe(true);
  });
});
