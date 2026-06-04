// scripts/check.ts
import prisma from "../lib/prisma.ts";
import jwt from "jsonwebtoken";
import { getAdminFromRequest } from "../lib/apiAuth.ts";

(async () => {
  const secret = process.env.JWT_SECRET || "test-secret";

  // Upsert a demo admin (id will be generated automatically)
  const bcrypt = require("bcryptjs");
  const passwordHash = bcrypt.hashSync("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { username: "demo-admin" },
    update: {},
    create: {
      username: "demo-admin",
      passwordHash,
      role: "ADMIN",
      city: "Mumbai",
    },
  });

  // Create a demo agent linked to the admin
  const agent = await prisma.agent.create({
    data: {
      name: "Demo Agent",
      adminId: admin.id,
    },
  });

  // Create a demo property and assign the agent
  const property = await prisma.property.create({
    data: {
      title: "Demo Property",
      subtitle: "",
      description: "",
      price: "₹1 Cr",
      priceNum: 10000000,
      city: "Mumbai",
      location: "Demo City",
      type: "Apartment",
      beds: 2,
      bathrooms: 1,
      area: 1200,
      featured: false,
      status: "PENDING",
      assignedAgentId: agent.id,
    },
  });

  // Generate a JWT for the admin
  const token = jwt.sign({ id: admin.id }, secret);
  console.log("Generated JWT:", token);

  // Use the helper to retrieve admin from the request
  const adminFromToken = await getAdminFromRequest({
    headers: { authorization: `Bearer ${token}` },
  } as any);
  console.log("Admin from token:", adminFromToken);

  // Fetch the property with its assigned agent to verify the relation
  const propWithAgent = await prisma.property.findUnique({
    where: { id: property.id },
    include: { assignedAgent: true },
  });
  console.log("Property with assigned agent:", propWithAgent);
})();
