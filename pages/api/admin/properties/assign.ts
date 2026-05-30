// pages/api/admin/properties/assign.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/apiAuth";

/**
 * Assign a property to an agent.
 * Expected body: { propertyId: string, agentId: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { propertyId, agentId } = req.body;
  if (!propertyId || !agentId) {
    return res.status(400).json({ success: false, message: "propertyId and agentId required" });
  }

  try {
    // Ensure the property belongs to the admin's city
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { city: true },
    });
    if (!property || property.city !== admin.city) {
      return res.status(403).json({ success: false, message: "Forbidden: property not in admin city" });
    }

    // Ensure the agent belongs to the same city
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { city: true },
    });
    if (!agent || agent.city !== admin.city) {
      return res.status(403).json({ success: false, message: "Forbidden: agent not in admin city" });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { assignedAgentId: agentId },
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Assign property error", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
