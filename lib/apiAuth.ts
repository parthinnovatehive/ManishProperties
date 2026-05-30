// lib/apiAuth.ts
import prisma from "./prisma.ts";
import jwt from "jsonwebtoken";

type Admin = {
  id: string;
  city: string | null;
};

/**
 * Extracts admin information from the request.
 * Expects an `Authorization: Bearer <jwt>` header where the JWT payload contains `id`.
 * Returns null if verification fails.
 */
export async function getAdminFromRequest(req: any): Promise<Admin | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { id: true, city: true },
    });
    return admin;
  } catch (e) {
    console.error("Invalid admin token", e);
    return null;
  }
}
