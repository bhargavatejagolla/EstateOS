import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
  connectionTimeoutMillis: 20000,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding EstateOS database with realistic full-lifecycle data...");

  // 1. Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentObligation.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 2. Create Users
  const owner = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "rajesh@estateos.com",
      passwordHash,
      role: "OWNER",
      phone: "+91 98450 12345",
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: "Ananya Sharma",
      email: "ananya@estateos.com",
      passwordHash,
      role: "OWNER",
      phone: "+91 98765 43210",
    },
  });

  const renter = await prisma.user.create({
    data: {
      name: "Arjun Mehta",
      email: "arjun@estateos.com",
      passwordHash,
      role: "RENTER",
      phone: "+91 99887 76655",
    },
  });

  const tenant = await prisma.user.create({
    data: {
      name: "Priya Nair",
      email: "priya@estateos.com",
      passwordHash,
      role: "TENANT",
      phone: "+91 97766 55443",
    },
  });

  console.log("✅ Created 4 users (2 Owners, 1 Renter, 1 Tenant)");

  // 3. Create Properties
  const prop1 = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: "Luxury 3BHK Penthouse with Skyline View",
      description: "Sunlit modern penthouse on 100ft road Indiranagar. Fully furnished with Italian marble flooring, central AC, modular kitchen, and private terrace lounge.",
      price: 65000,
      depositAmount: 195000,
      city: "Bangalore",
      locality: "Indiranagar",
      address: "42, 100ft Road, HAL 2nd Stage",
      pincode: "560038",
      propertyType: "APARTMENT",
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 2100,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Power Backup", "Gym", "Swimming Pool", "Car Parking", "Security", "Club House"],
      status: "ACTIVE",
      availability: "AVAILABLE_NOW",
      latitude: 12.9784,
      longitude: 77.6408,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            publicId: "estateos_demo_img_1",
            sortOrder: 0,
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
            publicId: "estateos_demo_img_2",
            sortOrder: 1,
            isPrimary: false,
          },
        ],
      },
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: "Chic 2BHK Apartment near Sony Signal",
      description: "Quiet residential apartment close to top cafes, startups, and transit in 4th Block Koramangala. Features teakwood wardrobes and high-speed internet readiness.",
      price: 45000,
      depositAmount: 135000,
      city: "Bangalore",
      locality: "Koramangala",
      address: "18, 5th Cross, 4th Block",
      pincode: "560034",
      propertyType: "APARTMENT",
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1350,
      furnishing: "SEMI_FURNISHED",
      amenities: ["Power Backup", "Security", "Car Parking", "Water Treatment"],
      status: "RENTED",
      availability: "NOT_AVAILABLE",
      latitude: 12.9352,
      longitude: 77.6245,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            publicId: "estateos_demo_img_3",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: "Independent 4BHK Villa with Private Garden",
      description: "Spacious gated community villa in Whitefield with solar water heating, landscaped lawn, dedicated home theater room, and EV charging station.",
      price: 85000,
      depositAmount: 250000,
      city: "Bangalore",
      locality: "Whitefield",
      address: "Villa 12, Palm Meadows, ECC Road",
      pincode: "560066",
      propertyType: "VILLA",
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 3400,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Private Garden", "EV Charger", "Swimming Pool", "Club House", "Power Backup", "Gym"],
      status: "ACTIVE", // Vacant active property!
      availability: "AVAILABLE_NOW",
      latitude: 12.9698,
      longitude: 77.7499,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
            publicId: "estateos_demo_img_4",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      ownerId: owner2.id,
      title: "Minimalist 1BHK Studio Apartment",
      description: "Compact, aesthetic studio ideal for tech professionals working in HSR Layout Sector 2. Walking distance to BDA complex.",
      price: 26000,
      depositAmount: 80000,
      city: "Bangalore",
      locality: "HSR Layout",
      address: "102, 19th Main, Sector 2",
      pincode: "560102",
      propertyType: "STUDIO",
      bedrooms: 1,
      bathrooms: 1,
      areaSqft: 650,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Power Backup", "Wi-Fi Ready", "Lift", "Security"],
      status: "ACTIVE",
      availability: "AVAILABLE_NOW",
      latitude: 12.9116,
      longitude: 77.6389,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            publicId: "estateos_demo_img_5",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  const prop5 = await prisma.property.create({
    data: {
      ownerId: owner2.id,
      title: "Spacious 3BHK Lakeview Residence",
      description: "Overlooking Bellandur lake with breezy cross ventilation, children play park, tennis court, and fast access to outer ring road tech corridors.",
      price: 58000,
      depositAmount: 175000,
      city: "Bangalore",
      locality: "Bellandur",
      address: "704, Green Glen Layout",
      pincode: "560103",
      propertyType: "APARTMENT",
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 1850,
      furnishing: "SEMI_FURNISHED",
      amenities: ["Power Backup", "Gym", "Tennis Court", "Car Parking", "Children Play Area"],
      status: "ACTIVE",
      availability: "AVAILABLE_NOW",
      latitude: 12.9260,
      longitude: 77.6762,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            publicId: "estateos_demo_img_6",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log("✅ Created 5 properties with photos across Bangalore");

  // 4. Create Active Lease for Priya on Prop 2
  const leaseStartDate = new Date("2026-01-01T00:00:00.000Z");
  const leaseEndDate = new Date("2026-12-31T23:59:59.000Z");

  const lease = await prisma.lease.create({
    data: {
      propertyId: prop2.id,
      tenantId: tenant.id,
      startDate: leaseStartDate,
      endDate: leaseEndDate,
      rentAmount: 45000,
      depositAmount: 135000,
      dueDay: 5,
      status: "ACTIVE",
      acceptanceStatus: "ACCEPTED",
      acceptedByName: "Priya Nair",
      acceptedByTenantAt: new Date("2026-01-01T10:00:00.000Z"),
    },
  });

  await prisma.property.update({
    where: { id: prop2.id },
    data: { activeLeaseId: lease.id },
  });

  // 5. Generate Past 5 Months Paid Obligations (Cashflow Trend)
  const now = new Date();
  const months = [
    { year: 2026, month: 0, paid: 45000 },
    { year: 2026, month: 1, paid: 45000 },
    { year: 2026, month: 2, paid: 45000 },
    { year: 2026, month: 3, paid: 45000 },
    { year: 2026, month: 4, paid: 45000 },
  ];

  for (const m of months) {
    const dueDate = new Date(m.year, m.month, 5);
    const ob = await prisma.rentObligation.create({
      data: {
        leaseId: lease.id,
        dueDate,
        amountDue: 45000,
        amountPaid: m.paid,
      },
    });

    await prisma.payment.create({
      data: {
        leaseId: lease.id,
        amount: m.paid,
        method: "BANK_TRANSFER",
        reference: `NEFT-20260${m.month + 1}-9921`,
        recordedBy: owner.id,
        paidAt: dueDate,
        paymentAllocations: {
          create: [
            {
              rentObligationId: ob.id,
              amount: m.paid,
            },
          ],
        },
      },
    });
  }

  // 6. Overdue Obligation (due 10 days ago, unpaid -> Red Signal on Owner Dashboard!)
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  await prisma.rentObligation.create({
    data: {
      leaseId: lease.id,
      dueDate: tenDaysAgo,
      amountDue: 45000,
      amountPaid: 0,
    },
  });

  // 7. Upcoming Obligation (due in 4 days -> Amber Signal)
  const fourDaysAhead = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
  await prisma.rentObligation.create({
    data: {
      leaseId: lease.id,
      dueDate: fourDaysAhead,
      amountDue: 45000,
      amountPaid: 0,
    },
  });

  console.log("✅ Created active lease with past cashflow trend and overdue obligation");

  // 8. Open Maintenance Request (Generates UNRESOLVED_MAINTENANCE signal)
  await prisma.maintenanceRequest.create({
    data: {
      propertyId: prop2.id,
      tenantId: tenant.id,
      leaseId: lease.id,
      title: "Geyser thermostat replacement in master bathroom",
      description: "Water is overheating and tripping the MCB. Electrician inspected and advised thermostat replacement.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // 9. Enquiry & Upcoming Viewing (Arjun enquired on Rajesh's Penthouse Prop 1)
  const enquiry = await prisma.enquiry.create({
    data: {
      userId: renter.id,
      propertyId: prop1.id,
      message: "Hi Rajesh, I work at an AI lab nearby. Can I come view this penthouse tomorrow?",
      status: "VISIT_SCHEDULED",
      ownerNotes: "High-intent tech lead. Budget ₹65k matches.",
    },
  });

  const tomorrow11am = new Date(Date.now() + 18 * 60 * 60 * 1000);
  await prisma.appointment.create({
    data: {
      enquiryId: enquiry.id,
      visitAt: tomorrow11am,
      status: "CONFIRMED",
      notes: "Confirmed for in-person inspection. Security pass pre-approved at main gate.",
    },
  });

  // 10. Shortlists for Arjun (Populates Recommendations Engine!)
  await prisma.favourite.create({
    data: {
      userId: renter.id,
      propertyId: prop1.id, // 3BHK in Bangalore, ₹65k
    },
  });

  await prisma.favourite.create({
    data: {
      userId: renter.id,
      propertyId: prop5.id, // 3BHK in Bangalore, ₹58k
    },
  });

  // 11. Initial Audit Trail
  await prisma.auditLog.createMany({
    data: [
      {
        userId: owner.id,
        action: "PROPERTY_PUBLISHED",
        entity: "Property",
        entityId: prop1.id,
        metadata: { title: prop1.title, price: prop1.price },
      },
      {
        userId: owner.id,
        action: "LEASE_CREATED",
        entity: "Lease",
        entityId: lease.id,
        metadata: { propertyId: prop2.id, tenant: "Priya Nair", rent: 45000 },
      },
      {
        userId: tenant.id,
        action: "LEASE_ACCEPTED",
        entity: "Lease",
        entityId: lease.id,
        metadata: { acceptedByName: "Priya Nair" },
      },
      {
        userId: owner.id,
        action: "PAYMENT_RECORDED",
        entity: "Payment",
        entityId: lease.id,
        metadata: { amount: 45000, method: "BANK_TRANSFER" },
      },
    ],
  });

  console.log("✅ Seed completed successfully! All signals, recommendations, and analytics are ready.");
  console.log("\n🔑 Demo Logins (Password for all: password123):");
  console.log("   • Owner:  rajesh@estateos.com");
  console.log("   • Renter: arjun@estateos.com");
  console.log("   • Tenant: priya@estateos.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
