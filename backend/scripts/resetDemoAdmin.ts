// scripts/resetDemoAdmin.ts
/**
 * Resets (or creates) the demo admin account so that its password is always
 * the plaintext value `admin123`. The password is stored as a bcrypt hash,
 * matching the logic in `project‑root/server/routes/adminRoutes.js`.
 *
 * Run:
 *   npx ts-node scripts/resetDemoAdmin.ts
 *
 * Afterwards you can log in with:
 *   Username: demo-admin
 *   Password: admin123
 */

import prisma from "../lib/prisma.ts";
import bcrypt from "bcryptjs";

(async () => {
  const DEMO_USERNAME = "demo-admin";
  const DEMO_PASSWORD = "admin123";

  // Generate a fresh bcrypt hash (10‑salt rounds, same as registration)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Upsert the admin – if it exists we simply update the hash,
  // otherwise we create the whole record.
  await prisma.admin.upsert({
    where: { username: DEMO_USERNAME },
    update: { passwordHash },
    create: {
      username: DEMO_USERNAME,
      passwordHash,
      role: "ADMIN",
      city: "Mumbai",
      // optional fields (name, phone) can be omitted if nullable in schema
    },
  });

  console.log("✅ Demo admin password reset to `admin123`");
})();
