import type { FastifyRequest, FastifyReply } from "fastify";
import { verifySession } from "../session.js";

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
  try {
    const session = await verifySession(token);
    (req as any).session = session;
  } catch {
    return reply.status(401).send({ error: "Invalid or expired session" });
  }
}
