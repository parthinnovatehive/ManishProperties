const bcrypt = require("bcryptjs");
const prisma = require("./lib/prisma");

async function main() {
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      username: "rootadmin",
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    "admin123",
    10
  );

  await prisma.admin.create({
    data: {
      username: "rootadmin",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("Root admin created");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });