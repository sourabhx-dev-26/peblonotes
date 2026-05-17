import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEMP_PASSWORD = "TempPass123!";

const run = async () => {
  const hash = await bcrypt.hash(TEMP_PASSWORD, 10);

  const res = await prisma.user.updateMany({
    where: { passwordHash: "TEMP" },
    data: { passwordHash: hash },
  });

  console.log("Updated users:", res.count);
};

run()
  .then(() => prisma.$disconnect())
  .then(() => pool.end())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });