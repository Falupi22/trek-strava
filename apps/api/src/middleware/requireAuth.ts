import type { FastifyRequest, FastifyReply } from "fastify";
import { verifySession } from "../session.js";
import { prisma } from "../db.js";
import { syncUser } from "../sync.js";
import { LAST_SEEN_WRITE_INTERVAL_MS, inactiveCutoff } from "../retention.js";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  // Prefer the httpOnly session cookie; fall back to a Bearer header for
  // backwards compatibility with any non-browser client.
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  const token = (req as any).cookies?.session ?? bearer;
  if (!token) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  let session;
  try {
    session = await verifySession(token);
  } catch {
    return reply.status(401).send({ error: "Invalid or expired session" });
  }

  // A JWT stays cryptographically valid after the user disconnects (or is
  // deleted via a Strava deauth webhook) on another device. Reject it once the
  // user row is gone so those devices are bounced to login instead of hitting
  // 404s / FK errors.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, lastSeenAt: true },
  });
  if (!user) {
    reply.clearCookie("session", { path: "/" });
    return reply.status(401).send({ error: "Session no longer valid" });
  }

  // Record the visit (throttled), which keeps the user in the nightly sync.
  const now = Date.now();
  if (now - user.lastSeenAt.getTime() > LAST_SEEN_WRITE_INTERVAL_MS) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date(now) },
    });
    // Returning after inactivity: their Strava data was dropped from the sync
    // (and possibly purged), so rebuild it now rather than waiting for 3 AM.
    if (user.lastSeenAt < inactiveCutoff(now)) {
      syncUser(user.id).catch((err) =>
        req.log.error({ err, userId: user.id }, "[retention] return sync failed"),
      );
    }
  }

  (req as any).session = session;
}
