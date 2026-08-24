import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_OPERATOR_EMAIL ?? "akcdompig@hotmail.com";

  const operator = await prisma.user.upsert({
    where: { email },
    update: { role: "OPERATOR" },
    create: { email, role: "OPERATOR", ageConfirmedAt: new Date() },
  });

  await prisma.operatorProfile.upsert({
    where: { userId: operator.id },
    update: {},
    create: { userId: operator.id, displayName: "Ashley" },
  });

  console.log(`Seeded operator account: ${email}`);
  console.log("Sign in with the magic-link flow at /inloggen using this email to reach /dashboard.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
