// pages/api/admin/appointments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { adminId: admin.id },
      include: { admin: { select: { city: true } } },
    });
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching appointments", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
