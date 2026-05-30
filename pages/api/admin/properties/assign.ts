import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/apiAuth";

/**
 * Assign a property to an agent.
 * Expected body: { propertyId: string, agentId: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const admin = await getAdminFromRequest(req);

  if (!admin) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized" });
  }

  const { propertyId, agentId } = req.body;

  if (!propertyId || !agentId) {
    return res.status(400).json({
      success: false,
      message: "propertyId and agentId required",
    });
  }

  try {
    // Check property belongs to admin city
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { city: true },
    });

    if (!property || property.city !== admin.city) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: property not in admin city",
      });
    }

    // Agent city validation skipped temporarily
    // because Agent model currently has no city field

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        assignedAgentId: agentId,
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Assign property error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}