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

async function createPropertyAndLease(ownerToken: string, tenantId: string) {
  const propRes = await request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      title: "Cozy Studio in Indiranagar",
      description: "Ideal for single professional, walkable to metro station.",
      price: 24000,
      depositAmount: 70000,
      city: "Bangalore",
      locality: "Indiranagar",
      address: "12th Main Road, Indiranagar, Bangalore",
      propertyType: "STUDIO",
      bedrooms: 1,
      bathrooms: 1,
      areaSqft: 600,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Wi-Fi", "Power Backup"],
    });

  const propertyId = propRes.body.id;

  await request(app)
    .patch(`/api/properties/${propertyId}/publish`)
    .set("Authorization", `Bearer ${ownerToken}`);

  const leaseRes = await request(app)
    .post("/api/leases")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      propertyId,
      tenantId,
      startDate: "2026-11-01T00:00:00.000Z",
      endDate: "2027-10-31T23:59:59.000Z",
      rentAmount: 24000,
      dueDay: 5,
    });

  return { propertyId, leaseId: leaseRes.body.id };
}

describe("Phase 4: Lease Acceptance & Immutability (4 tests)", () => {
  beforeEach(cleanDb);

  it("1. Tenant can accept lease with typed name", async () => {
    const owner = await makeUser("Owner 1", "owner1@accept.test", "OWNER");
    const tenant = await makeUser("Tenant 1", "tenant1@accept.test", "RENTER");
    const { leaseId } = await createPropertyAndLease(owner.token, tenant.user.id);

    const acceptRes = await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        acceptedByName: "Tenant Number One",
        signatureDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.acceptanceStatus).toBe("ACCEPTED");
    expect(acceptRes.body.acceptedByName).toBe("Tenant Number One");
    expect(acceptRes.body.acceptedByTenantAt).toBeDefined();

    // Verify detail reflects acceptance
    const detailRes = await request(app)
      .get(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(detailRes.body.acceptanceStatus).toBe("ACCEPTED");
    expect(detailRes.body.acceptedByName).toBe("Tenant Number One");
  });

  it("2. Accepted lease cannot be edited (immutable)", async () => {
    const owner = await makeUser("Owner 2", "owner2@accept.test", "OWNER");
    const tenant = await makeUser("Tenant 2", "tenant2@accept.test", "RENTER");
    const { leaseId } = await createPropertyAndLease(owner.token, tenant.user.id);

    // Accept lease
    await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Tenant Two" });

    // Attempt to accept again should fail with 409
    const secondAccept = await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Changed Name" });

    expect(secondAccept.status).toBe(409);
    expect(secondAccept.body.error?.message || secondAccept.body.message).toMatch(/already accepted and locked/i);

    // Owner attempts to change dates of accepted lease
    const modifyRes = await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ endDate: "2028-10-31T23:59:59.000Z" });

    expect(modifyRes.status).toBe(409);
    expect(modifyRes.body.error?.message || modifyRes.body.message).toMatch(/Cannot modify terms of an accepted lease/i);
  });

  it("3. Only the assigned tenant can accept", async () => {
    const owner = await makeUser("Owner 3", "owner3@accept.test", "OWNER");
    const assignedTenant = await makeUser("Assigned", "assigned@accept.test", "RENTER");
    const otherTenant = await makeUser("Other", "other@accept.test", "RENTER");

    const { leaseId } = await createPropertyAndLease(owner.token, assignedTenant.user.id);

    const acceptRes = await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${otherTenant.token}`)
      .send({ acceptedByName: "Imposter User" });

    expect(acceptRes.status).toBe(403);
    expect(acceptRes.body.error?.message || acceptRes.body.message).toMatch(/only the assigned tenant/i);
  });

  it("4. Owner cannot activate lease until tenant accepts", async () => {
    const owner = await makeUser("Owner 4", "owner4@accept.test", "OWNER");
    const tenant = await makeUser("Tenant 4", "tenant4@accept.test", "RENTER");
    const { leaseId } = await createPropertyAndLease(owner.token, tenant.user.id);

    // Owner attempts to activate while acceptance is PENDING
    const activateRes = await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ACTIVE" });

    expect(activateRes.status).toBe(409);
    expect(activateRes.body.error?.message || activateRes.body.message).toMatch(/Tenant must accept the lease first/i);
  });
});
