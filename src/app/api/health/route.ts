import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    app: true,
    databaseUrl: Boolean(process.env.DATABASE_URL),
    authSecret: Boolean(process.env.AUTH_SECRET),
    database: false
  };

  if (checks.databaseUrl) {
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      checks.database = false;
    }
  }

  const healthy =
    checks.app &&
    checks.databaseUrl &&
    checks.authSecret &&
    checks.database;

  return Response.json(
    {
      ok: healthy,
      checks
    },
    {
      status: healthy ? 200 : 503
    }
  );
}
