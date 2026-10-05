// Smoke test: real Supabase insert via Prisma. No secrets here — uses DATABASE_URL from .env.
// Run: node scripts/smoke-db.cjs
// Creates a timestamped test user + goal, prints the rows, then deletes them.
const { PrismaClient } = require("@prisma/client");

async function main() {
  const db = new PrismaClient();
  try {
    const stamp = Date.now();
    const email = `smoke+${stamp}@example.com`;

    const user = await db.user.create({ data: { email, name: "Smoke Test" } });
    console.log("USER_CREATED", JSON.stringify({ id: user.id, email: user.email, role: user.role }));

    const goal = await db.goal.create({
      data: { userId: user.id, title: "Smoke goal", rawInput: "smoke test — safe to delete" },
    });
    console.log("GOAL_CREATED", JSON.stringify({ id: goal.id, title: goal.title }));

    const count = await db.goal.count({ where: { userId: user.id } });
    console.log("GOAL_COUNT_FOR_USER", count);

    await db.goal.delete({ where: { id: goal.id } });
    await db.user.delete({ where: { id: user.id } });
    console.log("CLEANUP_OK deleted test user + goal");
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}

main().catch((err) => {
  console.error("SMOKE_FAILED", err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
