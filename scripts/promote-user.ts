import { PrismaClient } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3]?.trim().toUpperCase() ?? "TEACHER";
const allowedRoles = ["ADMIN", "TEACHER"] as const;

if (!email || !allowedRoles.includes(role as (typeof allowedRoles)[number])) {
  console.error(
    "Gebruik: npm run users:promote -- docent@school.nl [TEACHER|ADMIN]",
  );
  process.exit(1);
}

const db = new PrismaClient();

async function main() {
  const user = await db.user.update({
    where: { email },
    data: { role },
    select: { email: true, name: true, role: true },
  });

  console.log(`${user.name ?? user.email} heeft nu de rol ${user.role}.`);
}

main()
  .catch((error) => {
    console.error("Promoten is niet gelukt:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
