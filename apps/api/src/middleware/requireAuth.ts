import type { FastifyRequest, FastifyReply } from "fastify";
import { verifySession } from "../session.js";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  try {
    const token = authHeader.slice(7);
    const session = await verifySession(token);
    (req as any).session = session;
  } catch {
    return reply.status(401).send({ error: "Invalid or expired session" });
  }
}
