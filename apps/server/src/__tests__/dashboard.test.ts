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

async function createProperty(ownerToken: string, title = "Modern Luxury Villa", status: "DRAFT" | "ACTIVE" = "ACTIVE") {
  const createRes = await request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      title,
      description: "Exceptional property with premium furnishings and full power backup.",
      price: 60000,
      depositAmount: 180000,
      city: "Bangalore",
      locality: "Indiranagar",
      address: "100ft Road, Indiranagar",
      propertyType: "APARTMENT",
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 1800,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Power Backup", "Gym"],
    });

  const propId = createRes.body.id;

  if (status === "ACTIVE") {
    await request(app)
      .patch(`/api/properties/${propId}/publish`)
      .set("Authorization", `Bearer ${ownerToken}`);
  }

  return propId;
}

describe("Phase 5: Owner Dashboard Signals & Analytics (10 tests)", () => {
  beforeEach(cleanDb);

  it("1. Empty owner (no data) -> all summary counts zero, no null errors", async () => {
    const owner = await makeUser("Empty Owner", "empty.owner@dash.test", "OWNER");

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual({
      totalProperties: 0,
      activeProperties: 0,
      rentedProperties: 0,
      activeLeases: 0,
      occupancyRate: 0,
      monthlyRentExpected: 0,
      monthlyRentCollected: 0,
      collectionRate: 0,
      overdueAmount: 0,
      unresolvedMaintenanceCount: 0,
      upcomingViewingsCount: 0,
    });
    expect(res.body.signals).toEqual([]);
    expect(res.body.incomeTrend).toHaveLength(6);
    expect(res.body.recentActivity).toEqual([]);
  });

  it("2. Create overdue obligation -> OVERDUE_RENT signal appears with correct amount and negative daysOffset", async () => {
    const owner = await makeUser("Owner 2", "owner2@dash.test", "OWNER");
    const tenant = await makeUser("Tenant 2", "tenant2@dash.test", "RENTER");
    const propId = await createProperty(owner.token, "Indiranagar Penthouse");

    // Create and activate lease
    const lease = await prisma.lease.create({
      data: {
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T23:59:59.000Z"),
        rentAmount: 40000,
        dueDay: 5,
        status: "ACTIVE",
        acceptanceStatus: "ACCEPTED",
        acceptedByName: "Tenant 2",
      },
    });

    // Create an obligation due 12 days ago
    const twelveDaysAgo = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000);
    await prisma.rentObligation.create({
      data: {
        leaseId: lease.id,
        dueDate: twelveDaysAgo,
        amountDue: 40000,
        amountPaid: 0,
      },
    });

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const overdue = res.body.signals.find((s: any) => s.type === "OVERDUE_RENT");
    expect(overdue).toBeDefined();
    expect(overdue.severity).toBe("critical");
    expect(overdue.amount).toBe(40000);
    expect(overdue.daysOffset).toBeLessThanOrEqual(-11);
    expect(res.body.summary.overdueAmount).toBe(40000);
  });

  it("3. Create obligation due in 3 days -> UPCOMING_RENT signal, positive daysOffset", async () => {
    const owner = await makeUser("Owner 3", "owner3@dash.test", "OWNER");
    const tenant = await makeUser("Tenant 3", "tenant3@dash.test", "RENTER");
    const propId = await createProperty(owner.token, "Koramangala 3BHK");

    const lease = await prisma.lease.create({
      data: {
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T23:59:59.000Z"),
        rentAmount: 35000,
        dueDay: 5,
        status: "ACTIVE",
        acceptanceStatus: "ACCEPTED",
      },
    });

    const threeDaysAhead = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await prisma.rentObligation.create({
      data: {
        leaseId: lease.id,
        dueDate: threeDaysAhead,
        amountDue: 35000,
        amountPaid: 0,
      },
    });

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const upcoming = res.body.signals.find((s: any) => s.type === "UPCOMING_RENT");
    expect(upcoming).toBeDefined();
    expect(upcoming.severity).toBe("warning");
    expect(upcoming.amount).toBe(35000);
    expect(upcoming.daysOffset).toBeGreaterThanOrEqual(2);
    expect(upcoming.daysOffset).toBeLessThanOrEqual(4);
  });

  it("4. Create obligation due in 10 days -> no upcoming signal (outside 7-day window)", async () => {
    const owner = await makeUser("Owner 4", "owner4@dash.test", "OWNER");
    const tenant = await makeUser("Tenant 4", "tenant4@dash.test", "RENTER");
    const propId = await createProperty(owner.token, "Whitefield Condo");

    const lease = await prisma.lease.create({
      data: {
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T23:59:59.000Z"),
        rentAmount: 30000,
        dueDay: 5,
        status: "ACTIVE",
        acceptanceStatus: "ACCEPTED",
      },
    });

    const tenDaysAhead = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    await prisma.rentObligation.create({
      data: {
        leaseId: lease.id,
        dueDate: tenDaysAhead,
        amountDue: 30000,
        amountPaid: 0,
      },
    });

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const upcoming = res.body.signals.find((s: any) => s.type === "UPCOMING_RENT");
    expect(upcoming).toBeUndefined();
  });

  it("5. Owner with ACTIVE property + no lease -> VACANT_PROPERTY signal", async () => {
    const owner = await makeUser("Owner 5", "owner5@dash.test", "OWNER");
    const propId = await createProperty(owner.token, "HSR Layout Studio", "ACTIVE");

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const vacant = res.body.signals.find((s: any) => s.type === "VACANT_PROPERTY");
    expect(vacant).toBeDefined();
    expect(vacant.severity).toBe("warning");
    expect(vacant.title).toContain("HSR Layout Studio");
    expect(vacant.link).toContain(propId);
  });

  it("6. Unresolved maintenance 10 days old -> UNRESOLVED_MAINTENANCE with severity: critical", async () => {
    const owner = await makeUser("Owner 6", "owner6@dash.test", "OWNER");
    const tenant = await makeUser("Tenant 6", "tenant6@dash.test", "RENTER");
    const propId = await createProperty(owner.token, "Bellandur Flat");

    const lease = await prisma.lease.create({
      data: {
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T23:59:59.000Z"),
        rentAmount: 28000,
        dueDay: 5,
        status: "ACTIVE",
        acceptanceStatus: "ACCEPTED",
      },
    });

    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    await prisma.maintenanceRequest.create({
      data: {
        propertyId: propId,
        tenantId: tenant.user.id,
        leaseId: lease.id,
        title: "Main pipeline leakage",
        description: "Water dripping into the living room ceiling",
        status: "SUBMITTED",
        priority: "HIGH",
        createdAt: tenDaysAgo,
      },
    });

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const maintSignal = res.body.signals.find((s: any) => s.type === "UNRESOLVED_MAINTENANCE");
    expect(maintSignal).toBeDefined();
    expect(maintSignal.severity).toBe("critical");
    expect(maintSignal.daysOffset).toBeLessThanOrEqual(-9);
  });

  it("7. Lease ending in 20 days -> EXPIRING_LEASE signal, daysOffset: 20", async () => {
    const owner = await makeUser("Owner 7", "owner7@dash.test", "OWNER");
    const tenant = await makeUser("Tenant 7", "tenant7@dash.test", "RENTER");
    const propId = await createProperty(owner.token, "MG Road Suite");

    const twentyDaysAhead = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    await prisma.lease.create({
      data: {
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: new Date("2025-10-01T00:00:00.000Z"),
        endDate: twentyDaysAhead,
        rentAmount: 50000,
        dueDay: 5,
        status: "ACTIVE",
        acceptanceStatus: "ACCEPTED",
      },
    });

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const expiring = res.body.signals.find((s: any) => s.type === "EXPIRING_LEASE");
    expect(expiring).toBeDefined();
    expect(expiring.severity).toBe("warning");
    expect(expiring.daysOffset).toBeGreaterThanOrEqual(19);
    expect(expiring.daysOffset).toBeLessThanOrEqual(21);
  });

  it("8. Signals sorted: critical before warning before info", async () => {
    const owner = await makeUser("Owner 8", "owner8@dash.test", "OWNER");
    const tenant = await makeUser("Tenant 8", "tenant8@dash.test", "RENTER");
    const propId = await createProperty(owner.token, "Sorted Signals Apt");

    const lease = await prisma.lease.create({
      data: {
        propertyId: propId,
        tenantId: tenant.user.id,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T23:59:59.000Z"),
        rentAmount: 30000,
        dueDay: 5,
        status: "ACTIVE",
        acceptanceStatus: "ACCEPTED",
      },
    });

    // 1. Critical signal: overdue obligation
    await prisma.rentObligation.create({
      data: {
        leaseId: lease.id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        amountDue: 30000,
        amountPaid: 0,
      },
    });

    // 2. Info signal: upcoming appointment in 12h
    const enquiry = await prisma.enquiry.create({
      data: {
        userId: tenant.user.id,
        propertyId: propId,
        message: "Can I view the place tomorrow?",
        status: "VISIT_SCHEDULED",
      },
    });
    await prisma.appointment.create({
      data: {
        enquiryId: enquiry.id,
        visitAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        status: "CONFIRMED",
      },
    });

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const signals = res.body.signals;
    expect(signals.length).toBeGreaterThanOrEqual(2);

    const severities = signals.map((s: any) => s.severity);
    const sevRank = { critical: 0, warning: 1, info: 2 };
    for (let i = 0; i < severities.length - 1; i++) {
      expect(sevRank[severities[i] as keyof typeof sevRank]).toBeLessThanOrEqual(
        sevRank[severities[i + 1] as keyof typeof sevRank]
      );
    }
  });

  it("9. occupancyRate = rentedProperties / (activeProperties + rentedProperties)", async () => {
    const owner = await makeUser("Owner 9", "owner9@dash.test", "OWNER");
    const tenant = await makeUser("Tenant 9", "tenant9@dash.test", "RENTER");

    // 1 active vacant property
    await createProperty(owner.token, "Vacant Villa 1", "ACTIVE");

    // 1 rented property
    const prop2 = await createProperty(owner.token, "Rented Villa 2", "ACTIVE");
    const lease = await prisma.lease.create({
      data: {
        propertyId: prop2,
        tenantId: tenant.user.id,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T23:59:59.000Z"),
        rentAmount: 50000,
        dueDay: 5,
        status: "ACTIVE",
        acceptanceStatus: "ACCEPTED",
      },
    });
    await prisma.property.update({
      where: { id: prop2 },
      data: { status: "RENTED", activeLeaseId: lease.id },
    });

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.summary.activeProperties).toBe(1);
    expect(res.body.summary.rentedProperties).toBe(1);
    // 1 / (1 + 1) = 0.5
    expect(res.body.summary.occupancyRate).toBe(0.5);
  });

  it("10. incomeTrend has exactly 6 months, oldest first", async () => {
    const owner = await makeUser("Owner 10", "owner10@dash.test", "OWNER");

    const res = await request(app)
      .get("/api/dashboard/owner")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    const trend = res.body.incomeTrend;
    expect(trend).toHaveLength(6);

    for (let i = 0; i < trend.length - 1; i++) {
      expect(trend[i].month < trend[i + 1].month).toBe(true);
    }
  });
});
