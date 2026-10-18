import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { cleanDb } from "../test/helpers.js";

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

async function createActiveLease(ownerToken: string, tenantToken: string, tenantId: string) {
  // Create property
  const propRes = await request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      title: "Spacious 2BHK Residency",
      description: "Well maintained flat with security, water supply, and lift.",
      price: 32000,
      depositAmount: 100000,
      city: "Bangalore",
      locality: "HSR Layout",
      address: "Sector 2, HSR Layout, Bangalore",
      propertyType: "APARTMENT",
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1200,
      furnishing: "SEMI_FURNISHED",
      amenities: ["Water Supply", "Lift"],
    });

  const propertyId = propRes.body.id;

  // Publish property
  await request(app)
    .patch(`/api/properties/${propertyId}/publish`)
    .set("Authorization", `Bearer ${ownerToken}`);

  // Create lease
  const leaseRes = await request(app)
    .post("/api/leases")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      propertyId,
      tenantId,
      startDate: "2026-10-01T00:00:00.000Z",
      endDate: "2027-09-30T23:59:59.000Z",
      rentAmount: 32000,
      dueDay: 5,
    });

  const leaseId = leaseRes.body.id;

  // Accept lease
  await request(app)
    .post(`/api/leases/${leaseId}/accept`)
    .set("Authorization", `Bearer ${tenantToken}`)
    .send({ acceptedByName: "Tenant User" });

  // Activate lease
  await request(app)
    .patch(`/api/leases/${leaseId}`)
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ status: "ACTIVE" });

  return { propertyId, leaseId };
}

describe("Phase 4: Maintenance Operations & Audit Trail (6 tests)", () => {
  beforeEach(cleanDb);

  it("1. Tenant can submit maintenance on their own active lease", async () => {
    const owner = await makeUser("Owner 1", "owner1@maint.test", "OWNER");
    const tenant = await makeUser("Tenant 1", "tenant1@maint.test", "RENTER");
    const { leaseId } = await createActiveLease(owner.token, tenant.token, tenant.user.id);

    const maintRes = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        leaseId,
        title: "Kitchen tap leaking heavily",
        description: "The kitchen sink tap is dripping constantly and wasting water.",
        priority: "MEDIUM",
      });

    expect(maintRes.status).toBe(201);
    expect(maintRes.body.id).toBeDefined();
    expect(maintRes.body.status).toBe("SUBMITTED");
    expect(maintRes.body.updates.length).toBe(1);
    expect(maintRes.body.updates[0].newStatus).toBe("SUBMITTED");
  });

  it("2. Tenant cannot submit on someone else's lease", async () => {
    const owner = await makeUser("Owner 2", "owner2@maint.test", "OWNER");
    const tenant1 = await makeUser("Tenant 2A", "tenant2a@maint.test", "RENTER");
    const tenant2 = await makeUser("Tenant 2B", "tenant2b@maint.test", "RENTER");

    const { leaseId } = await createActiveLease(owner.token, tenant1.token, tenant1.user.id);

    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${tenant2.token}`)
      .send({
        leaseId,
        title: "Unauthorized request",
        description: "Tenant 2 trying to file maintenance on Tenant 1's lease.",
        priority: "LOW",
      });

    expect(res.status).toBe(403);
  });

  it("3. Owner cannot submit maintenance", async () => {
    const owner = await makeUser("Owner 3", "owner3@maint.test", "OWNER");
    const tenant = await makeUser("Tenant 3", "tenant3@maint.test", "RENTER");
    const { leaseId } = await createActiveLease(owner.token, tenant.token, tenant.user.id);

    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        leaseId,
        title: "Owner attempting submission",
        description: "Owners should not submit maintenance requests.",
        priority: "LOW",
      });

    expect(res.status).toBe(403);
  });

  it("4. Owner status change creates a MaintenanceUpdate row", async () => {
    const owner = await makeUser("Owner 4", "owner4@maint.test", "OWNER");
    const tenant = await makeUser("Tenant 4", "tenant4@maint.test", "RENTER");
    const { leaseId } = await createActiveLease(owner.token, tenant.token, tenant.user.id);

    const maintRes = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        leaseId,
        title: "Main circuit breaker tripping",
        description: "Power goes out when running microwave and geyser simultaneously.",
        priority: "HIGH",
      });
    const requestId = maintRes.body.id;

    // Owner marks IN_PROGRESS
    const updateRes = await request(app)
      .patch(`/api/maintenance/${requestId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        status: "IN_PROGRESS",
        note: "Electrician assigned; visiting tomorrow at 10 AM.",
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("IN_PROGRESS");
    expect(updateRes.body.updates.length).toBe(2);
    expect(updateRes.body.updates[1].newStatus).toBe("IN_PROGRESS");
    expect(updateRes.body.updates[1].note).toBe("Electrician assigned; visiting tomorrow at 10 AM.");
  });

  it("5. Full history returned on GET /maintenance/:id", async () => {
    const owner = await makeUser("Owner 5", "owner5@maint.test", "OWNER");
    const tenant = await makeUser("Tenant 5", "tenant5@maint.test", "RENTER");
    const { leaseId } = await createActiveLease(owner.token, tenant.token, tenant.user.id);

    const createRes = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        leaseId,
        title: "Geyser not heating water",
        description: "Bathroom geyser turns on but water stays cold.",
        priority: "HIGH",
      });
    const reqId = createRes.body.id;

    // Transition 1: ACKNOWLEDGED
    await request(app)
      .patch(`/api/maintenance/${reqId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ACKNOWLEDGED", note: "Reviewing vendor contacts" });

    // Transition 2: IN_PROGRESS
    await request(app)
      .patch(`/api/maintenance/${reqId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "IN_PROGRESS", note: "Technician visiting today" });

    // Transition 3: RESOLVED
    await request(app)
      .patch(`/api/maintenance/${reqId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "RESOLVED", note: "Heating element replaced successfully." });

    // Fetch detail as tenant
    const detailRes = await request(app)
      .get(`/api/maintenance/${reqId}`)
      .set("Authorization", `Bearer ${tenant.token}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.status).toBe("RESOLVED");
    expect(detailRes.body.resolvedAt).toBeDefined();
    expect(detailRes.body.updates.length).toBe(4);
    expect(detailRes.body.updates[0].newStatus).toBe("SUBMITTED");
    expect(detailRes.body.updates[1].newStatus).toBe("ACKNOWLEDGED");
    expect(detailRes.body.updates[2].newStatus).toBe("IN_PROGRESS");
    expect(detailRes.body.updates[3].newStatus).toBe("RESOLVED");
  });

  it("6. Owner cannot see other owner's maintenance requests", async () => {
    const owner1 = await makeUser("Owner 6A", "owner6a@maint.test", "OWNER");
    const owner2 = await makeUser("Owner 6B", "owner6b@maint.test", "OWNER");
    const tenant = await makeUser("Tenant 6", "tenant6@maint.test", "RENTER");

    const { leaseId } = await createActiveLease(owner1.token, tenant.token, tenant.user.id);

    const createRes = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        leaseId,
        title: "Balcony door latch jammed",
        description: "Door cannot be locked from the inside.",
        priority: "LOW",
      });
    const reqId = createRes.body.id;

    // Owner 2 attempts to view Owner 1's request
    const detailRes = await request(app)
      .get(`/api/maintenance/${reqId}`)
      .set("Authorization", `Bearer ${owner2.token}`);

    expect(detailRes.status).toBe(403);
  });
});
