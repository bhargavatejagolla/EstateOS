import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { cleanDb } from "../test/helpers.js";
import { prisma } from "../lib/prisma.js";
import { buildObligations } from "../modules/leases/lease.service.js";

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

async function createActiveProperty(ownerToken: string) {
  const createRes = await request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      title: "Luxury 3BHK Penthouse",
      description: "Spacious penthouse in central location with scenic terrace view.",
      price: 50000,
      depositAmount: 150000,
      city: "Bangalore",
      locality: "Koramangala",
      address: "80ft Road, 4th Block, Koramangala",
      propertyType: "APARTMENT",
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 2000,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Power Backup", "Gym", "Pool"],
    });

  const propId = createRes.body.id;

  // Publish to ACTIVE
  await request(app)
    .patch(`/api/properties/${propId}/publish`)
    .set("Authorization", `Bearer ${ownerToken}`);

  return propId;
}

describe("Phase 4: Leases & Rent Obligations (12 tests)", () => {
  beforeEach(cleanDb);

  it("1. Create lease auto-generates one obligation per month", async () => {
    const owner = await makeUser("Owner 1", "owner1@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 1", "tenant1@lease.test", "RENTER");
    const propertyId = await createActiveProperty(owner.token);

    const leaseRes = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2027-09-30T23:59:59.000Z",
        rentAmount: 40000,
        depositAmount: 120000,
        dueDay: 5,
      });

    expect(leaseRes.status).toBe(201);
    expect(leaseRes.body.id).toBeDefined();
    expect(leaseRes.body.status).toBe("PENDING_ACCEPTANCE");

    // Fetch obligations
    const obRes = await request(app)
      .get(`/api/leases/${leaseRes.body.id}/obligations`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(obRes.status).toBe(200);
    expect(obRes.body.length).toBe(12);
    expect(obRes.body[0].amountDue).toBe(40000);
    expect(obRes.body[0].amountPaid).toBe(0);
  });

  it("2. Lease start Aug 31, dueDay 28 -> first obligation Sep 28 (month-end clamping)", async () => {
    const obligations = buildObligations({
      id: "test-lease",
      startDate: new Date("2026-08-31T00:00:00.000Z"),
      endDate: new Date("2027-08-30T00:00:00.000Z"),
      rentAmount: 35000,
      dueDay: 28,
    });

    expect(obligations.length).toBeGreaterThan(0);
    // Month 8 is September (0-indexed)
    expect(obligations[0]!.dueDate.getUTCMonth()).toBe(8);
    expect(obligations[0]!.dueDate.getUTCDate()).toBe(28);
    expect(obligations[0]!.dueDate.toISOString().startsWith("2026-09-28")).toBe(true);
  });

  it("3. Cannot create overlapping lease on same property", async () => {
    const owner = await makeUser("Owner 3", "owner3@lease.test", "OWNER");
    const tenant1 = await makeUser("Tenant 3A", "tenant3a@lease.test", "RENTER");
    const tenant2 = await makeUser("Tenant 3B", "tenant3b@lease.test", "RENTER");
    const propertyId = await createActiveProperty(owner.token);

    // First lease: Oct 2026 to Oct 2027
    const firstLease = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId,
        tenantId: tenant1.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2027-09-30T23:59:59.000Z",
        rentAmount: 40000,
        dueDay: 5,
      });
    expect(firstLease.status).toBe(201);

    // Overlapping lease on same property
    const overlapping = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId,
        tenantId: tenant2.user.id,
        startDate: "2027-01-01T00:00:00.000Z",
        endDate: "2027-12-31T23:59:59.000Z",
        rentAmount: 42000,
        dueDay: 5,
      });

    expect(overlapping.status).toBe(409);
    expect(overlapping.body.error?.message || overlapping.body.message).toMatch(/already has an active lease/i);
  });

  it("4. Cannot create lease for tenant with active lease elsewhere", async () => {
    const owner1 = await makeUser("Owner 4A", "owner4a@lease.test", "OWNER");
    const owner2 = await makeUser("Owner 4B", "owner4b@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 4", "tenant4@lease.test", "RENTER");

    const prop1 = await createActiveProperty(owner1.token);
    const prop2 = await createActiveProperty(owner2.token);

    // Create lease 1
    const l1 = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner1.token}`)
      .send({
        propertyId: prop1,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2027-09-30T23:59:59.000Z",
        rentAmount: 30000,
        dueDay: 5,
      });
    expect(l1.status).toBe(201);

    // Tenant accepts lease 1
    await request(app)
      .post(`/api/leases/${l1.body.id}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Tenant 4" });

    // Owner 1 activates lease 1
    await request(app)
      .patch(`/api/leases/${l1.body.id}`)
      .set("Authorization", `Bearer ${owner1.token}`)
      .send({ status: "ACTIVE" });

    // Owner 2 tries to create lease for the same tenant
    const l2 = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner2.token}`)
      .send({
        propertyId: prop2,
        tenantId: tenant.user.id,
        startDate: "2026-11-01T00:00:00.000Z",
        endDate: "2027-10-31T23:59:59.000Z",
        rentAmount: 35000,
        dueDay: 5,
      });

    expect(l2.status).toBe(409);
    expect(l2.body.error?.message || l2.body.message).toMatch(/Tenant already has an active lease/i);
  });

  it("5. Owner cannot create lease on someone else's property", async () => {
    const owner1 = await makeUser("Owner 5A", "owner5a@lease.test", "OWNER");
    const owner2 = await makeUser("Owner 5B", "owner5b@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 5", "tenant5@lease.test", "RENTER");

    const prop1 = await createActiveProperty(owner1.token);

    const res = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner2.token}`)
      .send({
        propertyId: prop1,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2027-09-30T23:59:59.000Z",
        rentAmount: 30000,
        dueDay: 5,
      });

    expect(res.status).toBe(403);
  });

  it("6. Tenant cannot create lease", async () => {
    const owner = await makeUser("Owner 6", "owner6@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 6", "tenant6@lease.test", "RENTER");
    const prop = await createActiveProperty(owner.token);

    const res = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        propertyId: prop,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2027-09-30T23:59:59.000Z",
        rentAmount: 30000,
        dueDay: 5,
      });

    expect(res.status).toBe(403);
  });

  it("7. Payment of ₹45k splits FIFO across two obligations", async () => {
    const owner = await makeUser("Owner 7", "owner7@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 7", "tenant7@lease.test", "RENTER");
    const prop = await createActiveProperty(owner.token);

    // Create 2-month lease, rent ₹25,000 each month
    const leaseRes = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId: prop,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2026-11-30T23:59:59.000Z",
        rentAmount: 25000,
        dueDay: 5,
      });
    expect(leaseRes.status).toBe(201);
    const leaseId = leaseRes.body.id;

    // Tenant accepts
    await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Tenant 7" });

    // Owner activates
    await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ACTIVE" });

    // Record payment of ₹45,000 (should cover Month 1 ₹25k and Month 2 ₹20k)
    const payRes = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        leaseId,
        amount: 45000,
        method: "UPI",
        reference: "UPI/12345/ABC",
      });

    expect(payRes.status).toBe(201);
    expect(payRes.body.allocations.length).toBe(2);
    expect(payRes.body.allocations[0].amount).toBe(25000);
    expect(payRes.body.allocations[1].amount).toBe(20000);

    // Check obligations derived status
    const obRes = await request(app)
      .get(`/api/leases/${leaseId}/obligations`)
      .set("Authorization", `Bearer ${tenant.token}`);

    expect(obRes.status).toBe(200);
    expect(obRes.body[0].status).toBe("PAID");
    expect(obRes.body[0].balance).toBe(0);
    expect(obRes.body[1].status).toBe("PARTIAL");
    expect(obRes.body[1].balance).toBe(5000);
  });

  it("8. Payment exceeding outstanding creates credit obligation", async () => {
    const owner = await makeUser("Owner 8", "owner8@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 8", "tenant8@lease.test", "RENTER");
    const prop = await createActiveProperty(owner.token);

    // 1-month lease, rent ₹20,000
    const leaseRes = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId: prop,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2026-10-31T23:59:59.000Z",
        rentAmount: 20000,
        dueDay: 5,
      });
    const leaseId = leaseRes.body.id;

    await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Tenant 8" });

    await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ACTIVE" });

    // Payment of ₹25,000 (exceeds ₹20,000 obligation by ₹5,000)
    const payRes = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        leaseId,
        amount: 25000,
        method: "BANK_TRANSFER",
      });

    expect(payRes.status).toBe(201);
    expect(payRes.body.allocations.length).toBe(2);
    expect(payRes.body.allocations[0].amount).toBe(20000);
    expect(payRes.body.allocations[1].amount).toBe(5000);

    // Check obligations: 2 obligations, both PAID
    const obRes = await request(app)
      .get(`/api/leases/${leaseId}/obligations`)
      .set("Authorization", `Bearer ${tenant.token}`);

    expect(obRes.status).toBe(200);
    expect(obRes.body.length).toBe(2);
    expect(obRes.body[0].status).toBe("PAID");
    expect(obRes.body[1].status).toBe("PAID");
    expect(obRes.body[1].amountDue).toBe(5000);
  });

  it("9. Obligation status derives PAID when amountPaid >= amountDue", async () => {
    const owner = await makeUser("Owner 9", "owner9@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 9", "tenant9@lease.test", "RENTER");
    const prop = await createActiveProperty(owner.token);

    const leaseRes = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId: prop,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2026-10-31T23:59:59.000Z",
        rentAmount: 30000,
        dueDay: 5,
      });
    const leaseId = leaseRes.body.id;

    await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Tenant 9" });

    await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ACTIVE" });

    await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        leaseId,
        amount: 30000,
        method: "UPI",
      });

    const obRes = await request(app)
      .get(`/api/leases/${leaseId}/obligations`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(obRes.body[0].status).toBe("PAID");
    expect(obRes.body[0].balance).toBe(0);
  });

  it("10. Obligation status derives OVERDUE when dueDate < now and balance > 0", async () => {
    const owner = await makeUser("Owner 10", "owner10@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 10", "tenant10@lease.test", "RENTER");
    const prop = await createActiveProperty(owner.token);

    const leaseRes = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId: prop,
        tenantId: tenant.user.id,
        startDate: "2026-01-01T00:00:00.000Z",
        endDate: "2026-06-30T23:59:59.000Z",
        rentAmount: 30000,
        dueDay: 5,
      });
    const leaseId = leaseRes.body.id;

    // Manually set first obligation dueDate to 5 days ago to guarantee it is in the past
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const firstOb = await prisma.rentObligation.findFirst({
      where: { leaseId },
      orderBy: { dueDate: "asc" },
    });
    await prisma.rentObligation.update({
      where: { id: firstOb!.id },
      data: { dueDate: fiveDaysAgo },
    });

    const obRes = await request(app)
      .get(`/api/leases/${leaseId}/obligations`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(obRes.status).toBe(200);
    expect(obRes.body[0].status).toBe("OVERDUE");
    expect(obRes.body[0].daysOverdue).toBeGreaterThanOrEqual(4);
  });

  it("11. Activating lease sets Property.status = RENTED", async () => {
    const owner = await makeUser("Owner 11", "owner11@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 11", "tenant11@lease.test", "RENTER");
    const propId = await createActiveProperty(owner.token);

    const leaseRes = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2027-09-30T23:59:59.000Z",
        rentAmount: 45000,
        dueDay: 5,
      });
    const leaseId = leaseRes.body.id;

    // Tenant accepts
    await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Tenant 11" });

    // Owner activates lease
    const activateRes = await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ACTIVE" });

    expect(activateRes.status).toBe(200);

    // Verify Property.status is now RENTED in database
    const propertyInDb = await prisma.property.findUnique({
      where: { id: propId },
    });
    expect(propertyInDb?.status).toBe("RENTED");
    expect(propertyInDb?.activeLeaseId).toBe(leaseId);

    // Public search should NOT return this property anymore
    const searchRes = await request(app).get("/api/properties");
    expect(searchRes.body.properties.some((p: { id: string }) => p.id === propId)).toBe(false);
  });

  it("12. Ending lease sets Property.status = ACTIVE", async () => {
    const owner = await makeUser("Owner 12", "owner12@lease.test", "OWNER");
    const tenant = await makeUser("Tenant 12", "tenant12@lease.test", "RENTER");
    const propId = await createActiveProperty(owner.token);

    const leaseRes = await request(app)
      .post("/api/leases")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2027-09-30T23:59:59.000Z",
        rentAmount: 45000,
        dueDay: 5,
      });
    const leaseId = leaseRes.body.id;

    await request(app)
      .post(`/api/leases/${leaseId}/accept`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ acceptedByName: "Tenant 12" });

    await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ACTIVE" });

    // End lease
    const endRes = await request(app)
      .patch(`/api/leases/${leaseId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "ENDED" });

    expect(endRes.status).toBe(200);

    // Verify Property.status is back to ACTIVE
    const propertyInDb = await prisma.property.findUnique({
      where: { id: propId },
    });
    expect(propertyInDb?.status).toBe("ACTIVE");
    expect(propertyInDb?.activeLeaseId).toBeNull();

    // Public search should now include this property again
    const searchRes = await request(app).get("/api/properties");
    expect(searchRes.body.properties.some((p: { id: string }) => p.id === propId)).toBe(true);
  });
});
